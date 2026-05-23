from uuid import UUID
from typing import Optional
from fastapi import APIRouter, HTTPException
from app.db.supabase import get_supabase_admin
from app.schemas.schemas import ChatRequest, ChatResponse, DashboardStats
from app.services.groq_service import get_groq_service

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])
dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
db = get_supabase_admin()


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    machine_context = None

    if payload.machine_id:
        machine = db.table("machines").select("*").eq(
            "id", str(payload.machine_id)
        ).single().execute().data

        if machine:
            reading = db.table("sensor_readings").select(
                "vib_rms, temp_bearing, temp_motor, rpm, timestamp"
            ).eq("machine_id", str(payload.machine_id)).order(
                "timestamp", desc=True
            ).limit(1).execute().data

            machine_context = {**machine}
            if reading:
                machine_context.update(reading[0])

    groq = get_groq_service()
    history = [m.model_dump() for m in payload.history]

    try:
    result = groq.chat_sync(
        message=payload.message,
        history=history,
        machine_context=machine_context,
    )
except Exception as e:
    from loguru import logger
    logger.error(f"Erro Groq: {type(e).__name__}: {e}")
    raise HTTPException(status_code=500, detail=f"Erro Groq: {str(e)}")

    return ChatResponse(
        response=result["response"],
        tokens_used=result.get("tokens_used"),
    )


@dashboard_router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    machines = db.table("machines").select(
        "status, health_score"
    ).execute().data or []

    status_counts = {
        "operational": 0, "warning": 0,
        "critical": 0, "offline": 0, "maintenance": 0
    }
    total_health = 0.0

    for m in machines:
        s = m.get("status", "offline")
        status_counts[s] = status_counts.get(s, 0) + 1
        total_health += float(m.get("health_score") or 0)

    avg_health = round(total_health / len(machines), 1) if machines else 0.0

    open_alerts = db.table("alerts").select(
        "id", count="exact"
    ).eq("status", "open").execute()

    critical_alerts = db.table("alerts").select(
        "id", count="exact"
    ).eq("status", "open").eq("severity", "critical").execute()

    pending_orders = db.table("maintenance_orders").select(
        "id", count="exact"
    ).in_("status", ["pending", "in_progress"]).execute()

    return DashboardStats(
        total_machines=len(machines),
        operational=status_counts["operational"],
        warning=status_counts["warning"],
        critical=status_counts["critical"],
        offline=status_counts["offline"],
        open_alerts=open_alerts.count or 0,
        critical_alerts=critical_alerts.count or 0,
        pending_orders=pending_orders.count or 0,
        avg_health_score=avg_health,
    )


@dashboard_router.get("/machines/map")
async def get_machines_map():
    result = db.table("machines").select(
        "id, name, machine_type, status, health_score, latitude, longitude, location"
    ).not_.is_("latitude", "null").execute()
    return result.data