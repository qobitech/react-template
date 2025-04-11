import styled from 'styled-components'
import SavedNoteItem from './note-app-item'
import { INote, ButtonComponent } from '.'
import { FC, useCallback } from 'react'
import { ExportSVG, ImportSVG, SearchSVG } from '../../svg-icons'

interface ISavedTodosProps {
  offlineData: INote[] | undefined
  removeOfflineItem: (id: string) => Promise<void>
  clearOfflineUpdates: () => Promise<void>
  setNote: React.Dispatch<React.SetStateAction<INote>>
  note: INote
}

const SavedTodos: FC<ISavedTodosProps> = ({
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
        <h2>Saved Todos</h2>

        <HeaderRightClass>
          <SearchSVG
            title="Search todo"
            aria-label="Search todo files"
            focusable="true"
          />

          <ImportSVG
            title="Import todo"
            aria-label="Import todo files"
            focusable="true"
          />

          <ExportSVG
            title="Export todo"
            aria-label="Export todo files"
            focusable="true"
          />

          {offlineData?.length ? (
            <ButtonComponent
              onClick={async () => {
                await handleClearAll()
              }}
            >
              Clear All
            </ButtonComponent>
          ) : null}
        </HeaderRightClass>
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

export default SavedTodos

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
  h2 {
    font-size: 21px;
    margin: 0;
  }
`

const HeaderRightClass = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 27px;
`
