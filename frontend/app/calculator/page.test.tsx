import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CalculatorPage from './page'

describe('CalculatorPage', () => {
  it('removes the local header and keeps export in the results flow', () => {
    render(<CalculatorPage />)

    expect(screen.queryByRole('heading', { name: 'Kalkulator HPP' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ekspor Laporan' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Informasi Produk' })).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Contoh: Roti Coklat'), {
      target: { value: 'Roti' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }))

    fireEvent.change(screen.getByPlaceholderText('Contoh: Tepung Terigu'), {
      target: { value: 'Tepung' },
    })
    const numericInputs = screen.getAllByPlaceholderText('0')
    fireEvent.change(numericInputs[0], { target: { value: '1' } })
    fireEvent.change(numericInputs[1], { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }))

    fireEvent.click(screen.getByRole('button', { name: 'Hitung HPP' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hitung Proyeksi' }))

    expect(screen.getByRole('button', { name: 'Simpan & Ekspor' })).toBeInTheDocument()
  })
})
