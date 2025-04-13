import { FC, useMemo, useState } from 'react'
import { ButtonCancelComponent, ButtonComponent } from '.'
import styled from 'styled-components'
import { ExportSVG, SearchSVG } from '../../svg-icons'
import { useIO } from '../../hook'
import { ITodos } from '../../interface'

interface IExportTodo {
  todos: ITodos[] | undefined
  onCancel: () => void
}

const ExportTodo: FC<IExportTodo> = ({ todos, onCancel }) => {
  const useIOProps = useIO()

  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedFiles, setSelectedFiles] = useState<ITodos[]>([])

  const filteredTodos: ITodos[] = useMemo(() => {
    return (
      todos?.filter(
        (todo) =>
          !searchValue ||
          todo.title.toLowerCase().includes(searchValue.toLowerCase())
      ) || []
    )
  }, [searchValue, todos])

  const handleSelectAll = () => {
    setSelectedFiles((prev) =>
      prev.length === filteredTodos.length ? [] : filteredTodos
    )
  }

  const handleSelectItem = (todo: ITodos) => {
    setSelectedFiles((prev) => {
      const index = prev.findIndex((n) => n.id === todo.id)
      if (index === -1) {
        return [...prev, todo]
      }
      return prev.filter((i) => i.id !== todo.id)
    })
  }

  const isSelectAll = filteredTodos.length === selectedFiles.length

  const handleMultipleExport = async () => {
    await useIOProps.exportMultipleTodosAsZip(selectedFiles)
  }

  return (
    <ExportTodoWrapper>
      {!todos?.length ? (
        <EmptyTodoWrapper>
          <p>No todos to export</p>
        </EmptyTodoWrapper>
      ) : (
        <ExportTodosSection>
          <HeaderSection>
            <p>
              Select file(s) to export &nbsp;
              <span>(&nbsp;.todolistx&nbsp;)</span>
            </p>
          </HeaderSection>

          <ControllerSectionItem>
            <SearchSection>
              <SearchSVG aria-label="search todos" />

              <input
                placeholder="Search todos"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                type="search"
              />
            </SearchSection>
          </ControllerSectionItem>

          <SelectSection>
            <SelectSectionItem>
              <SelectCheckBox
                type="checkbox"
                onChange={handleSelectAll}
                checked={isSelectAll}
              />

              <p className="select-all">Select All</p>
            </SelectSectionItem>

            {filteredTodos.map((todo) => (
              <SelectSectionItem key={todo.id}>
                <SelectCheckBox
                  type="checkbox"
                  checked={
                    isSelectAll || selectedFiles.some((n) => n.id === todo.id)
                  }
                  onChange={() => {
                    handleSelectItem(todo)
                  }}
                />

                <p>{todo.title}</p>

                <ExportSVG
                  className="export"
                  aria-label="export todo item"
                  focusable="true"
                  onClick={async () => {
                    await useIOProps.exportTodoToFile(todo)
                  }}
                />
              </SelectSectionItem>
            ))}
          </SelectSection>

          <CTASection>
            <ButtonComponent
              disabled={selectedFiles.length < 2}
              onClick={handleMultipleExport}
            >
              <ExportSVG />
              Export&nbsp;
              {selectedFiles.length > 1
                ? `(${selectedFiles.length}) file${
                    selectedFiles.length === 1 ? '' : 's'
                  }`
                : ''}
            </ButtonComponent>

            <ButtonCancelComponent onClick={onCancel}>
              Close
            </ButtonCancelComponent>
          </CTASection>
        </ExportTodosSection>
      )}
    </ExportTodoWrapper>
  )
}

export default ExportTodo

const ExportTodoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 23px;
  padding: 20px;
  height: 54vh;
`
const EmptyTodoWrapper = styled.div`
  text-align: center;
  margin-top: 35px;
  p {
    font-size: 12px;
    margin: 0;
    opacity: 0.6;
  }
`
const ExportTodosSection = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`
const SelectSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 35vh;
  overflow: auto;
  border-bottom: 0.1px solid #eaeaea;
`
const ControllerSectionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
  border-bottom: 1px solid #efefef;
  padding: 10px 7px;
`
const SearchSection = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 9px;
  input {
    border: none;
    outline: none;
    font-size: 12px;
    background: none;
    @media (max-width: 1200px) {
      font-size: 16px;
    }
  }
  svg {
    width: 13px;
  }
`
const SelectSectionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 10px 7px;
  border-bottom: 0.5px solid #efefef;
  &:hover {
    background: #fafafa;
    transition: 0.3s ease-in-out;
  }
  p {
    font-size: 12px;
  }
  .select-all {
    color: rgb(111, 111, 111);
  }
  .export {
    margin-left: auto;
  }
`
const SelectCheckBox = styled.input`
  width: 10px;
  height: 10px;
  border: 1px solidrgb(242, 242, 242);
  border-radius: 2px;
  outline: none;
  background: transparent;
  font-size: 12px;
`
const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 22px;
  p {
    margin: 0;
  }
  span {
    color: grey;
    font-size: 12px;
  }
`
const CTASection = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 17px;
  button {
    cursor: default;
  }
`
