"""
SQLAlchemy ORM models for database tables
"""
from sqlalchemy import Column, Integer, String, Enum as SQLEnum, DateTime, Boolean, Text, ForeignKey, Index, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from schemas import ProductMode, PricingTier, FixedCostCategory, AllocationMethod


class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    mode = Column(SQLEnum(ProductMode), nullable=False, default=ProductMode.per_pcs)
    batch_size = Column(Integer, default=1, comment="Number of units per batch if mode is per_batch")
    hpp_per_unit = Column(Numeric(12, 2), default=0.00)
    selling_price = Column(Numeric(12, 2), default=0.00)
    pricing_tier = Column(SQLEnum(PricingTier), default=PricingTier.standard)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    raw_materials = relationship("RawMaterial", back_populates="product", cascade="all, delete-orphan")
    fixed_cost_allocations = relationship("ProductFixedCostAllocation", back_populates="product", cascade="all, delete-orphan")
    business_projections = relationship("BusinessProjection", back_populates="product", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="product", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_mode', 'mode'),
        Index('idx_created_at', 'created_at'),
    )


class RawMaterial(Base):
    __tablename__ = "raw_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    quantity = Column(Numeric(10, 3), nullable=False)
    unit = Column(String(50), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    total = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="raw_materials")
    
    __table_args__ = (
        Index('idx_product_id', 'product_id'),
    )


class FixedCost(Base):
    __tablename__ = "fixed_costs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(SQLEnum(FixedCostCategory), nullable=False, default=FixedCostCategory.other)
    monthly_amount = Column(Numeric(12, 2), nullable=False)
    is_marketing = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product_allocations = relationship("ProductFixedCostAllocation", back_populates="fixed_cost", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_category', 'category'),
        Index('idx_is_marketing', 'is_marketing'),
    )


class ProductFixedCostAllocation(Base):
    __tablename__ = "product_fixed_cost_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    fixed_cost_id = Column(Integer, ForeignKey("fixed_costs.id", ondelete="CASCADE"), nullable=False)
    allocation_method = Column(SQLEnum(AllocationMethod), nullable=False, default=AllocationMethod.proportional)
    allocated_amount = Column(Numeric(12, 2), nullable=False)
    allocation_percentage = Column(Numeric(5, 2), default=0.00)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="fixed_cost_allocations")
    fixed_cost = relationship("FixedCost", back_populates="product_allocations")
    
    __table_args__ = (
        Index('idx_product_id', 'product_id'),
        Index('idx_fixed_cost_id', 'fixed_cost_id'),
    )


class BusinessProjection(Base):
    __tablename__ = "business_projections"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    scenario_name = Column(String(255), default="Default")
    target_profit_monthly = Column(Numeric(12, 2), nullable=False)
    selling_price_used = Column(Numeric(12, 2), nullable=False)
    target_units_monthly = Column(Integer, nullable=False)
    target_units_daily = Column(Numeric(10, 2), nullable=False)
    projected_revenue = Column(Numeric(12, 2), nullable=False)
    projected_total_product_cost = Column(Numeric(12, 2), nullable=False)
    projected_total_fixed_cost = Column(Numeric(12, 2), nullable=False)
    projected_gross_profit = Column(Numeric(12, 2), nullable=False)
    projected_net_profit = Column(Numeric(12, 2), nullable=False)
    gross_margin_percent = Column(Numeric(5, 2), nullable=False)
    net_margin_percent = Column(Numeric(5, 2), nullable=False)
    roas_ratio = Column(Numeric(6, 2), nullable=True)
    break_even_units = Column(Integer, nullable=False)
    break_even_revenue = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="business_projections")
    
    __table_args__ = (
        Index('idx_product_id', 'product_id'),
        Index('idx_created_at', 'created_at'),
    )


class UnitsConversion(Base):
    __tablename__ = "units_conversion"
    
    id = Column(Integer, primary_key=True, index=True)
    base_unit = Column(String(50), nullable=False)
    target_unit = Column(String(50), nullable=False)
    conversion_factor = Column(Numeric(10, 6), nullable=False)
    category = Column(String(50), default="general")
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_category', 'category'),
    )


class Scenario(Base):
    __tablename__ = "scenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="scenarios")
    
    __table_args__ = (
        Index('idx_product_id', 'product_id'),
        Index('idx_is_active', 'is_active'),
    )
