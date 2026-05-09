from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skill_level: Optional[str] = None
    years_playing: Optional[int] = None
    location: Optional[str] = None
    preferred_hand: Optional[str] = None
    favorite_surface: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skill_level: Optional[str] = None
    years_playing: Optional[int] = None
    location: Optional[str] = None
    preferred_hand: Optional[str] = None
    favorite_surface: Optional[str] = None
    role: Optional[str] = None
    created_at: Optional[datetime] = None
