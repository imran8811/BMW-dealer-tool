/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import '@testing-library/jest-dom/extend-expect'
import { fireEvent, render } from '@testing-library/react'
import { ModalProvider } from 'react-modal-hook'
import { SelectOption } from '@common/utilities/selectOptions'
import MOCKED_DATA from './fixtures.json'
import AddRemoveAddon, { messages as addremoveAddonsMessages } from '../components/AddAddons'

jest.mock('@common/endpoints/useInventory', () => ({
  __esModule: true,
  useBulkAssociateAddons: () => ({
    mutate: () => {},
    status: 'idle',
    error: {},
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

describe('Testing Addon Association with inventory', () => {
  test('Testing Addon Association Popup have the tabs', async () => {
    const associationView = render(
      <ModalProvider>
        <AddRemoveAddon
          accessoriesData={MOCKED_DATA.dealerAccessories}
          onHideAddon={() => {}}
          associatedAddons={MOCKED_DATA.accessoriesList}
          vin={MOCKED_DATA.inventoryItems[0].vin}
          dealerCode={MOCKED_DATA.dealerCode}
          installModeOption={MOCKED_DATA.installationModeOptions as SelectOption[]}
        />
      </ModalProvider>,
    )
    const tabMenu = await associationView.findByTestId('add-remove-addon-test-id')

    // Tab Controller shows the 2 category tabs
    expect(tabMenu.firstChild?.firstChild?.childNodes.length).toEqual(3)
    // First Tab Controller heading matches "others"
    expect(tabMenu.firstChild?.firstChild?.childNodes[0].textContent).toEqual(
      MOCKED_DATA.dealerAccessories[0].category.displayName,
    )
    // second Tab headed matches "alloywheels"
    expect(tabMenu.firstChild?.firstChild?.childNodes[1].textContent).toEqual(
      MOCKED_DATA.dealerAccessories[7].category.displayName,
    )
    const categoryOneItem = tabMenu.childNodes[2].firstChild
    const categoryTwoItem = tabMenu.childNodes[2].lastChild

    fireEvent.click(tabMenu.firstChild?.firstChild?.childNodes[1].firstChild as Element)
    expect(categoryTwoItem).toHaveClass('active')
    expect(categoryOneItem).not.toHaveClass('active')

    fireEvent.click(tabMenu.firstChild?.firstChild?.childNodes[0].firstChild as Element)
    expect(categoryTwoItem).not.toHaveClass('active')
    expect(categoryOneItem).toHaveClass('active')
  })

  test('Test Addon Accordions Show Accurate Data', async () => {
    const associationView = render(
      <ModalProvider>
        <AddRemoveAddon
          accessoriesData={MOCKED_DATA.dealerAccessories}
          onHideAddon={() => {}}
          associatedAddons={MOCKED_DATA.accessoriesList}
          vin={MOCKED_DATA.inventoryItems[0].vin}
          dealerCode={MOCKED_DATA.dealerCode}
          installModeOption={MOCKED_DATA.installationModeOptions as SelectOption[]}
        />
      </ModalProvider>,
    )

    const view = await associationView.findByTestId('add-remove-addon-test-id')
    const firstAccordionContent =
      view.childNodes[2].firstChild?.childNodes[1]?.firstChild?.childNodes[1]?.firstChild?.firstChild
    const secondAccordionContent =
      view.childNodes[2].firstChild?.childNodes[1]?.childNodes[1]?.childNodes[1]?.firstChild?.firstChild
    // How many items are in accordion
    expect(firstAccordionContent?.childNodes.length).toEqual(5)

    expect(firstAccordionContent?.firstChild?.firstChild).toBeVisible()
    // First element is optional selected as preinstalled so it's heading should match
    expect(firstAccordionContent?.firstChild?.childNodes[1]).toHaveTextContent('John Cooper Works Sport Chassis')
    // Second element is preinstalled one with it's heading shoul match
    expect(firstAccordionContent?.childNodes[1]?.childNodes[1]).toHaveTextContent('Bonnet Stripes')
    expect(firstAccordionContent?.firstChild?.childNodes[2]).toHaveTextContent(
      `$${MOCKED_DATA.dealerAccessories[0].price.toFixed(2)}`,
    )

    fireEvent.click(firstAccordionContent?.firstChild?.childNodes[3] as Element)

    const description = await associationView.findByTestId('description-dialog-addon-association')
    const descriptionHeader = await associationView.findByTestId('description-dialog-header')
    // on clicking view details it opens up the dialog for description
    expect(descriptionHeader).toHaveTextContent('John Cooper Works Sport Chassis')
    expect(description).toHaveTextContent('John Cooper Works Sport Chassis')

    fireEvent.click(descriptionHeader.firstChild as Element)

    // on clicking back button it closes  the dialog for description
    expect(descriptionHeader).not.toBeInTheDocument()

    // Add and Remove Buttons are working perfectly
    expect(firstAccordionContent?.firstChild?.childNodes[4]).toHaveTextContent(addremoveAddonsMessages.add)
    expect(firstAccordionContent?.firstChild?.childNodes[5]).toHaveTextContent(addremoveAddonsMessages.remove)

    // First element is selected that's why it should show remove button
    expect((firstAccordionContent?.firstChild?.childNodes[4] as Element).classList.contains('d-none')).toBe(true)
    expect((firstAccordionContent?.firstChild?.childNodes[5] as Element).classList.contains('d-none')).toBe(false)
    expect(secondAccordionContent?.childNodes.length).toEqual(2)

    fireEvent.click(firstAccordionContent?.firstChild?.childNodes[5] as Element)

    // on clicking the optional will move downwards to optional category and then preinstalled will be shown as selected
    expect((firstAccordionContent?.firstChild?.childNodes[4] as Element).classList.contains('d-none')).toBe(true)
    expect((firstAccordionContent?.firstChild?.childNodes[5] as Element).classList.contains('d-none')).toBe(false)

    fireEvent.click(firstAccordionContent?.firstChild?.childNodes[5] as Element)
    expect((firstAccordionContent?.firstChild?.childNodes[4] as Element).classList.contains('d-none')).toBe(false)
    expect((firstAccordionContent?.firstChild?.childNodes[5] as Element).classList.contains('d-none')).toBe(true)

    // After click the optional categories will get one more item from preinstalled list
    expect(secondAccordionContent?.childNodes.length).toEqual(3)

    // price should be equal to sum of price of all selected one
    fireEvent.click(secondAccordionContent?.firstChild?.childNodes[4] as Element)
    const total = await associationView.findByTestId('total-price-sum')

    expect(total.textContent).toEqual('$600.00')
    fireEvent.click(firstAccordionContent?.firstChild?.childNodes[5] as Element)
    expect(total.textContent).toEqual('$400.00')

    fireEvent.click(secondAccordionContent?.firstChild?.childNodes[4] as Element)
    expect(total.textContent).toEqual('$475.00')

    // Testing Cancel and save buttons
    const cancelButton = await associationView.findByText(addremoveAddonsMessages.cancel)
    fireEvent.click(cancelButton)

    const confirmationPopup = await associationView.findByText(addremoveAddonsMessages.confirmCancel)

    expect(confirmationPopup).toBeVisible()

    // Testing Popups
    const yesBtn = await associationView.findByText('Yes')
    const noBtn = await associationView.findByText('No')
    fireEvent.click(noBtn)
    const saveBtn = await associationView.findByTestId('save-btn-associate-addon-popup')
    expect(saveBtn).toBeEnabled()
    expect(confirmationPopup).not.toBeVisible()
    fireEvent.click(cancelButton)
    fireEvent.click(yesBtn)

    expect(confirmationPopup).not.toBeVisible()

    // Testing search input

    const searchInput = await associationView.findByTestId('addon-search-input')
    const searchBtn = await associationView.findByTestId('addon-search-btn')
    const accordions = view.childNodes[2]?.firstChild?.childNodes[1]
    expect(accordions?.childNodes.length).toEqual(2)
    fireEvent.change(searchInput, { target: { value: 'bonn' } })
    fireEvent.click(searchBtn)

    expect(accordions?.childNodes.length).toEqual(1)
  })
})
