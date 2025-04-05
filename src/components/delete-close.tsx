import { FC } from 'react'
import { CloseSVG, TrashSVG } from '../svg-icons'

interface IDeleteClose {
  isEdit: boolean
  onDelete: () => void
  onClose: () => void
}

const DeleteClose: FC<IDeleteClose> = ({ isEdit, onClose, onDelete }) => {
  return (
    <>
      {!isEdit ? (
        <TrashSVG
          onClick={onDelete}
          aria-label="Delete todo item"
          focusable="true"
        />
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

export default DeleteClose
