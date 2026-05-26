import asyncio
import json
import logging
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException, status
from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import BaseModel, Field, ValidationError

from config import settings
from schemas import KakaoMapConfigOut, PlaceRecommendationOut, PlaceRecommendationRequest


router = APIRouter(prefix="/api/place-recommendations", tags=["place-recommendations"])
logger = logging.getLogger(__name__)


class _AIPlaceCandidate(BaseModel):
    place_name: str = Field(description="서울에 실제 존재하는 매장/장소의 공식 상호명")
    address: str = Field(description="정확한 서울 도로명 주소")
    description: str = Field(description="이 모임에 추천하는 이유. 한국어 2줄 이내")


class _AIPlaceCandidateList(BaseModel):
    recommendations: list[_AIPlaceCandidate]


GEMINI_FALLBACK_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
]


PLACE_RECOMMENDATION_SYSTEM_PROMPT = """당신은 서울 오프라인 모임 장소를 추천하는 로컬 큐레이터입니다.

절대 규칙:
1. 실제 서울에 존재한다고 널리 알려진 유명 장소/매장/복합문화공간만 추천합니다.
2. 상호명, 지점명, 도로명 주소를 확실히 아는 경우에만 추천합니다.
3. 모르면 추측하지 말고 해당 후보를 제외합니다. 가짜 장소, 임의 주소, 건물명만 있는 주소는 금지합니다.
4. 주소는 반드시 "서울특별시 ..."로 시작하는 도로명 주소여야 합니다.
5. 좌표는 만들지 않습니다. 좌표는 별도 지도 API 검증 단계에서 생성됩니다.
6. 프랜차이즈는 반드시 특정 지점명을 포함합니다.
7. 모임 성격, 카테고리, 설명, 키워드와 장소 분위기/접근성/활동 적합성을 함께 고려합니다.
8. 출력은 요청한 JSON 스키마만 따르고, 추가 설명을 쓰지 않습니다.
"""


def _build_user_prompt(payload: PlaceRecommendationRequest) -> str:
    keywords = ", ".join(k.strip() for k in payload.keywords if k.strip()) or "없음"
    return f"""아래 모임에 어울리는 서울의 실제 핫플레이스 후보를 최대 {payload.limit}개 추천하세요.

모임 정보:
- 제목: {payload.title}
- 카테고리: {payload.category}
- 설명: {payload.description}
- 키워드: {keywords}

후보마다 실제 상호명, 정확한 도로명 주소, 추천 이유를 작성하세요.
확실하지 않은 장소는 제외하세요.

반드시 아래 JSON 객체 형식으로만 응답하세요.
{{
  "recommendations": [
    {{
      "place_name": "장소명",
      "address": "서울특별시 ...",
      "description": "추천 이유"
    }}
  ]
}}"""


def _parse_gemini_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def _normalize_ai_place_response(data: object) -> _AIPlaceCandidateList:
    if isinstance(data, list):
        data = {"recommendations": data}
    if not isinstance(data, dict):
        raise ValueError("Unexpected Gemini response shape")

    raw_items = data.get("recommendations") or data.get("추천") or data.get("places") or data.get("장소") or []
    if not isinstance(raw_items, list):
        raise ValueError("Unexpected Gemini recommendations shape")

    items = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue
        items.append(
            {
                "place_name": item.get("place_name") or item.get("상호명") or item.get("장소명") or item.get("name") or "",
                "address": item.get("address") or item.get("도로명주소") or item.get("주소") or "",
                "description": item.get("description") or item.get("추천이유") or item.get("이유") or item.get("reason") or "",
            }
        )
    return _AIPlaceCandidateList.model_validate({"recommendations": items})


def _candidate_gemini_models() -> list[str]:
    models: list[str] = []
    for model in [settings.gemini_model, *GEMINI_FALLBACK_MODELS]:
        if model and model not in models:
            models.append(model)
    return models


def _request_gemini_place_candidates(payload: PlaceRecommendationRequest) -> list[_AIPlaceCandidate]:
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMINI_API_KEY가 설정되어 있지 않습니다.",
        )

    last_client_error: genai_errors.ClientError | None = None
    last_server_error: genai_errors.ServerError | None = None
    last_json_error: json.JSONDecodeError | None = None

    for model in _candidate_gemini_models():
        client = genai.Client(api_key=settings.gemini_api_key)
        prompt = f"{PLACE_RECOMMENDATION_SYSTEM_PROMPT}\n\n{_build_user_prompt(payload)}"
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                ),
            )
            raw = response.text or ""
            parsed = _normalize_ai_place_response(_parse_gemini_json(raw))
            return parsed.recommendations[: payload.limit]
        except json.JSONDecodeError as exc:
            last_json_error = exc
            logger.exception("Gemini returned invalid JSON from model %s", model)
            continue
        except (ValidationError, ValueError) as exc:
            logger.exception("Gemini returned unexpected place schema from model %s", model)
            continue
        except genai_errors.ServerError as exc:
            last_server_error = exc
            logger.exception("Gemini server error from model %s", model)
            continue
        except genai_errors.ClientError as exc:
            last_client_error = exc
            status_code = getattr(exc, "status_code", None)
            message = str(exc)
            logger.exception("Gemini client error from model %s", model)
            if status_code in {404, 429} or "RESOURCE_EXHAUSTED" in message:
                continue
            break
        except Exception as exc:
            logger.exception("Unexpected Gemini place recommendation error")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gemini 장소 추천 요청 중 알 수 없는 오류가 발생했습니다. 서버 로그를 확인해 주세요.",
            ) from exc

    if last_json_error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini가 올바른 JSON을 반환하지 않았습니다.",
        ) from last_json_error

    if last_client_error:
        exc = last_client_error
        status_code = getattr(exc, "status_code", None)
        message = str(exc)
        if status_code == 429 or "RESOURCE_EXHAUSTED" in message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="사용 가능한 Gemini 모델들의 API 할당량이 초과되었습니다. Google AI Studio에서 결제/할당량을 확인하거나 다른 API 키를 사용해 주세요.",
            ) from exc
        if status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="설정된 Gemini 모델을 사용할 수 없습니다. GEMINI_MODEL 값을 확인해 주세요.",
            ) from exc
        if status_code == 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gemini 요청 형식이 올바르지 않습니다.",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini API 호출에 실패했습니다. API 키, 모델명, 프로젝트 상태를 확인해 주세요.",
        ) from exc

    if last_server_error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini 모델이 일시적으로 혼잡합니다. 잠시 후 다시 시도해 주세요.",
        ) from last_server_error

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Gemini 장소 추천 결과를 만들지 못했습니다.",
    )


async def recommend_place_candidates_with_ai(payload: PlaceRecommendationRequest) -> list[_AIPlaceCandidate]:
    return await asyncio.to_thread(_request_gemini_place_candidates, payload)


def _request_kakao_json(path: str, params: dict[str, str | int]) -> dict:
    if not settings.kakao_rest_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="KAKAO_REST_API_KEY가 설정되어 있지 않습니다.",
        )

    url = f"https://dapi.kakao.com{path}?" + urlencode(params)
    request = Request(url, headers={"Authorization": f"KakaoAK {settings.kakao_rest_api_key}"})
    try:
        with urlopen(request, timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="ignore").strip()
        detail = f"카카오 로컬 API 요청에 실패했습니다. HTTP {exc.code}"
        if error_body:
            detail = f"{detail}: {error_body[:300]}"
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail,
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="카카오 로컬 API에 연결할 수 없습니다.",
        ) from exc


def _is_seoul_document(document: dict) -> bool:
    road_address = document.get("road_address_name") or ""
    address = document.get("address_name") or ""
    return road_address.startswith("서울") or address.startswith("서울")


def _short_place_query(place_name: str) -> str:
    stopwords = {"갤러리", "컬럼", "카페", "점", "성수점", "서울", "본점"}
    tokens = [token for token in re.split(r"\s+", place_name.strip()) if token and token not in stopwords]
    return " ".join(tokens[:2]) if tokens else place_name


def _request_kakao_keyword_search(candidate: _AIPlaceCandidate) -> dict | None:
    queries = [
        f"{candidate.place_name} {candidate.address}",
        candidate.place_name,
        candidate.address,
        _short_place_query(candidate.place_name),
    ]

    seen_queries: set[str] = set()
    for query in queries:
        query = query.strip()
        if not query or query in seen_queries:
            continue
        seen_queries.add(query)
        data = _request_kakao_json(
            "/v2/local/search/keyword.json",
            {
                "query": query,
                "size": 5,
            },
        )
        for document in data.get("documents", []):
            if _is_seoul_document(document):
                return document

    data = _request_kakao_json(
        "/v2/local/search/address.json",
        {
            "query": candidate.address,
        },
    )
    for document in data.get("documents", []):
        road_address = document.get("road_address") or {}
        address_name = road_address.get("address_name") or document.get("address_name") or ""
        if address_name.startswith("서울"):
            return {
                "place_name": candidate.place_name,
                "road_address_name": address_name,
                "address_name": document.get("address_name") or address_name,
                "x": document.get("x"),
                "y": document.get("y"),
            }
    return None


async def verify_place_with_kakao(candidate: _AIPlaceCandidate) -> PlaceRecommendationOut | None:
    document = await asyncio.to_thread(_request_kakao_keyword_search, candidate)
    if not document:
        return None

    address = document.get("road_address_name") or document.get("address_name")
    longitude = document.get("x")
    latitude = document.get("y")
    if not address or longitude is None or latitude is None:
        return None

    return PlaceRecommendationOut(
        place_name=document.get("place_name") or candidate.place_name,
        address=address,
        latitude=float(latitude),
        longitude=float(longitude),
        description=candidate.description,
    )


@router.post("", response_model=list[PlaceRecommendationOut])
async def recommend_places(payload: PlaceRecommendationRequest) -> list[PlaceRecommendationOut]:
    candidates = await recommend_place_candidates_with_ai(payload)
    verified_places: list[PlaceRecommendationOut] = []
    seen: set[tuple[str, str]] = set()

    for candidate in candidates:
        place = await verify_place_with_kakao(candidate)
        if not place:
            continue
        key = (place.place_name, place.address)
        if key in seen:
            continue
        seen.add(key)
        verified_places.append(place)

    if not verified_places:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="검증된 서울 장소를 찾지 못했습니다. 키워드를 더 구체적으로 입력해 주세요.",
        )

    return verified_places


@router.get("/map-config", response_model=KakaoMapConfigOut)
async def kakao_map_config() -> KakaoMapConfigOut:
    return KakaoMapConfigOut(javascript_key=settings.kakao_javascript_key)
