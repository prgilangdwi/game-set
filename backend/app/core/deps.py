from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from .config import settings

bearer = HTTPBearer(auto_error=False)


def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_ANON_KEY)


def get_supabase_anon() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    supabase: Annotated[Client, Depends(get_supabase)],
) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = credentials.credentials
    try:
        resp = supabase.auth.get_user(token)
        if not resp.user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"id": resp.user.id, "email": resp.user.email, "user": resp.user}
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    supabase: Annotated[Client, Depends(get_supabase)],
) -> dict | None:
    if not credentials:
        return None
    try:
        resp = supabase.auth.get_user(credentials.credentials)
        if resp.user:
            return {"id": resp.user.id, "email": resp.user.email}
    except Exception:
        pass
    return None


SupabaseDep = Annotated[Client, Depends(get_supabase)]
CurrentUser = Annotated[dict, Depends(get_current_user)]
OptionalUser = Annotated[dict | None, Depends(get_optional_user)]
