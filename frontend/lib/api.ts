/**
 * API Client for Warung HPP Calculator
 */
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export type ProductMode = 'per_pcs' | 'per_batch'
export type PricingTier = 'competitive' | 'standard' | 'premium' | 'manual'
export type FixedCostCategory = 'rent' | 'utilities' | 'internet' | 'salary' | 'marketing' | 'other'
export type AllocationMethod = 'proportional' | 'manual'

export interface RawMaterial {
  id?: number
  name: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  created_at?: string
  updated_at?: string
}

export interface FixedCost {
  id?: number
  name: string
  category: FixedCostCategory
  monthly_amount: number
  is_marketing: boolean
  description?: string
  created_at?: string
  updated_at?: string
}

export interface ProductFixedCostAllocation {
  id?: number
  product_id?: number
  fixed_cost_id: number
  allocation_method: AllocationMethod
  allocated_amount: number
  allocation_percentage: number
  created_at?: string
  updated_at?: string
}

export interface Product {
  id?: number
  name: string
  mode: ProductMode
  batch_size: number
  hpp_per_unit: number
  selling_price?: number
  pricing_tier: PricingTier
  raw_materials?: RawMaterial[]
  fixed_cost_allocations?: ProductFixedCostAllocation[]
  total_raw_material_cost?: number
  total_fixed_cost_allocation?: number
  pricing_suggestions?: PricingSuggestion
  created_at?: string
  updated_at?: string
}

export interface PricingSuggestion {
  competitive: {
    margin_percent: number
    selling_price: number
    profit_per_unit: number
  }
  standard: {
    margin_percent: number
    selling_price: number
    profit_per_unit: number
  }
  premium: {
    margin_percent: number
    selling_price: number
    profit_per_unit: number
  }
}

export interface BusinessProjection {
  id?: number
  product_id: number
  scenario_name: string
  target_profit_monthly: number
  selling_price_used: number
  target_units_monthly: number
  target_units_daily: number
  projected_revenue: number
  projected_total_product_cost: number
  projected_total_fixed_cost: number
  projected_gross_profit: number
  projected_net_profit: number
  gross_margin_percent: number
  net_margin_percent: number
  roas_ratio?: number
  break_even_units: number
  break_even_revenue: number
  created_at?: string
}

export interface HPPCalculationRequest {
  mode: ProductMode
  batch_size: number
  raw_materials: RawMaterial[]
  fixed_cost_allocations: ProductFixedCostAllocation[]
}

export interface HPPCalculationResponse {
  hpp_per_unit: number
  total_raw_material_cost: number
  total_fixed_cost_allocation: number
  raw_materials_breakdown: any[]
  fixed_costs_breakdown: any[]
  pricing_suggestions: PricingSuggestion
}

export interface ProjectionCalculationRequest {
  hpp_per_unit: number
  selling_price: number
  total_fixed_cost_monthly: number
  marketing_cost_monthly: number
  target_profit_monthly: number
}

export interface ProjectionCalculationResponse {
  target_units_monthly: number
  target_units_daily: number
  projected_revenue: number
  projected_total_product_cost: number
  projected_total_fixed_cost: number
  projected_gross_profit: number
  projected_net_profit: number
  gross_margin_percent: number
  net_margin_percent: number
  roas_ratio?: number
  break_even_units: number
  break_even_revenue: number
  recommendations: string[]
}

export interface MenuRecommendation {
  id: number
  name: string
  hpp_per_unit: number
  selling_price?: number
  pricing_tier: string
  keywords?: string
}

export interface SectionNavigation {
  section_name: string
  section_path: string
  button_text: string
}

export interface ChatbotRequest {
  message: string
}

export interface ChatbotResponse {
  response: string
  recommendations: MenuRecommendation[]
  navigation_suggestions: SectionNavigation[]
}

// API Functions
export const apiClient = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/')
    return response.data
  },

  // Products
  getProducts: async (skip = 0, limit = 100) => {
    const response = await api.get<Product[]>('/api/products', { params: { skip, limit } })
    return response.data
  },

  getProduct: async (productId: number) => {
    const response = await api.get<Product>(`/api/products/${productId}`)
    return response.data
  },

  createProduct: async (product: Product) => {
    const response = await api.post<Product>('/api/products', product)
    return response.data
  },

  updateProduct: async (productId: number, product: Partial<Product>) => {
    const response = await api.put<Product>(`/api/products/${productId}`, product)
    return response.data
  },

  deleteProduct: async (productId: number) => {
    const response = await api.delete(`/api/products/${productId}`)
    return response.data
  },

  // Raw Materials
  addRawMaterial: async (productId: number, material: RawMaterial) => {
    const response = await api.post<RawMaterial>(`/api/products/${productId}/raw-materials`, material)
    return response.data
  },

  // Fixed Costs
  getFixedCosts: async (skip = 0, limit = 100) => {
    const response = await api.get<FixedCost[]>('/api/fixed-costs', { params: { skip, limit } })
    return response.data
  },

  getFixedCost: async (fixedCostId: number) => {
    const response = await api.get<FixedCost>(`/api/fixed-costs/${fixedCostId}`)
    return response.data
  },

  createFixedCost: async (fixedCost: FixedCost) => {
    const response = await api.post<FixedCost>('/api/fixed-costs', fixedCost)
    return response.data
  },

  // Fixed Cost Allocations
  addFixedCostAllocation: async (productId: number, allocation: ProductFixedCostAllocation) => {
    const response = await api.post<ProductFixedCostAllocation>(
      `/api/products/${productId}/fixed-cost-allocations`,
      allocation
    )
    return response.data
  },

  // Business Projections
  createBusinessProjection: async (projection: Omit<BusinessProjection, 'id' | 'created_at'>) => {
    const response = await api.post<BusinessProjection>('/api/business-projections', projection)
    return response.data
  },

  getProductProjections: async (productId: number) => {
    const response = await api.get<BusinessProjection[]>(`/api/products/${productId}/projections`)
    return response.data
  },

  // Calculations
  calculateHPP: async (request: HPPCalculationRequest) => {
    const response = await api.post<HPPCalculationResponse>('/api/calculate/hpp', request)
    return response.data
  },

  calculateProjection: async (request: ProjectionCalculationRequest) => {
    const response = await api.post<ProjectionCalculationResponse>('/api/calculate/projection', request)
    return response.data
  },

  // Chatbot
  sendChatMessage: async (request: ChatbotRequest) => {
    const response = await api.post<ChatbotResponse>('/api/chatbot', request)
    return response.data
  },
}

export default api
