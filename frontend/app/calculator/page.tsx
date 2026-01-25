'use client'

import { useState } from 'react'
import { Calculator, Plus, Trash2, Save, TrendingUp, FileText, Download } from 'lucide-react'
import { formatCurrency, formatPercentage, getMarginColor, getMarginBadgeColor, cn } from '@/lib/utils'

type ProductMode = 'per_pcs' | 'per_batch'
type PricingTier = 'competitive' | 'standard' | 'premium' | 'manual'

interface RawMaterial {
  id: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  total: number
}

interface FixedCost {
  id: string
  name: string
  category: string
  monthly_amount: number
  is_marketing: boolean
  allocation_method: 'proportional' | 'manual'
  allocated_amount: number
  allocation_percentage: number
}

interface PricingSuggestion {
  margin_percent: number
  selling_price: number
  profit_per_unit: number
}

export default function CalculatorPage() {
  const [step, setStep] = useState(1)
  const [productName, setProductName] = useState('')
  const [mode, setMode] = useState<ProductMode>('per_pcs')
  const [batchSize, setBatchSize] = useState(1)
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
    { id: '1', name: '', quantity: 0, unit: 'gram', unit_price: 0, total: 0 }
  ])
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [targetProfit, setTargetProfit] = useState(10000000)
  const [selectedTier, setSelectedTier] = useState<PricingTier>('standard')
  const [manualPrice, setManualPrice] = useState(0)
  
  // Calculation results
  const [hpp, setHpp] = useState(0)
  const [pricingSuggestions, setPricingSuggestions] = useState<Record<string, PricingSuggestion>>({})
  const [projection, setProjection] = useState<any>(null)

  const units = ['gram', 'kg', 'ml', 'liter', 'pcs', 'pack', 'box', 'dozen']

  const addRawMaterial = () => {
    setRawMaterials([
      ...rawMaterials,
      { id: Date.now().toString(), name: '', quantity: 0, unit: 'gram', unit_price: 0, total: 0 }
    ])
  }

  const removeRawMaterial = (id: string) => {
    if (rawMaterials.length > 1) {
      setRawMaterials(rawMaterials.filter(m => m.id !== id))
    }
  }

  const updateRawMaterial = (id: string, field: keyof RawMaterial, value: any) => {
    setRawMaterials(rawMaterials.map(m => {
      if (m.id === id) {
        const updated = { ...m, [field]: value }
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = updated.quantity * updated.unit_price
        }
        return updated
      }
      return m
    }))
  }

  const addFixedCost = () => {
    setFixedCosts([
      ...fixedCosts,
      {
        id: Date.now().toString(),
        name: '',
        category: 'other',
        monthly_amount: 0,
        is_marketing: false,
        allocation_method: 'proportional',
        allocated_amount: 0,
        allocation_percentage: 0
      }
    ])
  }

  const removeFixedCost = (id: string) => {
    setFixedCosts(fixedCosts.filter(f => f.id !== id))
  }

  const updateFixedCost = (id: string, field: keyof FixedCost, value: any) => {
    setFixedCosts(fixedCosts.map(f => {
      if (f.id === id) {
        return { ...f, [field]: value }
      }
      return f
    }))
  }

  const calculateHPP = () => {
    // Calculate total raw material cost
    const totalRawMaterialCost = rawMaterials.reduce((sum, m) => sum + m.total, 0)
    
    // Calculate per unit cost
    let rawMaterialCostPerUnit = totalRawMaterialCost
    if (mode === 'per_batch' && batchSize > 1) {
      rawMaterialCostPerUnit = totalRawMaterialCost / batchSize
    }

    // Calculate total fixed cost allocation
    const totalFixedCostAllocation = fixedCosts.reduce((sum, f) => sum + f.allocated_amount, 0)

    // Calculate HPP
    const calculatedHPP = rawMaterialCostPerUnit + totalFixedCostAllocation
    setHpp(calculatedHPP)

    // Calculate pricing suggestions
    const margins = {
      competitive: 0.15,
      standard: 0.30,
      premium: 0.50
    }

    const suggestions: Record<string, PricingSuggestion> = {}
    Object.entries(margins).forEach(([tier, margin]) => {
      const sellingPrice = calculatedHPP * (1 + margin)
      suggestions[tier] = {
        margin_percent: margin * 100,
        selling_price: sellingPrice,
        profit_per_unit: sellingPrice - calculatedHPP
      }
    })
    setPricingSuggestions(suggestions)
  }

  const calculateProjection = () => {
    const sellingPrice = selectedTier === 'manual' ? manualPrice : pricingSuggestions[selectedTier]?.selling_price || 0
    
    if (sellingPrice <= hpp) {
      alert('Harga jual harus lebih besar dari HPP!')
      return
    }

    const contributionMargin = sellingPrice - hpp
    const totalFixedCost = fixedCosts.reduce((sum, f) => sum + f.monthly_amount, 0)
    const marketingCost = fixedCosts.filter(f => f.is_marketing).reduce((sum, f) => sum + f.monthly_amount, 0)
    const totalMonthlyCosts = totalFixedCost + marketingCost

    // Calculate target units
    const targetUnitsMonthly = Math.ceil((totalMonthlyCosts + targetProfit) / contributionMargin)
    const targetUnitsDaily = targetUnitsMonthly / 30

    // Calculate projections
    const projectedRevenue = targetUnitsMonthly * sellingPrice
    const projectedTotalProductCost = targetUnitsMonthly * hpp
    const projectedTotalFixedCost = totalMonthlyCosts
    const projectedGrossProfit = projectedRevenue - projectedTotalProductCost
    const projectedNetProfit = projectedRevenue - (projectedTotalProductCost + projectedTotalFixedCost)
    const grossMarginPercent = (projectedGrossProfit / projectedRevenue) * 100
    const netMarginPercent = (projectedNetProfit / projectedRevenue) * 100

    // Calculate ROAS
    let roasRatio = null
    if (marketingCost > 0) {
      roasRatio = projectedRevenue / marketingCost
    }

    // Calculate break-even
    const breakEvenUnits = Math.ceil(totalMonthlyCosts / contributionMargin)
    const breakEvenRevenue = breakEvenUnits * sellingPrice

    setProjection({
      target_units_monthly: targetUnitsMonthly,
      target_units_daily: targetUnitsDaily,
      projected_revenue: projectedRevenue,
      projected_total_product_cost: projectedTotalProductCost,
      projected_total_fixed_cost: projectedTotalFixedCost,
      projected_gross_profit: projectedGrossProfit,
      projected_net_profit: projectedNetProfit,
      gross_margin_percent: grossMarginPercent,
      net_margin_percent: netMarginPercent,
      roas_ratio: roasRatio,
      break_even_units: breakEvenUnits,
      break_even_revenue: breakEvenRevenue,
      selling_price: sellingPrice
    })

    setStep(4)
  }

  const exportReport = () => {
    alert('Fitur ekspor laporan akan segera tersedia!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Kalkulator HPP</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={exportReport}
                className="btn btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Ekspor Laporan
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-semibold",
                step >= s ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-600"
              )}>
                {s}
              </div>
              {s < 4 && (
                <div className={cn(
                  "w-16 h-1 mx-2",
                  step > s ? "bg-primary-600" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Product Info */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Produk</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Nama Produk</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Contoh: Roti Coklat"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">Mode Perhitungan</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setMode('per_pcs')}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-colors",
                        mode === 'per_pcs'
                          ? "border-primary-600 bg-primary-50 text-primary-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      )}
                    >
                      Per Pcs
                    </button>
                    <button
                      onClick={() => setMode('per_batch')}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-colors",
                        mode === 'per_batch'
                          ? "border-primary-600 bg-primary-50 text-primary-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      )}
                    >
                      Per Resep (Batch)
                    </button>
                  </div>
                </div>

                {mode === 'per_batch' && (
                  <div>
                    <label className="label">Ukuran Batch (jumlah pcs)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="Contoh: 100"
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="btn btn-primary"
                  disabled={!productName}
                >
                  Lanjut
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Raw Materials */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Bahan Baku</h2>
                <button
                  onClick={addRawMaterial}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Bahan
                </button>
              </div>

              <div className="space-y-4">
                {rawMaterials.map((material) => (
                  <div key={material.id} className="flex items-end space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="label">Nama Bahan</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Contoh: Tepung Terigu"
                        value={material.name}
                        onChange={(e) => updateRawMaterial(material.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <label className="label">Jumlah</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="0"
                        value={material.quantity || ''}
                        onChange={(e) => updateRawMaterial(material.id, 'quantity', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="w-32">
                      <label className="label">Satuan</label>
                      <select
                        className="input"
                        value={material.unit}
                        onChange={(e) => updateRawMaterial(material.id, 'unit', e.target.value)}
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-40">
                      <label className="label">Harga/Satuan</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="0"
                        value={material.unit_price || ''}
                        onChange={(e) => updateRawMaterial(material.id, 'unit_price', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="w-32">
                      <label className="label">Total</label>
                      <div className="input bg-gray-100 font-medium">
                        {formatCurrency(material.total)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeRawMaterial(material.id)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn btn-primary"
                  disabled={rawMaterials.every(m => !m.name || m.quantity === 0)}
                >
                  Lanjut
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Fixed Costs & Pricing */}
        {step === 3 && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fixed Costs */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Biaya Tetap</h2>
                <button
                  onClick={addFixedCost}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {fixedCosts.map((cost) => (
                  <div key={cost.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          className="input mb-2"
                          placeholder="Nama Biaya"
                          value={cost.name}
                          onChange={(e) => updateFixedCost(cost.id, 'name', e.target.value)}
                        />
                        <input
                          type="number"
                          className="input"
                          placeholder="Jumlah Bulanan"
                          value={cost.monthly_amount || ''}
                          onChange={(e) => updateFixedCost(cost.id, 'monthly_amount', Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <button
                        onClick={() => removeFixedCost(cost.id)}
                        className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg ml-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={cost.is_marketing}
                          onChange={(e) => updateFixedCost(cost.id, 'is_marketing', e.target.checked)}
                        />
                        <span className="text-sm">Biaya Pemasaran</span>
                      </label>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="text-sm">Metode Alokasi:</label>
                        <select
                          className="input text-sm py-1"
                          value={cost.allocation_method}
                          onChange={(e) => updateFixedCost(cost.id, 'allocation_method', e.target.value)}
                        >
                          <option value="proportional">Proporsional</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                      {cost.allocation_method === 'proportional' ? (
                        <div>
                          <label className="text-sm">Persentase Alokasi (%):</label>
                          <input
                            type="number"
                            className="input text-sm mt-1"
                            placeholder="0"
                            value={cost.allocation_percentage || ''}
                            onChange={(e) => {
                              const percentage = Number(e.target.value)
                              updateFixedCost(cost.id, 'allocation_percentage', percentage)
                              updateFixedCost(cost.id, 'allocated_amount', (cost.monthly_amount * percentage) / 100)
                            }}
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-sm">Jumlah Alokasi:</label>
                          <input
                            type="number"
                            className="input text-sm mt-1"
                            placeholder="0"
                            value={cost.allocated_amount || ''}
                            onChange={(e) => updateFixedCost(cost.id, 'allocated_amount', Number(e.target.value))}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Strategi Harga</h2>
              
              <button
                onClick={calculateHPP}
                className="w-full btn btn-primary mb-6"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Hitung HPP
              </button>

              {hpp > 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">HPP Per Unit</div>
                    <div className="text-3xl font-bold text-primary-700">
                      {formatCurrency(hpp)}
                    </div>
                  </div>

                  <div>
                    <label className="label">Pilih Tier Harga</label>
                    <div className="space-y-3">
                      {Object.entries(pricingSuggestions).map(([tier, suggestion]) => (
                        <button
                          key={tier}
                          onClick={() => setSelectedTier(tier as PricingTier)}
                          className={cn(
                            "w-full p-4 rounded-lg border-2 text-left transition-colors",
                            selectedTier === tier
                              ? "border-primary-600 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold capitalize">{tier}</div>
                              <div className="text-sm text-gray-600">
                                Margin: {formatPercentage(suggestion.margin_percent)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                {formatCurrency(suggestion.selling_price)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Laba: {formatCurrency(suggestion.profit_per_unit)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Harga Manual (Opsional)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="Masukkan harga manual"
                      value={manualPrice || ''}
                      onChange={(e) => {
                        setManualPrice(Number(e.target.value))
                        setSelectedTier('manual')
                      }}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="label">Target Laba Bersih / Bulan</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="Contoh: 10000000"
                      value={targetProfit || ''}
                      onChange={(e) => setTargetProfit(Number(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <button
                    onClick={calculateProjection}
                    className="w-full btn btn-success"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Hitung Proyeksi
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="btn btn-secondary"
              >
                Kembali
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && projection && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Omzet Bulanan</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(projection.projected_revenue)}
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Gross Profit</div>
                    <div className={cn("text-2xl font-bold", getMarginColor(projection.gross_margin_percent))}>
                      {formatCurrency(projection.projected_gross_profit)}
                    </div>
                    <div className={cn("text-sm", getMarginColor(projection.gross_margin_percent))}>
                      {formatPercentage(projection.gross_margin_percent)}
                    </div>
                  </div>
                  <Calculator className="h-8 w-8 text-success-600" />
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Net Profit</div>
                    <div className={cn("text-2xl font-bold", getMarginColor(projection.net_margin_percent))}>
                      {formatCurrency(projection.projected_net_profit)}
                    </div>
                    <div className={cn("text-sm", getMarginColor(projection.net_margin_percent))}>
                      {formatPercentage(projection.net_margin_percent)}
                    </div>
                  </div>
                  <FileText className="h-8 w-8 text-warning-600" />
                </div>
              </div>
              {projection.roas_ratio && (
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">ROAS</div>
                      <div className={cn("text-2xl font-bold", getROASColor(projection.roas_ratio))}>
                        {projection.roas_ratio.toFixed(2)}x
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Penjualan</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Harga Jual</span>
                    <span className="font-semibold">{formatCurrency(projection.selling_price)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">HPP Per Unit</span>
                    <span className="font-semibold">{formatCurrency(hpp)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Target Unit / Bulan</span>
                    <span className="font-semibold">{projection.target_units_monthly} pcs</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Target Unit / Hari</span>
                    <span className="font-semibold">{projection.target_units_daily.toFixed(1)} pcs</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Break-Even Point</span>
                    <span className="font-semibold">{projection.break_even_units} pcs</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Break-Even Revenue</span>
                    <span className="font-semibold">{formatCurrency(projection.break_even_revenue)}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rincian Biaya</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Biaya Produk (COGS)</span>
                    <span className="font-semibold">{formatCurrency(projection.projected_total_product_cost)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Biaya Tetap</span>
                    <span className="font-semibold">{formatCurrency(projection.projected_total_fixed_cost)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Total Biaya</span>
                    <span className="font-semibold text-danger-600">
                      {formatCurrency(projection.projected_total_product_cost + projection.projected_total_fixed_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Gross Profit</span>
                    <span className="font-semibold text-success-600">
                      {formatCurrency(projection.projected_gross_profit)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Net Profit</span>
                    <span className="font-semibold text-success-600">
                      {formatCurrency(projection.projected_net_profit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rekomendasi Bisnis</h3>
              <div className="space-y-3">
                {projection.gross_margin_percent < 40 && (
                  <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-warning-600 mr-2">⚠️</span>
                      <span className="text-sm text-gray-700">
                        Gross Margin di bawah 40%. Pertimbangkan mencari supplier lebih murah atau menaikkan harga jual.
                      </span>
                    </div>
                  </div>
                )}
                {projection.net_margin_percent < 10 && (
                  <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-warning-600 mr-2">⚠️</span>
                      <span className="text-sm text-gray-700">
                        Net Margin tipis (&lt;10%). Kurangi biaya operasional atau tingkatkan volume penjualan.
                      </span>
                    </div>
                  </div>
                )}
                {projection.roas_ratio && projection.roas_ratio < 2 && (
                  <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-danger-600 mr-2">❌</span>
                      <span className="text-sm text-gray-700">
                        ROAS rendah (&lt;2x). Iklan tidak efektif. Pertimbangkan hentikan atau optimasi targeting.
                      </span>
                    </div>
                  </div>
                )}
                {projection.gross_margin_percent >= 40 && projection.net_margin_percent >= 10 && (
                  <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-success-600 mr-2">✅</span>
                      <span className="text-sm text-gray-700">
                        Margin sehat! Bisnis berjalan dengan baik. Pertimbangkan untuk ekspansi atau investasi lebih lanjut.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="btn btn-secondary"
              >
                Kembali
              </button>
              <button
                onClick={exportReport}
                className="btn btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan & Ekspor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
