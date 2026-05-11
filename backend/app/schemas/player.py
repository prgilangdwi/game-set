from typing import Literal, Optional
from pydantic import BaseModel, Field

PlayerGender = Literal["male", "female", "other"]
SkillLevel = Literal["beginner", "intermediate", "advanced", "pro"]


class PlayerInput(BaseModel):
    name: str = Field(..., min_length=1)
    email: Optional[str] = None
    gender: PlayerGender = "male"
    skill_level: SkillLevel = "intermediate"


class AddPlayersRequest(BaseModel):
    players: list[PlayerInput]


class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[PlayerGender] = None
    skill_level: Optional[SkillLevel] = None
    is_checked_in: Optional[bool] = None


class PlayerResponse(BaseModel):
    id: str
    tournament_id: str
    user_id: Optional[str] = None
    name: str
    display_name: str
    email: Optional[str] = None
    gender: str
    skill_level: str
    rating: int
    is_checked_in: bool
    created_at: str
