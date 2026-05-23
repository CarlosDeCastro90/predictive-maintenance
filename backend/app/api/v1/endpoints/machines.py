from uuid import UUID
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.db.supabase import get_supabase_admin
from app.schemas.schemas import MachineCreate, MachineUpdate

router = APIRouter(prefix="/machines", tags=["Machines"])
db = get_supabase_admin()


@router.get("/")
async def list_machines(
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
):
    query = db.table("machines").select(
        "*, sectors(name)"
    ).limit(limit).order("name")
    if status:
        query = query.eq("status", status)
    return query.execute().data


@router.get("/{machine_id}")
async def get_machine(machine_id: UUID):
    result = db.table("machines").select(
        "*, sectors(name)"
    ).eq("id", str(machine_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    reading = db.table("sensor_readings").select(
        "vib_rms, temp_bearing, temp_motor, rpm, timestamp"
    ).eq("machine_id", str(machine_id)).order(
        "timestamp", desc=True
    ).limit(1).execute()
    machine = result.data
    machine["latest_reading"] = reading.data[0] if reading.data else None
    return machine


@router.post("/", status_code=201)
async def create_machine(payload: MachineCreate):
    data = payload.model_dump(exclude_none=True)
    data = {k: str(v) if isinstance(v, UUID) else v for k, v in data.items()}
    result = db.table("machines").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Erro ao criar máquina")
    return result.data[0]


@router.patch("/{machine_id}")
async def update_machine(machine_id: UUID, payload: MachineUpdate):
    data = payload.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum campo para actualizar")
    result = db.table("machines").update(data).eq(
        "id", str(machine_id)
    ).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return result.data[0]


@router.delete("/{machine_id}", status_code=204)
async def delete_machine(machine_id: UUID):
    db.table("machines").delete().eq("id", str(machine_id)).execute()


@router.get("/{machine_id}/stats")
async def get_machine_stats(
    machine_id: UUID,
    hours: int = Query(24, ge=1, le=720),
):
    result = db.rpc("machine_stats", {
        "p_machine_id": str(machine_id),
        "p_hours": hours
    }).execute()
    return {"machine_id": str(machine_id), "hours": hours, "stats": result.data}