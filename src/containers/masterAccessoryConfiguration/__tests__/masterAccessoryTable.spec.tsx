import { Lookups } from '@common/endpoints/typings.gen'
import { AccessoryType } from '@common/endpoints/useAccessories'
import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import { ModalProvider } from 'react-modal-hook'
import AddonTable, { messages } from '../masterAccessoryTable'
import MOCKED_DATA from './fixtures.json'

jest.mock('@common/endpoints/useMasterAccessories', () => ({
  __esModule: true,
  useMasterAccessories: () => ({ pageData: MOCKED_DATA.accessories.pageData }),
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
}))

const getOptions = (lookups: Lookups[]) => {
  const options = [...new Set(lookups.map((value: Lookups) => value))]
  return options.map(value => ({ label: value.displayName, value: value.code }))
}

describe('Testing Master Accessories Table', () => {
  const { referenceData } = MOCKED_DATA
  const categoryOptions = getOptions((referenceData?.[0].lookups as unknown) as Lookups[])
  const modalOptions = getOptions((referenceData?.[1].lookups as unknown) as Lookups[])

  const InstallationOptions = getOptions((referenceData?.[2].lookups as unknown) as Lookups[])
  const setFilters = jest.fn()
  const setSort = jest.fn()
  const confirmDelete = jest.fn()
  const show = jest.fn()
  const setActiveAddon = jest.fn()
  test('Verify Accessory Table has required columns', async () => {
    const accessoriesListView = render(
      <ModalProvider>
        <AddonTable
          data={(MOCKED_DATA.accessories.pageData as unknown) as AccessoryType[]}
          modalOptions={modalOptions}
          isValidating={false}
          categoryOptions={categoryOptions}
          isLoading={false}
          onServerSideFilter={params => setFilters(params)}
          onSortChange={evt => setSort(evt)}
          deleteRow={confirmDelete}
          InstallationOptions={InstallationOptions}
          handleUserClick={item => {
            if (item) {
              show()
              setActiveAddon(item)
            }
          }}
        />
      </ModalProvider>,
    )

    const accessoriesTable = await accessoriesListView.findByTestId('accessories-table')

    // Table is Visible
    expect(accessoriesTable).toBeVisible()

    const tbody = accessoriesTable.firstChild?.firstChild?.firstChild?.firstChild?.lastChild
    // tbody> tr[0]
    const tableColumns = tbody?.firstChild?.childNodes

    // Table have total of 11 columns
    expect(tableColumns?.length).toEqual(11)
    // thead
    const thead = accessoriesTable?.firstChild?.firstChild?.firstChild?.firstChild
    // Table has filters and title headers
    expect(thead?.childNodes.length).toEqual(2)
    // thead> tr[0]
    const tableHeaders = thead?.firstChild?.firstChild

    // Table header labels are accurate
    expect(tableHeaders?.childNodes[0]).toHaveTextContent(messages.rows.name)
    expect(tableHeaders?.childNodes[1]).toHaveTextContent(messages.rows.description)
    expect(tableHeaders?.childNodes[2]).toHaveTextContent(messages.rows.category)

    expect(tbody?.childNodes.length).toEqual(MOCKED_DATA.accessories.pageData.length)
  })

  test('Verify empty table', async () => {
    const accessoriesListView = render(
      <ModalProvider>
        <AddonTable
          data={[]}
          modalOptions={modalOptions}
          isValidating={false}
          categoryOptions={categoryOptions}
          isLoading={false}
          onServerSideFilter={params => setFilters(params)}
          onSortChange={evt => setSort(evt)}
          deleteRow={confirmDelete}
          InstallationOptions={InstallationOptions}
          handleUserClick={item => {
            if (item) {
              show()
              setActiveAddon(item)
            }
          }}
        />
      </ModalProvider>,
    )
    const accessoriesTable = await accessoriesListView.findByTestId('accessories-table')
    const tbody = accessoriesTable.firstChild?.firstChild?.firstChild?.firstChild?.lastChild

    expect(tbody?.childNodes.length).toEqual(1)
  })
})
