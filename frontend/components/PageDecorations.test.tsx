import { cleanup, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Home from '@/app/page'
import MenuPage from '@/app/menu/page'
import CalculatorPage from '@/app/calculator/page'
import AboutPage from '@/app/about/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/components/BackgroundAnimation', () => ({ default: () => null }))
vi.mock('@/components/Chatbot', () => ({ default: () => <div /> }))
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: (_target, tag) => tag }),
}))

describe('page decorations', () => {
  it.each([
    ['Home', Home, 2],
    ['Menu', MenuPage, 2],
    ['Calculator', CalculatorPage, 1],
    ['About', AboutPage, 2],
  ] as const)('%s keeps decoration behind content', (_name, Page, minimum) => {
    render(<Page />)
    const assets = screen.getAllByTestId('decorative-asset')
    expect(assets.length).toBeGreaterThanOrEqual(minimum)
    for (const asset of assets) {
      const boundary = asset.closest('section') ?? asset.parentElement
      expect(boundary?.querySelector('.relative.z-10')).not.toBeNull()
    }
    cleanup()
  })
})
