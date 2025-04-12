import { FC } from 'react'
import styled from 'styled-components'

interface IInputText {
  isEdit: boolean
  subject: string
  handleOnChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void
}

const InputText: FC<IInputText> = ({ isEdit, subject, handleOnChange }) => {
  return (
    <>
      {isEdit ? (
        <TodoInput
          autoFocus
          placeholder="Todo subject"
          onChange={handleOnChange}
          value={subject}
          id="subject"
        />
      ) : (
        <TodoText className="subject" data-testid="subject-text">
          {subject}
        </TodoText>
      )}
    </>
  )
}

export default InputText

const TodoInput = styled.input`
  width: 70%;
  height: 25px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  @media (max-width: 1200px) {
    font-size: 16px;
  }
`

const TodoText = styled.p`
  font-size: 11px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  max-width: 350px;
  @media (max-width: 1200px) {
    font-size: 16px;
    max-width: 150px;
  }
`
