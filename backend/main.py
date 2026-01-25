"""
Main FastAPI application for Warung HPP Calculator API
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from database import get_db, get_cors_origins, settings
from models import (
    Product, RawMaterial, FixedCost, ProductFixedCostAllocation,
    BusinessProjection, Scenario
)
from schemas import (
    ProductCreate, ProductUpdate, ProductResponse, ProductDetailResponse,
    RawMaterialCreate, RawMaterialResponse,
    FixedCostCreate, FixedCostResponse,
    ProductFixedCostAllocationCreate, ProductFixedCostAllocationResponse,
    BusinessProjectionCreate, BusinessProjectionResponse,
    ScenarioCreate, ScenarioResponse,
    HPPCalculationRequest, HPPCalculationResponse,
    ProjectionCalculationRequest, ProjectionCalculationResponse,
    MessageResponse, ErrorResponse
)
from calculations import calculation_service

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API for HPP Calculator and Business Projection System"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


# ==================== Products Endpoints ====================

@app.post("/api/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, tags=["Products"])
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """
    Create a new product with raw materials and fixed cost allocations
    """
    # Create product
    db_product = Product(
        name=product.name,
        mode=product.mode,
        batch_size=product.batch_size,
        selling_price=product.selling_price,
        pricing_tier=product.pricing_tier
    )
    db.add(db_product)
    db.flush()  # Get the product ID
    
    # Calculate HPP
    hpp_response = calculation_service.calculate_hpp(
        mode=product.mode,
        batch_size=product.batch_size,
        raw_materials=product.raw_materials,
        fixed_cost_allocations=product.fixed_cost_allocations
    )
    
    # Update product HPP
    db_product.hpp_per_unit = hpp_response.hpp_per_unit
    
    # Create raw materials
    for material in product.raw_materials:
        db_material = RawMaterial(
            product_id=db_product.id,
            name=material.name,
            quantity=material.quantity,
            unit=material.unit,
            unit_price=material.unit_price,
            total=material.quantity * material.unit_price
        )
        db.add(db_material)
    
    # Create fixed cost allocations
    for allocation in product.fixed_cost_allocations:
        db_allocation = ProductFixedCostAllocation(
            product_id=db_product.id,
            fixed_cost_id=allocation.fixed_cost_id,
            allocation_method=allocation.allocation_method,
            allocated_amount=allocation.allocated_amount,
            allocation_percentage=allocation.allocation_percentage
        )
        db.add(db_allocation)
    
    db.commit()
    db.refresh(db_product)
    
    return db_product


@app.get("/api/products", response_model=List[ProductResponse], tags=["Products"])
def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all products
    """
    products = db.query(Product).offset(skip).limit(limit).all()
    return products


@app.get("/api/products/{product_id}", response_model=ProductDetailResponse, tags=["Products"])
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get product details with HPP breakdown and pricing suggestions
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate totals
    total_raw_material_cost = sum(m.total for m in product.raw_materials)
    total_fixed_cost_allocation = sum(a.allocated_amount for a in product.fixed_cost_allocations)
    
    # Calculate pricing suggestions
    pricing_suggestions = calculation_service._calculate_pricing_suggestions(product.hpp_per_unit)
    
    # Build response
    response_dict = {
        "id": product.id,
        "name": product.name,
        "mode": product.mode,
        "batch_size": product.batch_size,
        "hpp_per_unit": product.hpp_per_unit,
        "selling_price": product.selling_price,
        "pricing_tier": product.pricing_tier,
        "raw_materials": product.raw_materials,
        "fixed_cost_allocations": product.fixed_cost_allocations,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
        "total_raw_material_cost": total_raw_material_cost,
        "total_fixed_cost_allocation": total_fixed_cost_allocation,
        "pricing_suggestions": pricing_suggestions
    }
    
    return response_dict


@app.put("/api/products/{product_id}", response_model=ProductResponse, tags=["Products"])
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    """
    Update product details
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update fields if provided
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    
    return product


@app.delete("/api/products/{product_id}", response_model=MessageResponse, tags=["Products"])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Delete a product
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    
    return MessageResponse(message="Product deleted successfully")


# ==================== Raw Materials Endpoints ====================

@app.post("/api/products/{product_id}/raw-materials", response_model=RawMaterialResponse, status_code=status.HTTP_201_CREATED, tags=["Raw Materials"])
def add_raw_material(product_id: int, material: RawMaterialCreate, db: Session = Depends(get_db)):
    """
    Add a raw material to a product
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_material = RawMaterial(
        product_id=product_id,
        name=material.name,
        quantity=material.quantity,
        unit=material.unit,
        unit_price=material.unit_price,
        total=material.quantity * material.unit_price
    )
    db.add(db_material)
    
    # Recalculate HPP
    raw_materials = [
        RawMaterialCreate(
            name=m.name,
            quantity=m.quantity,
            unit=m.unit,
            unit_price=m.unit_price
        ) for m in product.raw_materials
    ]
    raw_materials.append(material)
    
    fixed_cost_allocations = [
        ProductFixedCostAllocationCreate(
            fixed_cost_id=a.fixed_cost_id,
            allocation_method=a.allocation_method,
            allocated_amount=a.allocated_amount,
            allocation_percentage=a.allocation_percentage
        ) for a in product.fixed_cost_allocations
    ]
    
    hpp_response = calculation_service.calculate_hpp(
        mode=product.mode,
        batch_size=product.batch_size,
        raw_materials=raw_materials,
        fixed_cost_allocations=fixed_cost_allocations
    )
    
    product.hpp_per_unit = hpp_response.hpp_per_unit
    
    db.commit()
    db.refresh(db_material)
    
    return db_material


# ==================== Fixed Costs Endpoints ====================

@app.post("/api/fixed-costs", response_model=FixedCostResponse, status_code=status.HTTP_201_CREATED, tags=["Fixed Costs"])
def create_fixed_cost(fixed_cost: FixedCostCreate, db: Session = Depends(get_db)):
    """
    Create a new fixed cost
    """
    db_fixed_cost = FixedCost(
        name=fixed_cost.name,
        category=fixed_cost.category,
        monthly_amount=fixed_cost.monthly_amount,
        is_marketing=fixed_cost.is_marketing,
        description=fixed_cost.description
    )
    db.add(db_fixed_cost)
    db.commit()
    db.refresh(db_fixed_cost)
    
    return db_fixed_cost


@app.get("/api/fixed-costs", response_model=List[FixedCostResponse], tags=["Fixed Costs"])
def list_fixed_costs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all fixed costs
    """
    fixed_costs = db.query(FixedCost).offset(skip).limit(limit).all()
    return fixed_costs


@app.get("/api/fixed-costs/{fixed_cost_id}", response_model=FixedCostResponse, tags=["Fixed Costs"])
def get_fixed_cost(fixed_cost_id: int, db: Session = Depends(get_db)):
    """
    Get fixed cost details
    """
    fixed_cost = db.query(FixedCost).filter(FixedCost.id == fixed_cost_id).first()
    if not fixed_cost:
        raise HTTPException(status_code=404, detail="Fixed cost not found")
    
    return fixed_cost


# ==================== Fixed Cost Allocations Endpoints ====================

@app.post("/api/products/{product_id}/fixed-cost-allocations", response_model=ProductFixedCostAllocationResponse, status_code=status.HTTP_201_CREATED, tags=["Fixed Cost Allocations"])
def add_fixed_cost_allocation(
    product_id: int,
    allocation: ProductFixedCostAllocationCreate,
    db: Session = Depends(get_db)
):
    """
    Add a fixed cost allocation to a product
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    fixed_cost = db.query(FixedCost).filter(FixedCost.id == allocation.fixed_cost_id).first()
    if not fixed_cost:
        raise HTTPException(status_code=404, detail="Fixed cost not found")
    
    db_allocation = ProductFixedCostAllocation(
        product_id=product_id,
        fixed_cost_id=allocation.fixed_cost_id,
        allocation_method=allocation.allocation_method,
        allocated_amount=allocation.allocated_amount,
        allocation_percentage=allocation.allocation_percentage
    )
    db.add(db_allocation)
    
    # Recalculate HPP
    raw_materials = [
        RawMaterialCreate(
            name=m.name,
            quantity=m.quantity,
            unit=m.unit,
            unit_price=m.unit_price
        ) for m in product.raw_materials
    ]
    
    fixed_cost_allocations = [
        ProductFixedCostAllocationCreate(
            fixed_cost_id=a.fixed_cost_id,
            allocation_method=a.allocation_method,
            allocated_amount=a.allocated_amount,
            allocation_percentage=a.allocation_percentage
        ) for a in product.fixed_cost_allocations
    ]
    fixed_cost_allocations.append(allocation)
    
    hpp_response = calculation_service.calculate_hpp(
        mode=product.mode,
        batch_size=product.batch_size,
        raw_materials=raw_materials,
        fixed_cost_allocations=fixed_cost_allocations
    )
    
    product.hpp_per_unit = hpp_response.hpp_per_unit
    
    db.commit()
    db.refresh(db_allocation)
    
    return db_allocation


# ==================== Business Projections Endpoints ====================

@app.post("/api/business-projections", response_model=BusinessProjectionResponse, status_code=status.HTTP_201_CREATED, tags=["Business Projections"])
def create_business_projection(projection: BusinessProjectionCreate, db: Session = Depends(get_db)):
    """
    Create a business projection for a product
    """
    product = db.query(Product).filter(Product.id == projection.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate total fixed cost and marketing cost
    total_fixed_cost = sum(a.allocated_amount for a in product.fixed_cost_allocations)
    marketing_cost = sum(
        fc.monthly_amount for fc in db.query(FixedCost).filter(FixedCost.is_marketing == True).all()
        if any(a.fixed_cost_id == fc.id for a in product.fixed_cost_allocations)
    )
    
    # Calculate projection
    projection_response = calculation_service.calculate_projection(
        hpp_per_unit=product.hpp_per_unit,
        selling_price=projection.selling_price_used,
        total_fixed_cost_monthly=total_fixed_cost,
        marketing_cost_monthly=marketing_cost,
        target_profit_monthly=projection.target_profit_monthly
    )
    
    # Create projection record
    db_projection = BusinessProjection(
        product_id=projection.product_id,
        scenario_name=projection.scenario_name,
        target_profit_monthly=projection.target_profit_monthly,
        selling_price_used=projection.selling_price_used,
        target_units_monthly=projection_response.target_units_monthly,
        target_units_daily=projection_response.target_units_daily,
        projected_revenue=projection_response.projected_revenue,
        projected_total_product_cost=projection_response.projected_total_product_cost,
        projected_total_fixed_cost=projection_response.projected_total_fixed_cost,
        projected_gross_profit=projection_response.projected_gross_profit,
        projected_net_profit=projection_response.projected_net_profit,
        gross_margin_percent=projection_response.gross_margin_percent,
        net_margin_percent=projection_response.net_margin_percent,
        roas_ratio=projection_response.roas_ratio,
        break_even_units=projection_response.break_even_units,
        break_even_revenue=projection_response.break_even_revenue
    )
    db.add(db_projection)
    db.commit()
    db.refresh(db_projection)
    
    return db_projection


@app.get("/api/products/{product_id}/projections", response_model=List[BusinessProjectionResponse], tags=["Business Projections"])
def list_product_projections(product_id: int, db: Session = Depends(get_db)):
    """
    List all business projections for a product
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    projections = db.query(BusinessProjection).filter(BusinessProjection.product_id == product_id).all()
    return projections


# ==================== Calculation Endpoints ====================

@app.post("/api/calculate/hpp", response_model=HPPCalculationResponse, tags=["Calculations"])
def calculate_hpp(request: HPPCalculationRequest):
    """
    Calculate HPP without saving to database
    """
    return calculation_service.calculate_hpp(
        mode=request.mode,
        batch_size=request.batch_size,
        raw_materials=request.raw_materials,
        fixed_cost_allocations=request.fixed_cost_allocations
    )


@app.post("/api/calculate/projection", response_model=ProjectionCalculationResponse, tags=["Calculations"])
def calculate_projection(request: ProjectionCalculationRequest):
    """
    Calculate business projection without saving to database
    """
    return calculation_service.calculate_projection(
        hpp_per_unit=request.hpp_per_unit,
        selling_price=request.selling_price,
        total_fixed_cost_monthly=request.total_fixed_cost_monthly,
        marketing_cost_monthly=request.marketing_cost_monthly,
        target_profit_monthly=request.target_profit_monthly
    )


# ==================== Scenarios Endpoints ====================

@app.post("/api/scenarios", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED, tags=["Scenarios"])
def create_scenario(scenario: ScenarioCreate, db: Session = Depends(get_db)):
    """
    Create a new scenario for a product
    """
    product = db.query(Product).filter(Product.id == scenario.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_scenario = Scenario(
        product_id=scenario.product_id,
        name=scenario.name,
        description=scenario.description,
        is_active=scenario.is_active
    )
    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)
    
    return db_scenario


@app.get("/api/products/{product_id}/scenarios", response_model=List[ScenarioResponse], tags=["Scenarios"])
def list_product_scenarios(product_id: int, db: Session = Depends(get_db)):
    """
    List all scenarios for a product
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    scenarios = db.query(Scenario).filter(Scenario.product_id == product_id).all()
    return scenarios


# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
