import { FC, useRef, useCallback, useState, SyntheticEvent, ComponentProps } from 'react'
import Table, { Column, TableType } from '@components/Table'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import EditButton from '@components/EditButton'
import { FeeTag } from '@common/endpoints/typings.gen'
import { FeeTagType, IFeeTagFilter } from '@common/endpoints/useFeeTags'

import { Menu } from 'primereact/menu'
import { TableSort } from '@containers/FeesConfiguration/components/BetterTable/BetterTable'
import styles from './components/feeTags.module.scss'

const messages = {
  dateFormat: 'MM/DD/YYYY',
  emptyTable: 'No data available in table',
  rows: {
    chargeCode: 'Fee Name',
    stateCode: 'State',
    productCode: 'Financial Product',
    tagName: 'Tag Name',
  },
  filterPlaceholders: {
    chargeCode: 'Search by Fee Name',
    stateCode: 'Search by State',
    productCode: 'Search by Financial Product',
    tagName: 'Search by Tag Name',
  },
  loadMore: 'Load More',
}

const AddonTools: FC<{
  row: FeeTagType
  onEdit: (row: FeeTagType) => unknown
  onDelete: (row: FeeTagType) => unknown
}> = ({ row, onEdit, onDelete }) => {
  const menuRef = useRef<Menu>(null)
  const cb = useCallback((evt: SyntheticEvent): void => menuRef.current?.toggle(evt), [menuRef])
  const handleEdit = useCallback(() => void onEdit(row), [row, onEdit])
  const handleDelete = useCallback(() => void onDelete(row), [row, onDelete])

  return (
    <>
      <EditButton onClick={cb} icon="settings" />
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
  field: keyof FeeTag,
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

const FeeTagConfigurationsContainer: FC<{
  data: FeeTagType[]
  isLoading: boolean
  deleteRow: (e: FeeTagType) => unknown
  handleUserClick: (item: FeeTagType) => void
  onServerSideFilter: (params: IFeeTagFilter) => unknown
  onSortChange: (evt: { sortField?: string; sortOrder?: number }) => unknown
}> = ({ ...props }) => {
  const tableRef = useRef<TableType>(null)
  const { data, handleUserClick, deleteRow, onSortChange, onServerSideFilter } = props

  const [serverFilters, setFilter] = useState()
  const [{ sortField, sortOrder }, setSort] = useState<TableSort>({})

  const getServerSideFilters = (filter: {
    [x: string]: { value: string | string[] | number | number[]; matchMode: string }
  }) => {
    let initialValue = {} as IFeeTagFilter
    const getValue = (key: keyof IFeeTagFilter) => (filter[key].value ?? filter[key]) as string
    const calculate = (key: keyof IFeeTagFilter) => {
      return getValue(key)
    }
    Object.keys(filter).forEach(key => {
      const val = calculate(key as keyof IFeeTagFilter)
      initialValue = {
        ...initialValue,
        [key]: val === '' ? undefined : val,
      }
    })
    return initialValue
  }

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
      <div className="pt-0 pb-3 px-4 bg-white rounded">
        <Table
          ref={tableRef}
          emptyMessage={<MissingDataPlaceholder>{messages.emptyTable}</MissingDataPlaceholder>}
          value={data || []}
          sortField="description"
          sortOrder={1}
          rowHover
          className={styles.tablewithEdit}
          autoLayout
          onFilter={({ filters }) => {
            setFilter(filters)
            onServerSideFilter(getServerSideFilters(filters))
          }}
          lazy
          filters={serverFilters}
          {...props}
          {...sortProps}
        >
          <Column
            {...generateColumnProps('chargeCode')}
            body={(item: FeeTagType) => <strong className="text-dark">{item.chargeCode}</strong>}
          />
          <Column {...generateColumnProps('stateCode')} />
          <Column {...generateColumnProps('productCode')} />
          <Column {...generateColumnProps('tagName')} />

          <Column
            key="_tools_"
            className={styles.editColumn}
            body={(item: FeeTagType) => <AddonTools row={item} onEdit={handleUserClick} onDelete={deleteRow} />}
          />
        </Table>
      </div>
    </>
  )
}

export default FeeTagConfigurationsContainer
