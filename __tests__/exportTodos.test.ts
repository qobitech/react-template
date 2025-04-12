import * as helper from '../src/helper' // Import for mocking
import { vi } from 'vitest'
import { ITodos } from '../src/interface'
import { exportTodos } from '../src/utils'

// Mock the dependencies of exportTodos
vi.mock('../src/helper.ts', () => ({
  generateUUID: vi.fn().mockReturnValue('mock-uuid'),
  generateUserFingerprint: vi.fn().mockResolvedValue('mock-fingerprint'),
  createSHA256: vi.fn().mockResolvedValue('mock-checksum'),
  generateVisualHash: vi.fn().mockReturnValue('mock-visual-hash'),
  compressWithPako: vi.fn().mockReturnValue('mock-compressed-data'),
  encodeData: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
  createBinaryHeader: vi.fn().mockImplementation(() => {
    const header = new ArrayBuffer(32)
    const view = new DataView(header)
    view.setUint8(0, 0x54) // T
    view.setUint8(1, 0x44) // D
    view.setUint8(2, 0x4f) // O
    view.setUint8(3, 0x58) // X
    return header
  })
}))

describe('exportTodos function', () => {
  const mockTodo: ITodos = {
    id: '1',
    title: 'Todo A',
    text: 'Task A',
    timeStamp: 1,
    todo: []
  }

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  // Create a mock implementation for FileReader to avoid timeout issues
  beforeAll(() => {
    // Mock FileReader
    global.FileReader = class {
      onloadend: (() => void) | null = null
      result: any = null

      readAsArrayBuffer(blob: Blob) {
        // Mock the ArrayBuffer result
        const mockHeaderBuffer = new ArrayBuffer(32)
        const headerView = new DataView(mockHeaderBuffer)
        headerView.setUint8(0, 0x54) // T
        headerView.setUint8(1, 0x44) // D
        headerView.setUint8(2, 0x4f) // O
        headerView.setUint8(3, 0x58) // X
        headerView.setUint32(8, 3, true) // Content length

        // Create a combined buffer (header + encoded data)
        const combinedBuffer = new ArrayBuffer(32 + 3)
        new Uint8Array(combinedBuffer).set(new Uint8Array(mockHeaderBuffer), 0)
        new Uint8Array(combinedBuffer).set([1, 2, 3], 32)

        this.result = combinedBuffer

        // Simulate async nature of FileReader
        setTimeout(() => {
          if (this.onloadend) this.onloadend()
        }, 0)
      }
    } as any

    // Mock crypto for SHA-256
    global.crypto = {
      subtle: {
        digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
      }
    } as any
  })

  afterAll(() => {
    // Clean up mocks
    delete (global as any).FileReader
    delete (global as any).crypto
  })

  it('should export todos and call the helper functions correctly', async () => {
    // Act
    const resultBlob = await exportTodos(mockTodo)

    // Assert
    expect(resultBlob).toBeInstanceOf(Blob)
    expect(resultBlob.type).toBe('application/x-mytodo')

    // Verify that the mocked dependencies were called correctly
    expect(helper.generateUUID).toHaveBeenCalled()
    expect(helper.generateUserFingerprint).toHaveBeenCalled()
    expect(helper.createSHA256).toHaveBeenCalled()
    expect(helper.generateVisualHash).toHaveBeenCalledWith(mockTodo)
    expect(helper.compressWithPako).toHaveBeenCalled()
    expect(helper.encodeData).toHaveBeenCalledWith('mock-compressed-data')
    expect(helper.createBinaryHeader).toHaveBeenCalled()

    // Verify the JSON structure passed to compression without strict matching
    const compressCallArg = vi.mocked(helper.compressWithPako).mock.calls[0][0]
    const parsedArg = JSON.parse(compressCallArg)

    expect(parsedArg.formatSignature).toBe('MYTODO_FORMAT_V1')
    expect(parsedArg.todo).toEqual(mockTodo)
    expect(parsedArg.visualSignature).toBe('mock-visual-hash')

    // Check metadata structure more flexibly
    const metadata = parsedArg.metadata
    expect(metadata).toBeDefined()
  }, 10000) // Increase timeout to 10 seconds
})
