import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DecorativeAsset from './DecorativeAsset'

describe('DecorativeAsset', () => {
  it('is hidden from assistive technology and cannot intercept input', () => {
    render(<DecorativeAsset src="/assets/decorations/burger.png" className="left-0" />)

    const decoration = screen.getByTestId('decorative-asset')
    expect(decoration).toHaveAttribute('aria-hidden', 'true')
    expect(decoration).toHaveClass('pointer-events-none')
    expect(screen.getByRole('presentation', { hidden: true })).toHaveAttribute('alt', '')
  })
})
