from typing import List, Optional, Literal

from pydantic import BaseModel, Field


SortOption = Literal["cheapest", "nearest", "fastest", "lowest_shipping"]


class SupplierSearchRequest(BaseModel):
    job_type: str = Field(..., min_length=2)
    job_notes: Optional[str] = None
    customer_zip: Optional[str] = None
    sort_by: SortOption = "cheapest"


class SupplierOption(BaseModel):
    supplier: str
    item_name: str
    price: float
    shipping_cost: float
    shipping_days: int
    distance_miles: Optional[float] = None
    in_stock: bool = True
    pickup_available: bool = False
    supplier_type: str  # local or online


class MaterialResult(BaseModel):
    material_name: str
    quantity: int
    options: List[SupplierOption]


class SupplierSearchResponse(BaseModel):
    detected_job_type: str
    materials: List[MaterialResult]