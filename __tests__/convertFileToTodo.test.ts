import { convertFileToTodo } from '../src/utils'
import * as helper from '../src/helper'
import { Mock } from 'vitest'

vi.mock('../src/helper', () => ({
  readFileAsArrayBuffer: vi.fn(),
  createSHA256: vi.fn(),
  decodeData: vi.fn(),
  decompressWithPako: vi.fn()
}))

describe('convertFileToTodo', () => {
  const fakeChecksum = 'aabbccddeeff00112233445566778899'

  function createValidHeader({
    version = 1,
    contentLength = 4,
    checksum = fakeChecksum
  }) {
    const header = new Uint8Array(32)
    header[0] = 0x54 // T
    header[1] = 0x44 // D
    header[2] = 0x4f // O
    header[3] = 0x58 // X
    header[4] = version
    header[5] = 0x00
    header[8] = contentLength
    for (let i = 0; i < 8; i++) {
      header[24 + i] = parseInt(checksum.substring(i * 2, i * 2 + 2), 16)
    }
    return header
  }

  it('successfully imports a valid todo file', async () => {
    const mockTodo = {
      metadata: { contentChecksum: 'mock-content-checksum' },
      todo: [{ id: '1', title: 'Test Todo', text: '', timeStamp: 0, todo: [] }]
    }

    const header = createValidHeader({})
    const buffer = new Uint8Array([...header, 5, 6, 7, 8]).buffer

    ;(helper.readFileAsArrayBuffer as Mock).mockResolvedValue(buffer)
    ;(helper.createSHA256 as Mock)
      .mockResolvedValueOnce(fakeChecksum)
      .mockResolvedValueOnce('mock-content-checksum')
    ;(helper.decodeData as Mock).mockReturnValue([1, 2, 3])
    ;(helper.decompressWithPako as Mock).mockReturnValue(
      JSON.stringify(mockTodo)
    )

    const file = new File([], 'valid.todolistx')
    const result = await convertFileToTodo(file)

    const { contentChecksum, ...strippedMetadata } = mockTodo.metadata
    expect(result).toEqual({
      ...mockTodo,
      metadata: strippedMetadata
    })
  })

  it('throws error when file is too small', async () => {
    const tinyBuffer = new Uint8Array(10).buffer
    ;(helper.readFileAsArrayBuffer as Mock).mockResolvedValue(tinyBuffer)

    await expect(
      convertFileToTodo(new File([], 'tiny.todolistx'))
    ).rejects.toThrow('Invalid file: too small to be a valid todo file')
  })

  it('throws error for invalid file format (bad magic number)', async () => {
    const badHeader = new Uint8Array(32)
    badHeader[0] = 0x00 // not 'T'
    ;(helper.readFileAsArrayBuffer as Mock).mockResolvedValue(badHeader.buffer)

    await expect(
      convertFileToTodo(new File([], 'badmagic.todolistx'))
    ).rejects.toThrow('Invalid file format: not a todo file')
  })

  it('throws error for unsupported version', async () => {
    const header = createValidHeader({ version: 2 })
    ;(helper.readFileAsArrayBuffer as Mock).mockResolvedValue(header.buffer)

    await expect(
      convertFileToTodo(new File([], 'unsupported.todolistx'))
    ).rejects.toThrow('Unsupported file version: 2')
  })

  it('throws error for header checksum mismatch', async () => {
    const header = createValidHeader({})
    ;(helper.readFileAsArrayBuffer as Mock).mockResolvedValue(header.buffer)
    ;(helper.createSHA256 as Mock).mockResolvedValue('wrong-checksum')

    await expect(
      convertFileToTodo(new File([], 'headerfail.todolistx'))
    ).rejects.toThrow('Header checksum verification failed')
  })

  it('throws error for content integrity mismatch', async () => {
    const mockData = {
      metadata: { contentChecksum: 'expected-checksum' },
      todo: []
    }

    const header = createValidHeader({})
    const buffer = new Uint8Array([...header, 10, 11, 12, 13]).buffer

    ;(helper.readFileAsArrayBuffer as Mock).mockResolvedValue(buffer)
    ;(helper.createSHA256 as Mock)
      .mockResolvedValueOnce(fakeChecksum) // header checksum
      .mockResolvedValueOnce('wrong-content-checksum') // content fails
    ;(helper.decodeData as Mock).mockReturnValue([1, 2, 3])
    ;(helper.decompressWithPako as Mock).mockReturnValue(
      JSON.stringify(mockData)
    )

    await expect(
      convertFileToTodo(new File([], 'contentfail.todolistx'))
    ).rejects.toThrow('Content integrity check failed')
  })
})
