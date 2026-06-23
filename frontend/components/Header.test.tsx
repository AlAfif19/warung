import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Header from './Header'

const { pathnameMock, routerPushMock } = vi.hoisted(() => ({
  pathnameMock: vi.fn(),
  routerPushMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: pathnameMock,
  useRouter: () => ({ push: routerPushMock }),
}))

describe('Header', () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue('/')
    routerPushMock.mockClear()
    vi.stubGlobal('scrollTo', vi.fn())
  })

  it('scrolls immediately to the top when Beranda is clicked on home', () => {
    render(<Header />)
    const homeLink = screen.getAllByRole('link', { name: /Beranda/i })[0]
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })

    const navigates = homeLink.dispatchEvent(click)

    expect(navigates).toBe(false)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('closes the mobile menu after Beranda is clicked', () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getAllByRole('link', { name: /Beranda/i })).toHaveLength(2)

    fireEvent.click(screen.getAllByRole('link', { name: /Beranda/i })[1])

    expect(screen.getAllByRole('link', { name: /Beranda/i })).toHaveLength(1)
  })

  it('forces Beranda navigation from another page to start at the top', () => {
    pathnameMock.mockReturnValue('/menu')
    render(<Header />)
    const homeLink = screen.getAllByRole('link', { name: /Beranda/i })[0]
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })

    const navigates = homeLink.dispatchEvent(click)

    expect(navigates).toBe(false)
    expect(routerPushMock).toHaveBeenCalledWith('/')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })
})
