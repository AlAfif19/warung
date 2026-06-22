import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { menuImages } from '@/lib/visualAssets'
import MenuPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/components/BackgroundAnimation', () => ({ default: () => null }))

describe('MenuPage imagery', () => {
  it('shows the supplied image for every menu item', () => {
    render(<MenuPage />)
    for (const image of Object.values(menuImages)) {
      expect(screen.getByRole('img', { name: image.alt })).toBeInTheDocument()
    }
  })
})
