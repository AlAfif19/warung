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
