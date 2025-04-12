import { render, screen, fireEvent, renderHook } from '@testing-library/react'
import Modal, { useModal } from '../src/components/modal'
import React from 'react'

// Mock CloseSVG to preserve props
vi.mock('../src/svg-icons', () => ({
  CloseSVG: (props: any) => <svg data-testid="close-svg" {...props} />
}))

// Wrapper component to test Modal
const ModalTestWrapper = ({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) => {
  const modalProps = useModal()

  React.useEffect(() => {
    modalProps.openModal()
  }, [])

  return (
    <Modal modalProps={modalProps} title={title}>
      {children}
    </Modal>
  )
}

// Add at the top of modal.test.tsx (before any tests run)
beforeAll(() => {
  // Patch dialog element methods that JSDOM doesn't support
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

describe('useModal Hook', () => {
  it('should return dialogRef, openModal, and closeModal', () => {
    const { result } = renderHook(() => useModal())
    expect(result.current.dialogRef).toBeDefined()
    expect(typeof result.current.openModal).toBe('function')
    expect(typeof result.current.closeModal).toBe('function')
  })

  it('openModal should call showModal on dialogRef', () => {
    const mockShowModal = vi.fn()
    const { result } = renderHook(() => useModal())
    result.current.dialogRef.current = {
      showModal: mockShowModal
    } as unknown as HTMLDialogElement
    result.current.openModal()
    expect(mockShowModal).toHaveBeenCalledTimes(1)
  })

  it('closeModal should call close on dialogRef', () => {
    const mockClose = vi.fn()
    const { result } = renderHook(() => useModal())
    result.current.dialogRef.current = {
      close: mockClose
    } as unknown as HTMLDialogElement
    result.current.closeModal()
    expect(mockClose).toHaveBeenCalledTimes(1)
  })
})

describe('Modal Component', () => {
  const title = 'Test Modal Title'
  const children = <div data-testid="modal-content">Modal Content</div>

  it('renders with title and children', () => {
    render(<ModalTestWrapper title={title}>{children}</ModalTestWrapper>)
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByTestId('modal-content')).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    render(<ModalTestWrapper title={title}>{children}</ModalTestWrapper>)
    const dialog = screen.getByTestId('definition')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('calls closeModal when CloseSVG is clicked', () => {
    const mockClose = vi.fn()
    const modalProps = {
      dialogRef: { current: { showModal: vi.fn(), close: vi.fn() } } as any,
      openModal: vi.fn(),
      closeModal: mockClose
    }

    render(
      <Modal modalProps={modalProps} title={title}>
        {children}
      </Modal>
    )

    fireEvent.click(screen.getByLabelText('close modal'))
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('renders title with id="modal-title"', () => {
    render(<ModalTestWrapper title={title}>{children}</ModalTestWrapper>)
    const titleElement = screen.getByText(title)
    expect(titleElement).toHaveAttribute('id', 'modal-title')
  })

  it('renders children inside BodySection', () => {
    render(<ModalTestWrapper title={title}>{children}</ModalTestWrapper>)
    const dialog = screen.getByTestId('definition')
    expect(dialog).toContainElement(screen.getByTestId('modal-content'))
  })
})
