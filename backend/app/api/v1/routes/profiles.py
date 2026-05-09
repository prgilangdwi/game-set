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
async def list_profiles(current_user: CurrentUser, supabase: SupabaseDep):
    resp = supabase.table("profiles").select("*").order("name").execute()
    return resp.data or []


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str, current_user: CurrentUser, supabase: SupabaseDep):
    resp = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data
