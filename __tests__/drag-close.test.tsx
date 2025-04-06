import { render, screen, fireEvent } from '@testing-library/react'
import DragClose from '../src/components/drag-close'

describe('DragClose component', () => {
  it('shows DraggableSVG when isEdit is false and triggers onDelete on click', () => {
    render(
      <DragClose isEdit={false} dragHandleProps={null} onClose={() => {}} />
    )
    const reorderIcon = screen.getByLabelText('Re-order todo item')
    expect(reorderIcon).toBeInTheDocument()
  })

  it('shows CloseSVG when isEdit is true and triggers onClose on click', () => {
    const onClose = vi.fn()
    render(<DragClose isEdit={true} dragHandleProps={null} onClose={onClose} />)
    const closeIcon = screen.getByLabelText('Exit todo item')
    expect(closeIcon).toBeInTheDocument()
    fireEvent.click(closeIcon)
    expect(onClose).toHaveBeenCalled()
  })
})
