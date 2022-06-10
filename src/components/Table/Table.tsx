import { forwardRef, ReactNode } from 'react'
import cls from 'classnames'
import { DataTable as PrimeTable, DataTableProps as PrimeTableProps } from 'primereact/datatable'
import type { DataTable as PrimeTableType } from 'primereact/datatable'
import styles from './Table.module.scss'

export type TableProps = PrimeTableProps & {
  children?: ReactNode
  darkText?: boolean
}

export type TableType = PrimeTableType

export type MatchMode = 'contains' | 'endsWith' | 'equals' | 'in' | 'custom' | 'startsWith'

export type TableFilterType = (value: unknown, field: string, matchMode?: MatchMode) => void

/**
 * Documentation: https://primefaces.org/primereact/showcase/#/datatable
 */
const Table = forwardRef<PrimeTableType, TableProps>(({ className, darkText, onSelectionChange, ...props }, ref) => {
  return (
    <div className={cls(styles.wrapper, onSelectionChange && styles.selectable)}>
      <PrimeTable
        resizableColumns
        columnResizeMode="expand"
        ref={ref}
        onSelectionChange={onSelectionChange}
        {...props}
        className={cls(styles.table, darkText && styles.darkText, className)}
      />
    </div>
  )
})

export default Table
