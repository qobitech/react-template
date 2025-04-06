import { useState, useEffect, useRef, useCallback } from 'react'
import { useNetworkStatus, useSync } from '../../hook'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import { ITodo } from './todo-item'
import { ButtonComponent } from '../../components/button-component'
import Todo from './todo'
import SavedNotes from './saved-notes'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'

export interface INote {
  id: string
  text: string
  title: string
  timeStamp: number
  todo: ITodo[]
}

const defaultNote: Omit<INote, 'id'> = {
  text: '',
  title: '',
  timeStamp: Date.now(),
  todo: []
}

const NotesApp = () => {
  const [note, setNote] = useState<INote>({ ...defaultNote, id: uuidv4() }) // Stores the current note being typed
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false) // Stores the list of saved notes

  const debounceTimeout = useRef<number | null>(null) // Reference to track debounce timing
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null) // Reference text area

  const isOnline = useNetworkStatus() // Custom hook to check internet status

  const {
    saveOfflineUpdate,
    getOfflineUpdates,
    clearOfflineUpdates,
    offlineData,
    removeOfflineItem
  } = useSync<INote>() // Custom hook to manage offline storage

  /**
   * Saves a note to the server.
   * If the request fails, the error is thrown so it can be handled properly.
   */
  const saveNote = async (note: INote) => {
    setSyncInProgress(true)
    try {
      await fetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(note),
        headers: { 'Content-Type': 'application/json' }
      })
        .then(() => {
          setSyncInProgress(false)
        })
        .catch(() => {
          setSyncInProgress(false)
        })
    } catch (error) {
      setSyncInProgress(false)
      console.error('Error saving note to server:', error)
      throw error // Allow the caller to handle the failure
    }
  }

  /**
   * Handles saving a note.
   * - If online, it tries to save the note to the server.
   * - If the request fails, or if offline, it saves the note locally.
   */
  const handleSaveNote = async <K extends keyof INote>(
    id: K,
    value: INote[K]
  ) => {
    if (!value) return // Prevent saving empty notes

    if (note.id) {
      const updatedNote = { ...note, [id]: value, timeStamp: Date.now() }

      const modifiedNotes = [
        updatedNote,
        ...(offlineData || []).filter((i) => i.id !== note.id)
      ]

      try {
        await saveOfflineUpdate(modifiedNotes)
        if (isOnline) await saveNote(updatedNote) // Try saving online
      } catch (error) {
        console.error('Failed to save note:', error)
        // Optionally add error handling or user notification
      }
    }
  }

  const handleNewNote = useCallback(() => {
    setNote({ ...defaultNote, id: uuidv4() })
    if (textAreaRef?.current) textAreaRef.current.autofocus = true
  }, [])

  /**
   * Handles user input with debouncing to prevent excessive API calls.
   * - Updates the note state immediately.
   * - Waits 500ms before attempting to save (only if online).
   */
  const handleDebouncedSaveNote = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setNote((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current) // Clear any existing timeout
    }

    debounceTimeout.current = window.setTimeout(async () => {
      await handleSaveNote(e.target.id as keyof INote, e.target.value) // Save after delay
    }, 500)
  }

  /**
   * When the app comes back online, this effect runs.
   * - It checks for any offline notes.
   * - If there are unsynced notes, it tries to save them in bulk.
   * - If the save is successful, it clears the offline storage.
   */
  useEffect(() => {
    if (isOnline) {
      ;(async () => {
        const offlineNotes = await getOfflineUpdates()
        if (offlineData && offlineData.length > 0) {
          try {
            await Promise.all(offlineNotes?.map(saveNote)) // Sync all offline notes
            // await clearOfflineUpdates() // Clear them after successful sync
          } catch {
            console.error('Failed to sync offline notes, keeping them stored')
          }
        }
      })()
    }
  }, [isOnline])

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    }
  }, [])

  function moveAndShift<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
    if (
      fromIndex < 0 ||
      fromIndex >= arr.length ||
      toIndex < 0 ||
      toIndex > arr.length
    ) {
      throw new Error('Index out of bounds')
    }

    const newArr = [...arr]
    const [item] = newArr.splice(fromIndex, 1) // Remove item from its original spot
    newArr.splice(toIndex, 0, item) // Insert it into the new spot

    return newArr
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return

    setNote((prev) => {
      const newTodos = moveAndShift(prev.todo, source.index, destination.index)
      const updatedNote = { ...prev, todo: newTodos }

      handleSaveNote('todo', updatedNote?.todo || [])
      return updatedNote
    })
  }

  return (
    <ContainerClass>
      <StatusClass>
        <p className={`status-sync ${isOnline ? 'online' : 'offline'}`}>
          Status: {isOnline ? 'Online' : 'Offline'}
        </p>

        <p className="status-sync">{syncInProgress ? 'Syncing...' : ''}</p>
      </StatusClass>

      <NoteClass>
        <HeaderClass>
          <h1>Note App</h1>

          <ButtonComponent
            onClick={() => {
              handleNewNote()
            }}
          >
            New Note +
          </ButtonComponent>
        </HeaderClass>

        <input
          value={note.title}
          placeholder="Title"
          className="text-input"
          onChange={handleDebouncedSaveNote}
          id="title"
        />

        <textarea
          value={note.text}
          onChange={handleDebouncedSaveNote}
          placeholder="Write a note..."
          className="text-area"
          ref={textAreaRef}
          id="text"
          autoFocus
        />

        <DragDropContext onDragEnd={onDragEnd}>
          <Todo setNote={setNote} note={note} handleSaveNote={handleSaveNote} />
        </DragDropContext>

        <button
          onClick={async () => {
            await handleSaveNote('text', note.text)
          }}
          className="btn"
        >
          Save Note
        </button>
      </NoteClass>

      <SavedNotes
        offlineData={offlineData}
        removeOfflineItem={removeOfflineItem}
        clearOfflineUpdates={clearOfflineUpdates}
        setNote={setNote}
        note={note}
      />
    </ContainerClass>
  )
}

export default NotesApp

const ContainerClass = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 700px;
  width: 95%;
  gap: 30px;
  padding: 30px 0;
`
const NoteClass = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 100%;
  gap: 30px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid #eaeaea;
  border-radius: 5px;
  .text-area {
    padding: 7px;
    outline: none;
    min-height: 70px;
    font-size: 16px;
  }
  .text-input {
    padding: 7px;
    outline: none;
    font-size: 16px;
  }

  .btn {
    outline: none;
    border: none;
    padding: 10px 5px;
    border-radius: 5px;
  }
`
const HeaderClass = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const StatusClass = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  .status-sync {
    font-size: 11px;
    &.online {
      color: green;
    }
    &.offline {
      color: red;
    }
  }
`
