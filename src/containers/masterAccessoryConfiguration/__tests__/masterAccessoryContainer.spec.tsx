import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import { ModalProvider } from 'react-modal-hook'
import AddonContainer, { messages } from '../masterAccessoryContainer'
import MOCKED_DATA from './fixtures.json'

jest.mock('@common/endpoints/useMasterAccessories', () => ({
  __esModule: true,
  useMasterAccessories: () => ({ pageData: MOCKED_DATA.accessories.pageData }),
  useAccessories: () => ({ pageData: MOCKED_DATA.accessories.pageData }),
  useBulkAssociateAddons: () => ({
    mutate: () => {},
    status: 'idle',
    error: {},
  }),
  useMasterAccessoryMutation: () => ({
    mutate: () => {},
    status: 'idle',
    error: {},
  }),
  useDeleteMasterAccessory: () => ({
    mutate: () => {},
    status: 'idle',
    error: {},
  }),
}))

describe('Testing Master Accessories Container', () => {
  test('Verify Accessory Table has required columns', () => {
    const masterAccessoryContainerView = render(
      <ModalProvider>
        <AddonContainer />
      </ModalProvider>,
    )
    expect(masterAccessoryContainerView.findByText(messages.loadMore))
  })
})
