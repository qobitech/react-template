import { FC, useRef } from 'react'
import styled from 'styled-components'
import { CloseSVG } from '../svg-icons'

interface IUseModal {
  dialogRef: React.RefObject<HTMLDialogElement | null>
  openModal: () => void
  closeModal: () => void
}

export const useModal = (): IUseModal => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openModal = () => {
    dialogRef.current?.showModal()
  }

  const closeModal = () => {
    dialogRef.current?.close()
  }

  return {
    dialogRef,
    openModal,
    closeModal
  }
}

interface IModal {
  modalProps: IUseModal
  children?: any
  title: string
}

const Modal: FC<IModal> = ({ modalProps, children, title }) => {
  const { dialogRef, closeModal } = modalProps

  return (
    <ModalWrapper ref={dialogRef}>
      <HeaderSection>
        <p>{title}</p>
        <CloseSVG
          className="close"
          aria-label="close modal"
          focusable="true"
          onClick={closeModal}
        />
      </HeaderSection>
      <BodySection>{children}</BodySection>
    </ModalWrapper>
  )
}

export default Modal

const ModalWrapper = styled.dialog`
  margin: auto;
  max-width: 750px;
  width: 95%;
  background: #fff;
  height: 70vh;
  outline: none;
  border: none;
  border-radius: 5px;
  box-sizing: border-box;
  overflow: hidden;
`
const HeaderSection = styled.div`
  width: 100%;
  padding: 12px;
  border-bottom: 1px solid #eaeaea;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  .close {
    position: absolute;
    right: 45px;
  }
  p {
    margin: 0;
    font-weight: 500;
    font-size: 13px;
    opacity: 0.7;
  }
`

const BodySection = styled.div`
  width: 100%;
  padding: 12px;
  height: auto;
  overflow: auto;
  box-sizing: border-box;
`
