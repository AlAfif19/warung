import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { articleImages, teamImages, testimonialImages } from '@/lib/visualAssets'
import AboutPage from './page'

vi.mock('@/components/BackgroundAnimation', () => ({ default: () => null }))
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: (_target, tag) => tag }),
}))

describe('AboutPage imagery', () => {
  it('shows supplied team, testimonial, and article images', () => {
    render(<AboutPage />)
    const images = [...teamImages, ...testimonialImages, ...articleImages]
    for (const image of images) {
      expect(screen.getByRole('img', { name: image.alt })).toBeInTheDocument()
    }
  })
})
