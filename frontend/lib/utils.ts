/**
 * Utility functions
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number to Indonesian Rupiah currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format number to percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Get margin color based on percentage
 */
export function getMarginColor(percentage: number): string {
  if (percentage < 20) return 'text-danger-600'
  if (percentage < 40) return 'text-warning-600'
  return 'text-success-600'
}

/**
 * Get margin badge color based on percentage
 */
export function getMarginBadgeColor(percentage: number): string {
  if (percentage < 20) return 'badge-danger'
  if (percentage < 40) return 'badge-warning'
  return 'badge-success'
}

/**
 * Get ROAS color based on ratio
 */
export function getROASColor(ratio: number): string {
  if (ratio < 2) return 'text-danger-600'
  if (ratio < 4) return 'text-warning-600'
  return 'text-success-600'
}

/**
 * Calculate psychological pricing
 */
export function getPsychologicalPrice(price: number): number {
  // Round down to nearest 100, then subtract 10
  const rounded = Math.floor(price / 100) * 100
  return Math.max(rounded - 10, price * 0.9) // Ensure at least 10% discount from original
}

/**
 * Validate Indonesian phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const regex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/
  return regex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Parse CSV to array of objects
 */
export function parseCSV<T>(csv: string, headers: string[]): T[] {
  const lines = csv.trim().split('\n')
  return lines.map(line => {
    const values = line.split(',')
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || ''
    })
    return obj as T
  })
}

/**
 * Export array to CSV
 */
export function exportToCSV<T>(data: T[], filename: string): void {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0] as object)
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = (row as any)[header]
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    }).join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, `${filename}.csv`)
}
