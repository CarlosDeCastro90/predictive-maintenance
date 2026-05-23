from uuid import UUID
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.db.supabase import get_supabase_admin
from app.schemas.schemas import MaintenanceOrderCreate

router = APIRouter(prefix="/orders", tags=["Maintenance Orders"])
db = get_supabase_admin()


@router.get("/")
async def list_orders(
    status: Optional[str] = Query(None),
    machine_id: Optional[UUID] = None,
    limit: int = Query(50, le=200),
):
    query = db.table("maintenance_orders").select(
        "*, machines(name, machine_type, location)"
    ).order("created_at", desc=True).limit(limit)
    if status:
        query = query.eq("status", status)
    if machine_id:
        query = query.eq("machine_id", str(machine_id))
    return query.execute().data


@router.post("/", status_code=201)
async def create_order(payload: MaintenanceOrderCreate):
    data = payload.model_dump(exclude_none=True)
    for key in ["machine_id", "alert_id"]:
        if key in data and data[key]:
            data[key] = str(data[key])
    if "tasks" in data:
        data["tasks"] = [{"title": t, "done": False} for t in data["tasks"]]
    result = db.table("maintenance_orders").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Erro ao criar ordem")
    return result.data[0]


@router.patch("/{order_id}/start")
async def start_order(order_id: UUID):
    result = db.table("maintenance_orders").update({
        "status": "in_progress",
        "started_at": "now()",
    }).eq("id", str(order_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")
    return result.data[0]


@router.patch("/{order_id}/complete")
async def complete_order(
    order_id: UUID,
    actual_hours: Optional[float] = None,
    notes: Optional[str] = None,
):
    order = db.table("maintenance_orders").select(
        "machine_id"
    ).eq("id", str(order_id)).single().execute().data

    update_data: dict = {"status": "completed", "completed_at": "now()"}
    if actual_hours:
        update_data["actual_hours"] = actual_hours
    if notes:
        update_data["notes"] = notes

    result = db.table("maintenance_orders").update(update_data).eq(
        "id", str(order_id)
    ).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")

    if order:
        db.table("machines").update({
            "last_maintenance": "now()",
            "status": "operational",
            "health_score": 95.0,
        }).eq("id", order["machine_id"]).execute()

    return result.data[0]


@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: UUID, reason: Optional[str] = None):
    result = db.table("maintenance_orders").update({
        "status": "cancelled",
        "notes": reason,
    }).eq("id", str(order_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")
    return result.data[0]