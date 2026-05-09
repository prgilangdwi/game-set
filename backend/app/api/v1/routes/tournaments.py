from fastapi import APIRouter, HTTPException, status
from app.core.deps import SupabaseDep, CurrentUser
from app.schemas.tournament import TournamentCreate, TournamentUpdate, TournamentResponse
from app.schemas.player import AddPlayersRequest, PlayerResponse, PlayerUpdate
from app.schemas.match import MatchResponse, RoundResponse, StandingResponse, ScoreUpdate
from app.services import americano_engine

router = APIRouter(prefix="/tournaments", tags=["tournaments"])


def _get_tournament_or_403(supabase, tournament_id: str, user_id: str) -> dict:
    res = supabase.table("tournaments").select("*").eq("id", tournament_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Tournament not found")
    if res.data["organizer_id"] != user_id:
        raise HTTPException(403, "Not authorized")
    return res.data


# ── Tournament CRUD ──────────────────────────────────────────────────────────

@router.get("", response_model=list[TournamentResponse])
async def list_tournaments(supabase: SupabaseDep, user: CurrentUser):
    res = supabase.table("tournaments").select("*, players(count)").eq("organizer_id", user["id"]).order("created_at", desc=True).execute()
    tournaments = res.data or []
    for t in tournaments:
        players_data = t.pop("players", [])
        t["player_count"] = players_data[0]["count"] if players_data else 0
    return tournaments


@router.post("", response_model=TournamentResponse, status_code=201)
async def create_tournament(body: TournamentCreate, supabase: SupabaseDep, user: CurrentUser):
    data = body.model_dump(exclude_none=True)
    data["organizer_id"] = user["id"]
    if data.get("start_date"):
        data["start_date"] = str(data["start_date"])
    if data.get("end_date"):
        data["end_date"] = str(data["end_date"])
    res = supabase.table("tournaments").insert(data).execute()
    return res.data[0]


@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(tournament_id: str, supabase: SupabaseDep, user: CurrentUser):
    res = supabase.table("tournaments").select("*, players(count)").eq("id", tournament_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Tournament not found")
    t = res.data
    players_data = t.pop("players", [])
    t["player_count"] = players_data[0]["count"] if players_data else 0
    # Allow organizer or public
    if t["organizer_id"] != user["id"] and not t["is_public"]:
        raise HTTPException(403, "Not authorized")
    return t


@router.patch("/{tournament_id}", response_model=TournamentResponse)
async def update_tournament(tournament_id: str, body: TournamentUpdate, supabase: SupabaseDep, user: CurrentUser):
    _get_tournament_or_403(supabase, tournament_id, user["id"])
    data = body.model_dump(exclude_none=True)
    if data.get("start_date"):
        data["start_date"] = str(data["start_date"])
    if data.get("end_date"):
        data["end_date"] = str(data["end_date"])
    res = supabase.table("tournaments").update(data).eq("id", tournament_id).execute()
    return res.data[0]


@router.delete("/{tournament_id}", status_code=204)
async def delete_tournament(tournament_id: str, supabase: SupabaseDep, user: CurrentUser):
    _get_tournament_or_403(supabase, tournament_id, user["id"])
    supabase.table("tournaments").delete().eq("id", tournament_id).execute()


@router.post("/{tournament_id}/start", response_model=TournamentResponse)
async def start_tournament(tournament_id: str, supabase: SupabaseDep, user: CurrentUser):
    t = _get_tournament_or_403(supabase, tournament_id, user["id"])
    if t["status"] != "draft":
        raise HTTPException(400, "Tournament is not in draft status")
    players_res = supabase.table("players").select("id").eq("tournament_id", tournament_id).execute()
    if len(players_res.data or []) < 4:
        raise HTTPException(400, "Need at least 4 players to start")
    res = supabase.table("tournaments").update({"status": "active"}).eq("id", tournament_id).execute()
    return res.data[0]


# ── Players ──────────────────────────────────────────────────────────────────

@router.get("/{tournament_id}/players", response_model=list[PlayerResponse])
async def list_players(tournament_id: str, supabase: SupabaseDep, user: CurrentUser):
    res = supabase.table("players").select("*").eq("tournament_id", tournament_id).order("created_at").execute()
    return res.data or []


@router.post("/{tournament_id}/players", response_model=list[PlayerResponse], status_code=201)
async def add_players(tournament_id: str, body: AddPlayersRequest, supabase: SupabaseDep, user: CurrentUser):
    _get_tournament_or_403(supabase, tournament_id, user["id"])
    rows = [{"tournament_id": tournament_id, **p.model_dump()} for p in body.players]
    res = supabase.table("players").insert(rows).execute()
    return res.data


@router.patch("/{tournament_id}/players/{player_id}", response_model=PlayerResponse)
async def update_player(tournament_id: str, player_id: str, body: PlayerUpdate, supabase: SupabaseDep, user: CurrentUser):
    _get_tournament_or_403(supabase, tournament_id, user["id"])
    data = body.model_dump(exclude_none=True)
    res = supabase.table("players").update(data).eq("id", player_id).eq("tournament_id", tournament_id).execute()
    if not res.data:
        raise HTTPException(404, "Player not found")
    return res.data[0]


@router.delete("/{tournament_id}/players/{player_id}", status_code=204)
async def remove_player(tournament_id: str, player_id: str, supabase: SupabaseDep, user: CurrentUser):
    _get_tournament_or_403(supabase, tournament_id, user["id"])
    supabase.table("players").delete().eq("id", player_id).eq("tournament_id", tournament_id).execute()


@router.post("/{tournament_id}/players/{player_id}/checkin", response_model=PlayerResponse)
async def checkin_player(tournament_id: str, player_id: str, supabase: SupabaseDep, user: CurrentUser):
    _get_tournament_or_403(supabase, tournament_id, user["id"])
    res = supabase.table("players").update({"is_checked_in": True}).eq("id", player_id).execute()
    return res.data[0]


# ── Schedule generation ───────────────────────────────────────────────────────

@router.post("/{tournament_id}/schedule/generate", response_model=RoundResponse, status_code=201)
async def generate_round(tournament_id: str, supabase: SupabaseDep, user: CurrentUser):
    t = _get_tournament_or_403(supabase, tournament_id, user["id"])
    if t["status"] != "active":
        raise HTTPException(400, "Tournament must be active to generate rounds")

    # Get players
    players_res = supabase.table("players").select("*").eq("tournament_id", tournament_id).execute()
    players = players_res.data or []
    if len(players) < 4:
        raise HTTPException(400, "Need at least 4 players")

    # Get existing matches for history
    existing_matches_res = supabase.table("matches").select("*").eq("tournament_id", tournament_id).execute()
    history = americano_engine.build_history_from_matches(existing_matches_res.data or [])

    # Determine next round number
    rounds_res = supabase.table("rounds").select("round_number").eq("tournament_id", tournament_id).order("round_number", desc=True).limit(1).execute()
    next_num = (rounds_res.data[0]["round_number"] + 1) if rounds_res.data else 1

    # Generate slots
    is_mixed = t["format"] == "mixed_doubles"
    slots = americano_engine.generate_round(players, t["courts"], history, mixed_doubles=is_mixed)
    if not slots:
        raise HTTPException(400, "Cannot generate valid round with current players")

    # Create round
    round_res = supabase.table("rounds").insert({
        "tournament_id": tournament_id,
        "round_number": next_num,
        "status": "active",
    }).execute()
    round_id = round_res.data[0]["id"]

    # Record history so next call doesn't repeat pairs
    history.record_round(slots)

    # Insert matches
    match_rows = [
        {
            "round_id": round_id,
            "tournament_id": tournament_id,
            "court_number": slot.court,
            "team1_player1_id": slot.team1[0],
            "team1_player2_id": slot.team1[1],
            "team2_player1_id": slot.team2[0],
            "team2_player2_id": slot.team2[1],
            "team1_score": 0,
            "team2_score": 0,
            "status": "scheduled",
        }
        for slot in slots
    ]
    supabase.table("matches").insert(match_rows).execute()

    return round_res.data[0]


# ── Matches ───────────────────────────────────────────────────────────────────

@router.get("/{tournament_id}/matches", response_model=list[MatchResponse])
async def list_matches(tournament_id: str, supabase: SupabaseDep, user: CurrentUser):
    res = supabase.table("matches").select(
        "*, "
        "team1_player1:players!team1_player1_id(id,first_name,last_name,display_name,gender,skill_level), "
        "team1_player2:players!team1_player2_id(id,first_name,last_name,display_name,gender,skill_level), "
        "team2_player1:players!team2_player1_id(id,first_name,last_name,display_name,gender,skill_level), "
        "team2_player2:players!team2_player2_id(id,first_name,last_name,display_name,gender,skill_level)"
    ).eq("tournament_id", tournament_id).order("created_at").execute()
    return res.data or []


@router.get("/{tournament_id}/rounds", response_model=list[RoundResponse])
async def list_rounds(tournament_id: str, supabase: SupabaseDep, user: CurrentUser):
    res = supabase.table("rounds").select("*").eq("tournament_id", tournament_id).order("round_number").execute()
    return res.data or []


@router.get("/{tournament_id}/rounds/{round_id}/matches", response_model=list[MatchResponse])
async def list_round_matches(tournament_id: str, round_id: str, supabase: SupabaseDep, user: CurrentUser):
    res = supabase.table("matches").select(
        "*, "
        "team1_player1:players!team1_player1_id(*), "
        "team1_player2:players!team1_player2_id(*), "
        "team2_player1:players!team2_player1_id(*), "
        "team2_player2:players!team2_player2_id(*)"
    ).eq("round_id", round_id).eq("tournament_id", tournament_id).execute()
    return res.data or []


@router.patch("/{tournament_id}/matches/{match_id}/score", response_model=MatchResponse)
async def update_score(tournament_id: str, match_id: str, body: ScoreUpdate, supabase: SupabaseDep, user: CurrentUser):
    _get_tournament_or_403(supabase, tournament_id, user["id"])
    data: dict = {"team1_score": body.team1_score, "team2_score": body.team2_score}
    if body.status:
        data["status"] = body.status
    res = supabase.table("matches").update(data).eq("id", match_id).execute()
    if not res.data:
        raise HTTPException(404, "Match not found")
    return res.data[0]


@router.post("/{tournament_id}/matches/{match_id}/start", response_model=MatchResponse)
async def start_match(tournament_id: str, match_id: str, supabase: SupabaseDep, user: CurrentUser):
    _get_tournament_or_403(supabase, tournament_id, user["id"])
    from datetime import datetime, timezone
    res = supabase.table("matches").update({"status": "live", "started_at": datetime.now(timezone.utc).isoformat()}).eq("id", match_id).execute()
    return res.data[0]


@router.post("/{tournament_id}/matches/{match_id}/complete", response_model=MatchResponse)
async def complete_match(tournament_id: str, match_id: str, supabase: SupabaseDep, user: CurrentUser):
    _get_tournament_or_403(supabase, tournament_id, user["id"])
    from datetime import datetime, timezone
    res = supabase.table("matches").update({
        "status": "completed",
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", match_id).execute()
    return res.data[0]


# ── Standings ─────────────────────────────────────────────────────────────────

@router.get("/{tournament_id}/standings", response_model=list[StandingResponse])
async def get_standings(tournament_id: str, supabase: SupabaseDep, user: CurrentUser):
    res = supabase.table("standings").select(
        "*, player:players(id,first_name,last_name,display_name,gender,skill_level)"
    ).eq("tournament_id", tournament_id).order("rank").execute()
    return res.data or []
