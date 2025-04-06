import { useState, useEffect, useRef, useCallback } from 'react'
import { useNetworkStatus, useSync } from '../../hook'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import SavedNoteItem from './note-app-item'
import TodoItem, { ITodo } from './todo-item'

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

  const handleEditNote = useCallback((note: INote) => {
    setNote(note)
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

  const handleClearAll = async () => {
    await clearOfflineUpdates() // Clear them after successful sync
  }

  const onAddTodo = () => {
    setNote((prev) => ({
      ...prev,
      todo: [
        ...(prev?.todo || []),
        { id: uuidv4(), subject: '', status: 'not-started' }
      ]
    }))
  }

  const onSaveTodo = useCallback(
    async (todoItem: ITodo) => {
      setNote((prevNote) => {
        const modifiedTodo =
          prevNote?.todo?.map((i) => (i.id === todoItem.id ? todoItem : i)) ||
          []
        const updatedNote = { ...prevNote, todo: modifiedTodo }

        handleSaveNote('todo', updatedNote?.todo || [])

        return updatedNote
      })
    },
    [note]
  )

  const deleteTodo = useCallback(
    async (id: string) => {
      setNote((prevNote) => {
        const updatedNote = {
          ...prevNote,
          todo: prevNote?.todo?.filter((i) => i.id !== id) || []
        }

        handleSaveNote('todo', updatedNote?.todo || [])

        return updatedNote
      })
    },
    [note]
  )

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

        <TodoListContainerClass>
          {note?.todo?.map((todo) => (
            <TodoItem
              todo={todo}
              onSaveTodo={onSaveTodo}
              deleteTodo={deleteTodo}
              key={todo.id}
            />
          ))}
        </TodoListContainerClass>

        <UtilityContainerClass>
          <ButtonComponent
            onClick={onAddTodo}
            disabled={!note.title && !note.text}
          >
            Add Todo list
          </ButtonComponent>
        </UtilityContainerClass>

        <button
          onClick={async () => {
            await handleSaveNote('text', note.text)
          }}
          className="btn"
        >
          Save Note
        </button>
      </NoteClass>

      <SavedNoteClass>
        <SavedNoteHeaderClass>
          <h2>Saved Notes</h2>

          {offlineData?.length ? (
            <ButtonComponent
              onClick={async () => {
                await handleClearAll()
              }}
            >
              Clear All
            </ButtonComponent>
          ) : null}
        </SavedNoteHeaderClass>

        {!offlineData?.length ? (
          <p className="no-notes">No notes saved</p>
        ) : (
          <SavedNoteGridClass>
            {offlineData
              .sort((a, b) => b.timeStamp - a.timeStamp)
              ?.map((n) => (
                <SavedNoteItem
                  key={n.id}
                  note={n}
                  onClick={() => {
                    handleEditNote(n)
                  }}
                  onDelete={async () => {
                    await removeOfflineItem(n.id)
                  }}
                />
              ))}
          </SavedNoteGridClass>
        )}
      </SavedNoteClass>
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
const SavedNoteClass = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 100%;
  gap: 30px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid #eaeaea;
  border-radius: 5px;
  .no-notes {
    font-size: 11px;
    opacity: 0.7;
  }
`

const SavedNoteHeaderClass = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  h2 {
    font-size: 21px;
    margin: 0;
  }
`

const HeaderClass = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const SavedNoteGridClass = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
  gap: 19px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
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
const UtilityContainerClass = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`

const TodoListContainerClass = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ButtonComponent = styled.button`
  outline: none;
  border: 1px solid #eaeaea;
  cursor: pointer;
  border-radius: 5px;
  font-size: 12px;
  padding: 2px 5px;
`
