from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.routes.tournaments import router as tournaments_router
from app.api.v1.routes.public import router as public_router

app = FastAPI(
    title="GameSet API",
    description="Tennis tournament management platform",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tournaments_router, prefix="/api/v1")
app.include_router(public_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/v1")
async def api_root():
    return {"message": "GameSet API v1"}
