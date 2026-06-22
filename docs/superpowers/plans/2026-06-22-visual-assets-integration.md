# Visual Assets Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the five supplied composite images into web-ready assets and integrate them into Menu, About, Home, and Calculator without obscuring content or adding heavy animation.

**Architecture:** Keep all source sheets untouched in `database/`, create focused derivatives under `frontend/public/assets/`, and expose their paths through one typed manifest. Meaningful content uses Next.js `Image`; a reusable `DecorativeAsset` component owns non-interactive 3D positioning and responsive visibility.

**Tech Stack:** Next.js 14.1, React 18, TypeScript, Tailwind CSS, Vitest, Testing Library, OpenAI image generation/editing

## Global Constraints

- Use the `imagegen` skill for every image extraction or transparent-background edit.
- Keep every source file in `database/` unchanged.
- Use lowercase kebab-case derivative filenames under `frontend/public/assets/`.
- Export exactly 10 menu images, 4 team portraits, 3 testimonial portraits, 3 article thumbnails, and 12 curated 3D decorations.
- Decorations use empty alt text, `aria-hidden`, and `pointer-events-none`; meaningful images use descriptive Indonesian alt text.
- Decorations overlap section edges by at most roughly 10–15% and never cover text, controls, form fields, or results.
- Desktop gets the complete decoration set, tablet gets smaller assets, and mobile retains at most one small accent per major section.
- Do not add continuous animation or change application copy, data, prices, cart behavior, calculator logic, routes, or backend behavior.

---

### Task 1: Generate web-ready image derivatives

**Files:**
- Read: `database/menu.png`
- Read: `database/foto tim dan profile user rating.png`
- Read: `database/thummbnail artikel.png`
- Read: `database/assets 3d.png`
- Read: `database/assets 3d 2.png`
- Create: `frontend/public/assets/menu/*.png`
- Create: `frontend/public/assets/people/*.png`
- Create: `frontend/public/assets/articles/*.png`
- Create: `frontend/public/assets/decorations/*.png`

**Interfaces:**
- Consumes: the five supplied source sheets.
- Produces: 32 image files with the exact paths used by Task 2.

- [ ] **Step 1: Load image-editing instructions and inspect every source at original resolution**

Use the `imagegen` skill, then inspect all five files with the local image viewer at original detail. Do not modify the source sheets.

- [ ] **Step 2: Extract the ten menu images**

For each edit, instruct image generation to preserve the selected dish exactly, remove the checkerboard into true transparency, retain realistic shadow, center the full object, avoid text, and output a square PNG. Generate these exact files:

```text
database/menu.png -> frontend/public/assets/menu/nasi-goreng.png
database/menu.png -> frontend/public/assets/menu/nasi-rames.png
database/menu.png -> frontend/public/assets/menu/nasi-ayam-bakar.png
database/menu.png -> frontend/public/assets/menu/mie-goreng.png
database/menu.png -> frontend/public/assets/menu/mie-rebus.png
database/menu.png -> frontend/public/assets/menu/es-teh.png
database/menu.png -> frontend/public/assets/menu/es-jeruk.png
database/menu.png -> frontend/public/assets/menu/kopi-susu.png
database/menu.png -> frontend/public/assets/menu/pisang-goreng.png
database/menu.png -> frontend/public/assets/menu/tahu-crispy.png
```

- [ ] **Step 3: Extract team and testimonial portraits**

Crop one person per output, preserve the existing photographic background, use a centered 4:3 portrait, and do not alter faces or clothing. Generate:

```text
top row left-to-right:
frontend/public/assets/people/andi-pratama.png
frontend/public/assets/people/siti-rahayu.png
frontend/public/assets/people/budi-santoso.png
frontend/public/assets/people/dewi-lestari.png

second row left-to-right:
frontend/public/assets/people/rina.png
frontend/public/assets/people/agus.png
frontend/public/assets/people/maya.png
```

- [ ] **Step 4: Extract the three article thumbnails**

Crop each panel from `database/thummbnail artikel.png` without adding text, preserve its scene, and output 16:10 images:

```text
left panel   -> frontend/public/assets/articles/hpp-tips.png
center panel -> frontend/public/assets/articles/digital-marketing.png
right panel  -> frontend/public/assets/articles/stock-management.png
```

- [ ] **Step 5: Extract the 12 transparent 3D decorations**

Preserve dimensional lighting and source shadows, remove checkerboard into true transparency, isolate one object or coherent cluster per file, and leave generous transparent padding:

```text
assets 3d.png:
burger              -> frontend/public/assets/decorations/burger.png
fries carton         -> frontend/public/assets/decorations/fries.png
fried chicken plate  -> frontend/public/assets/decorations/fried-chicken.png
iced tea             -> frontend/public/assets/decorations/iced-tea.png
iced coffee          -> frontend/public/assets/decorations/iced-coffee.png

assets 3d 2.png:
wooden Warung sign       -> frontend/public/assets/decorations/warung-sign.png
standing menu board      -> frontend/public/assets/decorations/menu-board.png
100% Segar badge         -> frontend/public/assets/decorations/fresh-badge.png
Harga Bersahabat badge   -> frontend/public/assets/decorations/value-badge.png
welcome brush banner     -> frontend/public/assets/decorations/welcome-banner.png
red chili cluster        -> frontend/public/assets/decorations/chili.png
green leaf cluster       -> frontend/public/assets/decorations/leaves.png
```

- [ ] **Step 6: Visually verify all derivatives**

Open every output at original detail. Confirm no checkerboard remains on transparent files, no object is clipped, portraits match the intended people, and article crops match their titles.

- [ ] **Step 7: Commit generated assets**

```bash
git add frontend/public/assets
git commit -m "feat(assets): add web-ready visual library"
```

---

### Task 2: Typed asset manifest and decorative component

**Files:**
- Create: `frontend/lib/visualAssets.ts`
- Create: `frontend/lib/visualAssets.test.ts`
- Create: `frontend/components/DecorativeAsset.tsx`
- Create: `frontend/components/DecorativeAsset.test.tsx`

**Interfaces:**
- Produces: `menuImages`, `teamImages`, `testimonialImages`, `articleImages`, and `decorations` path maps.
- Produces: `DecorativeAsset({ src, className }: { src: string; className: string }): JSX.Element`.

- [ ] **Step 1: Write failing manifest and component tests**

Create `frontend/lib/visualAssets.test.ts`:

```ts
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { articleImages, decorations, menuImages, teamImages, testimonialImages } from './visualAssets'

describe('visual asset manifest', () => {
  it('maps every meaningful record and decoration to an existing file', () => {
    expect(Object.keys(menuImages)).toHaveLength(10)
    expect(teamImages).toHaveLength(4)
    expect(testimonialImages).toHaveLength(3)
    expect(articleImages).toHaveLength(3)
    expect(Object.keys(decorations)).toHaveLength(12)

    const paths = [
      ...Object.values(menuImages).map((entry) => entry.src),
      ...teamImages.map((entry) => entry.src),
      ...testimonialImages.map((entry) => entry.src),
      ...articleImages.map((entry) => entry.src),
      ...Object.values(decorations),
    ]

    for (const path of paths) {
      expect(existsSync(join(process.cwd(), 'public', path.slice(1)))).toBe(true)
    }
  })
})
```

Create `frontend/components/DecorativeAsset.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DecorativeAsset from './DecorativeAsset'

describe('DecorativeAsset', () => {
  it('is hidden from assistive technology and cannot intercept input', () => {
    render(<DecorativeAsset src="/assets/decorations/burger.png" className="left-0" />)

    const decoration = screen.getByTestId('decorative-asset')
    expect(decoration).toHaveAttribute('aria-hidden', 'true')
    expect(decoration).toHaveClass('pointer-events-none')
    expect(screen.getByRole('presentation')).toHaveAttribute('alt', '')
  })
})
```

- [ ] **Step 2: Run tests and verify RED**

```bash
cd frontend
npm test -- lib/visualAssets.test.ts components/DecorativeAsset.test.tsx
```

Expected: FAIL because both modules are missing.

- [ ] **Step 3: Create the complete asset manifest**

Create `frontend/lib/visualAssets.ts` with exact exported paths and Indonesian alt text:

```ts
export const menuImages = {
  '1': { src: '/assets/menu/nasi-goreng.png', alt: 'Nasi Goreng Spesial' },
  '2': { src: '/assets/menu/nasi-rames.png', alt: 'Nasi Rames Komplit' },
  '3': { src: '/assets/menu/nasi-ayam-bakar.png', alt: 'Nasi Ayam Bakar' },
  '4': { src: '/assets/menu/mie-goreng.png', alt: 'Mie Goreng Jawa' },
  '5': { src: '/assets/menu/mie-rebus.png', alt: 'Mie Rebus Spesial' },
  '6': { src: '/assets/menu/es-teh.png', alt: 'Es Teh Manis' },
  '7': { src: '/assets/menu/es-jeruk.png', alt: 'Es Jeruk Segar' },
  '8': { src: '/assets/menu/kopi-susu.png', alt: 'Kopi Susu' },
  '9': { src: '/assets/menu/pisang-goreng.png', alt: 'Pisang Goreng' },
  '10': { src: '/assets/menu/tahu-crispy.png', alt: 'Tahu Crispy' },
} as const

export const teamImages = [
  { src: '/assets/people/andi-pratama.png', alt: 'Andi Pratama' },
  { src: '/assets/people/siti-rahayu.png', alt: 'Siti Rahayu' },
  { src: '/assets/people/budi-santoso.png', alt: 'Budi Santoso' },
  { src: '/assets/people/dewi-lestari.png', alt: 'Dewi Lestari' },
] as const

export const testimonialImages = [
  { src: '/assets/people/rina.png', alt: 'Rina, pemilik Warung Kopi Asik' },
  { src: '/assets/people/agus.png', alt: 'Agus, pemilik Warung Nasi Goreng Spesial' },
  { src: '/assets/people/maya.png', alt: 'Maya, pemilik Cafe Senja' },
] as const

export const articleImages = [
  { src: '/assets/articles/hpp-tips.png', alt: 'Menghitung HPP makanan' },
  { src: '/assets/articles/digital-marketing.png', alt: 'Digital marketing untuk warung' },
  { src: '/assets/articles/stock-management.png', alt: 'Manajemen stok warung' },
] as const

export const decorations = {
  burger: '/assets/decorations/burger.png',
  fries: '/assets/decorations/fries.png',
  friedChicken: '/assets/decorations/fried-chicken.png',
  icedTea: '/assets/decorations/iced-tea.png',
  icedCoffee: '/assets/decorations/iced-coffee.png',
  warungSign: '/assets/decorations/warung-sign.png',
  menuBoard: '/assets/decorations/menu-board.png',
  freshBadge: '/assets/decorations/fresh-badge.png',
  valueBadge: '/assets/decorations/value-badge.png',
  welcomeBanner: '/assets/decorations/welcome-banner.png',
  chili: '/assets/decorations/chili.png',
  leaves: '/assets/decorations/leaves.png',
} as const
```

- [ ] **Step 4: Create the decorative component**

Create `frontend/components/DecorativeAsset.tsx`:

```tsx
import Image from 'next/image'

interface DecorativeAssetProps {
  src: string
  className: string
}

export default function DecorativeAsset({ src, className }: DecorativeAssetProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="decorative-asset"
      className={`pointer-events-none absolute z-0 ${className}`}
    >
      <Image src={src} alt="" role="presentation" width={320} height={320} className="h-auto w-full object-contain" />
    </div>
  )
}
```

- [ ] **Step 5: Run tests and verify GREEN**

```bash
cd frontend
npm test -- lib/visualAssets.test.ts components/DecorativeAsset.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit shared asset code**

```bash
git add frontend/lib/visualAssets.ts frontend/lib/visualAssets.test.ts frontend/components/DecorativeAsset.tsx frontend/components/DecorativeAsset.test.tsx
git commit -m "feat(ui): add visual asset system"
```

---

### Task 3: Menu and About meaningful imagery

**Files:**
- Modify: `frontend/app/menu/page.tsx`
- Create: `frontend/app/menu/page.visual.test.tsx`
- Modify: `frontend/app/about/page.tsx`
- Create: `frontend/app/about/page.visual.test.tsx`

**Interfaces:**
- Consumes: `menuImages`, `teamImages`, `testimonialImages`, and `articleImages` from Task 2.
- Produces: visible, descriptive images in all existing Menu and About cards.

- [ ] **Step 1: Write failing visual integration tests**

Create `frontend/app/menu/page.visual.test.tsx`:

```tsx
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
```

Create `frontend/app/about/page.visual.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { articleImages, teamImages, testimonialImages } from '@/lib/visualAssets'
import AboutPage from './page'

vi.mock('@/components/BackgroundAnimation', () => ({ default: () => null }))

describe('AboutPage imagery', () => {
  it('shows supplied team, testimonial, and article images', () => {
    render(<AboutPage />)
    const images = [...teamImages, ...testimonialImages, ...articleImages]
    for (const image of images) {
      expect(screen.getByRole('img', { name: image.alt })).toBeInTheDocument()
    }
  })
})
```

Run:

```bash
cd frontend
npm test -- app/menu/page.visual.test.tsx app/about/page.visual.test.tsx
```

Expected: FAIL because the pages do not render meaningful images.

- [ ] **Step 2: Integrate menu images**

Import `Image` and `menuImages`. Replace each menu-card letter block with:

```tsx
<Image
  src={menuImages[item.id as keyof typeof menuImages].src}
  alt={menuImages[item.id as keyof typeof menuImages].alt}
  fill
  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
  className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
/>
```

Keep the existing price badge above the image with `z-10`.

- [ ] **Step 3: Integrate About images**

Import `Image` and the three About manifests, then add `image: teamImages[index]`, `testimonialImages[index]`, or `articleImages[index]` while constructing each array. Render the three card image types with:

```tsx
<Image src={member.image.src} alt={member.image.alt} width={640} height={480} className="h-48 w-full object-cover" />

<Image src={testimonial.image.src} alt={testimonial.image.alt} width={96} height={96} className="h-12 w-12 rounded-full object-cover mr-4" />

<Image src={post.image.src} alt={post.image.alt} width={800} height={500} className="h-48 w-full object-cover" />
```

- [ ] **Step 4: Run integration tests and verify GREEN**

```bash
cd frontend
npm test -- app/menu/page.visual.test.tsx app/about/page.visual.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit meaningful imagery**

```bash
git add frontend/app/menu/page.tsx frontend/app/menu/page.visual.test.tsx frontend/app/about/page.tsx frontend/app/about/page.visual.test.tsx
git commit -m "feat(content): show supplied photography"
```

---

### Task 4: Contextual 3D decorations on all pages

**Files:**
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/app/menu/page.tsx`
- Modify: `frontend/app/calculator/page.tsx`
- Modify: `frontend/app/about/page.tsx`
- Create: `frontend/components/PageDecorations.test.tsx`

**Interfaces:**
- Consumes: `DecorativeAsset` and `decorations` from Task 2.
- Produces: non-interactive contextual edge decoration on Home, Menu, Calculator, and About.

- [ ] **Step 1: Write the failing page decoration test**

Create `frontend/components/PageDecorations.test.tsx`:

```tsx
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
```

Run:

```bash
cd frontend
npm test -- components/PageDecorations.test.tsx
```

Expected: FAIL because no page renders `DecorativeAsset`.

- [ ] **Step 2: Decorate Home**

Import `DecorativeAsset` and `decorations`. Make Hero and Features `relative isolate`, wrap their existing content in `relative z-10`, and insert:

```tsx
<DecorativeAsset src={decorations.burger} className="hidden lg:block -left-20 top-8 w-56 xl:w-64" />
<DecorativeAsset src={decorations.icedTea} className="hidden lg:block -right-16 top-20 w-40 xl:w-48" />
<DecorativeAsset src={decorations.fries} className="hidden md:block -left-12 bottom-10 w-36 lg:w-44" />
<DecorativeAsset src={decorations.friedChicken} className="hidden lg:block -right-16 bottom-4 w-48" />
```

- [ ] **Step 3: Decorate Menu**

Make Hero and Menu Grid `relative isolate`, keep current content in `relative z-10`, and insert:

```tsx
<DecorativeAsset src={decorations.warungSign} className="hidden lg:block -left-20 top-2 w-56" />
<DecorativeAsset src={decorations.menuBoard} className="hidden lg:block -right-12 top-0 w-40" />
<DecorativeAsset src={decorations.freshBadge} className="hidden md:block -left-8 top-16 w-28" />
```

- [ ] **Step 4: Decorate Calculator**

Make the outer page container `relative isolate overflow-hidden`, wrap progress and forms in `relative z-10`, and insert:

```tsx
<DecorativeAsset src={decorations.valueBadge} className="hidden md:block -left-6 top-24 w-28" />
<DecorativeAsset src={decorations.chili} className="hidden md:block -right-8 bottom-24 w-32" />
```

- [ ] **Step 5: Decorate About**

Make Hero, Team, and Blog `relative isolate`, wrap their current content in `relative z-10`, and insert:

```tsx
<DecorativeAsset src={decorations.welcomeBanner} className="hidden lg:block -left-20 top-8 w-64" />
<DecorativeAsset src={decorations.leaves} className="hidden md:block -right-8 top-16 w-32" />
<DecorativeAsset src={decorations.warungSign} className="hidden lg:block -left-24 bottom-12 w-48" />
<DecorativeAsset src={decorations.chili} className="hidden md:block -right-8 bottom-8 w-28" />
```

- [ ] **Step 6: Run decoration and full tests**

```bash
cd frontend
npm test -- components/PageDecorations.test.tsx
npm test
```

Expected: decoration test passes and the complete suite has zero failures.

- [ ] **Step 7: Commit decorations**

```bash
git add frontend/app/page.tsx frontend/app/menu/page.tsx frontend/app/calculator/page.tsx frontend/app/about/page.tsx frontend/components/PageDecorations.test.tsx
git commit -m "feat(ui): add contextual 3d decorations"
```

---

### Task 5: Responsive visual and production verification

**Files:**
- Verify only; no planned source changes.

**Interfaces:**
- Consumes: all generated assets and page integrations.
- Produces: evidence that the visual library is accessible, responsive, buildable, and live.

- [ ] **Step 1: Run automated gates**

```bash
cd frontend
npm test
npm run lint
npm run build
```

Expected: all tests pass, lint reports no warnings or errors, and every route builds.

- [ ] **Step 2: Verify desktop, tablet, and mobile layouts**

Inspect `/`, `/menu`, `/calculator`, and `/about` at 1440×900, 768×1024, and 390×844. Confirm no decoration clips important content, no card image stretches, desktop overlap stays near 10–15%, and mobile keeps at most one small accent per major section.

- [ ] **Step 3: Verify source and repository hygiene**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors, no modified source image under `database/`, and no uncommitted implementation files.
