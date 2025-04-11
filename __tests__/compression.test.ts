import { compressWithPako, decompressWithPako } from '../src/helper'

describe('compressWithPako', () => {
  it('returns a non-empty base64 string', () => {
    const input = JSON.stringify({ todos: ['a', 'b', 'c'] })
    const compressed = compressWithPako(input)
    expect(compressed.length).toBeGreaterThan(0)
    expect(compressed).toMatch(/^[A-Za-z0-9+/=]+$/)
  })

  it('can be decompressed to the original input', () => {
    const input = JSON.stringify({ todos: ['x'] })
    const compressed = compressWithPako(input)
    const decompressed = decompressWithPako(compressed)
    expect(decompressed).toBe(input)
  })
})
