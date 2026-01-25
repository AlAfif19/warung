/**
 * Export functionality for PDF and Excel reports
 */
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { formatCurrency, formatPercentage } from './utils'

export interface ExportData {
  productName: string
  mode: string
  hpp: number
  sellingPrice: number
  pricingTier: string
  projection: {
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
  }
  rawMaterials: Array<{
    name: string
    quantity: number
    unit: string
    unit_price: number
    total: number
  }>
  fixedCosts: Array<{
    name: string
    monthly_amount: number
    allocated_amount: number
    allocation_percentage: number
  }>
}

/**
 * Export data to PDF
 */
export async function exportToPDF(data: ExportData, elementId?: string): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    let yPosition = margin

    // Helper function to check page break
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
    }

    // Title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Laporan HPP & Proyeksi Bisnis', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Product Information
    checkPageBreak(30)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Informasi Produk', margin, yPosition)
    yPosition += 8

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Nama Produk: ${data.productName}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Mode Perhitungan: ${data.mode === 'per_pcs' ? 'Per Pcs' : 'Per Batch'}`, margin, yPosition)
    yPosition += 6
    pdf.text(`HPP Per Unit: ${formatCurrency(data.hpp)}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Harga Jual: ${formatCurrency(data.sellingPrice)}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Tier Harga: ${data.pricingTier.toUpperCase()}`, margin, yPosition)
    yPosition += 10

    // Raw Materials
    checkPageBreak(40)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Rincian Bahan Baku', margin, yPosition)
    yPosition += 8

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    // Table header
    const tableStartY = yPosition
    const colWidths = [60, 30, 20, 35, 30]
    const headers = ['Nama Bahan', 'Jumlah', 'Satuan', 'Harga/Satuan', 'Total']
    
    pdf.setFillColor(59, 130, 246)
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    
    headers.forEach((header, i) => {
      let x = margin
      for (let j = 0; j < i; j++) {
        x += colWidths[j]
      }
      pdf.text(header, x + 2, yPosition + 5)
    })
    
    yPosition += 8
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')

    // Table rows
    data.rawMaterials.forEach((material, index) => {
      checkPageBreak(8)
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251)
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
      }
      
      const values = [
        material.name,
        material.quantity.toString(),
        material.unit,
        formatCurrency(material.unit_price),
        formatCurrency(material.total)
      ]
      
      values.forEach((value, i) => {
        let x = margin
        for (let j = 0; j < i; j++) {
          x += colWidths[j]
        }
        pdf.text(value, x + 2, yPosition + 5)
      })
      
      yPosition += 8
    })

    // Total raw material cost
    yPosition += 5
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Total Biaya Bahan Baku: ${formatCurrency(data.rawMaterials.reduce((sum, m) => sum + m.total, 0))}`, margin, yPosition)
    yPosition += 10

    // Fixed Costs
    checkPageBreak(40)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Biaya Tetap & Alokasi', margin, yPosition)
    yPosition += 8

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    const fixedCostHeaders = ['Nama Biaya', 'Jumlah Bulanan', 'Alokasi (%)', 'Jumlah Alokasi']
    const fixedCostColWidths = [60, 40, 25, 50]
    
    pdf.setFillColor(59, 130, 246)
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    
    fixedCostHeaders.forEach((header, i) => {
      let x = margin
      for (let j = 0; j < i; j++) {
        x += fixedCostColWidths[j]
      }
      pdf.text(header, x + 2, yPosition + 5)
    })
    
    yPosition += 8
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')

    data.fixedCosts.forEach((cost, index) => {
      checkPageBreak(8)
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251)
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
      }
      
      const values = [
        cost.name,
        formatCurrency(cost.monthly_amount),
        cost.allocation_percentage.toFixed(2) + '%',
        formatCurrency(cost.allocated_amount)
      ]
      
      values.forEach((value, i) => {
        let x = margin
        for (let j = 0; j < i; j++) {
          x += fixedCostColWidths[j]
        }
        pdf.text(value, x + 2, yPosition + 5)
      })
      
      yPosition += 8
    })

    // Total fixed cost allocation
    yPosition += 5
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Total Alokasi Biaya Tetap: ${formatCurrency(data.fixedCosts.reduce((sum, f) => sum + f.allocated_amount, 0))}`, margin, yPosition)
    yPosition += 10

    // Business Projection
    checkPageBreak(50)
    pdf.addPage()
    yPosition = margin

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Proyeksi Bisnis Bulanan', margin, yPosition)
    yPosition += 10

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    
    const projectionItems = [
      `Target Penjualan Bulanan: ${data.projection.target_units_monthly} pcs`,
      `Target Penjualan Harian: ${data.projection.target_units_daily.toFixed(1)} pcs`,
      `Omzet Proyeksi: ${formatCurrency(data.projection.projected_revenue)}`,
      `Biaya Produk (COGS): ${formatCurrency(data.projection.projected_total_product_cost)}`,
      `Biaya Tetap: ${formatCurrency(data.projection.projected_total_fixed_cost)}`,
      `Gross Profit: ${formatCurrency(data.projection.projected_gross_profit)} (${formatPercentage(data.projection.gross_margin_percent)})`,
      `Net Profit: ${formatCurrency(data.projection.projected_net_profit)} (${formatPercentage(data.projection.net_margin_percent)})`,
      `Break-Even Point: ${data.projection.break_even_units} pcs`,
      `Break-Even Revenue: ${formatCurrency(data.projection.break_even_revenue)}`
    ]

    if (data.projection.roas_ratio) {
      projectionItems.push(`ROAS: ${data.projection.roas_ratio.toFixed(2)}x`)
    }

    projectionItems.forEach(item => {
      checkPageBreak(8)
      pdf.text(item, margin, yPosition)
      yPosition += 7
    })

    // Footer
    yPosition = pageHeight - 20
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(128, 128, 128)
    pdf.text(
      `Laporan dibuat pada ${new Date().toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`,
      margin,
      yPosition
    )
    pdf.text(
      'Warung HPP Calculator - Kalkulator HPP & Proyeksi Bisnis',
      margin,
      yPosition + 5
    )

    // Save PDF
    pdf.save(`Laporan_HPP_${data.productName.replace(/\s+/g, '_')}_${Date.now()}.pdf`)
  } catch (error) {
    console.error('Error exporting PDF:', error)
    throw new Error('Gagal mengekspor PDF. Silakan coba lagi.')
  }
}

/**
 * Export data to Excel
 */
export function exportToExcel(data: ExportData): void {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Product Information Sheet
    const productData = [
      ['Informasi Produk'],
      ['Nama Produk', data.productName],
      ['Mode Perhitungan', data.mode === 'per_pcs' ? 'Per Pcs' : 'Per Batch'],
      ['HPP Per Unit', data.hpp],
      ['Harga Jual', data.sellingPrice],
      ['Tier Harga', data.pricingTier.toUpperCase()],
      [],
      [''],
    ]

    // Raw Materials Sheet
    const rawMaterialHeaders = ['Nama Bahan', 'Jumlah', 'Satuan', 'Harga/Satuan', 'Total']
    const rawMaterialData = [
      ['Rincian Bahan Baku'],
      rawMaterialHeaders,
      ...data.rawMaterials.map(m => [
        m.name,
        m.quantity,
        m.unit,
        m.unit_price,
        m.total
      ]),
      ['Total Biaya Bahan Baku', '', '', '', data.rawMaterials.reduce((sum, m) => sum + m.total, 0)],
      [],
      [''],
    ]

    // Fixed Costs Sheet
    const fixedCostHeaders = ['Nama Biaya', 'Jumlah Bulanan', 'Alokasi (%)', 'Jumlah Alokasi']
    const fixedCostData = [
      ['Biaya Tetap & Alokasi'],
      fixedCostHeaders,
      ...data.fixedCosts.map(f => [
        f.name,
        f.monthly_amount,
        f.allocation_percentage,
        f.allocated_amount
      ]),
      ['Total Alokasi Biaya Tetap', '', '', data.fixedCosts.reduce((sum, f) => sum + f.allocated_amount, 0)],
      [],
      [''],
    ]

    // Business Projection Sheet
    const projectionData = [
      ['Proyeksi Bisnis Bulanan'],
      ['Target Penjualan Bulanan (pcs)', data.projection.target_units_monthly],
      ['Target Penjualan Harian (pcs)', data.projection.target_units_daily],
      ['Omzet Proyeksi', data.projection.projected_revenue],
      ['Biaya Produk (COGS)', data.projection.projected_total_product_cost],
      ['Biaya Tetap', data.projection.projected_total_fixed_cost],
      ['Gross Profit', data.projection.projected_gross_profit],
      ['Gross Margin (%)', data.projection.gross_margin_percent],
      ['Net Profit', data.projection.projected_net_profit],
      ['Net Margin (%)', data.projection.net_margin_percent],
      ['Break-Even Point (pcs)', data.projection.break_even_units],
      ['Break-Even Revenue', data.projection.break_even_revenue],
    ]

    if (data.projection.roas_ratio) {
      projectionData.push(['ROAS', data.projection.roas_ratio])
    }

    // Create sheets
    const productSheet = XLSX.utils.aoa_to_sheet(productData)
    const rawMaterialSheet = XLSX.utils.aoa_to_sheet(rawMaterialData)
    const fixedCostSheet = XLSX.utils.aoa_to_sheet(fixedCostData)
    const projectionSheet = XLSX.utils.aoa_to_sheet(projectionData)

    // Set column widths
    productSheet['!cols'] = [{ wch: 25 }, { wch: 20 }]
    rawMaterialSheet['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }]
    fixedCostSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }]
    projectionSheet['!cols'] = [{ wch: 30 }, { wch: 20 }]

    // Append sheets to workbook
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Produk')
    XLSX.utils.book_append_sheet(workbook, rawMaterialSheet, 'Bahan Baku')
    XLSX.utils.book_append_sheet(workbook, fixedCostSheet, 'Biaya Tetap')
    XLSX.utils.book_append_sheet(workbook, projectionSheet, 'Proyeksi')

    // Save Excel file
    XLSX.writeFile(
      workbook,
      `Laporan_HPP_${data.productName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`
    )
  } catch (error) {
    console.error('Error exporting Excel:', error)
    throw new Error('Gagal mengekspor Excel. Silakan coba lagi.')
  }
}

/**
 * Export element as image (for charts)
 */
export async function exportElementAsImage(
  elementId: string,
  filename: string
): Promise<void> {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Element not found')
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = image
    link.click()
  } catch (error) {
    console.error('Error exporting image:', error)
    throw new Error('Gagal mengekspor gambar. Silakan coba lagi.')
  }
}
