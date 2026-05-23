from uuid import UUID
from typing import List
from fastapi import APIRouter, HTTPException, Query
from app.db.supabase import get_supabase_admin
from app.schemas.schemas import SensorReadingCreate

router = APIRouter(prefix="/readings", tags=["Sensor Readings"])
db = get_supabase_admin()


@router.post("/", status_code=201)
async def ingest_reading(payload: SensorReadingCreate):
    data = payload.model_dump(exclude_none=True)
    data["machine_id"] = str(data["machine_id"])
    result = db.table("sensor_readings").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Erro ao guardar leitura")
    return {"success": True, "id": result.data[0]["id"]}


@router.get("/machine/{machine_id}")
async def get_readings(
    machine_id: UUID,
    hours: int = Query(24, ge=1, le=720),
    limit: int = Query(200, le=1000),
):
    result = db.table("sensor_readings").select(
        "id, timestamp, vib_x, vib_y, vib_z, vib_rms,"
        "temp_bearing, temp_motor, temp_ambient, rpm, current_a"
    ).eq("machine_id", str(machine_id)).gte(
        "timestamp", f"now() - interval '{hours} hours'"
    ).order("timestamp").limit(limit).execute()
    return result.data


@router.get("/machine/{machine_id}/latest")
async def get_latest_reading(machine_id: UUID):
    result = db.table("sensor_readings").select("*").eq(
        "machine_id", str(machine_id)
    ).order("timestamp", desc=True).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Sem leituras para esta máquina")
    return result.data[0]