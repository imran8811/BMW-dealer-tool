import { FC, useRef, useCallback, useState, ComponentProps } from 'react'

import Table, { Column, TableFilterType, TableType } from '@components/Table'
import { DateDisplay } from '@components/DateDisplay'
import MultiSelect from '@components/MultiSelect'
import { Dealerships } from '@common/endpoints/typings.gen'
import formatPhoneNumber from '@common/utilities/formatPhoneNumber'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import MaskedInput from '@components/MaskedInput'
import EditButtons from '@components/EditButton'
import { IFilterDealerShips } from '@common/endpoints/useDealerships'
import { TableSort } from '@containers/FeesConfiguration/components/BetterTable/BetterTable'
import { SelectOption } from '@common/utilities/selectOptions'
import StatusSwitch from './component/StatusSwitch'
import RetailSwitch from './component/Retailswitch'
import styles from './dealership.module.scss'

export const messages = {
  dateFormat: 'MM/DD/YYYY',
  emptyTable: 'No data available in table',
  dateMask: '99/99/9999',
  rows: {
    name: 'Dealership Name',
    address: 'Address',
    city: 'City',
    zipCode: 'Zip',
    state: 'State',
    email: 'Email Id',
    contactNo: 'Contact No.',
    updatedAt: 'Last Updated',
    isActive: 'Status',
    digitalRetailEnabled: 'Digital Retail',
  },
  filterPlaceholders: {
    name: 'Search by Name',
    address: 'Search by Address',
    state: 'Search by State',
    city: 'Search by City',
    zipCode: 'Search by Zip',
    email: 'Search by email Id',
    contactNo: 'Search by Contact',
    updatedAt: 'Search by Date',
    isActive: 'Search by Status',
    digitalRetailEnabled: 'Search By Digital Retail',
  },
  loadMore: 'Load More',
  statusFilterOptions: [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
  ],
  retailFilterOptions: [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
  ],
}

export const generateColumnProps = (
  field: keyof Dealerships,
  options?: {
    filter?: boolean
    sortable?: boolean
  },
) => {
  const { filter, sortable } = {
    filter: true,
    sortable: true,
    ...options,
  }

  return {
    header: (messages.rows as Record<string, string>)[field] || '',
    field,
    sortable,
    filter,
    filterField: filter ? field : undefined,
    filterPlaceholder: filter ? (messages.filterPlaceholders as Record<string, string>)[field] : undefined,
    filterMatchMode: filter ? 'contains' : undefined,
  }
}

const DealershipContainer: FC<{
  data: Dealerships[]
  isLoading: boolean
  onEdit: (item: Dealerships) => unknown
  onServerSideFilter: (params: IFilterDealerShips) => unknown
  onSortChange: (evt: { sortField?: string; sortOrder?: number }) => unknown
}> = ({ onServerSideFilter, onSortChange, ...props }) => {
  const tableRef = useRef<TableType>(null)

  const { data, onEdit } = props
  const onFilter = useCallback<TableFilterType>(
    (value, field, matchMode) => tableRef?.current?.filter(value, field, (matchMode || 'contains') as string),
    [tableRef],
  )

  const [serverFilters, setFilter] = useState()
  const [statusFilterValue, setStatusFilterValue] = useState<Dealerships['isActive'][]>([])
  const [retailFilterValue, setRetailFilterValue] = useState<Dealerships['digitalRetailEnabled'][]>([])
  const [updateAtFilter, setUpdateAtFilter] = useState<Dealerships['updatedAt']>('')

  const getServerSideFilters = (filter: { [x: string]: { value: unknown; matchMode: string } }) => {
    let initialValue = {} as IFilterDealerShips
    const getValue = (key: keyof IFilterDealerShips) => (filter[key].value ?? filter[key]) as string
    const processDate = (date: string) => {
      const expr = date.split('/')
      const numeric = (str: string) => {
        return str.includes('_') ? '' : str
      }
      const dateStr = [numeric(expr[2]), numeric(expr[0]), numeric(expr[1])] // YYYY-MM-DD
      if (dateStr.join('-').length !== 10) return

      return new Date(Number(dateStr[0]), Number(dateStr[1]) - 1, Number(dateStr[2]), 0, 0, 0, 0).toISOString()
    }
    const calculate = (key: keyof IFilterDealerShips) => {
      if (key === 'updatedAt' || key === 'createdAt') return processDate(getValue(key))
      if (key === 'digitalRetailEnabled' || key === 'isActive') return getValue(key).length > 1 ? '' : getValue(key)
      return getValue(key)
    }
    Object.keys(filter).forEach(key => {
      const val = calculate(key as keyof IFilterDealerShips)
      initialValue = {
        ...initialValue,
        [key]: val === '' ? undefined : val,
      }
    })
    return initialValue
  }

  const [{ sortField, sortOrder }, setSort] = useState<TableSort>({})
  const handleSortChange = useCallback(
    (evt: { sortField: string; sortOrder: number }) => {
      const { sortField: localSortField, sortOrder: localSortOrder } = evt
      setSort({ sortField: localSortField, sortOrder: localSortOrder })
      onSortChange?.({
        sortField: localSortField ?? undefined,
        sortOrder: localSortOrder === 0 ? undefined : localSortOrder,
      })
    },
    [setSort, onSortChange],
  )

  const sortProps: Partial<ComponentProps<typeof Table>> = {
    sortField,
    sortOrder,
    onSort: handleSortChange,
    sortMode: 'single',
    removableSort: true,
  }

  return (
    <>
      <div data-testid="dealership-table" className="pt-0 pb-3 px-4 bg-white rounded">
        <Table
          ref={tableRef}
          emptyMessage={
            <MissingDataPlaceholder testId="missing-placeholder-dealership">
              {messages.emptyTable}
            </MissingDataPlaceholder>
          }
          value={data || []}
          // sortField="updatedAt"
          // sortOrder={-1}
          onFilter={({ filters }) => {
            setFilter(filters)
            onServerSideFilter(getServerSideFilters(filters))
          }}
          lazy
          filters={serverFilters}
          rowHover
          className={styles.tablewithEdit}
          autoLayout
          {...props}
          {...sortProps}
        >
          <Column
            {...generateColumnProps('name')}
            body={(item: Dealerships) => <strong className="text-dark text-uppercase">{item.name}</strong>}
          />
          <Column
            {...generateColumnProps('digitalRetailEnabled')}
            body={(item: Dealerships) => (
              <RetailSwitch testId="dealership-retail-switch" key={`${item._id}2`} {...item} />
            )}
            filterElement={
              <div className={styles.filter}>
                <MultiSelect
                  name="digitalRetailEnabled"
                  small
                  value={retailFilterValue}
                  onChange={e => {
                    onFilter(e?.value, 'digitalRetailEnabled', 'in')
                    setRetailFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.digitalRetailEnabled}
                  options={(messages.retailFilterOptions as unknown) as SelectOption[]}
                />
              </div>
            }
          />
          <Column
            {...generateColumnProps('isActive')}
            body={(item: Dealerships) => (
              <StatusSwitch testId="status-switch-dealer-table" key={`${item._id}1`} {...item} />
            )}
            filterElement={
              <div className={styles.filter}>
                <MultiSelect
                  name="isActive"
                  small
                  value={statusFilterValue}
                  onChange={e => {
                    onFilter(e?.value, 'isActive', 'in')
                    setStatusFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.isActive}
                  options={(messages.statusFilterOptions as unknown) as SelectOption[]}
                />
              </div>
            }
          />

          <Column
            {...generateColumnProps('state')}
            body={(item: Dealerships) => <span className="text-dark">{item?.state?.displayName}</span>}
            field="state.displayName"
          />
          <Column
            {...generateColumnProps('address')}
            body={(item: Dealerships) => (
              <span className="text-dark">{`${item.address} ${(item?.address2 as string) || ''}`}</span>
            )}
          />

          <Column
            {...generateColumnProps('city')}
            body={(item: Dealerships) => <span className="text-dark">{item?.city}</span>}
          />

          <Column
            {...generateColumnProps('zipCode')}
            body={(item: Dealerships) => <span className="text-dark">{item?.zipCode}</span>}
          />
          <Column
            {...generateColumnProps('contactNo')}
            body={(item: Dealerships) => <span className="text-dark">{formatPhoneNumber(item?.contactNo || '')}</span>}
          />
          <Column
            {...generateColumnProps('email')}
            body={(item: Dealerships) => (
              <a href={`mailto:${item?.email || ''}`}>
                <span>
                  <u>{item?.email}</u>
                </span>
              </a>
            )}
          />
          <Column
            {...generateColumnProps('updatedAt')}
            body={(item: Dealerships) => item?.updatedAt && <DateDisplay value={item.updatedAt} format="date" />}
            filterElement={
              <div style={{ minWidth: '160px' }}>
                <MaskedInput
                  name="updatedAt"
                  small
                  mask={messages.dateMask}
                  onChange={(e: { value: string }) => {
                    onFilter(e?.value, 'updatedAt', 'custom')
                    setUpdateAtFilter(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.updatedAt}
                  value={updateAtFilter}
                />
              </div>
            }
          />

          <Column
            className={styles.editColumn}
            body={(item: Dealerships) => (
              <EditButtons testId="dealership-table-edit-btn" onClick={() => onEdit(item)} />
            )}
          />
        </Table>
      </div>
    </>
  )
}

export default DealershipContainer
