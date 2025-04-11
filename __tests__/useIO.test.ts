import { renderHook } from '@testing-library/react'
import { useIO } from '../src/hook'
import { INote } from '../src/pages/note-app'

// Mock all the utility functions used in the hook
vi.mock('../src/helper', () => ({
  generateUserFingerprint: vi
    .fn()
    .mockResolvedValue('fakehash-user-fingerprint'),
  generateUUID: vi.fn().mockReturnValue('mock-uuid-123'),
  generateVisualHash: vi.fn().mockReturnValue('mock-visual-hash'),
  createSHA256: vi.fn().mockImplementation(async (data) => 'mock-sha256-hash'),
  compressWithPako: vi
    .fn()
    .mockImplementation((data) => new Uint8Array([1, 2, 3, 4])),
  encodeData: vi
    .fn()
    .mockImplementation((data) => new Uint8Array([5, 6, 7, 8])),
  createBinaryHeader: vi.fn().mockReturnValue(new ArrayBuffer(32)),
  readFileAsArrayBuffer: vi.fn(),
  decodeData: vi.fn(),
  decompressWithPako: vi.fn()
}))

// Create a mock for document.createElement
const mockLink = {
  href: '',
  download: '',
  click: vi.fn()
}

// Mock URL and document APIs
global.URL = {
  createObjectURL: vi.fn().mockReturnValue('mock-blob-url'),
  revokeObjectURL: vi.fn()
} as any

// Store the original createElement method before mocking
const originalCreateElement = document.createElement.bind(document)

vi.spyOn(document, 'createElement').mockImplementation((tag) => {
  if (tag === 'a') return mockLink as any
  // Call the original method directly
  return originalCreateElement(tag)
})

describe('useIO Hook', () => {
  const mockTodos: INote[] = [
    { id: '1', title: 'Test Todo 1', text: 'sample', timeStamp: 100, todo: [] },
    { id: '2', title: 'Test Todo 2', text: 'sample2', timeStamp: 200, todo: [] }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportTodosToFile', () => {
    it('creates a blob and triggers a download', async () => {
      const { result } = renderHook(() => useIO())

      await result.current.exportTodosToFile(mockTodos)

      // Verify URL and link manipulation
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(mockLink.click).toHaveBeenCalledTimes(1)
      expect(mockLink.download).toMatch(/myTodos_\d+\.todolistx/)
      expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1)
    })
  })

  describe('importTodosFromFile', () => {
    it('successfully imports todos from a valid file', async () => {
      // Mock createSHA256 to return a predictable value for header verification
      const { createSHA256 } = await import('../src/helper')
      const mockHeaderChecksum = '0123456789abcdef0123456789abcdef' // 32 hex chars for SHA-256
      ;(createSHA256 as any).mockImplementation(async (data: any) => {
        // For header verification
        if (data instanceof Uint8Array && data.length === 24) {
          return mockHeaderChecksum
        }
        // For other checksum verifications
        return 'mock-sha256-hash'
      })

      // Mock the readFileAsArrayBuffer to return a valid file structure
      const mockArrayBuffer = new ArrayBuffer(100)
      const view = new DataView(mockArrayBuffer)

      // Set magic number "TDOX"
      view.setUint8(0, 0x54) // T
      view.setUint8(1, 0x44) // D
      view.setUint8(2, 0x4f) // O
      view.setUint8(3, 0x58) // X

      // Set version to 1
      view.setUint16(4, 1, true)

      // Set content length
      view.setUint32(8, 50, true)

      // Set the header checksum to match what our mocked createSHA256 will return
      for (let i = 0; i < 8; i++) {
        view.setUint8(
          24 + i,
          parseInt(mockHeaderChecksum.substring(i * 2, i * 2 + 2), 16)
        )
      }

      // Mock the import sequence
      const { readFileAsArrayBuffer, decodeData, decompressWithPako } =
        await import('../src/helper')
      ;(readFileAsArrayBuffer as any).mockResolvedValue(mockArrayBuffer)
      ;(decodeData as any).mockReturnValue(new Uint8Array([10, 20, 30]))
      ;(decompressWithPako as any).mockReturnValue(
        JSON.stringify({
          formatSignature: 'MYTODO_FORMAT_V1',
          metadata: {
            contentChecksum: 'mock-sha256-hash',
            version: '1.0'
          },
          todos: mockTodos
        })
      )

      const { result } = renderHook(() => useIO())
      const mockFile = new File([], 'test.todolistx')

      const importedTodos = await result.current.importTodosFromFile(mockFile)

      expect(importedTodos).toEqual(mockTodos)
      expect(readFileAsArrayBuffer).toHaveBeenCalledWith(mockFile)
    })

    it('throws an error for invalid file format', async () => {
      // Mock an invalid file (wrong magic number)
      const mockArrayBuffer = new ArrayBuffer(100)
      const view = new DataView(mockArrayBuffer)

      // Set wrong magic number
      view.setUint8(0, 0x58) // X
      view.setUint8(1, 0x58) // X
      view.setUint8(2, 0x58) // X
      view.setUint8(3, 0x58) // X

      const { readFileAsArrayBuffer } = await import('../src/helper')
      ;(readFileAsArrayBuffer as any).mockResolvedValue(mockArrayBuffer)

      const { result } = renderHook(() => useIO())
      const mockFile = new File([], 'invalid.todolistx')

      await expect(
        result.current.importTodosFromFile(mockFile)
      ).rejects.toThrow('Invalid file format: not a todo file')
    })

    it('throws an error for unsupported version', async () => {
      // Mock a file with unsupported version
      const mockArrayBuffer = new ArrayBuffer(100)
      const view = new DataView(mockArrayBuffer)

      // Set magic number "TDOX"
      view.setUint8(0, 0x54) // T
      view.setUint8(1, 0x44) // D
      view.setUint8(2, 0x4f) // O
      view.setUint8(3, 0x58) // X

      // Set version to 2 (unsupported)
      view.setUint16(4, 2, true)

      const { readFileAsArrayBuffer } = await import('../src/helper')
      ;(readFileAsArrayBuffer as any).mockResolvedValue(mockArrayBuffer)

      const { result } = renderHook(() => useIO())
      const mockFile = new File([], 'unsupported.todolistx')

      await expect(
        result.current.importTodosFromFile(mockFile)
      ).rejects.toThrow('Unsupported file version: 2')
    })
  })
})
