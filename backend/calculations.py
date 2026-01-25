"""
Calculation service module for HPP and business projections
"""
from decimal import Decimal, getcontext, ROUND_HALF_UP
from typing import List, Dict, Optional, Tuple
from schemas import (
    ProductMode, PricingTier, RawMaterialCreate, FixedCostCreate,
    ProductFixedCostAllocationCreate, HPPCalculationRequest,
    ProjectionCalculationRequest, HPPCalculationResponse, ProjectionCalculationResponse
)

# Set decimal precision for financial calculations
getcontext().prec = 12
getcontext().rounding = ROUND_HALF_UP


class CalculationService:
    """Service class for HPP and business projection calculations"""
    
    @staticmethod
    def calculate_hpp(
        mode: ProductMode,
        batch_size: int,
        raw_materials: List[RawMaterialCreate],
        fixed_cost_allocations: List[ProductFixedCostAllocationCreate]
    ) -> HPPCalculationResponse:
        """
        Calculate HPP per unit based on raw materials and fixed costs
        
        Args:
            mode: Calculation mode (per_pcs or per_batch)
            batch_size: Number of units in batch (if mode is per_batch)
            raw_materials: List of raw material inputs
            fixed_cost_allocations: List of fixed cost allocations
            
        Returns:
            HPPCalculationResponse with calculated values
        """
        # Calculate total raw material cost
        total_raw_material_cost = Decimal('0.00')
        raw_materials_breakdown = []
        
        for material in raw_materials:
            material_total = material.quantity * material.unit_price
            total_raw_material_cost += material_total
            raw_materials_breakdown.append({
                "name": material.name,
                "quantity": float(material.quantity),
                "unit": material.unit,
                "unit_price": float(material.unit_price),
                "total": float(material_total)
            })
        
        # Adjust for batch mode
        if mode == ProductMode.per_batch and batch_size > 1:
            raw_material_cost_per_unit = total_raw_material_cost / Decimal(batch_size)
        else:
            raw_material_cost_per_unit = total_raw_material_cost
        
        # Calculate total fixed cost allocation
        total_fixed_cost_allocation = Decimal('0.00')
        fixed_costs_breakdown = []
        
        for allocation in fixed_cost_allocations:
            total_fixed_cost_allocation += allocation.allocated_amount
            fixed_costs_breakdown.append({
                "fixed_cost_id": allocation.fixed_cost_id,
                "allocation_method": allocation.allocation_method,
                "allocated_amount": float(allocation.allocated_amount),
                "allocation_percentage": float(allocation.allocation_percentage)
            })
        
        # Calculate HPP per unit
        hpp_per_unit = raw_material_cost_per_unit + total_fixed_cost_allocation
        
        # Calculate pricing suggestions (3-tier)
        pricing_suggestions = CalculationService._calculate_pricing_suggestions(hpp_per_unit)
        
        return HPPCalculationResponse(
            hpp_per_unit=round(hpp_per_unit, 2),
            total_raw_material_cost=round(total_raw_material_cost, 2),
            total_fixed_cost_allocation=round(total_fixed_cost_allocation, 2),
            raw_materials_breakdown=raw_materials_breakdown,
            fixed_costs_breakdown=fixed_costs_breakdown,
            pricing_suggestions=pricing_suggestions
        )
    
    @staticmethod
    def _calculate_pricing_suggestions(hpp_per_unit: Decimal) -> Dict:
        """
        Calculate 3-tier pricing suggestions
        
        Args:
            hpp_per_unit: HPP per unit
            
        Returns:
            Dictionary with pricing suggestions
        """
        margins = {
            "competitive": Decimal('0.15'),  # 15%
            "standard": Decimal('0.30'),     # 30%
            "premium": Decimal('0.50')       # 50%
        }
        
        suggestions = {}
        for tier, margin in margins.items():
            selling_price = hpp_per_unit * (Decimal('1') + margin)
            profit = selling_price - hpp_per_unit
            suggestions[tier] = {
                "margin_percent": float(margin * Decimal('100')),
                "selling_price": float(round(selling_price, 2)),
                "profit_per_unit": float(round(profit, 2))
            }
        
        return suggestions
    
    @staticmethod
    def calculate_projection(
        hpp_per_unit: Decimal,
        selling_price: Decimal,
        total_fixed_cost_monthly: Decimal,
        marketing_cost_monthly: Decimal,
        target_profit_monthly: Decimal
    ) -> ProjectionCalculationResponse:
        """
        Calculate business projection based on HPP, selling price, and targets
        
        Args:
            hpp_per_unit: HPP per unit
            selling_price: Selling price per unit
            total_fixed_cost_monthly: Total fixed costs per month
            marketing_cost_monthly: Marketing costs per month
            target_profit_monthly: Target net profit per month
            
        Returns:
            ProjectionCalculationResponse with calculated projections
        """
        # Validate selling price > HPP
        if selling_price <= hpp_per_unit:
            raise ValueError("Selling price must be greater than HPP for profitable business")
        
        # Calculate contribution margin per unit
        contribution_margin = selling_price - hpp_per_unit
        
        # Total costs (fixed + marketing)
        total_monthly_costs = total_fixed_cost_monthly + marketing_cost_monthly
        
        # Calculate target units needed
        target_units_monthly = (total_monthly_costs + target_profit_monthly) / contribution_margin
        target_units_monthly_int = int(target_units_monthly) + 1  # Round up to ensure profit target
        
        # Calculate daily target
        target_units_daily = Decimal(target_units_monthly_int) / Decimal('30')
        
        # Calculate projections
        projected_revenue = Decimal(target_units_monthly_int) * selling_price
        projected_total_product_cost = Decimal(target_units_monthly_int) * hpp_per_unit
        projected_total_fixed_cost = total_monthly_costs
        
        # Calculate profits
        projected_gross_profit = projected_revenue - projected_total_product_cost
        projected_net_profit = projected_revenue - (projected_total_product_cost + projected_total_fixed_cost)
        
        # Calculate margins
        gross_margin_percent = (projected_gross_profit / projected_revenue) * Decimal('100')
        net_margin_percent = (projected_net_profit / projected_revenue) * Decimal('100')
        
        # Calculate ROAS (if marketing cost > 0)
        roas_ratio = None
        if marketing_cost_monthly > 0:
            roas_ratio = projected_revenue / marketing_cost_monthly
        
        # Calculate break-even point
        break_even_units = int(total_monthly_costs / contribution_margin) + 1
        break_even_revenue = Decimal(break_even_units) * selling_price
        
        # Generate recommendations
        recommendations = CalculationService._generate_recommendations(
            gross_margin_percent,
            net_margin_percent,
            roas_ratio,
            projected_net_profit
        )
        
        return ProjectionCalculationResponse(
            target_units_monthly=target_units_monthly_int,
            target_units_daily=round(target_units_daily, 2),
            projected_revenue=round(projected_revenue, 2),
            projected_total_product_cost=round(projected_total_product_cost, 2),
            projected_total_fixed_cost=round(projected_total_fixed_cost, 2),
            projected_gross_profit=round(projected_gross_profit, 2),
            projected_net_profit=round(projected_net_profit, 2),
            gross_margin_percent=round(gross_margin_percent, 2),
            net_margin_percent=round(net_margin_percent, 2),
            roas_ratio=round(roas_ratio, 2) if roas_ratio else None,
            break_even_units=break_even_units,
            break_even_revenue=round(break_even_revenue, 2),
            recommendations=recommendations
        )
    
    @staticmethod
    def _generate_recommendations(
        gross_margin: Decimal,
        net_margin: Decimal,
        roas: Optional[Decimal],
        net_profit: Decimal
    ) -> List[str]:
        """
        Generate business recommendations based on calculated metrics
        
        Args:
            gross_margin: Gross margin percentage
            net_margin: Net margin percentage
            roas: ROAS ratio
            net_profit: Net profit amount
            
        Returns:
            List of recommendation strings
        """
        recommendations = []
        
        # Gross margin analysis
        if gross_margin < Decimal('40'):
            recommendations.append(
                "⚠️ Gross Margin di bawah 40%. Pertimbangkan mencari supplier lebih murah atau menaikkan harga jual."
            )
        elif gross_margin >= Decimal('40') and gross_margin < Decimal('60'):
            recommendations.append(
                "✅ Gross Margin sehat (40-60%). Pertahankan strategi saat ini."
            )
        else:
            recommendations.append(
                "🎯 Gross Margin sangat baik (>60%). Pertimbangkan ekspansi produk atau investasi."
            )
        
        # Net margin analysis
        if net_margin < Decimal('10'):
            recommendations.append(
                "⚠️ Net Margin tipis (<10%). Kurangi biaya operasional atau tingkatkan volume penjualan."
            )
        elif net_margin >= Decimal('10') and net_margin < Decimal('20'):
            recommendations.append(
                "✅ Net Margin cukup sehat (10-20%). Ruang untuk optimasi lebih lanjut."
            )
        else:
            recommendations.append(
                "🎯 Net Margin sangat baik (>20%). Bisnis berjalan sangat efisien."
            )
        
        # ROAS analysis (if applicable)
        if roas is not None:
            if roas < Decimal('2'):
                recommendations.append(
                    "❌ ROAS rendah (<2x). Iklan tidak efektif. Pertimbangkan hentikan atau optimasi targeting."
                )
            elif roas >= Decimal('2') and roas < Decimal('4'):
                recommendations.append(
                    "✅ ROAS cukup baik (2-4x). Iklan efektif namun bisa dioptimasi."
                )
            else:
                recommendations.append(
                    "🎯 ROAS sangat baik (>4x). Iklan sangat efektif, pertimbangkan scale up."
                )
        
        # Profit analysis
        if net_profit < 0:
            recommendations.append(
                "❌ Proyeksi rugi bulanan. Segera revisi harga atau biaya operasional."
            )
        else:
            recommendations.append(
                f"💰 Proyeksi laba bulanan positif. Target tercapai dengan margin yang sehat."
            )
        
        return recommendations
    
    @staticmethod
    def calculate_fixed_cost_allocation(
        total_fixed_cost: Decimal,
        allocation_method: str,
        allocation_percentage: Optional[Decimal] = None,
        manual_amount: Optional[Decimal] = None
    ) -> Decimal:
        """
        Calculate fixed cost allocation based on method
        
        Args:
            total_fixed_cost: Total fixed cost to allocate
            allocation_method: Method of allocation (proportional or manual)
            allocation_percentage: Percentage for proportional allocation
            manual_amount: Manual amount for manual allocation
            
        Returns:
            Allocated amount
        """
        if allocation_method == "proportional":
            if allocation_percentage is None:
                raise ValueError("Allocation percentage required for proportional method")
            return (total_fixed_cost * allocation_percentage) / Decimal('100')
        elif allocation_method == "manual":
            if manual_amount is None:
                raise ValueError("Manual amount required for manual allocation")
            return manual_amount
        else:
            raise ValueError(f"Unknown allocation method: {allocation_method}")
    
    @staticmethod
    def calculate_break_even(
        hpp_per_unit: Decimal,
        selling_price: Decimal,
        total_fixed_cost: Decimal
    ) -> Tuple[int, Decimal]:
        """
        Calculate break-even point
        
        Args:
            hpp_per_unit: HPP per unit
            selling_price: Selling price per unit
            total_fixed_cost: Total fixed costs
            
        Returns:
            Tuple of (break_even_units, break_even_revenue)
        """
        contribution_margin = selling_price - hpp_per_unit
        if contribution_margin <= 0:
            raise ValueError("Selling price must be greater than HPP")
        
        break_even_units = int(total_fixed_cost / contribution_margin) + 1
        break_even_revenue = Decimal(break_even_units) * selling_price
        
        return break_even_units, break_even_revenue
    
    @staticmethod
    def format_currency(amount: Decimal) -> str:
        """
        Format decimal as Indonesian Rupiah currency string
        
        Args:
            amount: Amount to format
            
        Returns:
            Formatted currency string
        """
        return f"Rp {amount:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    
    @staticmethod
    def format_percentage(value: Decimal) -> str:
        """
        Format decimal as percentage string
        
        Args:
            value: Value to format
            
        Returns:
            Formatted percentage string
        """
        return f"{value:.2f}%"


# Create singleton instance
calculation_service = CalculationService()
