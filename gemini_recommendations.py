import json
import re
from datetime import datetime

from google import genai
from google.genai import types

from config import settings
from models import Meeting, User


def _fallback_rank(user: User, meetings: list[Meeting], limit: int) -> list[Meeting]:
    interest_names = {i.name for i in user.interests}
    scored: list[tuple[int, datetime, Meeting]] = []
    for meeting in meetings:
        category = meeting.category.strip().lower()
        match = 1 if category in interest_names else 0
        scored.append((match, meeting.start_at, meeting))
    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return [meeting for _, _, meeting in scored[:limit]]


def _parse_gemini_json(text: str) -> list[dict]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    data = json.loads(cleaned)
    if isinstance(data, dict) and "recommendations" in data:
        return data["recommendations"]
    if isinstance(data, list):
        return data
    raise ValueError("Unexpected Gemini response shape")


def _build_prompt(user: User, meetings: list[Meeting]) -> str:
    interests = ", ".join(i.name for i in user.interests) or "없음"
    meeting_lines = []
    for m in meetings:
        meeting_lines.append(
            {
                "id": m.id,
                "title": m.title,
                "description": m.description[:300],
                "category": m.category,
                "location": m.location,
                "start_at": m.start_at.isoformat(),
                "max_members": m.max_members,
                "owner_name": m.owner.name if m.owner else "",
            }
        )
    return f"""당신은 모임 매칭 앱 '이음'의 추천 어시스턴트입니다.
사용자 프로필과 모임 목록을 분석해 가장 잘 맞는 모임을 추천하세요.

## 사용자
- 이름: {user.name}
- 자기소개: {user.bio or "없음"}
- 관심 분야: {interests}

## 모임 목록 (JSON)
{json.dumps(meeting_lines, ensure_ascii=False)}

## 규칙
1. 관심 분야, 자기소개, 모임 설명·카테고리·일정·장소를 종합해 적합도를 판단하세요.
2. 이미 참여 중이거나 주최한 모임은 목록에 없습니다.
3. 최대 10개까지, 적합도가 높은 순으로만 선택하세요.
4. 반드시 아래 JSON만 출력하세요. 다른 설명은 금지합니다.

{{
  "recommendations": [
    {{"meeting_id": 1, "score": 92, "reason": "한 문장으로 추천 이유 (한국어)"}}
  ]
}}

score는 0~100 정수입니다. reason 필드는 사용하지 않으므로 빈 문자열로 두세요."""


async def recommend_meetings_with_gemini(
    user: User,
    meetings: list[Meeting],
    *,
    limit: int = 10,
) -> list[Meeting]:
    if not meetings:
        return []

    if not settings.gemini_api_key:
        return _fallback_rank(user, meetings, limit)

    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = _build_prompt(user, meetings)

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.4,
                response_mime_type="application/json",
            ),
        )
        raw = (response.text or "").strip()
        items = _parse_gemini_json(raw)
    except Exception:
        return _fallback_rank(user, meetings, limit)

    by_id = {m.id: m for m in meetings}
    ranked: list[Meeting] = []
    seen: set[int] = set()

    for item in items:
        if not isinstance(item, dict):
            continue
        meeting_id = item.get("meeting_id")
        if meeting_id is None or meeting_id in seen:
            continue
        meeting = by_id.get(int(meeting_id))
        if not meeting:
            continue
        seen.add(int(meeting_id))
        ranked.append(meeting)
        if len(ranked) >= limit:
            break

    if not ranked:
        return _fallback_rank(user, meetings, limit)

    return ranked
