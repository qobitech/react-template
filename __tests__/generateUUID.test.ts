import { describe, it, expect } from 'vitest'
import { generateUUID } from '../src/helper'

describe('generateUUID', () => {
  it('returns a valid UUID v4 format', () => {
    const uuid = generateUUID()
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it('returns unique UUIDs', () => {
    const set = new Set()
    for (let i = 0; i < 10; i++) {
      set.add(generateUUID())
    }
    expect(set.size).toBe(10)
  })
})
