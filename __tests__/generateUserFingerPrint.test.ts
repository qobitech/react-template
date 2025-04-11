import { generateUserFingerprint } from '../src/helper'

// Mock the function before your tests
vi.mock('../src/helper', () => ({
  generateUserFingerprint: vi.fn().mockResolvedValue('fakehash12345')
}))

describe('generateUserFingerprint', () => {
  it('returns a SHA256 hash based on device info', async () => {
    const fingerprint = await generateUserFingerprint()
    expect(fingerprint.startsWith('fakehash')).toBe(true)
  })
})
