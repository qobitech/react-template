import { useEffect, useState } from 'react'
import { IDBPDatabase, openDB } from 'idb'

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
  saveOfflineUpdate: (update: T[]) => Promise<void>
  clearOfflineUpdates: () => Promise<void>
  getOfflineUpdates: () => Promise<T[]>
  offlineData: T[] | undefined
  syncToServer: (syncFunction: (updates: T[]) => Promise<void>) => Promise<void>
  removeOfflineItem: (id: string) => Promise<void>
}

export const useSync = <T extends { id: string } = any>(): IUseSync<T> => {
  const [offlineData, setOfflineData] = useState<T[]>([])

  const version = 3

  const saveOfflineUpdate = async (updates: T[]) => {
    let db: IDBPDatabase<unknown> | null = null
    try {
      db = await openDB('SyncDB', version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('updates')) {
            db.createObjectStore('updates', {
              keyPath: 'id'
            })
          }
        }
      })

      if (!db) {
        throw new Error('Failed to open database')
      }

      const tx = db.transaction('updates', 'readwrite')
      const store = tx.objectStore('updates')

      // Collect put promises and use Promise.all for efficiency
      const putPromises = updates.map(async (update) => await store.put(update))
      await Promise.all(putPromises)

      await tx.done

      const allUpdates = await db.getAll('updates')
      setOfflineData(allUpdates)
    } catch (error) {
      console.error('Failed to save offline update:', error)
    } finally {
      if (db) {
        db.close()
      }
    }
  }

  const getOfflineUpdates = async (): Promise<T[]> => {
    try {
      const db = await openDB('SyncDB', version, {
        upgrade(db) {
          // Ensure the 'updates' object store is created if it doesn't exist
          if (!db.objectStoreNames.contains('updates')) {
            db.createObjectStore('updates', {
              keyPath: 'id',
              autoIncrement: false
            })
            console.log('Updates object store created during initialization')
          }
        }
      })

      // Retrieve all updates
      const data = await db.getAll('updates')

      // Close the database connection
      db.close()

      // Set the offline data state
      setOfflineData(data)

      return data
    } catch (error) {
      console.error('Error retrieving offline updates:', error)

      // Clear offline data state in case of error
      setOfflineData([])

      return []
    }
  }

  const clearOfflineUpdates = async () => {
    const db = await openDB('SyncDB', version)
    await db.clear('updates')
    setOfflineData([])
  }

  const removeOfflineItem = async (id: string) => {
    const db = await openDB('SyncDB', version)
    await db.delete('updates', id)
    // Optionally, update the local state by filtering out the removed item
    setOfflineData((prevData) => prevData.filter((item) => item.id !== id))
  }

  const syncToServer = async (
    syncFunction: (updates: T[]) => Promise<void>
  ) => {
    const updates = await getOfflineUpdates()
    if (updates.length === 0) return

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
    clearOfflineUpdates,
    getOfflineUpdates,
    offlineData,
    syncToServer,
    removeOfflineItem
  }
}
