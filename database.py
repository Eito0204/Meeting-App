from collections.abc import AsyncGenerator

from datetime import datetime

from passlib.context import CryptContext
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///./meeting_app.db"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def get_or_create_interests(session: AsyncSession, names: list[str]) -> list["Interest"]:
    from models import Interest

    normalized = sorted({name.strip() for name in names if name.strip()})
    if not normalized:
        return []

    result = await session.execute(select(Interest).where(Interest.name.in_(normalized)))
    existing = {interest.name: interest for interest in result.scalars().all()}
    interests: list[Interest] = list(existing.values())

    for name in normalized:
        if name not in existing:
            interest = Interest(name=name)
            session.add(interest)
            interests.append(interest)
    return interests


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


async def seed_db(session: AsyncSession) -> None:
    from models import Interest, Meeting, MeetingSchedule, User

    result = await session.execute(select(func.count(Meeting.id)))
    meeting_count = int(result.scalar_one() or 0)
    if meeting_count > 0:
        return

    mock_users = [
        {
            "email": "seoyun@example.com",
            "name": "서윤",
            "bio": "감성 플레이리스트 큐레이터. 비 오는 날 음악과 카페를 사랑해요.",
            "password": "demo1234",
            "interests": ["인디 음악", "어쿠스틱", "플레이리스트"],
        },
        {
            "email": "haneul@example.com",
            "name": "하늘",
            "bio": "플렉시테리언, 제로웨이스트 초보. 맛있는 비건 브런치를 찾아 다닙니다.",
            "password": "demo1234",
            "interests": ["비건", "브런치", "친환경"],
        },
        {
            "email": "minjae@example.com",
            "name": "민재",
            "bio": "프리랜서 영상 크리에이터. 콘텐츠 기획과 생산성 루틴을 함께 공유하고 싶어요.",
            "password": "demo1234",
            "interests": ["브이로그", "생산성", "콘텐츠 기획"],
        },
        {
            "email": "jiwoo@example.com",
            "name": "지우",
            "bio": "시네필. 감성 영화와 디테일한 감독 연출을 좋아합니다.",
            "password": "demo1234",
            "interests": ["예술 영화", "감성 연출", "영화 토론"],
        },
        {
            "email": "soobin@example.com",
            "name": "수빈",
            "bio": "스트릿푸드 헌터. 매콤하고 감각적인 야식 메뉴를 즐겨 찾아요.",
            "password": "demo1234",
            "interests": ["스트릿푸드", "야간 나들이", "사진 찍기"],
        },
        {
            "email": "jaehyun@example.com",
            "name": "재현",
            "bio": "아침 러닝과 카페 리커버리를 좋아하는 액티브 라이프 애호가입니다.",
            "password": "demo1234",
            "interests": ["러닝", "웰니스", "카페"],
        },
    ]

    users = []
    for spec in mock_users:
        user = User(
            email=spec["email"],
            name=spec["name"],
            bio=spec["bio"],
            hashed_password=hash_password(spec["password"]),
        )
        user.interests = await get_or_create_interests(session, spec["interests"])
        session.add(user)
        users.append(user)

    await session.flush()

    mock_meetings = [
        {
            "title": "무드 플레이리스트 서울",
            "description": "한남동 감성 카페에서 취향 기반 음악 플레이리스트를 함께 만들고 서로의 추천곡을 공유하는 모임입니다.",
            "category": "Music & Culture",
            "location": "한남동 소울카페",
            "max_members": 8,
            "owner": users[0],
            "start_at": "2026-06-14T19:00:00",
            "end_at": "2026-06-14T21:30:00",
            "schedule": {
                "location": "한남동 소울카페 2층",
                "scheduled_at": "2026-06-14T19:00:00",
                "activity": "감성 플레이리스트 제작 & 추천곡 공유",
                "capacity": 8,
                "settings": "각자 좋아하는 곡 2곡 준비",
            },
        },
        {
            "title": "브런치 & 비건 감성 토크",
            "description": "연남동 비건 카페에서 식물성 브런치를 즐기며 지속 가능한 라이프스타일과 카페 취향을 나누는 소그룹 모임입니다.",
            "category": "Food & Lifestyle",
            "location": "연남동 플랜트 브런치",
            "max_members": 6,
            "owner": users[1],
            "start_at": "2026-06-15T10:30:00",
            "end_at": "2026-06-15T13:00:00",
            "schedule": {
                "location": "연남동 플랜트 브런치 메인 홀",
                "scheduled_at": "2026-06-15T10:30:00",
                "activity": "비건 브런치 & 지속 가능한 라이프스타일 토크",
                "capacity": 6,
                "settings": "비건 메뉴 추천 카드 제공",
            },
        },
        {
            "title": "디지털 노마드 크리에이터 워크숍",
            "description": "성수동 크리에이터 하우스에서 프로젝트 기획과 생산성 루틴을 공유하는 모임입니다.",
            "category": "Creator & Work",
            "location": "성수 크리에이터 하우스",
            "max_members": 7,
            "owner": users[2],
            "start_at": "2026-06-16T18:00:00",
            "end_at": "2026-06-16T20:30:00",
            "schedule": {
                "location": "성수 크리에이터 하우스 세미나룸",
                "scheduled_at": "2026-06-16T18:00:00",
                "activity": "콘텐츠 기획 워크숍 & 크리에이터 콜라보 아이디어 공유",
                "capacity": 7,
                "settings": "각자 현재 기획 중인 콘텐츠 1개 소개",
            },
        },
        {
            "title": "무비 나잇 x 시네마틱 토크",
            "description": "홍대 시네마 라운지에서 한 편의 영화를 함께 보고 감독과 장르, 감성에 대해 토론하는 모임입니다.",
            "category": "Culture & Film",
            "location": "홍대 시네마 라운지",
            "max_members": 10,
            "owner": users[3],
            "start_at": "2026-06-17T19:30:00",
            "end_at": "2026-06-17T22:00:00",
            "schedule": {
                "location": "홍대 시네마 라운지 라운지 A",
                "scheduled_at": "2026-06-17T19:30:00",
                "activity": "영화 상영 및 시네마 토크",
                "capacity": 10,
                "settings": "감상 후 자유 토론 세션 포함",
            },
        },
        {
            "title": "서울 나이트 스트리트 푸드 트립",
            "description": "광장시장 야시장과 성수 스트리트푸드를 돌며 매콤하고 퓨전한 길거리 음식을 함께 즐기는 모임입니다.",
            "category": "Food & Nightlife",
            "location": "광장시장 야시장",
            "max_members": 8,
            "owner": users[4],
            "start_at": "2026-06-18T20:00:00",
            "end_at": "2026-06-18T22:30:00",
            "schedule": {
                "location": "광장시장 야시장 출구 앞",
                "scheduled_at": "2026-06-18T20:00:00",
                "activity": "스트릿푸드 테이스팅 & 사진 스팟 투어",
                "capacity": 8,
                "settings": "각자 좋아하는 푸드 스타일 공유",
            },
        },
        {
            "title": "서울 힙스터 러닝 & 릴렉스",
            "description": "한강에서 감성 러닝을 즐기고 근처 힙 카페에서 리커버리 시간을 가지는 액티브 라이프 모임입니다.",
            "category": "Active & Wellness",
            "location": "여의도 한강공원 + 마포 힙카페",
            "max_members": 6,
            "owner": users[5],
            "start_at": "2026-06-19T08:00:00",
            "end_at": "2026-06-19T10:30:00",
            "schedule": {
                "location": "여의도 한강공원 러닝 코스",
                "scheduled_at": "2026-06-19T08:00:00",
                "activity": "아침 러닝 & 힙 카페 리커버리",
                "capacity": 6,
                "settings": "러닝 페이스 사전 공유",
            },
        },
    ]

    for spec in mock_meetings:
        meeting = Meeting(
            title=spec["title"],
            description=spec["description"],
            category=spec["category"],
            location=spec["location"],
            max_members=spec["max_members"],
            start_at=datetime.fromisoformat(spec["start_at"]),
            end_at=datetime.fromisoformat(spec["end_at"]),
            owner=spec["owner"],
        )
        session.add(meeting)
        await session.flush()

        schedule_spec = spec["schedule"]
        schedule = MeetingSchedule(
            meeting_id=meeting.id,
            location=schedule_spec["location"],
            scheduled_at=datetime.fromisoformat(schedule_spec["scheduled_at"]),
            activity=schedule_spec["activity"],
            capacity=schedule_spec["capacity"],
            settings=schedule_spec["settings"],
        )
        session.add(schedule)

    await session.commit()


async def init_db() -> None:
    import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        await seed_db(session)
