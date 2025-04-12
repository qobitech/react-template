import { renderHook } from '@testing-library/react'
import { useIO } from '../src/hook'
import * as helperFunctions from '../src/utils'
import { ITodos } from '../src/interface'

// Mock all the utility functions used in the hook
vi.mock('../src/utils.ts', () => ({
  convertFileToTodo: vi.fn(),
  exportTodos: vi.fn()
}))

vi.mock('../src/helper', () => ({
  generateUserFingerprint: vi
    .fn()
    .mockResolvedValue('fakehash-user-fingerprint'),
  generateUUID: vi.fn().mockReturnValue('mock-uuid-123'),
  sanitizeFileName: vi.fn().mockReturnValue('Test_Todo_1'),
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
// const mockLink = {
//   href: '',
//   download: '',
//   click: vi.fn()
// }
const aTagElement = document.createElement

const mockLink = document.createElement('a')
mockLink.click = vi.fn()

vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
  if (tagName === 'a') return mockLink
  return aTagElement.call(document, tagName)
})

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
  const mockTodo: ITodos = {
    id: '1',
    title: 'Test Todo 1',
    text: 'sample',
    timeStamp: 100,
    todo: []
  }

  const mockTodos: ITodos[] = [
    {
      id: '1',
      title: 'Todo A',
      text: 'Task A',
      timeStamp: 1,
      todo: []
    },
    {
      id: '2',
      title: 'Todo B',
      text: 'Task B',
      timeStamp: 2,
      todo: []
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportTodosToFile', () => {
    it('creates a blob and triggers a download', async () => {
      const { result } = renderHook(() => useIO())

      await result.current.exportTodoToFile(mockTodo)

      // Verify URL and link manipulation
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(mockLink.click).toHaveBeenCalledTimes(1)
      expect(mockLink.download).toMatch(/Test_Todo_1_\d+\.todolistx/)
      expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1)
    })
  })

  describe('importTodoFromFile', () => {
    it('successfully imports todo from a valid file as todo', async () => {
      // Mock the import sequence
      const { result } = renderHook(() => useIO())
      const mockFile = new File([], 'test.todolistx')

      const { convertFileToTodo } = helperFunctions

      ;(convertFileToTodo as any).mockResolvedValue({ todo: mockTodo })

      const { todo } = await result.current.importTodoFromFile(mockFile)

      expect(todo).toEqual(mockTodo)
      expect(convertFileToTodo).toHaveBeenCalledWith(mockFile)
    })
  })

  describe('exportMultipleTodosAsZip', () => {
    it('exports multiple todos to a zip file and triggers download', async () => {
      const { result } = renderHook(() => useIO())

      const createObjectURLSpy = vi.spyOn(global.URL, 'createObjectURL')
      const revokeObjectURLSpy = vi.spyOn(global.URL, 'revokeObjectURL')
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      await result.current.exportMultipleTodosAsZip(mockTodos)

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1)
      expect(mockLink.click).toHaveBeenCalledTimes(1)
      expect(mockLink.download).toMatch(/myTodoLists_\d+\.zip/)
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1)
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
    })
  })

  describe('importMultipleTodosFromFile', () => {
    it('imports multiple valid todo files', async () => {
      const { result } = renderHook(() => useIO())

      const { convertFileToTodo } = helperFunctions

      ;(convertFileToTodo as any)
        .mockResolvedValueOnce({ todo: mockTodos[0] })
        .mockResolvedValueOnce({ todo: mockTodos[1] })

      const mockFileA = new File([], 'Todo_A.todolistx')
      const mockFileB = new File([], 'Todo_B.todolistx')

      const { todos } = await result.current.importMultipleTodosFromFile([
        mockFileA,
        mockFileB
      ])

      expect(todos).toEqual(mockTodos)
      expect(convertFileToTodo).toHaveBeenCalledTimes(2)
      expect(convertFileToTodo).toHaveBeenCalledWith(mockFileA)
      expect(convertFileToTodo).toHaveBeenCalledWith(mockFileB)
    })

    it('continues importing even if one file fails', async () => {
      const { result } = renderHook(() => useIO())

      const file1 = new File([], 'valid.todolistx')
      const file2 = new File([], 'broken.todolistx')
      const file3 = new File([], 'valid2.todolistx')

      const { convertFileToTodo } = helperFunctions

      ;(convertFileToTodo as any)
        .mockResolvedValueOnce({
          todo: { id: '1', title: 'Ok', text: '', timeStamp: 0, todo: [] }
        })
        .mockRejectedValueOnce(new Error('Bad file'))
        .mockResolvedValueOnce({
          todo: { id: '1', title: 'Ok', text: '', timeStamp: 0, todo: [] }
        })

      const { todos } = await result.current.importMultipleTodosFromFile([
        file1,
        file2,
        file3
      ])

      expect(todos.length).toBe(2)
      expect(todos[0].title).toBe('Ok')
    })

    it('generates a report for a failed import', async () => {
      const { result } = renderHook(() => useIO())

      const file1 = new File([], 'valid.todolistx')
      const file2 = new File([], 'broken.todolistx')
      const file3 = new File([], 'valid2.todolistx')

      const { convertFileToTodo } = helperFunctions

      ;(convertFileToTodo as any)
        .mockResolvedValueOnce({
          todo: { id: '1', title: 'Ok', text: '', timeStamp: 0, todo: [] }
        })
        .mockRejectedValueOnce(new Error('Bad file'))
        .mockResolvedValueOnce({
          todo: { id: '1', title: 'Ok', text: '', timeStamp: 0, todo: [] }
        })

      const { reports } = await result.current.importMultipleTodosFromFile([
        file1,
        file2,
        file3
      ])

      expect(reports.length).toBe(1)
      expect(reports[0].filename).toBe('broken.todolistx')
      expect(reports[0].error).toBe('Bad file')
    })
  })
})
