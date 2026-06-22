# Navigation Performance and Calculator UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make header navigation responsive, reset Beranda to the top, stop leaked homepage animation work, and remove the redundant calculator-local header.

**Architecture:** Keep routing in Next.js `Link` components and add one same-route click handler for Beranda. Make the canvas animation own and clean up its animation-frame handle. Keep calculator export behavior in the existing step-4 result action while deleting only the duplicate page header.

**Tech Stack:** Next.js 14.1, React 18, TypeScript, Framer Motion, Vitest 2, Testing Library, jsdom

## Global Constraints

- Preserve the global application header, current routes, styling, particle count, and export handler behavior.
- Do not change the backend or remove the particle effect.
- Clicking Beranda while already on `/` must scroll immediately to the top.
- Export must remain available only through **Simpan & Ekspor** in calculator step 4.
- Follow red-green-refactor and commit each independently verified task.

---

### Task 1: Header navigation and frontend test harness

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/vitest.setup.ts`
- Create: `frontend/components/Header.test.tsx`
- Modify: `frontend/components/Header.tsx`

**Interfaces:**
- Consumes: Next.js `usePathname(): string` and normal `Link` route navigation.
- Produces: `handleNavigation(event: MouseEvent<HTMLAnchorElement>, path: string): void`, used by every desktop and mobile navigation link.

- [ ] **Step 1: Install and configure the test harness**

Run:

```bash
cd frontend
npm install --save-dev vitest@2.1.9 jsdom@25.0.1 @testing-library/react@16.1.0 @testing-library/jest-dom@6.6.3
```

Expected: `package.json` and `package-lock.json` include the four development dependencies.

Add this script to `frontend/package.json`:

```json
"test": "vitest run"
```

Create `frontend/vitest.config.ts`:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

Create `frontend/vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 2: Write failing Header tests**

Create `frontend/components/Header.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Header from './Header'

const { pathnameMock } = vi.hoisted(() => ({
  pathnameMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: pathnameMock,
}))

describe('Header', () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue('/')
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
})
```

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
cd frontend
npm test -- components/Header.test.tsx
```

Expected: FAIL because clicking the current Beranda link neither prevents redundant navigation nor calls `window.scrollTo`.

- [ ] **Step 4: Implement the minimal Header behavior**

In `frontend/components/Header.tsx`, change the React import and add the handler inside `Header`:

```tsx
import { type MouseEvent, useState } from 'react'

const handleNavigation = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
  setIsMobileMenuOpen(false)

  if (path === '/' && pathname === '/') {
    event.preventDefault()
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }
}
```

Attach it to both mapped links:

```tsx
onClick={(event) => handleNavigation(event, item.path)}
```

Replace the mobile link's existing close-only click handler with the same handler.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
cd frontend
npm test -- components/Header.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit the Header task**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.ts frontend/vitest.setup.ts frontend/components/Header.test.tsx frontend/components/Header.tsx
git commit -m "fix(nav): reset home scroll"
```

---

### Task 2: Homepage animation lifecycle and frame cost

**Files:**
- Create: `frontend/components/BackgroundAnimation.test.tsx`
- Modify: `frontend/components/BackgroundAnimation.tsx`

**Interfaces:**
- Consumes: browser `requestAnimationFrame(callback): number` and `cancelAnimationFrame(id): void`.
- Produces: a canvas effect that owns exactly one current frame handle and cancels it on unmount.

- [ ] **Step 1: Write the failing animation cleanup test**

Create `frontend/components/BackgroundAnimation.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
cd frontend
npm test -- components/BackgroundAnimation.test.tsx
```

Expected: FAIL because `cancelAnimationFrame` is never called.

- [ ] **Step 3: Own and clean up the frame handle**

In `frontend/components/BackgroundAnimation.tsx`, insert this declaration immediately before `const animate = () => {`:

```tsx
let animationFrameId = 0
```

Replace the final line inside `animate`:

```tsx
animationFrameId = requestAnimationFrame(animate)
```

Replace the effect cleanup with:

```tsx
return () => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', resizeCanvas)
}
```

- [ ] **Step 4: Replace per-frame slicing with indexed iteration**

Replace the connection loop with:

```tsx
for (let i = 0; i < particles.length; i += 1) {
  const particle = particles[i]

  for (let j = i + 1; j < particles.length; j += 1) {
    const otherParticle = particles[j]
    const dx = particle.x - otherParticle.x
    const dy = particle.y - otherParticle.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 100) {
      ctx.beginPath()
      ctx.strokeStyle = `rgba(78, 205, 196, ${0.2 * (1 - distance / 100)})`
      ctx.lineWidth = 1
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(otherParticle.x, otherParticle.y)
      ctx.stroke()
    }
  }
}
```

- [ ] **Step 5: Run animation and Header tests**

Run:

```bash
cd frontend
npm test -- components/BackgroundAnimation.test.tsx components/Header.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 6: Commit the animation task**

```bash
git add frontend/components/BackgroundAnimation.tsx frontend/components/BackgroundAnimation.test.tsx
git commit -m "perf(home): stop leaked animation frames"
```

---

### Task 3: Calculator-local header removal

**Files:**
- Create: `frontend/app/calculator/page.test.tsx`
- Modify: `frontend/app/calculator/page.tsx`

**Interfaces:**
- Consumes: existing four-step calculator state and `exportReport(): void`.
- Produces: calculator content beginning with progress steps and a single export action labelled **Simpan & Ekspor** in step 4.

- [ ] **Step 1: Write the failing calculator UI test**

Create `frontend/app/calculator/page.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
cd frontend
npm test -- app/calculator/page.test.tsx
```

Expected: FAIL because the calculator-local `Kalkulator HPP` heading and `Ekspor Laporan` button are still rendered.

- [ ] **Step 3: Remove only the calculator-local header**

In `frontend/app/calculator/page.tsx`:

- Remove `Download` from the `lucide-react` import.
- Delete the complete `<header className="bg-white shadow-sm border-b border-gray-200 mb-6">...</header>` block.
- Leave the progress-step block, `exportReport`, and the step-4 **Simpan & Ekspor** button unchanged.

The component return must begin:

```tsx
return (
  <div className="min-h-screen bg-gray-50">
    {/* Progress Steps */}
    <div className="py-6">
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
cd frontend
npm test -- app/calculator/page.test.tsx
```

Expected: 1 test passes.

- [ ] **Step 5: Run the complete test suite**

Run:

```bash
cd frontend
npm test
```

Expected: 4 tests pass with zero failures.

- [ ] **Step 6: Commit the calculator task**

```bash
git add frontend/app/calculator/page.tsx frontend/app/calculator/page.test.tsx
git commit -m "refactor(calculator): remove duplicate header"
```

---

### Task 4: Full frontend verification

**Files:**
- Verify only; no planned file changes.

**Interfaces:**
- Consumes: completed Header, BackgroundAnimation, and CalculatorPage changes.
- Produces: fresh evidence that tests, lint, and production compilation succeed together.

- [ ] **Step 1: Run all automated tests**

```bash
cd frontend
npm test
```

Expected: 4 tests pass with zero failures.

- [ ] **Step 2: Run lint**

```bash
cd frontend
npm run lint
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 3: Run the production build**

```bash
cd frontend
npm run build
```

Expected: exit code 0 and all routes compile successfully.

- [ ] **Step 4: Check the final diff and worktree**

```bash
git status --short
git diff HEAD~3 --check
```

Expected: no unstaged files and no whitespace errors.
