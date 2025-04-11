import { describe, it, expect } from 'vitest'
import { generateVisualHash } from '../src/helper'

describe('generateVisualHash', () => {
  it('returns a hex color string', () => {
    const color = generateVisualHash({ task: 'do something' })
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('returns the same output for the same input', () => {
    const input = { task: 'write tests' }
    const color1 = generateVisualHash(input)
    const color2 = generateVisualHash(input)
    expect(color1).toBe(color2)
  })

  it('returns different outputs for different input', () => {
    const hash1 = generateVisualHash({ a: 1 })
    const hash2 = generateVisualHash({ a: 2 })
    expect(hash1).not.toBe(hash2)
  })
})
