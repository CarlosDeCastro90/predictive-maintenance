from datetime import datetime
from typing import Optional, List, Any, Dict
from uuid import UUID
from pydantic import BaseModel, Field


class MachineCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    machine_type: str = Field(..., pattern="^(motor|compressor|pump|turbine|conveyor|fan|generator|other)$")
    sector_id: Optional[UUID] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    maintenance_interval_days: int = Field(default=90)
    threshold_vib_warning: float = Field(default=2.5)
    threshold_vib_critical: float = Field(default=5.0)
    threshold_temp_warning: float = Field(default=75.0)
    threshold_temp_critical: float = Field(default=90.0)


class MachineUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    threshold_vib_warning: Optional[float] = None
    threshold_vib_critical: Optional[float] = None
    threshold_temp_warning: Optional[float] = None
    threshold_temp_critical: Optional[float] = None
    next_maintenance: Optional[datetime] = None


class SensorReadingCreate(BaseModel):
    machine_id: UUID
    device_id: str = Field(..., max_length=50)
    firmware_ver: str = Field(default="v1.0.0")
    vib_x: Optional[float] = None
    vib_y: Optional[float] = None
    vib_z: Optional[float] = None
    vib_rms: Optional[float] = None
    temp_bearing: Optional[float] = None
    temp_motor: Optional[float] = None
    temp_ambient: Optional[float] = None
    rpm: Optional[float] = None
    current_a: Optional[float] = None
    voltage_v: Optional[float] = None
    pressure_bar: Optional[float] = None
    signal_rssi: Optional[int] = None


class AlertAcknowledge(BaseModel):
    resolution_notes: Optional[str] = None


class MaintenanceOrderCreate(BaseModel):
    machine_id: UUID
    order_type: str = Field(default="preventive")
    priority: str = Field(default="medium")
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    tasks: List[str] = Field(default_factory=list)
    scheduled_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    alert_id: Optional[UUID] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    machine_id: Optional[UUID] = None
    history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    response: str
    tokens_used: Optional[int] = None


class DashboardStats(BaseModel):
    total_machines: int
    operational: int
    warning: int
    critical: int
    offline: int
    open_alerts: int
    critical_alerts: int
    pending_orders: int
    avg_health_score: float