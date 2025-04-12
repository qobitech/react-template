import React, { FC, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { ButtonComponent } from '.'
import { CheckSVG, ImportSVG } from '../../svg-icons'
import { IReport, useIO, useSync } from '../../hook'
import { ITodos } from '../../interface'

interface IImportTodoProps {
  onClose: () => void
}

const ImportTodo: FC<IImportTodoProps> = ({ onClose }) => {
  const useIOProps = useIO()
  const { saveOfflineUpdate, offlineData } = useSync<ITodos>()

  const [reports, setReports] = useState<IReport[] | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (todoFiles: File[]) => {
    if (todoFiles?.length) {
      const { todos, reports } = await useIOProps.importMultipleTodosFromFile(
        todoFiles
      )
      const modifiedNotes = [...todos, ...(offlineData || [])]
      await saveOfflineUpdate(modifiedNotes)

      setReports(reports || [])
    }
  }

  const handleOnChange = async ({
    target
  }: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = target
    const todoFiles = Array.from(files || [])
    await handleUpload(todoFiles)
  }

  const handleDrop = async (event: React.DragEvent<HTMLInputElement>) => {
    event.preventDefault()
    const todoFiles = Array.from(event.dataTransfer.files)
    await handleUpload(todoFiles)
  }

  const handleDragOver = (event: React.DragEvent<HTMLInputElement>) => {
    event.preventDefault()
  }

  const onReset = () => {
    setReports(null)
  }

  useEffect(() => {
    return () => {
      onReset()
    }
  }, [])

  return (
    <ImportWarpper>
      {!reports ? (
        <ImportUploadSection>
          <input
            type="file"
            onChange={handleOnChange}
            ref={inputRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            accept=".todolistx"
            multiple
          />

          <ImportSVG aria-label="import todos" />

          <p>Drag and drop the file</p>

          <p>OR</p>

          <ButtonComponent>Browse files</ButtonComponent>
        </ImportUploadSection>
      ) : (
        <ResponseSection>
          {reports.length ? (
            <ReportSection>
              {reports.map((report, index) => (
                <ReportSectionItem key={index}>
                  <p className="file-name">{report.filename}</p>
                  <p className="error">{report.error}</p>
                </ReportSectionItem>
              ))}
            </ReportSection>
          ) : (
            <SuccessSection>
              <CheckSVG aria-label="check icon" />
              <p>File(s) imported successfully</p>
            </SuccessSection>
          )}
        </ResponseSection>
      )}

      {reports ? (
        <CTASection>
          {reports.length ? (
            <ButtonComponent onClick={onReset}>Reset</ButtonComponent>
          ) : (
            <ButtonComponent onClick={onClose}>Close</ButtonComponent>
          )}
        </CTASection>
      ) : null}
    </ImportWarpper>
  )
}

export default ImportTodo

const ImportWarpper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 23px;
  padding: 20px;
  height: 54vh;
`
const ImportUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 17px;
  position: relative;
  p {
    font-size: 12px;
    margin: 0;
  }
  input {
    position: absolute;
    width: 100%;
    height: 100%;
    border: none;
    color: transparent;
    outline: none;
    top: 0;
    &:before {
      content: '';
    }
    &::file-selector-button {
      visibility: hidden;
    }
    &:-webkit-file-upload-button {
      visibility: hidden;
    }
    &:-moz-file-upload-button {
      visibility: hidden;
    }
    &:file-selector-button {
      visibility: hidden;
    }
  }
`
const ResponseSection = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 17px;
  p {
    font-size: 12px;
    margin: 0;
  }
`
const SuccessSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 7px;
  svg path {
    fill: green;
  }
`
const ReportSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 35vh;
  overflow: auto;
`
const ReportSectionItem = styled.div`
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
    &.file-name {
      width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &.error {
      color: red;
      margin-left: auto;
    }
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
