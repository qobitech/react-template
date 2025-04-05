import { FC } from 'react'
import { CheckSVG, EditSVG } from '../svg-icons'
import styled from 'styled-components'

interface IEditSave {
  isEdit: boolean
  onSave?: () => void
}

const EditSave: FC<IEditSave> = ({ isEdit, onSave }) => {
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
        <EditSVG aria-label="Edit todo item" />
      )}
    </EditSaveWrapper>
  )
}

export default EditSave

const EditSaveWrapper = styled.div`
  .save {
    cursor: pointer;
  }
  .save path {
    fill: green;
    color: green;
  }
`
