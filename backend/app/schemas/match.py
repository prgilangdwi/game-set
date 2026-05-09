from typing import Optional
from pydantic import BaseModel, Field


class ScoreUpdate(BaseModel):
    match_id: str
    team1_score: int = Field(..., ge=0)
    team2_score: int = Field(..., ge=0)
    status: Optional[str] = None


class MatchResponse(BaseModel):
    id: str
    round_id: str
    tournament_id: str
    court_number: int
    team1_player1_id: str
    team1_player2_id: str
    team2_player1_id: str
    team2_player2_id: str
    team1_score: int
    team2_score: int
    status: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str
    # Nested player info (joined)
    team1_player1: Optional[dict] = None
    team1_player2: Optional[dict] = None
    team2_player1: Optional[dict] = None
    team2_player2: Optional[dict] = None


class RoundResponse(BaseModel):
    id: str
    tournament_id: str
    round_number: int
    status: str
    created_at: str


class StandingResponse(BaseModel):
    id: str
    tournament_id: str
    player_id: str
    player: Optional[dict] = None
    matches_played: int
    wins: int
    losses: int
    points: int
    points_for: int
    points_against: int
    differential: int
    rank: int
    prev_rank: Optional[int] = None
