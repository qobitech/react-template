import styled from 'styled-components'
import { ButtonComponent } from '../../components/button-component'
import SavedNoteItem from './note-app-item'
import { INote } from '.'
import { FC, useCallback } from 'react'

interface ISavedNotesProps {
  offlineData: INote[] | undefined
  removeOfflineItem: (id: string) => Promise<void>
  clearOfflineUpdates: () => Promise<void>
  setNote: React.Dispatch<React.SetStateAction<INote>>
  note: INote
}

const SavedNotes: FC<ISavedNotesProps> = ({
  offlineData,
  removeOfflineItem,
  clearOfflineUpdates,
  setNote,
  note
}) => {
  const handleClearAll = async () => {
    await clearOfflineUpdates() // Clear them after successful sync
  }

  const handleEditNote = useCallback(
    (note: INote) => {
      setNote(note)
    },
    [note]
  )

  return (
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
  )
}

export default SavedNotes

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

const SavedNoteGridClass = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
  gap: 19px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
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
