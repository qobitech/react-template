import { useEffect, useState } from 'react'
import { openDB } from 'idb'

export const useNetworkStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

interface IUseSync<T = undefined> {
  saveOfflineUpdate: (update: T) => Promise<void>
  getOfflineUpdates: () => Promise<T>
  clearOfflineUpdates: () => Promise<void>
  offlineData: T | undefined
  syncToServer: (syncFunction: (updates: T) => Promise<void>) => Promise<void>
}

export const useSync = <T>(): IUseSync<T> => {
  const [offlineData, setOfflineData] = useState<T>()

  const saveOfflineUpdate = async (update: T) => {
    const db = await openDB('SyncDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('updates')) {
          db.createObjectStore('updates', {
            keyPath: 'id',
            autoIncrement: true
          })
        }
      }
    })

    await db.put('updates', update)
    setOfflineData(update)
  }

  const getOfflineUpdates = async (): Promise<T> => {
    const db = await openDB('SyncDB', 1)
    return (await db.getAll('updates')) as T
  }

  const clearOfflineUpdates = async () => {
    const db = await openDB('SyncDB', 1)
    await db.clear('updates')
  }

  const syncToServer = async (syncFunction: (updates: T) => Promise<void>) => {
    const updates = await getOfflineUpdates()
    if (Array.isArray(updates) && updates.length === 0) return

    try {
      await syncFunction(updates)
      await clearOfflineUpdates() // Only clear if successful
      console.log('Sync successful!')
    } catch (error) {
      console.error('Sync failed, will retry later', error)
    }
  }

  return {
    saveOfflineUpdate,
    getOfflineUpdates,
    clearOfflineUpdates,
    offlineData,
    syncToServer
  }
}
