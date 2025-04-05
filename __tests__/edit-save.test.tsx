import { render, screen, fireEvent } from '@testing-library/react'
import EditSave from '../src/components/edit-save'

describe('EditSave Component', () => {
  it('shows EditSVG when isEdit is false', () => {
    render(<EditSave isEdit={false} onSave={() => {}} />)

    const editIcon = screen.getByLabelText('Edit todo item')
    expect(editIcon).toBeInTheDocument()
  })

  it('shows CheckSVG when isEdit is true and triggers onSave onClick', () => {
    const onSave = vi.fn()
    render(<EditSave isEdit={true} onSave={onSave} />)

    const saveIcon = screen.getByLabelText('Save todo item')
    expect(saveIcon).toBeInTheDocument()

    fireEvent.click(saveIcon)
    expect(onSave).toHaveBeenCalled()
  })
})
