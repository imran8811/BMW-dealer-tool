import { renderHook } from '@testing-library/react-hooks'
import { useMasterAccessories, useMasterAccessoryMutation } from '../useMasterAccessories'

describe('Test useMasterAccessories', () => {
  test('Test useAccessories', () => {
    const accessoriesData = renderHook(() =>
      useMasterAccessories({
        pageSize: 7,
      }),
    )
    expect(accessoriesData.result.current.pageData?.length).toBe(0)
  })

  test('Test useMasterAccessoriesMutation', () => {
    const data = renderHook(() => useMasterAccessoryMutation())
    expect(typeof data.result.current.mutate).toBe('function')
  })
})
