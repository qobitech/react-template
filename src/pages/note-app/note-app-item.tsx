import { FC } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { INote } from '.'
import { TrashSVG } from '../../svg-icons'

interface ISavedNoteItem {
  note: INote
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined
  onDelete: () => void
}

const SavedNoteItem: FC<ISavedNoteItem> = ({ note, onClick, onDelete }) => {
  return (
    <SavedNoteItemWarpperClass>
      <SavedNoteItemClass onClick={onClick}>
        <h5 className="header">{note.title || note.text}</h5>

        <p className="time-stamp">
          {new Date(note.timeStamp).toDateString()}&nbsp;&nbsp;{' '}
          <span className="time">{moment(note.timeStamp).fromNow()}</span>
        </p>
      </SavedNoteItemClass>

      <CTAClass>
        <TrashSVG
          onClick={onDelete}
          aria-label="Delete note item"
          focusable="true"
        />
      </CTAClass>
    </SavedNoteItemWarpperClass>
  )
}

export default SavedNoteItem

const SavedNoteItemWarpperClass = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  border: 1px solid #eaeaea;
  border-radius: 5px;
  box-sizing: border-box;
`

const SavedNoteItemClass = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  .header {
    font-size: 14px;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    cursor: pointer;
  }
  .time-stamp {
    font-size: 10px;
    opacity: 0.8;
    margin: 0;
  }
  .time {
    opacity: 0.6;
  }
`

const CTAClass = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-top: 10px;
`
