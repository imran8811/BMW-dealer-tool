import { render } from '@testing-library/react'
import DuoTabView from '@components/DuoTabView'

describe('Test DuoTabView', () => {
  test('test render of DuoTabView', () => {
    render(
      <DuoTabView>
        <>test</>
      </DuoTabView>,
    )
  })
})
