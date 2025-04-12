import { FC, useCallback } from 'react'
import TodoItem from './todo-item'
import { v4 as uuidv4 } from 'uuid'
import { ButtonComponent } from '.'
import styled from 'styled-components'
import { Droppable } from 'react-beautiful-dnd'
import { ITodo, ITodos } from '../../interface'

interface ITodoProps {
  setNote: (value: React.SetStateAction<ITodos>) => void
  note: ITodos
  handleSaveNote: <K extends keyof ITodos>(
    id: K,
    value: ITodos[K]
  ) => Promise<void>
}

const Todo: FC<ITodoProps> = ({ setNote, note, handleSaveNote }) => {
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
    <>
      <Droppable droppableId={note.id}>
        {(provided) => (
          <TodoListContainerClass
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <TodoListHeaderClass>
              <p>
                Todo Items &nbsp;&nbsp;<span>( {note.todo.length} )</span>
              </p>
            </TodoListHeaderClass>
            {note?.todo?.map((todo, index) => (
              <TodoItem
                todo={todo}
                onSaveTodo={onSaveTodo}
                deleteTodo={deleteTodo}
                key={todo.id}
                index={index}
              />
            ))}
            {provided.placeholder}
          </TodoListContainerClass>
        )}
      </Droppable>
      <UtilityContainerClass>
        <ButtonComponent
          onClick={onAddTodo}
          disabled={!note.title && !note.text}
        >
          Add Todo Item
        </ButtonComponent>
      </UtilityContainerClass>
    </>
  )
}

export default Todo

const TodoListContainerClass = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const UtilityContainerClass = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`

const TodoListHeaderClass = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  p {
    font-size: 13px;
    font-weight: bold;
  }
  span {
    font-weight: 400;
  }
`
