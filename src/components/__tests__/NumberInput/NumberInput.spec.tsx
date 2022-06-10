import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import NumberInput from '@components/NumberInput'

describe('Test NumberInput', () => {
  test('test render of NumberInput', () => {
    render(<NumberInput name="testInput" value={2} />)
  })

  test('test currency mode', () => {
    const value = 2
    render(<NumberInput mode="currency" name="testInput" value={value} />)
    const input = screen.getByTestId('number-input-test-id') as HTMLInputElement
    expect(input.value).toBe('$2.00')
  })

  test('test percentage mode', () => {
    const value = 2
    render(<NumberInput mode="percentage" name="testInput" value={value} />)
    const input = screen.getByTestId('number-input-test-id') as HTMLInputElement
    expect(input.value).toBe('2%')
  })
  test('test decimal mode', () => {
    const value = 2
    render(<NumberInput mode="decimal" name="testInput" value={value} />)
    const input = screen.getByTestId('number-input-test-id') as HTMLInputElement
    expect(input.value).toBe('2 ')
  })
})
