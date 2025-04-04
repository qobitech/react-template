import { FC, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { CheckSVG, CloseSVG, EditSVG, TrashSVG } from './svg'

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
}

const TodoItem: FC<ITodoItem> = ({ todo, onSaveTodo, deleteTodo }) => {
  const debounceTimeout = useRef<number | null>(null) // Reference to track debounce timing
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [onEdit, setOnEdit] = useState<boolean>(!todo.subject)
  const [formData, setFormData] = useState<ITodo>(todo)

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) {
        setOnEdit(true) // Clicked inside
      } else {
        setOnEdit(!formData.subject) // Clicked outside
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

  const onSave = () => {
    // check if any note item is empty saving
    if (!formData.subject) {
      alert('You can’t save an empty note.')
    } else {
      onSaveTodo(formData)
      setOnEdit(false)
    }
  }

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const fd = { ...formData, [e.target.id]: e.target.value }

    setFormData(fd)

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current) // Clear any existing timeout
    }

    debounceTimeout.current = window.setTimeout(async () => {
      await onSaveTodo(fd) // Save after delay
    }, 500)
  }

  return (
    <TodoItemWrapperClass>
      {!onEdit ? (
        <TrashSVG onClick={async () => await deleteTodo(formData.id)} />
      ) : (
        <CloseSVG
          className="close"
          onClick={async () => {
            if (!formData.subject) {
              await deleteTodo(formData.id)
            } else {
              setOnEdit(false)
            }
          }}
        />
      )}

      <TodoItemClass ref={wrapperRef}>
        {onEdit ? (
          <TodoInput
            autoFocus
            placeholder="Todo subject"
            onChange={handleOnChange}
            value={formData.subject}
            id="subject"
          />
        ) : (
          <p className="subject">{todo.subject}</p>
        )}

        <div className="others">
          {onEdit ? (
            <TodoStatusController
              value={formData.status}
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
            <TodoStatus $status={todo.status}>{todo.status}</TodoStatus>
          )}

          {onEdit ? (
            <CheckSVG className="save" onClick={onSave} />
          ) : (
            <EditSVG />
          )}
        </div>
      </TodoItemClass>
    </TodoItemWrapperClass>
  )
}

export default TodoItem

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

const TodoItemClass = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  box-sizing: border-box;
  width: 100%;
  .others {
    margin-left: auto;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 25px;
  }
  .subject {
    font-size: 11px;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 50%;
  }
  .time-stamp {
    font-size: 10px;
    opacity: 0.8;
    margin: 0;
  }
  .time {
    opacity: 0.6;
  }
  .save {
    cursor: pointer;
  }
  .save path {
    fill: green;
    color: green;
  }
`

const TodoInput = styled.input`
  width: 50%;
  height: 25px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
`

const TodoStatusController = styled.select`
  height: 25px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 11px;
`
