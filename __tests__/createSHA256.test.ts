import { createSHA256 } from '../src/helper'

// add comment
beforeAll(() => {
  global.crypto = {
    subtle: {
      digest: async (_: string, data: ArrayBuffer) => {
        const { createHash } = await import('node:crypto')
        const hash = createHash('sha256').update(new Uint8Array(data)).digest()
        return hash.buffer.slice(
          hash.byteOffset,
          hash.byteOffset + hash.byteLength
        )
      }
    }
  } as any
})

describe('createSHA256', () => {
  it('creates the correct SHA-256 hash for a known string', async () => {
    const hash = await createSHA256('hello')
    expect(hash).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    )
  })

  it('produces a 64-character hex string', async () => {
    const hash = await createSHA256('any-string')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})
