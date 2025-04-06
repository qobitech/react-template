import { FC } from 'react'
import { CloseSVG, DraggableSVG } from '../svg-icons'
import styled from 'styled-components'
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd'

interface IDragClose {
  isEdit: boolean
  onClose: () => void
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined
}

const DragClose: FC<IDragClose> = ({ isEdit, onClose, dragHandleProps }) => {
  return (
    <>
      {!isEdit ? (
        <DragWrapperClass {...dragHandleProps} aria-label="Re-order todo item">
          <DraggableSVG aria-label="Draggable icon" />
        </DragWrapperClass>
      ) : (
        <CloseSVG
          className="close"
          onClick={onClose}
          aria-label="Exit todo item"
          focusable="true"
        />
      )}
    </>
  )
}

export default DragClose

const DragWrapperClass = styled.div`
  width: max-content;
  height: max-content;
`
