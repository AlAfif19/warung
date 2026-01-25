'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface ProjectionChartsProps {
  projection: {
    projected_revenue: number
    projected_total_product_cost: number
    projected_total_fixed_cost: number
    projected_gross_profit: number
    projected_net_profit: number
    gross_margin_percent: number
    net_margin_percent: number
  }
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6']

export function RevenueCostChart({ projection }: ProjectionChartsProps) {
  const data = [
    { name: 'Omzet', value: projection.projected_revenue },
    { name: 'Biaya Produk', value: projection.projected_total_product_cost },
    { name: 'Biaya Tetap', value: projection.projected_total_fixed_cost },
    { name: 'Gross Profit', value: projection.projected_gross_profit },
    { name: 'Net Profit', value: projection.projected_net_profit },
  ]

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Omzet vs Biaya vs Laba</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" name="Jumlah (Rp)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CostCompositionChart({ projection }: ProjectionChartsProps) {
  const data = [
    { name: 'Biaya Produk', value: projection.projected_total_product_cost },
    { name: 'Biaya Tetap', value: projection.projected_total_fixed_cost },
  ]

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Komposisi Biaya</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MarginChart({ projection }: ProjectionChartsProps) {
  const data = [
    { name: 'Gross Margin', value: projection.gross_margin_percent },
    { name: 'Net Margin', value: projection.net_margin_percent },
  ]

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Margin Laba</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => `${value}%`} />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <Legend />
          <Bar dataKey="value" fill="#22c55e" name="Persentase (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface ProfitTrendProps {
  months: number[]
  revenue: number[]
  grossProfit: number[]
  netProfit: number[]
}

export function ProfitTrendChart({ months, revenue, grossProfit, netProfit }: ProfitTrendProps) {
  const data = months.map((month, index) => ({
    month: `Bulan ${month}`,
    revenue: revenue[index],
    grossProfit: grossProfit[index],
    netProfit: netProfit[index],
  }))

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Laba (6 Bulan)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Omzet" />
          <Line type="monotone" dataKey="grossProfit" stroke="#22c55e" strokeWidth={2} name="Gross Profit" />
          <Line type="monotone" dataKey="netProfit" stroke="#f59e0b" strokeWidth={2} name="Net Profit" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
