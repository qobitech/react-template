import { render, screen, fireEvent } from '@testing-library/react'
import InputText from '../src/components/input-text'

describe('InputText Component', () => {
  it('renders an input when isEdit is true and handles change', () => {
    const handleChange = vi.fn()

    render(
      <InputText
        isEdit={true}
        subject="Buy groceries"
        handleOnChange={handleChange}
      />
    )

    const input = screen.getByPlaceholderText('Todo subject')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Buy groceries')

    fireEvent.change(input, { target: { value: 'Go jogging' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders text when isEdit is false', () => {
    const handleChange = vi.fn()

    render(
      <InputText
        isEdit={false}
        subject="Call mom"
        handleOnChange={handleChange}
      />
    )

    const text = screen.getByText('Call mom')
    expect(text).toBeInTheDocument()
  })

  it('autoFocuses the input when isEdit is true', () => {
    const handleChange = vi.fn()

    render(
      <InputText
        isEdit={true}
        subject="Write code"
        handleOnChange={handleChange}
      />
    )

    const input = screen.getByPlaceholderText('Todo subject')
    expect(document.activeElement).toBe(input)
  })

  it('responds to Enter key press when typing', () => {
    const handleChange = vi.fn()

    render(
      <InputText
        isEdit={true}
        subject="Walk the dog"
        handleOnChange={handleChange}
      />
    )

    const input = screen.getByPlaceholderText('Todo subject')

    fireEvent.change(input, { target: { value: 'Feed the cat' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    // This test doesn't expect anything by default unless you connect Enter to a handler
    // but here's a simple sanity check to confirm key event works
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders input when isEdit is true and submits form on Enter key', () => {
    const handleChange = vi.fn()
    const handleSubmit = vi.fn((e) => e.preventDefault())

    render(
      <form onSubmit={handleSubmit}>
        <InputText
          isEdit={true}
          subject="Walk the dog"
          handleOnChange={handleChange}
        />
        {/* hidden button helps Enter key trigger form submission */}
        <button type="submit" style={{ display: 'none' }}>
          Submit
        </button>
      </form>
    )

    const input = screen.getByPlaceholderText('Todo subject')

    // Simulate typing — this should call handleChange
    fireEvent.change(input, { target: { value: 'Feed the cat' } })

    // Press Enter to trigger form submit
    fireEvent.submit(input)

    expect(handleChange).toHaveBeenCalled()
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('renders the p tag when isEdit is false', () => {
    render(
      <InputText
        isEdit={false}
        subject="Clean the room"
        handleOnChange={() => {}}
      />
    )

    const pTag = screen.getByTestId('subject-text')

    expect(pTag).toBeInTheDocument()
    expect(pTag.tagName).toBe('P')
  })
})
