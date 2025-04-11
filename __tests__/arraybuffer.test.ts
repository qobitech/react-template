import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  readFileAsArrayBuffer
} from '../src/helper'

describe('arrayBufferToBase64 & base64ToArrayBuffer & readFileAsArrayBuffer', () => {
  it('should convert buffer to base64 and back without data loss', () => {
    const original = new Uint8Array([72, 101, 108, 108, 111]) // 'Hello'
    const base64 = arrayBufferToBase64(original)
    const restored = base64ToArrayBuffer(base64)

    expect(restored).toEqual(original)
  })

  it('base64ToArrayBuffer handles empty string', () => {
    const result = base64ToArrayBuffer('')
    expect(result).toEqual(new Uint8Array(0))
  })

  it('reads a File and returns its ArrayBuffer', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' })
    const file = new File([blob], 'test.txt')

    const result = await readFileAsArrayBuffer(file)
    const view = new Uint8Array(result)
    const expected = new TextEncoder().encode('hello')

    expect(Array.from(view)).toEqual(Array.from(expected))
  })
})
