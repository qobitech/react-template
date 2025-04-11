import { useEffect, useState } from 'react'
import { IDBPDatabase, openDB } from 'idb'
import { INote } from './pages/note-app'
import {
  compressWithPako,
  createBinaryHeader,
  createSHA256,
  decodeData,
  decompressWithPako,
  encodeData,
  generateUserFingerprint,
  generateUUID,
  generateVisualHash,
  readFileAsArrayBuffer
} from './helper'
import { TodoExportFormat } from './utils'

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

export const useIO = () => {
  async function exportData(todos: INote[]): Promise<Blob> {
    // Create the export data object
    const exportData: TodoExportFormat = {
      formatSignature: 'MYTODO_FORMAT_V1',
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        appIdentifier: 'MyPersonalTodoApp',
        appVersion: '1.2.3',
        exportId: generateUUID(), // Unique identifier for this export
        userFingerprint: await generateUserFingerprint() // Optional: device signature
      },
      todos,
      // Visual signature for displaying to user
      visualSignature: generateVisualHash(todos)
    }

    // JSON stringify the data
    const jsonString = JSON.stringify(exportData)

    // Create checksum of the JSON data
    const checksum = await createSHA256(jsonString)

    // Add checksum to the export data and stringify again
    exportData.metadata.contentChecksum = checksum
    const finalJsonString = JSON.stringify(exportData)

    // Compress the data (optional)
    const compressedData = compressWithPako(finalJsonString)

    // Encode the compressed data
    const encodedData = encodeData(compressedData)

    // Create binary header
    const headerBuffer = createBinaryHeader()
    const headerView = new DataView(headerBuffer)

    // Update content length in header
    headerView.setUint32(8, encodedData.length, true)

    // Update header checksum
    const headerChecksum = await createSHA256(
      new Uint8Array(headerBuffer.slice(0, 24))
    )

    for (let i = 0; i < 8; i++) {
      headerView.setUint8(
        24 + i,
        parseInt(headerChecksum.substring(i * 2, i * 2 + 2), 16)
      )
    }

    // Combine header and data
    const finalBuffer = new Uint8Array(
      headerBuffer.byteLength + encodedData.byteLength
    )
    finalBuffer.set(new Uint8Array(headerBuffer), 0)
    finalBuffer.set(encodedData, headerBuffer.byteLength)

    // Create a Blob with custom MIME type
    return new Blob([finalBuffer], { type: 'application/x-mytodo' })
  }

  async function exportTodosToFile(data: INote[]): Promise<void> {
    const blob = await exportData(data)
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `myTodos_${Date.now()}.todolistx` // custom extension
    link.click()

    URL.revokeObjectURL(url)
  }

  async function importTodos(file: File): Promise<TodoExportFormat> {
    try {
      // Read file as ArrayBuffer
      const fileBuffer = await readFileAsArrayBuffer(file)

      // Check minimum file size for header
      if (fileBuffer.byteLength < 32) {
        throw new Error('Invalid file: too small to be a valid todo file')
      }

      // Extract and validate header
      const headerView = new DataView(fileBuffer.slice(0, 32))

      // Check magic number ("TDOX")
      if (
        !(
          headerView.getUint8(0) === 0x54 &&
          headerView.getUint8(1) === 0x44 &&
          headerView.getUint8(2) === 0x4f &&
          headerView.getUint8(3) === 0x58
        )
      ) {
        throw new Error('Invalid file format: not a todo file')
      }

      // Check version compatibility
      const version = headerView.getUint16(4, true)
      if (version > 1) {
        throw new Error(`Unsupported file version: ${version}`)
      }

      // Verify header checksum
      const headerChecksum = await createSHA256(
        new Uint8Array(fileBuffer.slice(0, 24))
      )
      let checksumMatch = true
      for (let i = 0; i < 8; i++) {
        if (
          headerView.getUint8(24 + i) !==
          parseInt(headerChecksum.substring(i * 2, i * 2 + 2), 16)
        ) {
          checksumMatch = false
          break
        }
      }
      if (!checksumMatch) {
        throw new Error('Header checksum verification failed')
      }

      // Get content length
      const contentLength = headerView.getUint32(8, true)

      // Extract the data part
      const encodedData = new Uint8Array(
        fileBuffer.slice(32, 32 + contentLength)
      )

      // Decode the data
      const decodedData = decodeData(encodedData)

      // Decompress the data
      const decompressedData = decompressWithPako(decodedData)

      // Parse JSON
      const importData = JSON.parse(decompressedData) as TodoExportFormat

      // Verify content checksum
      const contentWithoutChecksum = { ...importData }
      const storedChecksum = contentWithoutChecksum.metadata.contentChecksum
      delete contentWithoutChecksum.metadata.contentChecksum

      const calculatedChecksum = await createSHA256(
        JSON.stringify(contentWithoutChecksum)
      )
      if (calculatedChecksum !== storedChecksum) {
        throw new Error('Content integrity check failed')
      }

      return importData
    } catch (error) {
      console.error('Import failed:', error)
      throw error
    }
  }

  async function importTodosFromFile(file: File): Promise<INote[]> {
    const importFile = await importTodos(file)
    return importFile.todos
  }

  return {
    exportTodosToFile,
    importTodosFromFile
  }
}
