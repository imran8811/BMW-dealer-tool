import { FC, useRef, useState, useCallback, useMemo, SyntheticEvent, ComponentProps } from 'react'

import Table, { Column, TableType, TableProps, TableFilterType, MatchMode } from '@components/Table'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import Button from '@components/Button'
import MultiSelect from '@components/MultiSelect'
import { DealerFnIProduct } from '@common/endpoints/typings.gen'
import useFnIProducts, { DealerFnIProductType, IFniFilters } from '@common/endpoints/useFinanceProducts'
import cls from 'classnames'
import { Menu } from 'primereact/menu'
import EditButtons from '@components/EditButton'
import { TableSort } from '@containers/FeesConfiguration/components/BetterTable/BetterTable'
import { SelectOption } from '@common/utilities/selectOptions'
import StatusSwitch from './Switch/StatusSwitch'
import styles from './product.module.scss'

type ColumnMessage = { [K in keyof DealerFnIProduct]?: string }

const messages = {
  dateFormat: 'MM/DD/YYYY',
  emptyTable: 'No data available in table',
  showMore: 'Load more',
  dateMask: '99/99/9999',
  columns: {
    productName: 'Product Name',
    providerName: 'Provider',
    productType: 'Product Type',
    isActive: 'Status',
    markup: 'Markup %',
  },
  filterPlaceholders: {
    productName: 'Search by Name',
    providerName: 'Search by Provider Name',
    productType: 'Search by Type',
    markup: 'Search',
    isActive: 'Search by Status',
  },
}

const ProductTools: FC<{
  row: DealerFnIProductType
  onEdit: (row: DealerFnIProductType) => unknown
  onDelete: (row: DealerFnIProductType) => unknown
}> = ({ row, onEdit, onDelete }) => {
  const menuRef = useRef<Menu>(null)
  const cb = useCallback((evt: SyntheticEvent): void => menuRef.current?.toggle(evt), [menuRef])
  const handleEdit = useCallback(() => void onEdit(row), [row, onEdit])
  const handleDelete = useCallback(() => void onDelete(row), [row, onDelete])

  return (
    <>
      <EditButtons onClick={cb} icon="settings" />
      <Menu
        ref={menuRef}
        popup
        appendTo={document?.body}
        model={[
          { label: 'Edit', command: handleEdit },
          { label: 'Delete', command: handleDelete },
        ]}
      />
    </>
  )
}
const generateColumnProps = (
  field: keyof DealerFnIProduct,
  options?: {
    filter?: boolean
    sortable?: boolean
    filterMatchMode?: MatchMode
  },
) => {
  const { filter, sortable, filterMatchMode } = {
    filter: true,
    sortable: true,
    filterMatchMode: 'contains',
    ...options,
  }

  return {
    header: (messages.columns as ColumnMessage)[field] || '',
    field,
    sortable,
    filter,
    filterField: filter ? field : undefined,
    filterPlaceholder: filter ? (messages.filterPlaceholders as ColumnMessage)[field] : undefined,
    filterMatchMode: filter ? filterMatchMode : undefined,
  }
}

const ProductTable: FC<
  TableProps & {
    dealerCode?: string
    onSelectItem?: (e: DealerFnIProduct[]) => unknown
    onEdit: (e: DealerFnIProductType) => unknown
    onDeleteRow: (e: DealerFnIProductType) => unknown
  }
> = ({ dealerCode, onEdit, onDeleteRow }) => {
  const tableRef = useRef<TableType>(null)

  const [clientFilters, setClientFilters] = useState()
  const [serverFilters, setServerFilters] = useState<IFniFilters | null>(null)
  const [{ sortField, sortOrder }, setSort] = useState<TableSort>({})

  // API integration
  const { pageData, isLoading, total, setSize, size } = useFnIProducts(dealerCode || '', {
    ...serverFilters,
    sortOrder,
    sortBy: sortField,
  })
  const [statusFilterValue, setStatusFilterValue] = useState<DealerFnIProduct['isActive'][]>()

  const onFilter = useCallback<TableFilterType>(
    (value, field, matchMode) => tableRef?.current?.filter(value, field, (matchMode || 'contains') as string),
    [tableRef],
  )
  const showMore = async () => {
    await setSize(size + 1)
  }
  const statusFilterOptions = useMemo(() => {
    const options = [true, false]
    return options.map(value => ({ label: value ? 'Active' : 'InActive', value }))
  }, [])

  const handleSortChange = useCallback(
    (evt: { sortField: string; sortOrder: number }) => {
      const { sortField: localSortField, sortOrder: localSortOrder } = evt
      setSort({ sortField: localSortField, sortOrder: localSortOrder })
    },
    [setSort],
  )

  const sortProps: Partial<ComponentProps<typeof Table>> = {
    sortField,
    sortOrder,
    onSort: handleSortChange,
    sortMode: 'single',
    removableSort: true,
  }

  const getServerSideFilters = (filter: { [x: string]: { value: unknown; matchMode: string } }) => {
    let initialValue = {} as IFniFilters
    const getValue = (key: keyof IFniFilters) => (filter[key].value ?? filter[key]) as string

    const calculate = (key: keyof IFniFilters) => {
      if (key === 'isActive') return getValue(key).length > 1 ? '' : getValue(key)
      return getValue(key)
    }
    Object.keys(filter).forEach(key => {
      const val = calculate(key as keyof IFniFilters)
      initialValue = {
        ...initialValue,
        [key]: val === '' ? undefined : val,
      }
    })
    return initialValue
  }

  // Render
  return (
    <>
      <div className="pt-0 pb-3 px-4 bg-white rounded">
        <Table
          ref={tableRef}
          onPage={() => {}} // If not defined dynamic `rows` isn't working
          emptyMessage={<MissingDataPlaceholder>{messages.emptyTable}</MissingDataPlaceholder>}
          value={pageData || []}
          className={cls([styles.tablewithEdit, 'pt-0 pb-3 px-4'])}
          sortField="productName"
          sortOrder={-1}
          rowHover
          autoLayout
          onFilter={({ filters }) => {
            setClientFilters(filters)
            setServerFilters(getServerSideFilters(filters))
          }}
          lazy
          filters={clientFilters}
          {...sortProps}
        >
          <Column
            {...generateColumnProps('providerName')}
            body={(item: DealerFnIProduct) => <strong className="text-dark">{item?.providerName || ''}</strong>}
          />
          <Column
            {...generateColumnProps('productType')}
            body={(item: DealerFnIProduct) => <strong className="text-dark">{item?.productType || ''}</strong>}
          />

          <Column
            {...generateColumnProps('productName')}
            body={(item: DealerFnIProduct) => <strong className="text-dark">{item?.productName || ''}</strong>}
          />
          <Column
            {...generateColumnProps('markup')}
            body={(item: DealerFnIProduct) => <strong className="text-dark">{item?.markup || ''}</strong>}
          />

          <Column
            {...generateColumnProps('isActive')}
            filterElement={
              <div style={{ minWidth: '200px' }}>
                <MultiSelect
                  name="isActive"
                  small
                  value={statusFilterValue}
                  onChange={e => {
                    onFilter(e?.value, 'isActive', 'in')
                    setStatusFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.isActive}
                  options={(statusFilterOptions as unknown) as SelectOption[]}
                />
              </div>
            }
            body={(item: DealerFnIProductType) => <StatusSwitch key={`${item.productId}1`} {...item} />}
          />
          <Column
            key="_tools_"
            className={styles.editColumn}
            body={(item: DealerFnIProductType) => <ProductTools row={item} onEdit={onEdit} onDelete={onDeleteRow} />}
          />
        </Table>
      </div>
      {total && pageData.length > 0 && total > pageData.length && (
        <Button loading={isLoading} tertiary onClick={showMore} fullWidth className="mt-2">
          {messages.showMore}
        </Button>
      )}
    </>
  )
}

export default ProductTable
