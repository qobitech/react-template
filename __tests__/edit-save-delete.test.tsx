import { render, screen, fireEvent } from '@testing-library/react'
import EditSaveDelete from '../src/components/edit-save-delete'

describe('EditSaveDelete Component', () => {
  it('shows EditSVG when isEdit is false', () => {
    render(
      <EditSaveDelete isEdit={false} onSave={() => {}} onDelete={() => {}} />
    )

    const editIcon = screen.getByLabelText('Edit todo item')
    expect(editIcon).toBeInTheDocument()
  })

  it('shows TrashSVG when isEdit is false', () => {
    const onDelete = vi.fn()
    render(
      <EditSaveDelete isEdit={false} onSave={() => {}} onDelete={onDelete} />
    )

    const trashIcon = screen.getByLabelText('Delete todo item')
    expect(trashIcon).toBeInTheDocument()

    fireEvent.click(trashIcon)
    expect(onDelete).toHaveBeenCalled()
  })

  it('shows CheckSVG when isEdit is true and triggers onSave onClick', () => {
    const onSave = vi.fn()
    render(<EditSaveDelete isEdit={true} onSave={onSave} onDelete={() => {}} />)

    const saveIcon = screen.getByLabelText('Save todo item')
    expect(saveIcon).toBeInTheDocument()

    fireEvent.click(saveIcon)
    expect(onSave).toHaveBeenCalled()
  })
})
