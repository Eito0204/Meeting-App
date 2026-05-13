from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class InterestOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=2, max_length=80)
    bio: str | None = None
    interests: list[str] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    bio: str | None
    interests: list[InterestOut] = []

    model_config = {"from_attributes": True}


class MeetingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, min_length=5)
    category: str | None = Field(default=None, min_length=2, max_length=50)
    location: str | None = Field(default=None, min_length=2, max_length=120)
    max_members: int | None = Field(default=None, ge=2, le=200)
    start_at: datetime | None = None
    end_at: datetime | None = None


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    bio: str | None = None
    interests: list[str] | None = None


class MeetingCreate(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5)
    category: str = Field(min_length=2, max_length=50)
    location: str = Field(min_length=2, max_length=120)
    max_members: int = Field(ge=2, le=200)
    start_at: datetime
    end_at: datetime | None = None


class MeetingOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    location: str
    max_members: int
    start_at: datetime
    end_at: datetime | None
    owner: UserOut
    approved_members: int = 0

    model_config = {"from_attributes": True}


class ApplicationCreate(BaseModel):
    message: str | None = None


class ApplicationOut(BaseModel):
    id: int
    meeting_id: int
    user: UserOut
    status: str
    message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ApplicationInboxOut(BaseModel):
    id: int
    meeting_id: int
    meeting_title: str
    user: UserOut
    status: str
    message: str | None
    created_at: datetime


class ApplicationDecision(BaseModel):
    status: str = Field(pattern="^(approved|rejected)$")


class BoardPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=120)
    content: str | None = Field(default=None, min_length=2)


class BoardPostCreate(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    content: str = Field(min_length=2)
    meeting_id: int | None = None


class BoardPostOut(BaseModel):
    id: int
    meeting_id: int | None
    meeting_title: str | None = None
    author: UserOut
    title: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatMessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class ChatMessageOut(BaseModel):
    id: int
    meeting_id: int
    sender: UserOut
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
