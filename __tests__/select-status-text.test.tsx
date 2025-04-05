import { render, screen, fireEvent } from '@testing-library/react'
import SelectStatusText from '../src/components/select-status-text'

describe('SelectStatusText Component', () => {
  it('renders the select dropdown when isEdit is true', () => {
    const handleChange = vi.fn()

    render(
      <SelectStatusText
        isEdit={true}
        status="completed"
        handleOnChange={handleChange}
      />
    )

    const selectElement = screen.getByRole('combobox')
    expect(selectElement).toBeInTheDocument()

    // Simulate change
    fireEvent.change(selectElement, { target: { value: 'blocked' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders the status text when isEdit is false', () => {
    render(
      <SelectStatusText
        isEdit={false}
        status="in-progress"
        handleOnChange={() => {}}
      />
    )

    const statusText = screen.getByText('in-progress')
    expect(statusText).toBeInTheDocument()
    expect(statusText.tagName).toBe('DIV')
  })
})
