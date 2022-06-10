import '@testing-library/jest-dom/extend-expect'
import { fireEvent, render } from '@testing-library/react'
import { ModalProvider } from 'react-modal-hook'
import { InventoryItem } from '@common/endpoints/useInventory'

import AssociationList, { messages as associationMessages } from '../components/associationList'
import { messages as associatePopupMessages } from '../components/AddAddons'
import MOCKED_DATA from './fixtures.json'

jest.mock('@common/endpoints/useInventory', () => ({
  __esModule: true,
  useVehicalAccessory: () => ({ pageData: MOCKED_DATA.accessoriesList }),
  useBulkAssociateAddons: () => ({
    mutate: () => {},
    status: 'idle',
    error: {},
  }),
}))

jest.mock('@common/utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: () => ({
    featureFlags: (val: string) => {
      if (val === 'permAccessoryRightsFlag') return MOCKED_DATA.permAddonFlag
      return true
    },
    isLoading: false,
  }),
}))

jest.mock('../components/img-not-avl.png', () => {
  return {
    default: '',
  }
})

jest.mock('@common/utilities/tenantFeaturesFlags', () => ({
  __esModule: true,
  default: () => ({
    shouldShowImages: true,
    isModuleAccessible: true,
  }),
}))

describe('Testing Accessories Association Popup', () => {
  const inventoryItem = (MOCKED_DATA.inventoryItems[0] as unknown) as InventoryItem
  test('Verify Accessory Table has required columns', async () => {
    const associationListView = render(
      <ModalProvider>
        <AssociationList
          accessoriesData={[]}
          categoryOption={[]}
          installModeOption={[]}
          descriptionOptions={[]}
          onCloseAccessory={() => {}}
          item={inventoryItem}
          dealerCode={MOCKED_DATA.dealerCode}
        />
      </ModalProvider>,
    )

    const accessoriesTable = await associationListView.findByTestId('associate-accessories-table')

    // Table is Visible
    expect(accessoriesTable).toBeVisible()

    const tbody = accessoriesTable.firstChild?.firstChild?.firstChild?.firstChild?.lastChild
    // tbody> tr[0]
    const tableColumns = tbody?.firstChild?.childNodes

    // Table have total of 7 columns
    expect(tableColumns?.length).toEqual(7)
    // thead
    const thead = accessoriesTable?.firstChild?.firstChild?.firstChild?.firstChild
    // Table has filters and title headers
    expect(thead?.childNodes.length).toEqual(2)
    // thead> tr[0]
    const tableHeaders = thead?.firstChild?.firstChild

    // Table header labels are accurate
    expect(tableHeaders?.childNodes[0]).toHaveTextContent(associationMessages.columns.name)
    expect(tableHeaders?.childNodes[1]).toHaveTextContent(associationMessages.columns.description)
    expect(tableHeaders?.childNodes[2]).toHaveTextContent(associationMessages.columns.category)
    expect(tableHeaders?.childNodes[3]).toHaveTextContent(associationMessages.columns.price)
    expect(tableHeaders?.childNodes[4]).toHaveTextContent(associationMessages.columns.installationMode)
    expect(tableHeaders?.childNodes[5]).toHaveTextContent(associationMessages.columns.supplier)

    expect(tbody?.childNodes.length).toEqual(MOCKED_DATA.accessoriesList.length)
  })

  test('Verify Total price of selected addons is accurate', async () => {
    const associationListView = render(
      <ModalProvider>
        <AssociationList
          accessoriesData={[]}
          categoryOption={[]}
          installModeOption={[]}
          descriptionOptions={[]}
          onCloseAccessory={() => {}}
          item={inventoryItem}
          dealerCode={MOCKED_DATA.dealerCode}
        />
      </ModalProvider>,
    )
    const sumOfPrice = await associationListView.findByTestId('sum-of-addon-price')

    expect(sumOfPrice).toHaveTextContent(`$${MOCKED_DATA.totalPrice}`)
  })

  test('Verify Add new Button is working properly', async () => {
    const associationListView = render(
      <ModalProvider>
        <AssociationList
          accessoriesData={[]}
          categoryOption={[]}
          installModeOption={[]}
          descriptionOptions={[]}
          onCloseAccessory={() => {}}
          item={inventoryItem}
          dealerCode={MOCKED_DATA.dealerCode}
        />
      </ModalProvider>,
    )

    const deleteBtn = await associationListView.findByTestId('popup-opener-associate-new-addon-btn')

    fireEvent.click(deleteBtn)

    const addonPopupHeading = await associationListView.findByText(associatePopupMessages.heading)

    expect(addonPopupHeading).toBeVisible()
    const cancelBtn = await associationListView.findByTestId('cancel-btn-associate-addon-popup')
    const saveBtn = await associationListView.findByTestId('save-btn-associate-addon-popup')
    expect(saveBtn).toBeDisabled()
    fireEvent.click(cancelBtn)

    expect(addonPopupHeading).not.toBeVisible()
  })
})
