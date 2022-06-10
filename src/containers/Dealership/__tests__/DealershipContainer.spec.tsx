import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { renderHook } from '@testing-library/react-hooks'
import { ModalProvider } from 'react-modal-hook'
import userEvent from '@testing-library/user-event'
import { Dealerships } from '@common/endpoints/typings.gen'
import useDealerships, { IFilterDealerShips } from '@common/endpoints/useDealerships'
import RetailSwitch, { messages as retailMessages } from '../component/Retailswitch'
import DealershipContainer, { messages } from '../dealershipContainer'
import Dealership, { messages as tableMessages } from '../dealershipTable'
import StatusSwitch, { messages as statusMessages } from '../component/StatusSwitch'
import MOCKED_DATA from '../fixtures.json'

type TestStates = {
  selectedItem: Dealerships | null
  filters: null | IFilterDealerShips
  sort: {
    sortField?: string | undefined
    sortOrder?: number | undefined
  } | null
  dealershipsData: Dealerships[]
}
const state: TestStates = {
  selectedItem: null,
  filters: null,
  sort: null,
  dealershipsData: [],
}

const setState = (key: keyof TestStates, item: unknown) => {
  return {
    ...state,
    [key]: item,
  }
}

jest.mock('@common/endpoints/useDealerships', () => ({
  __esModule: true,
  default: () => ({ ...MOCKED_DATA.dealerships }),
  useDealershipRetailUpdate: () => ({
    mutate: () => ({ ...MOCKED_DATA.dealerships.pageData[0], digitalRetailEnabled: false }),
  }),
  useDealershipStatusUpdate: () => ({}),
  invalidateDealership: () => ({ ...MOCKED_DATA.dealerships.pageData[0], digitalRetailEnabled: false }),
}))

describe('dealership-container-test01', () => {
  test('Test Screen Title', async () => {
    const dealershipContainer = render(
      <ModalProvider>
        <DealershipContainer />
      </ModalProvider>,
    )
    const sectionHeading = await dealershipContainer.findByTestId('container-title')

    // Screen Heading is accurate
    expect(sectionHeading.firstChild?.childNodes[1]).toHaveTextContent(messages.title)
  })
  test('Test Add Dealership Button', async () => {
    const dealershipContainer = render(
      <ModalProvider>
        <DealershipContainer />
      </ModalProvider>,
    )
    const sectionHeadingBtn = await dealershipContainer.findByTestId('add-new-btn')

    // Add New Button text
    expect(sectionHeadingBtn).toBeVisible()
    expect(sectionHeadingBtn).toHaveTextContent(messages.addNewDealership)
    userEvent.click(sectionHeadingBtn)
    const addFormDialog = await dealershipContainer.findByTestId('add-new-dealership-dialog')

    // Add New Dealership Button is working
    expect(addFormDialog).toBeVisible()
  })

  test('Test Dealership Container UI', async () => {
    const dealershipTableNode = render(
      <ModalProvider>
        <DealershipContainer />
      </ModalProvider>,
    )

    const dealerTable = await dealershipTableNode.findByTestId('dealership-table')

    const dealerTableEditBtn = await dealershipTableNode.findAllByTestId('dealership-table-edit-btn')

    // Dealership table is visible
    expect(dealerTable).toBeVisible()

    const tableHead = dealerTable.firstChild?.firstChild?.firstChild?.firstChild?.firstChild

    // Dealership table has filters and label rows
    expect(tableHead?.childNodes.length).toEqual(2)

    // Dealership table has 11 columns
    expect(tableHead?.firstChild?.childNodes.length).toEqual(11)

    const retailSwitch = await dealershipTableNode.findAllByTestId('dealership-retail-switch')
    expect(retailSwitch[0]).toBeVisible()

    userEvent.click(dealerTableEditBtn[0])
    const addFormDialog = await dealershipTableNode.findByTestId('add-new-dealership-dialog')

    // Dealership table's edit button is working perfectly
    expect(addFormDialog).toBeVisible()
  })

  test('Test Dealership Table Missing Placeholder', async () => {
    const dealershipTableNode = render(
      <ModalProvider>
        <Dealership
          onEdit={item => {
            setState('selectedItem', item)
          }}
          onServerSideFilter={params => setState('filters', params)}
          onSortChange={evt => setState('sort', evt)}
          data={[]}
          isLoading={false}
        />
      </ModalProvider>,
    )

    const missingPlaceholder = await dealershipTableNode.findByText(tableMessages.emptyTable)

    // Missing placeholder is present when there is no data
    expect(missingPlaceholder).toBeVisible()
  })

  test('Test Dealership retail switch is Enabled when value is truthy', async () => {
    const dealerData = renderHook(() => useDealerships())
    const testId = 'retail-switch'
    const retailSwitchNode = render(
      <RetailSwitch
        testId={testId}
        key={`${dealerData.result.current.pageData[0]._id}2`}
        {...dealerData.result.current.pageData[0]}
      />,
    )
    const retailSwitch = await retailSwitchNode.findAllByTestId(testId)
    expect(retailSwitch[0]).toHaveTextContent(retailMessages.enabled)
  })

  test('Test Dealership retail switch is Disabled when value is falsy', async () => {
    const dealerData = renderHook(() => useDealerships())
    const testId = 'retail-switch'
    const retailSwitchNode = render(
      <RetailSwitch
        testId={testId}
        key={`${dealerData.result.current.pageData[1]._id}2`}
        {...dealerData.result.current.pageData[1]}
      />,
    )
    const retailSwitch = await retailSwitchNode.findAllByTestId(testId)
    expect(retailSwitch[0]).toHaveTextContent(retailMessages.disabled)
  })

  test('Test Dealership Status switch is active when value is truthy', async () => {
    const dealerData = renderHook(() => useDealerships())
    const testId = 'status-switch-dealer-table'
    const statusSwitchNode = render(
      <ModalProvider>
        <StatusSwitch
          testId={testId}
          key={`${dealerData.result.current.pageData[0]._id}2`}
          {...dealerData.result.current.pageData[0]}
        />
      </ModalProvider>,
    )
    const statusSwitch = await statusSwitchNode.findAllByTestId(testId)
    expect(statusSwitch[0]).toHaveTextContent(statusMessages.statusActive)
  })

  test('Test Dealership Status switch is inactive when value is falsy', async () => {
    const dealerData = renderHook(() => useDealerships())
    const testId = 'status-switch-dealer-table'
    const statusSwitchNode = render(
      <ModalProvider>
        <StatusSwitch
          testId={testId}
          key={`${dealerData.result.current.pageData[1]._id}2`}
          {...dealerData.result.current.pageData[1]}
        />
      </ModalProvider>,
    )
    const statusSwitch = await statusSwitchNode.findAllByTestId(testId)
    expect(statusSwitch[0]).toHaveTextContent(statusMessages.statusInactive)
  })

  // TODO: Test Status confirmation popups
})
