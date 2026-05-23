from fastapi import APIRouter
from app.api.v1.endpoints.machines  import router as machines_router
from app.api.v1.endpoints.readings  import router as readings_router
from app.api.v1.endpoints.alerts    import router as alerts_router
from app.api.v1.endpoints.orders    import router as orders_router
from app.api.v1.endpoints.assistant import router as assistant_router
from app.api.v1.endpoints.assistant import dashboard_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(machines_router)
api_router.include_router(readings_router)
api_router.include_router(alerts_router)
api_router.include_router(orders_router)
api_router.include_router(assistant_router)
api_router.include_router(dashboard_router)