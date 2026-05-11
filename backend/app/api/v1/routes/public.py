from fastapi import APIRouter, HTTPException
from app.core.deps import SupabaseDep
from app.schemas.tournament import TournamentResponse
from app.schemas.match import MatchResponse, StandingResponse

router = APIRouter(prefix="/public", tags=["public"])


def _get_public_tournament(supabase, slug_or_id: str) -> dict:
    # Try by slug first, then by ID
    res = supabase.table("tournaments").select("*, players(count)").eq("slug", slug_or_id).eq("is_public", True).maybe_single().execute()
    if not res.data:
        res = supabase.table("tournaments").select("*, players(count)").eq("id", slug_or_id).eq("is_public", True).maybe_single().execute()
    if not res.data:
        raise HTTPException(404, "Tournament not found or not public")
    t = res.data
    players_data = t.pop("players", [])
    t["player_count"] = players_data[0]["count"] if players_data else 0
    return t


@router.get("/tournaments/{slug_or_id}", response_model=TournamentResponse)
async def get_public_tournament(slug_or_id: str, supabase: SupabaseDep):
    return _get_public_tournament(supabase, slug_or_id)


@router.get("/tournaments/{slug_or_id}/matches", response_model=list[MatchResponse])
async def get_public_matches(slug_or_id: str, supabase: SupabaseDep):
    tournament = _get_public_tournament(supabase, slug_or_id)
    res = supabase.table("matches").select(
        "*, "
        "team1_player1:players!team1_player1_id(id,name,display_name,gender,skill_level), "
        "team1_player2:players!team1_player2_id(id,name,display_name,gender,skill_level), "
        "team2_player1:players!team2_player1_id(id,name,display_name,gender,skill_level), "
        "team2_player2:players!team2_player2_id(id,name,display_name,gender,skill_level)"
    ).eq("tournament_id", tournament["id"]).order("created_at").execute()
    return res.data or []


@router.get("/tournaments/{slug_or_id}/standings", response_model=list[StandingResponse])
async def get_public_standings(slug_or_id: str, supabase: SupabaseDep):
    tournament = _get_public_tournament(supabase, slug_or_id)
    res = supabase.table("standings").select(
        "*, player:players(id,name,display_name,gender,skill_level)"
    ).eq("tournament_id", tournament["id"]).order("rank").execute()
    return res.data or []
