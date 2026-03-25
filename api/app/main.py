from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base, engine
from app.models import user, company
from app.routers.health import router as health_router
from app.routers.onboarding import router as onboarding_router
from app.routers.auth import router as auth_router
from app.routers.materials import router as materials_router

app = FastAPI(title=settings.APP_NAME)

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(onboarding_router)
app.include_router(auth_router)
app.include_router(materials_router)


@app.get("/")
def root():
    return {
        "message": "Contractor Estimator Platform API is running",
        "app_name": settings.APP_NAME,
    }