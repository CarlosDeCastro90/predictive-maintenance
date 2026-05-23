from uuid import UUID
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.db.supabase import get_supabase_admin
from app.schemas.schemas import AlertAcknowledge

router = APIRouter(prefix="/alerts", tags=["Alerts"])
db = get_supabase_admin()


@router.get("/")
async def list_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    machine_id: Optional[UUID] = None,
    limit: int = Query(50, le=200),
):
    query = db.table("alerts").select(
        "*, machines(name, machine_type)"
    ).order("created_at", desc=True).limit(limit)
    if status:
        query = query.eq("status", status)
    if severity:
        query = query.eq("severity", severity)
    if machine_id:
        query = query.eq("machine_id", str(machine_id))
    return query.execute().data


@router.get("/{alert_id}")
async def get_alert(alert_id: UUID):
    result = db.table("alerts").select(
        "*, machines(name, machine_type, health_score)"
    ).eq("id", str(alert_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return result.data


@router.patch("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: UUID, payload: AlertAcknowledge):
    result = db.table("alerts").update({
        "status": "acknowledged",
        "resolution_notes": payload.resolution_notes,
    }).eq("id", str(alert_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return result.data[0]


@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: UUID, payload: AlertAcknowledge):
    result = db.table("alerts").update({
        "status": "resolved",
        "resolved_at": "now()",
        "resolution_notes": payload.resolution_notes,
    }).eq("id", str(alert_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return result.data[0]