
from fastapi import APIRouter, HTTPException
from typing import List
from app.core.deps import SupabaseDep, CurrentUser
from app.schemas.profile import ProfileUpdate, ProfileResponse

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(current_user: CurrentUser, supabase: SupabaseDep):
    resp = supabase.table("profiles").select("*").eq("id", current_user["id"]).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(data: ProfileUpdate, current_user: CurrentUser, supabase: SupabaseDep):
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    resp = supabase.table("profiles").update(update_data).eq("id", current_user["id"]).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data[0]


@router.get("", response_model=List[ProfileResponse])
async def list_profiles(_: CurrentUser, supabase: SupabaseDep):
    resp = supabase.table("profiles").select("*").order("name").execute()
    return resp.data or []


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str, _: CurrentUser, supabase: SupabaseDep):
    resp = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data


@router.get("/{user_id}/stats")
async def get_player_stats(user_id: str, _: CurrentUser, supabase: SupabaseDep):
    # Find all player records linked to this user
    players_res = supabase.table("players").select("id").eq("user_id", user_id).execute()
    player_ids = [p["id"] for p in (players_res.data or [])]

    if not player_ids:
        return {"tournaments_played": 0, "matches_played": 0, "wins": 0, "losses": 0, "points": 0, "win_rate": 0}

    standings_res = supabase.table("standings").select("*").in_("player_id", player_ids).execute()
    standings = standings_res.data or []

    matches_played = sum(s.get("matches_played", 0) for s in standings)
    wins = sum(s.get("wins", 0) for s in standings)
    losses = sum(s.get("losses", 0) for s in standings)
    points = sum(s.get("points", 0) for s in standings)
    win_rate = round(wins / matches_played * 100) if matches_played > 0 else 0

    return {
        "tournaments_played": len(standings),
        "matches_played": matches_played,
        "wins": wins,
        "losses": losses,
        "points": points,
        "win_rate": win_rate,
    }
