from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, Field

TournamentFormat = Literal[
    "americano", "mexicano", "round_robin", "single_elimination",
    "double_elimination", "mixed_doubles", "team_cup", "ladder"
]
TournamentStatus = Literal["draft", "active", "completed", "cancelled"]
SportType = Literal["tennis", "badminton", "padel", "pickleball"]


class TournamentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sport: SportType = "tennis"
    description: Optional[str] = None
    format: TournamentFormat = "americano"
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    courts: int = Field(default=4, ge=1, le=20)
    match_duration: int = Field(default=20, gt=0)
    break_duration: int = Field(default=5, ge=0)
    scoring_system: str = Field(default="points")
    match_type: Optional[str] = None
    is_public: bool = True
    max_players: Optional[int] = None


class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    sport: Optional[SportType] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    courts: Optional[int] = Field(default=None, ge=1, le=20)
    match_duration: Optional[int] = Field(default=None, gt=0)
    break_duration: Optional[int] = Field(default=None, ge=0)
    scoring_system: Optional[str] = None
    match_type: Optional[str] = None
    is_public: Optional[bool] = None
    status: Optional[TournamentStatus] = None


class TournamentResponse(BaseModel):
    id: str
    organizer_id: str
    name: str
    sport: str = "tennis"
    description: Optional[str] = None
    format: str
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    courts: int
    match_duration: int
    break_duration: int
    scoring_system: str
    match_type: Optional[str] = None
    status: str
    is_public: bool
    slug: Optional[str] = None
    max_players: Optional[int] = None
    created_at: str
    player_count: Optional[int] = None
