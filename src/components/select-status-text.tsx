import { FC } from 'react'
import styled from 'styled-components'
import { todoStatusType } from '../interface'

interface ISelectStatusText {
  isEdit: boolean
  status: todoStatusType
  handleOnChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void
}

const SelectStatusText: FC<ISelectStatusText> = ({
  isEdit,
  status,
  handleOnChange
}) => {
  return (
    <>
      {isEdit ? (
        <TodoStatusController
          value={status}
          onChange={handleOnChange}
          id="status"
        >
          <option value="">Select status</option>
          <option value="completed">completed</option>
          <option value="not-started">not-started</option>
          <option value="in-progress">in-progress</option>
          <option value="blocked">blocked</option>
        </TodoStatusController>
      ) : (
        <TodoStatus $status={status}>{status}</TodoStatus>
      )}
    </>
  )
}

export default SelectStatusText

const TodoStatusController = styled.select`
  height: 25px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 11px;
`

const TodoStatus = styled.div<{ $status: todoStatusType }>`
  font-size: 10px;
  margin: 0;
  ${({ $status }) => {
    const obj: Record<todoStatusType, string> = {
      blocked: 'red',
      completed: 'green',
      'not-started': 'gray',
      'in-progress': 'orange'
    }
    const color = obj[$status]
    return `color: ${color};`
  }}
`
