import { useEffect, useState } from 'react'
import { IDBPDatabase, openDB } from 'idb'
import { sanitizeFileName } from './helper'
import JSZip from 'jszip'
import { ITodos } from './interface'
import { convertFileToTodo, exportTodos } from './utils'

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

export interface IUseSync<T = undefined> {
  saveOfflineUpdate: (update: T[]) => Promise<void>
  clearOfflineUpdates: () => Promise<void>
  getOfflineUpdates: () => Promise<T[]>
  offlineData: T[] | undefined
  syncToServer: (syncFunction: (updates: T[]) => Promise<void>) => Promise<void>
  removeOfflineItem: (id: string) => Promise<void>
  setNote: React.Dispatch<React.SetStateAction<T>>
  note: T
}

export const useSync = <T extends { id: string } = any>(
  defaultNote: T
): IUseSync<T> => {
  const [note, setNote] = useState<T>(defaultNote) // Stores the current note being typed
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
    setNote(defaultNote)
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
    removeOfflineItem,
    setNote,
    note
  }
}

export interface IReport {
  filename: string
  error: string
}

interface IUserIO {
  exportTodoToFile: (data: ITodos) => Promise<void>
  importTodoFromFile: (file: File) => Promise<{
    todo: ITodos | null
    report: IReport | null
  }>
  exportMultipleTodosAsZip: (todoLists: ITodos[]) => Promise<void>
  importMultipleTodosFromFile: (files: File[]) => Promise<{
    todos: ITodos[]
    reports: IReport[]
  }>
}

export const useIO = (): IUserIO => {
  async function exportTodoToFile(data: ITodos): Promise<void> {
    const blob = await exportTodos(data)
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${sanitizeFileName(data.title)}_${Date.now()}.todolistx` // custom extension
    link.click()

    URL.revokeObjectURL(url)
  }

  async function exportMultipleTodosAsZip(todoLists: ITodos[]): Promise<void> {
    // Create a new zip file
    const zip = new JSZip()

    // Process each todo list
    for (const todoList of todoLists) {
      try {
        // Get blob for this todo list
        const blob = await exportTodos(todoList)

        // Convert blob to ArrayBuffer for adding to zip
        const arrayBuffer = await blob.arrayBuffer()

        // Add to zip with sanitized filename
        const safeFileName = sanitizeFileName(todoList.title)
        zip.file(`${safeFileName}_${Date.now()}.todolistx`, arrayBuffer)
      } catch (error) {
        console.error(`Failed to process todo list "${todoList.title}":`, error)
        // Optionally, you could throw an error here to abort the whole operation
      }
    }

    // Add a manifest file with information about the export
    const manifest = {
      exportDate: new Date().toISOString(),
      appVersion: '1.2.3',
      todoLists: todoLists.map((list) => ({
        name: list.title,
        itemCount: todoLists.length
      }))
    }

    zip.file('manifest.json', JSON.stringify(manifest, null, 2))

    // Generate the zip file as a blob
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6 // Balanced between size and speed
      }
    })

    // Create and trigger download
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `myTodoLists_${Date.now()}.zip`
    document.body.appendChild(link) // Some browsers need the element in the DOM
    link.click()
    document.body.removeChild(link) // Clean up
    URL.revokeObjectURL(url)
  }

  async function importTodoFromFile(
    file: File
  ): Promise<{ todo: ITodos | null; report: IReport | null }> {
    try {
      const todoFile = await convertFileToTodo(file)
      return {
        todo: todoFile.todo,
        report: null
      }
    } catch (error) {
      console.error(`Failed to import ${file.name}`, error)
      return {
        todo: null,
        report: {
          filename: file.name,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  async function importMultipleTodosFromFile(files: File[]): Promise<{
    todos: ITodos[]
    reports: IReport[]
  }> {
    const todos: ITodos[] = []
    const reports: IReport[] = []
    for (const file of files) {
      try {
        const importFile = await convertFileToTodo(file)
        if (importFile?.todo) todos.push(importFile.todo)
      } catch (error) {
        console.error(`Failed to import ${file.name}`, error)
        reports.push({
          filename: file.name,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    return { todos, reports }
  }

  return {
    exportTodoToFile,
    importTodoFromFile,
    exportMultipleTodosAsZip,
    importMultipleTodosFromFile
  }
}
