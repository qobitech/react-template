import { decodeData, encodeData } from '../src/helper'

describe('encodeData & decodeData', () => {
  it('should encode and decode a string correctly', () => {
    const input = 'My secret message'
    const encoded = encodeData(input)
    const decoded = decodeData(encoded)

    expect(decoded).toBe(input)
  })

  it('produces different output from original input', () => {
    const input = 'test'
    const encoded = encodeData(input)
    expect(encoded).not.toEqual(new TextEncoder().encode(input))
  })
})
