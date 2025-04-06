import { FC } from 'react'
import { CheckSVG, EditSVG, TrashSVG } from '../svg-icons'
import styled from 'styled-components'

interface IEditSaveDelete {
  isEdit: boolean
  onSave: () => void
  onDelete: () => void
}

const EditSaveDelete: FC<IEditSaveDelete> = ({ isEdit, onSave, onDelete }) => {
  return (
    <EditSaveWrapper>
      {isEdit ? (
        <CheckSVG
          className="save"
          onClick={onSave}
          aria-label="Save todo item"
          focusable="true"
        />
      ) : (
        <>
          <EditSVG aria-label="Edit todo item" />
          <TrashSVG
            aria-label="Delete todo item"
            focusable="true"
            onClick={onDelete}
          />
        </>
      )}
    </EditSaveWrapper>
  )
}

export default EditSaveDelete

const EditSaveWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 19px;
  .save {
    cursor: pointer;
  }
  .save path {
    fill: green;
    color: green;
  }
`
