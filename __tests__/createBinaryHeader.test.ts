import { createBinaryHeader } from '../src/helper'

describe('createBinaryHeader', () => {
  it('returns a 32-byte ArrayBuffer with correct identifiers', () => {
    const buffer = createBinaryHeader()
    const view = new DataView(buffer)

    expect(view.getUint8(0)).toBe(0x54) // T
    expect(view.getUint8(1)).toBe(0x44) // D
    expect(view.getUint8(2)).toBe(0x4f) // O
    expect(view.getUint8(3)).toBe(0x58) // X
    expect(view.getUint8(4)).toBe(1) // Major version
    expect(view.getUint8(5)).toBe(0) // Minor version
    expect(view.byteLength).toBe(32)
  })
})
