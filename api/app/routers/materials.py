from fastapi import APIRouter

from app.schemas.materials import SupplierSearchRequest, SupplierSearchResponse
from app.services.material_engine import build_material_results

router = APIRouter(prefix="/materials", tags=["Materials"])


@router.post("/search", response_model=SupplierSearchResponse)
def search_material_suppliers(payload: SupplierSearchRequest):
    materials = build_material_results(payload.job_type, payload.sort_by)

    return {
        "detected_job_type": payload.job_type,
        "materials": materials,
    }