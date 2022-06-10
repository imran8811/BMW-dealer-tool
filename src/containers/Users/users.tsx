import { FC, useCallback, useEffect, useRef, useState } from 'react'
import Table, { Column, TableFilterType, TableType } from '@components/Table'
import { UserAccount } from '@common/endpoints/useUsers'
import ProgressSpinner from '@components/ProgressSpinner'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import EditButtons from '@components/EditButton'
import MultiSelect from '@components/MultiSelect'
import Button from '@components/Button'
import cls from 'classnames'
import { SelectOption } from '@common/utilities/selectOptions'
import SwitchCell from './SwitchCell/SwitchCell'
import styles from './form/UserForm.module.scss'

const messages = {
  loadMore: 'Load more',
  emptyTable: 'No data available in table',
  rows: {
    fullName: 'First/last name',
    email: 'email id',
    phoneNumber: 'phone no',
    roleDisplayName: 'role',
    roleCode: 'role',
    isActive: 'status',
  },
  filterPlaceholders: {
    fullName: 'Search by Name',
    email: 'Search by Email ID',
    phoneNumber: 'Search by Phone No.',
    roleDisplayName: 'Search by Role',
    isActive: 'Search by Status',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
  roles: {
    DealerAdmin: 'Dealer Admin',
    DealerAgent: 'Dealer Agent',
  },
}

const statusFilterOptions = [
  { label: 'Inactive', value: false },
  { label: 'Active', value: true },
]

const generateColumnProps = (
  field: keyof UserAccount,
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

interface IUsers {
  handleUserClick: (item: UserAccount) => void
  data?: Array<UserAccount>
  isLoading: boolean
  dealerCode?: string
  isValidating: boolean
}

const mapUserRolesToDisplay = (role?: string) => {
  if (role === 'DealerAdmin' || role === 'DealerAgent') {
    return messages.roles[role]
  }
  return role
}

const Users: FC<IUsers> = ({ isValidating, handleUserClick, data, isLoading, dealerCode }) => {
  const defaultListSize = 20

  const tableRef = useRef<TableType>(null)
  const [statusFilter, setStatusFilter] = useState<UserAccount['isActive'][]>()
  const [roleFilter, setRoleFilter] = useState<UserAccount['roleDisplayName']>()
  const [listSize, setListSize] = useState<number>(defaultListSize)

  const onFilter = useCallback<TableFilterType>(
    (value, field, matchMode) => tableRef?.current?.filter(value, field, (matchMode || 'contains') as string),
    [tableRef],
  )

  useEffect(() => {
    if (tableRef.current && !isValidating && !tableRef.current.state.filters) {
      setRoleFilter('')
      setStatusFilter([])
    }
  }, [isLoading, isValidating, dealerCode])

  if (isLoading) {
    return (
      <div className="py-5 text-center rounded bg-white">
        <ProgressSpinner />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <MissingDataPlaceholder>{messages.emptyTable}</MissingDataPlaceholder>
  }

  return (
    <section style={{ marginBottom: 120 }}>
      <Table
        onPage={() => {}} // Required, otherwise dynamic rows are not working
        value={data || []}
        rowHover
        autoLayout
        className={cls([styles.tablewithEdit, 'pt-0 pb-3 px-4'])}
        ref={tableRef}
        rows={listSize}
      >
        <Column
          {...generateColumnProps('fullName')}
          body={(item: UserAccount) => (
            <strong>
              {item.firstName} {item.lastName}
            </strong>
          )}
        />
        <Column
          {...generateColumnProps('email')}
          body={(item: UserAccount) => <a href={`mailto:${item.email || ''}`}>{item.email}</a>}
        />
        <Column {...generateColumnProps('phoneNumber')} body={(item: UserAccount) => <span>{item.phoneNumber}</span>} />
        <Column
          {...generateColumnProps('roleCode')}
          body={(item: UserAccount) => <span>{mapUserRolesToDisplay(item.roleDisplayName)}</span>}
          filterElement={
            <MultiSelect
              name="roleCode"
              small
              onChange={e => {
                onFilter(e?.value, 'roleCode', 'in')
                setRoleFilter(e?.value)
              }}
              placeholder={messages.filterPlaceholders.roleDisplayName}
              value={roleFilter}
              options={[
                {
                  label: messages.roles.DealerAdmin,
                  value: 'DealerAdmin',
                },
                {
                  label: messages.roles.DealerAgent,
                  value: 'DealerAgent',
                },
              ]}
            />
          }
        />
        <Column
          {...generateColumnProps('isActive')}
          sortable
          filter
          body={(item: UserAccount) => <SwitchCell {...item} />}
          filterElement={
            <MultiSelect
              name="isActive"
              small
              onChange={e => {
                onFilter(e?.value, 'isActive', 'in')
                setStatusFilter(e?.value)
              }}
              placeholder={messages.filterPlaceholders.isActive}
              value={statusFilter}
              options={(statusFilterOptions as unknown) as SelectOption[]}
            />
          }
        />
        <Column
          className={cls(styles.editColumn)}
          body={(item: UserAccount) => <EditButtons onClick={() => handleUserClick(item)} />}
        />
      </Table>
      {data.length >= listSize && (
        <Button
          tertiary
          fullWidth
          className="mt-5"
          onClick={() => {
            setListSize(listSize + defaultListSize)
          }}
        >
          {messages.loadMore}
        </Button>
      )}
    </section>
  )
}

export default Users
