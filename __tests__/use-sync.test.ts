import { renderHook, act } from '@testing-library/react'
import { openDB } from 'idb'
import 'fake-indexeddb/auto'
import { useSync } from '../src/hook'

interface MockItem {
  id: string
  name: string
}

const defaultItem = {
  id: '',
  name: ''
}

describe('useSync Hook', () => {
  const sampleData: MockItem[] = [
    { id: '1', name: 'Item One' },
    { id: '2', name: 'Item Two' }
  ]

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('SyncDB')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => {
        console.warn('Delete blocked')
        resolve() // still resolve to avoid test hanging
      }
    })
  })

  it('should save and retrieve offline updates', async () => {
    const { result } = renderHook(() => useSync<MockItem>(defaultItem))

    await act(async () => {
      await result.current.saveOfflineUpdate(sampleData)
    })

    await act(async () => {
      const updates = await result.current.getOfflineUpdates()
      expect(updates.length).toBe(2)
      expect(updates[0].name).toBe('Item One')
    })
  })

  it('should remove a specific offline item', async () => {
    const { result } = renderHook(() => useSync<MockItem>(defaultItem))

    await act(async () => {
      await result.current.saveOfflineUpdate(sampleData)
      await result.current.removeOfflineItem('1')
    })

    await act(async () => {
      const updates = await result.current.getOfflineUpdates()
      expect(updates.length).toBe(1)
      expect(updates[0].id).toBe('2')
    })
  })

  it('should clear all offline updates', async () => {
    const { result } = renderHook(() => useSync<MockItem>(defaultItem))

    await act(async () => {
      await result.current.saveOfflineUpdate(sampleData)
      await result.current.clearOfflineUpdates()
    })

    await act(async () => {
      const updates = await result.current.getOfflineUpdates()
      expect(updates.length).toBe(0)
    })
  })

  it('should call syncFunction and clear offline updates on success', async () => {
    const { result } = renderHook(() => useSync<MockItem>(defaultItem))

    const mockSyncFn = vi.fn().mockResolvedValue(undefined)

    await act(async () => {
      await result.current.saveOfflineUpdate(sampleData)
      await result.current.syncToServer(mockSyncFn)
    })

    expect(mockSyncFn).toHaveBeenCalledWith(sampleData)

    const db = await openDB('SyncDB', 3)
    const updates = await db.getAll('updates')
    expect(updates.length).toBe(0)
  })

  it('should NOT clear offline updates if sync fails', async () => {
    const { result } = renderHook(() => useSync<MockItem>(defaultItem))

    const mockSyncFn = vi.fn().mockRejectedValue(new Error('Sync failed'))

    await act(async () => {
      await result.current.saveOfflineUpdate(sampleData)
      await result.current.syncToServer(mockSyncFn)
    })

    const db = await openDB('SyncDB', 3)
    const updates = await db.getAll('updates')
    expect(updates.length).toBe(2)
  })
})
