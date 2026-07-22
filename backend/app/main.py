from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models import StepAnalyticsRequest, StepAnalyticsResponse
from .analytics import analyze_steps

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("Starting Step Counter AI Analytics Engine...")
    yield
    # Shutdown logic
    print("Shutting down...")

app = FastAPI(
    title="Step Counter AI Analytics",
    description="Backend for Step Counter AI Analytics App",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/v1/analyze", response_model=StepAnalyticsResponse)
async def analyze_endpoint(request: StepAnalyticsRequest):
    return analyze_steps(request.daily_steps, request.goal)
