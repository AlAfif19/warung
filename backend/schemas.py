"""
Pydantic schemas for API request/response models
"""
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum


# Enums
class ProductMode(str, Enum):
    per_pcs = "per_pcs"
    per_batch = "per_batch"


class PricingTier(str, Enum):
    competitive = "competitive"
    standard = "standard"
    premium = "premium"
    manual = "manual"


class FixedCostCategory(str, Enum):
    rent = "rent"
    utilities = "utilities"
    internet = "internet"
    salary = "salary"
    marketing = "marketing"
    other = "other"


class AllocationMethod(str, Enum):
    proportional = "proportional"
    manual = "manual"


# Base Models
class RawMaterialBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    quantity: Decimal = Field(..., gt=0, decimal_places=3)
    unit: str = Field(..., min_length=1, max_length=50)
    unit_price: Decimal = Field(..., ge=0, decimal_places=2)


class RawMaterialCreate(RawMaterialBase):
    pass


class RawMaterialResponse(RawMaterialBase):
    id: int
    total: Decimal
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class FixedCostBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: FixedCostCategory = FixedCostCategory.other
    monthly_amount: Decimal = Field(..., gt=0, decimal_places=2)
    is_marketing: bool = False
    description: Optional[str] = None


class FixedCostCreate(FixedCostBase):
    pass


class FixedCostResponse(FixedCostBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductFixedCostAllocationBase(BaseModel):
    fixed_cost_id: int
    allocation_method: AllocationMethod = AllocationMethod.proportional
    allocated_amount: Decimal = Field(..., ge=0, decimal_places=2)
    allocation_percentage: Decimal = Field(default=0.0, ge=0, le=100, decimal_places=2)


class ProductFixedCostAllocationCreate(ProductFixedCostAllocationBase):
    pass


class ProductFixedCostAllocationResponse(ProductFixedCostAllocationBase):
    id: int
    product_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    mode: ProductMode = ProductMode.per_pcs
    batch_size: int = Field(default=1, gt=0)
    selling_price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    pricing_tier: PricingTier = PricingTier.standard


class ProductCreate(ProductBase):
    raw_materials: List[RawMaterialCreate] = []
    fixed_cost_allocations: List[ProductFixedCostAllocationCreate] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    mode: Optional[ProductMode] = None
    batch_size: Optional[int] = Field(default=None, gt=0)
    selling_price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    pricing_tier: Optional[PricingTier] = None


class ProductResponse(ProductBase):
    id: int
    hpp_per_unit: Decimal
    raw_materials: List[RawMaterialResponse] = []
    fixed_cost_allocations: List[ProductFixedCostAllocationResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductDetailResponse(ProductResponse):
    total_raw_material_cost: Decimal
    total_fixed_cost_allocation: Decimal
    pricing_suggestions: dict


class BusinessProjectionBase(BaseModel):
    product_id: int
    target_profit_monthly: Decimal = Field(..., ge=0, decimal_places=2)
    selling_price_used: Decimal = Field(..., gt=0, decimal_places=2)
    scenario_name: Optional[str] = Field(default="Default", max_length=255)


class BusinessProjectionCreate(BusinessProjectionBase):
    pass


class BusinessProjectionResponse(BusinessProjectionBase):
    id: int
    target_units_monthly: int
    target_units_daily: Decimal
    projected_revenue: Decimal
    projected_total_product_cost: Decimal
    projected_total_fixed_cost: Decimal
    projected_gross_profit: Decimal
    projected_net_profit: Decimal
    gross_margin_percent: Decimal
    net_margin_percent: Decimal
    roas_ratio: Optional[Decimal] = None
    break_even_units: int
    break_even_revenue: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True


class ScenarioBase(BaseModel):
    product_id: int
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_active: bool = False


class ScenarioCreate(ScenarioBase):
    pass


class ScenarioResponse(ScenarioBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Calculation Request/Response Models
class HPPCalculationRequest(BaseModel):
    mode: ProductMode = ProductMode.per_pcs
    batch_size: int = Field(default=1, gt=0)
    raw_materials: List[RawMaterialCreate]
    fixed_costs: List[FixedCostCreate] = []
    fixed_cost_allocations: List[ProductFixedCostAllocationCreate] = []


class HPPCalculationResponse(BaseModel):
    hpp_per_unit: Decimal
    total_raw_material_cost: Decimal
    total_fixed_cost_allocation: Decimal
    raw_materials_breakdown: List[dict]
    fixed_costs_breakdown: List[dict]
    pricing_suggestions: dict


class ProjectionCalculationRequest(BaseModel):
    hpp_per_unit: Decimal
    selling_price: Decimal
    total_fixed_cost_monthly: Decimal
    marketing_cost_monthly: Decimal = Field(default=0.0, ge=0, decimal_places=2)
    target_profit_monthly: Decimal


class ProjectionCalculationResponse(BaseModel):
    target_units_monthly: int
    target_units_daily: Decimal
    projected_revenue: Decimal
    projected_total_product_cost: Decimal
    projected_total_fixed_cost: Decimal
    projected_gross_profit: Decimal
    projected_net_profit: Decimal
    gross_margin_percent: Decimal
    net_margin_percent: Decimal
    roas_ratio: Optional[Decimal] = None
    break_even_units: int
    break_even_revenue: Decimal
    recommendations: List[str]


# Export Request/Response Models
class ExportRequest(BaseModel):
    product_id: int
    projection_id: Optional[int] = None
    format: str = Field(..., pattern="^(pdf|excel)$")
    include_charts: bool = True


class ExportResponse(BaseModel):
    file_url: str
    file_name: str
    format: str
    created_at: datetime


# Generic Response Models
class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    success: bool = False
