import { FC, useRef, useCallback, useState, SyntheticEvent, ComponentProps } from 'react'
import Table, { Column, TableFilterType, TableType } from '@components/Table'
import MultiSelect from '@components/MultiSelect'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import EditButton from '@components/EditButton'
import { Accessories } from '@common/endpoints/typings.gen'
import { SelectOption } from '@common/utilities/selectOptions'
import { AccessoryType, IAccessoryFilter } from '@common/endpoints/useAccessories'
import Select from '@components/Select'
import cls from 'classnames'
import { Menu } from 'primereact/menu'
import { TableSort } from '@containers/FeesConfiguration/components/BetterTable/BetterTable'
import useFeatureFlag from '@common/utilities/useFeatureFlag'
import SwitchCell from './components/SwitchCell'
import styles from './components/addons.module.scss'

const messages = {
  dateFormat: 'MM/DD/YYYY',
  emptyTable: 'No data available in table',
  rows: {
    name: 'Product Name',
    description: 'Description',
    category: 'Category',
    isActive: 'Status',
    partNo: 'Part No.',
    price: 'Price ($)',
    supplier: 'Offered By',
    installationMode: 'Installation Mode',
    residualValueAdder: 'Rv Adder',
    compatibleModels: 'Compatible Models',
    vehicleType: 'Vehicle Type',
  },
  filterPlaceholders: {
    description: 'Search by Description',
    name: 'Search by Product Name',
    category: 'Search by Category',
    status: 'Search by Status',
    partNo: 'Search by Part No.',
    price: 'Search by Price ($)',
    supplier: 'Search by Offered By',
    installationMode: 'Search by Installation Mode',
    residualValueAdder: 'Search by Rv Adder',
    compatibleModels: 'Search by Compatible Models',
    vehicleType: 'Search by Vehicle Type',
  },
  loadMore: 'Load More',
  statusFilterOptions: [
    { value: true, label: 'Active' },
    { value: false, label: 'In Active' },
  ],
}

const AddonTools: FC<{
  row: AccessoryType
  onEdit: (row: AccessoryType) => unknown
  onDelete: (row: AccessoryType) => unknown
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
  field: keyof Accessories,
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

const AccessoriesConfigurationsContainer: FC<{
  dealerCode: string
  categoryOptions: SelectOption[]
  data: AccessoryType[]
  modalOptions: SelectOption[]
  isLoading: boolean
  isValidating: boolean
  deleteRow: (e: AccessoryType) => unknown
  handleUserClick: (item: AccessoryType) => void
  InstallationOptions: SelectOption[]
  onServerSideFilter: (params: IAccessoryFilter) => unknown
  onSortChange: (evt: { sortField?: string; sortOrder?: number }) => unknown
  vehicleConditions?: SelectOption[]
}> = ({ ...props }) => {
  const tableRef = useRef<TableType>(null)
  const {
    data,
    handleUserClick,
    deleteRow,
    InstallationOptions,
    modalOptions,
    categoryOptions,
    onSortChange,
    onServerSideFilter,
    vehicleConditions,
  } = props

  const { featureFlags } = useFeatureFlag()
  const [serverFilters, setFilter] = useState()
  const [{ sortField, sortOrder }, setSort] = useState<TableSort>({})
  const [statusFilter, setStatusFilter] = useState<AccessoryType['isActive'] | null>()
  const [categoryFilter, setCategoryFilter] = useState<string>()
  const [compatibleModalsFilter, setCompatibleModalsFilter] = useState<string>('')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('')
  const [installModeFilter, setInstallModeFilter] = useState<AccessoryType['installationMode'] | null>()

  const onFilter = useCallback<TableFilterType>(
    (value, field, matchMode) => tableRef?.current?.filter(value, field, (matchMode || 'contains') as string),
    [tableRef],
  )

  const installationFitlerMethod = (value: AccessoryType['installationMode'], filter: string[]) => {
    return filter.find(e => e === value.code)
  }

  const mutliSelectFunctions = (value: AccessoryType['compatibleModels'], filter: string) => {
    return value?.find(e => e?.code === filter)
  }

  const categoryFilterFunction = (value: AccessoryType['category'], filter: string[]) => {
    return filter.find(e => e === value.code)
  }

  const getServerSideFilters = (filter: {
    [x: string]: { value: string | string[] | number | number[]; matchMode: string }
  }) => {
    let initialValue = {} as IAccessoryFilter
    const getValue = (key: keyof IAccessoryFilter) => (filter[key].value ?? filter[key]) as string
    const calculate = (key: keyof IAccessoryFilter) => {
      if (key === 'isActive') return getValue(key).length > 1 ? '' : getValue(key)
      return getValue(key)
    }
    Object.keys(filter).forEach(key => {
      const val = calculate(key as keyof IAccessoryFilter)
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
          {featureFlags('tempAccessoryUIFlag') && (
            <Column
              {...generateColumnProps('name')}
              body={(item: AccessoryType) => <strong className="text-dark text-uppercase">{item.name}</strong>}
            />
          )}
          <Column
            {...generateColumnProps('description')}
            body={(item: AccessoryType) => <strong className="text-dark text-uppercase">{item.description}</strong>}
          />
          <Column
            {...generateColumnProps('category')}
            field="category.displayName"
            filterFunction={categoryFilterFunction}
            filterElement={
              <MultiSelect
                name="category"
                small
                id="category"
                className={styles['select-filter-status']}
                value={categoryFilter}
                onChange={e => {
                  onFilter(e?.value, 'category', 'custom')
                  setCategoryFilter(e?.value)
                }}
                placeholder={messages.filterPlaceholders.category}
                options={categoryOptions}
              />
            }
            body={(item: AccessoryType) => <span className="text-dark">{`${item.category.displayName}`}</span>}
          />
          <Column
            {...generateColumnProps('isActive')}
            body={(item: AccessoryType) => <SwitchCell key={item._id} {...item} />}
            filterElement={
              <MultiSelect
                name="isActive"
                small
                id="isActive"
                className={styles['select-filter-status']}
                value={statusFilter}
                onChange={e => {
                  onFilter(e?.value, 'isActive', 'in')
                  setStatusFilter(e?.value)
                }}
                placeholder={messages.filterPlaceholders.status}
                options={(messages.statusFilterOptions as unknown) as SelectOption[]}
              />
            }
          />
          {featureFlags('tempVehicleConditionInAddon') && (
            <Column
              {...generateColumnProps('vehicleType')}
              body={(item: AccessoryType) => (
                <span className="text-dark">{item.vehicleType?.map(e => e.displayName)?.join(', ')}</span>
              )}
              filterFunction={mutliSelectFunctions}
              filterElement={
                <MultiSelect
                  small
                  name="vehicleType"
                  className={styles['select-filter-status']}
                  id="vehicleType"
                  value={vehicleTypeFilter}
                  onChange={e => {
                    onFilter(e?.value, 'vehicleType', 'custom')
                    setVehicleTypeFilter(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.vehicleType}
                  options={vehicleConditions}
                />
              }
            />
          )}
          <Column
            {...generateColumnProps('partNo')}
            body={(item: AccessoryType) => <span className="text-dark">{item.partNo}</span>}
          />
          <Column
            {...generateColumnProps('price')}
            body={(item: AccessoryType) => <span className="text-dark">{`$${item.price}`}</span>}
          />
          <Column
            {...generateColumnProps('supplier')}
            body={(item: AccessoryType) => <span className="text-dark">{item.supplier}</span>}
          />
          <Column
            {...generateColumnProps('installationMode')}
            field="installationMode.displayName"
            body={(item: AccessoryType) => <span className="text-dark">{item.installationMode.displayName}</span>}
            filterElement={
              <MultiSelect
                small
                name="installationMode"
                className={styles['select-filter-status']}
                id="installationMode"
                value={installModeFilter}
                onChange={e => {
                  onFilter(e?.value, 'installationMode', 'custom')
                  setInstallModeFilter(e?.value)
                }}
                placeholder={messages.filterPlaceholders.installationMode}
                options={InstallationOptions}
              />
            }
            filterFunction={installationFitlerMethod}
          />
          <Column
            {...generateColumnProps('residualValueAdder')}
            body={(item: AccessoryType) => <span className="text-dark">{`$${item.residualValueAdder}`}</span>}
          />
          <Column
            {...generateColumnProps('compatibleModels')}
            body={(item: AccessoryType) => (
              <span className="text-dark">{item.compatibleModels.map(e => e.displayName).join(', ')}</span>
            )}
            filterFunction={mutliSelectFunctions}
            filterElement={
              <Select
                name="compatibleModels"
                selectClass={cls([styles.selectClass, compatibleModalsFilter.length > 0 && styles.noBackground])}
                containerClass="mb-0"
                onClear={
                  compatibleModalsFilter.length > 0
                    ? () => {
                        setCompatibleModalsFilter('')
                        onFilter('', 'compatibleModels', 'custom')
                      }
                    : undefined
                }
                value={compatibleModalsFilter}
                onChange={e => {
                  onFilter(e?.target.value, 'compatibleModels', 'custom')
                  setCompatibleModalsFilter(e?.target.value)
                }}
                placeholder={messages.filterPlaceholders.compatibleModels}
                options={modalOptions}
              />
            }
          />
          <Column
            key="_tools_"
            className={styles.editColumn}
            body={(item: AccessoryType) => <AddonTools row={item} onEdit={handleUserClick} onDelete={deleteRow} />}
          />
        </Table>
      </div>
    </>
  )
}

export default AccessoriesConfigurationsContainer
