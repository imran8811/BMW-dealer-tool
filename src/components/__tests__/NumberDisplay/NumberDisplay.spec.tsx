import { render } from '@testing-library/react'
import NumberDisplay, { useNumberFormatter } from '@components/NumberDisplay'

describe('Test NumberDisplay', () => {
  test('test render of NumberDisplay', () => {
    render(<NumberDisplay value={2} />)
  })

  test('test useNumberFormatter', () => {
    const result = useNumberFormatter(5000)
    expect(result).toBe('5,000')
  })
})
