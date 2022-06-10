/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * This component builds on top of PrimeReact's table and implements
 * common patterns for the dealer tool.
 */
import Table, { Column, TableType } from '@components/Table'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import React, { ComponentProps, ReactNode, useCallback, useRef, useState } from 'react'

/**
 * Defines properties of a column.
 */
export interface ColumnDef<Value = any, Row = any> {
  // header displayed at the top of the column
  header: string
  // template for the cell's body
  template?: (row: Row) => ReactNode
  // definition for filtering
  filter?: FilterDef<Value>
  // definition for sorting
  sort?:
    | boolean
    | {
        field?: string
      }
}

export interface FilterDef<FilterType = any, ColType = any, SFType = any> {
  // Placeholder for the default filter widget.
  placeholder?: string
  // Match mode used by the default filter function. See PrimeReact's Table
  // for details.
  matchMode?: string
  // type of the filter text field (<input type="???">)
  type?: string
  // Renders the custom filter widget. It receives `value` and `onChange`
  // arguments to help with maintining value.
  render?: (params: FilterRenderParams<FilterType>) => ReactNode
  // Function which is supposed to convert filter value to a value which
  // can be used for server-side filtering
  getServerSide?: (value: FilterType) => SFType
  // A function which can be used for customizing how client-side filter works
  custom?: (value: ColType, filter: FilterType) => boolean
  // Property name to use when outputting server-side filters
  serverField?: string
}

export interface FilterRenderParams<T = any> {
  value?: T
  onChange: (value: T) => unknown
}

type Filters<Keys extends string | number | symbol> = Partial<Record<Keys, { value: any; matchMode: string }>>
export type TableSort = { sortOrder?: number; sortField?: string }

interface BetterTableProps<Columns, Row = unknown> {
  // items of data to display
  items: Row[]
  // column definitions
  columns: Columns
  // if filtering and sorting will be applied server-side
  serverSide?: boolean
  // element to show on empty data
  emptyMessage?: ReactNode
  // emitted when filters on the table change
  onFiltersChange?: (params: { filters: Filters<keyof Columns>; serverFilters: any }) => unknown
  // additional column with tools
  tools?: (row: Row) => ReactNode
  // sort handler which can be used for server-side sorting
  onSortChange?: (params: TableSort) => unknown
  // show text in black instead of gray by default
  darkText?: boolean
}

const getServerSideFilters = (columns: Record<string, ColumnDef>, values: Filters<string>): Record<string, any> => {
  const result: Record<string, any> = {}

  Object.keys(columns).forEach(key => {
    const col = columns[key]
    let val = values[key]?.value

    if (val != null) {
      if (col.filter?.getServerSide != null) {
        val = col.filter.getServerSide(val)
      }

      result[col.filter?.serverField ?? key] = val
    }
  })

  return result
}

const defaultMatchMode = 'startsWith'

const messages = {
  emptyTable: 'No data available in table',
}

const hasSort = (columns: ColumnDef<any, any>[]): boolean => columns.filter(col => !!col.sort).length > 0

const BetterTable = <Row, Columns extends Record<string, ColumnDef<any, Row>>>({
  items,
  serverSide,
  columns,
  emptyMessage,
  darkText,
  onFiltersChange,
  tools,
  onSortChange,
}: BetterTableProps<Columns, Row>) => {
  const [filters, setFilters] = useState<any>({})
  const tableRef = useRef<TableType>(null)
  /* The only way to apply a filter with all logic is to call .filter() method on the table. */
  const applyFilter = useCallback((field: string, value: unknown, mode: string) => {
    tableRef.current?.filter(value, field, mode)
  }, [])
  /* for sorting we will need to handle our own state */
  const [{ sortField, sortOrder }, setSort] = useState<TableSort>({})
  const handleSortChange = useCallback(
    (evt: { sortField: string; sortOrder: number }) => {
      const { sortField, sortOrder } = evt
      setSort({ sortField, sortOrder })
      onSortChange?.({ sortField: sortField ?? undefined, sortOrder: sortOrder === 0 ? undefined : sortOrder })
    },
    [setSort, onSortChange],
  )

  const sortEnabled = hasSort(Object.values(columns))

  const renderColumn = (key: string, def: ColumnDef<any, any>) => {
    const { render, custom, matchMode } = def?.filter ?? {}
    const finalMode = matchMode || (custom != null ? 'custom' : defaultMatchMode)
    const filterElement =
      render?.({
        value: filters[key]?.value,
        onChange: (value: any) => applyFilter(key, value, finalMode),
      }) ?? undefined

    return (
      <Column
        key={key}
        field={key}
        filter={def.filter != null}
        filterField={key}
        filterPlaceholder={def.filter?.placeholder}
        filterType={def.filter?.type}
        filterMatchMode={finalMode}
        reorderable
        sortable={def.sort != null || def.sort === true}
        sortField={typeof def.sort === 'boolean' ? key : def.sort?.field ?? key}
        header={def.header}
        body={def.template}
        filterElement={filterElement}
        filterFunction={custom}
      />
    )
  }
  const sortProps: Partial<ComponentProps<typeof Table>> = !sortEnabled
    ? {}
    : {
        sortField,
        sortOrder,
        onSort: handleSortChange,
        sortMode: 'single',
        removableSort: true,
      }

  return (
    <>
      <Table
        dataKey="_id"
        value={items}
        rows={items.length}
        lazy={serverSide === true}
        rowHover
        ref={tableRef}
        filters={filters}
        emptyMessage={emptyMessage || <MissingDataPlaceholder>{messages.emptyTable}</MissingDataPlaceholder>}
        autoLayout
        darkText={darkText}
        onFilter={({ filters }) => {
          setFilters(filters)
          onFiltersChange?.({
            filters,
            serverFilters: getServerSideFilters(columns, filters),
          })
        }}
        {...sortProps}
        onPage={() => {}} // Required, otherwise dynamic rows are not working
      >
        {Object.entries(columns).map(([key, props]) => renderColumn(key, props))}
        {tools != null && <Column key="_tools_" body={tools} />}
      </Table>
    </>
  )
}

export default BetterTable
