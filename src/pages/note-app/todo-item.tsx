import { FC, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import DragClose from '../../components/drag-close'
import InputText from '../../components/input-text'
import SelectStatusText from '../../components/select-status-text'
import EditSaveDelete from '../../components/edit-save-delete'
import { Draggable } from 'react-beautiful-dnd'

export type todoStatusType =
  | 'completed'
  | 'not-started'
  | 'in-progress'
  | 'blocked'

export interface ITodo {
  id: string
  subject: string
  status: todoStatusType
}

export interface ITodoItem {
  todo: ITodo
  onSaveTodo: (todo: ITodo) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  index: number
}

const TodoItem: FC<ITodoItem> = ({ todo, onSaveTodo, deleteTodo, index }) => {
  const debounceTimeout = useRef<number | null>(null) // Reference to track debounce timing
  const wrapperRef = useRef<HTMLFormElement>(null)

  const [isEdit, setIsEdit] = useState<boolean>(!todo.subject)
  const [formData, setFormData] = useState<ITodo>(todo)

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) {
        setIsEdit(true) // Clicked inside
      } else {
        setIsEdit(!formData.subject) // Clicked outside
      }
    },
    [formData]
  )

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [handleClick])

  const onSave = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    // check if note item subject is empty
    if (!formData.subject) {
      alert('You can’t save an empty note.')
    } else {
      onSaveTodo(formData)
      setIsEdit(false)
    }
  }

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const fd = { ...formData, [e.target.id]: e.target.value }

      setFormData(fd)

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current) // Clear any existing timeout
      }

      debounceTimeout.current = window.setTimeout(async () => {
        await onSaveTodo(fd) // Save after delay
      }, 500)
    },
    [formData]
  )

  const onExitNote = async () => {
    if (!formData.subject) {
      await deleteTodo(formData.id)
    } else {
      setIsEdit(false)
    }
  }

  return (
    <Draggable draggableId={formData.id} index={index}>
      {(provided) => (
        <TodoItemWrapperClass
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <DragClose
            isEdit={isEdit}
            dragHandleProps={provided.dragHandleProps}
            onClose={async () => await onExitNote()}
          />

          <TodoItemClass ref={wrapperRef} onSubmit={onSave}>
            <InputText
              isEdit={isEdit}
              handleOnChange={handleOnChange}
              subject={formData.subject}
            />

            <TodoItemController>
              <SelectStatusText
                isEdit={isEdit}
                handleOnChange={handleOnChange}
                status={formData.status}
              />

              <EditSaveDelete
                isEdit={isEdit}
                onSave={onSave}
                onDelete={async () => await deleteTodo(formData.id)}
              />
            </TodoItemController>
          </TodoItemClass>
        </TodoItemWrapperClass>
      )}
    </Draggable>
  )
}

export default TodoItem

const TodoItemWrapperClass = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  padding: 0.3rem 0;
  border-bottom: 1px solid #eaeaea;
  flex-shrink: 0;
  width: 100%;
`

const TodoItemClass = styled.form`
  display: flex;
  align-items: center;
  gap: 15px;
  box-sizing: border-box;
  width: 100%;
`

const TodoItemController = styled.div`
  margin-left: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 25px;
`
