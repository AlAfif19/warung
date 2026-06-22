import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BackgroundAnimation from './BackgroundAnimation'

describe('BackgroundAnimation', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D)
  })

  it('cancels its scheduled frame when unmounted', () => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 42))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    const { unmount } = render(<BackgroundAnimation />)
    unmount()

    expect(cancelAnimationFrame).toHaveBeenCalledWith(42)
  })
})
