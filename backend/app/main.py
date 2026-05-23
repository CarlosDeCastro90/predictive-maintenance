from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from app.core.config import get_settings
from app.api.v1.router import api_router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 PredictAI API a arrancar — ambiente: {settings.environment}")
    logger.info(f"📡 Supabase: {settings.supabase_url}")
    logger.info(f"🤖 Groq model: {settings.groq_model}")
    yield
    logger.info("👋 PredictAI API a encerrar")

app = FastAPI(
    title="PredictAI — Predictive Maintenance API",
    description="API para monitorização de sensores IoT e manutenção preditiva com IA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.environment,
    }

@app.get("/", tags=["System"])
async def root():
    return {
        "name": "PredictAI API",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Erro não tratado: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Erro interno do servidor"},
    )