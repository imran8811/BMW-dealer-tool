import { FC, useRef, useState, useCallback, useMemo, ComponentProps, SyntheticEvent } from 'react'

import useInventory, { IFilterInventory, InventoryItem, VinAccessoryType } from '@common/endpoints/useInventory'
import Table, { Column, TableType, TableProps, TableFilterType, MatchMode } from '@components/Table'
import FullscreenGallery from '@components/FullscreenGallery'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import Button from '@components/Button'
import Currency from '@components/Currency'
import NumberDisplay from '@components/NumberDisplay'
import MultiSelect from '@components/MultiSelect'
import Dialog from '@components/Dialog'
import { useModal } from 'react-modal-hook'
import { SelectOption } from '@common/utilities/selectOptions'
import useReferenceData from '@common/endpoints/useReferenceData'
import { AccessoryRequest, Lookups, VehicleAccessories } from '@common/endpoints/typings.gen'
import Select from '@components/Select'
import cls from 'classnames'
import { AccessoryType } from '@common/endpoints/useAccessories'
import useFeatureFlag from '@common/utilities/useFeatureFlag'
import { TableSort } from '@containers/FeesConfiguration/components/BetterTable/BetterTable'
import useAddonFeature from '@common/utilities/tenantFeaturesFlags'
import { Menu } from 'primereact/menu'
import EditButton from '@components/EditButton'
import useBulkUpdate from './useBulkUpdate'
import StateColumn, { messages as stateMessages } from './components/StateColumn'
import AssociatedList from './components/associationList'
import Header from './components/Header'
import styles from './inventory.module.scss'
import InventoryUpdateColumn from './components/inventoryUpdateColumn'
import EditablePriceColumn from './components/priceColumn'
import CustomerReferral from './components/CustomerReferal'

type AccessoriesType = AccessoryRequest & {
  name: string
}
type InventoryAccessoryType = InventoryItem & {
  accessories: AccessoriesType[]
}
const messages = {
  viewImages: 'View images',
  dateFormat: 'MM/DD/YYYY',
  emptyTable: 'No data available in table',
  showMore: 'Load more',
  dateMask: '99/99/9999',
  columns: {
    makeModel: 'Make/Model',
    vin: 'VIN',
    publish: 'Listing Status',
    status: 'Status',
    typeName: 'Vehicle Type',
    stockNumber: 'Stock Number',
    photoUrls: 'Images',
    mileage: 'Mileage',
    msrp: 'MSRP',
    dailyInventoryUpdate: 'Daily Update',
    internetPrice: 'Selling price',
    accessories: 'Add-ons',
  },
  filterPlaceholders: {
    makeModel: 'Search by Make/Model',
    vin: 'Search by VIN',
    publish: 'Search by State',
    status: 'Search by Status',
    typeName: 'Search by Vehicle Type',
    stockNumber: 'Search by Stock No',
    mileage: 'Search by Mileage',
    msrp: 'Search by MSRP',
    dailyInventoryUpdate: 'Search by State',
    internetPrice: 'Search by Price',
    addon: 'Search by Add-ons',
  },
}

type ColumnMessage = { [K in keyof InventoryItem]?: string }

const generateColumnProps = (
  field: keyof InventoryItem,
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
const inventoryFilterOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]
const pageSize = 5

const InventoryTools: FC<{
  row: InventoryItem
  onSendEmail: (row: InventoryItem) => unknown
}> = ({ row, onSendEmail }) => {
  const menuRef = useRef<Menu>(null)
  const cb = useCallback((evt: SyntheticEvent): void => menuRef.current?.toggle(evt), [menuRef])
  const handleEmail = useCallback(() => onSendEmail(row), [row, onSendEmail])

  return (
    <>
      <EditButton onClick={cb} icon="settings" />
      <Menu ref={menuRef} popup appendTo={document?.body} model={[{ label: 'Send Referral', command: handleEmail }]} />
    </>
  )
}

const InventoryContainer: FC<
  TableProps & {
    dealerCode?: string
    accessoriesData: AccessoryType[] | undefined
    descriptionOptions: SelectOption[]
    onSelectVin: (e: VinAccessoryType[]) => unknown
  }
> = ({ accessoriesData, onSelectVin, descriptionOptions, dealerCode, className, ...props }) => {
  const tableRef = useRef<TableType>(null)
  const [clientFilters, setClientFilters] = useState()
  const [referralVin, setReferralVin] = useState('')
  const [serverFilters, setServerFilters] = useState<IFilterInventory | null>(null)
  const [{ sortField, sortOrder }, setSort] = useState<TableSort>({})
  const { featureFlags } = useFeatureFlag<boolean>()
  const { isModuleAccessible: isAddonAccessible } = useAddonFeature(dealerCode)
  const { pageData, isLoading, total, setSize, size } = useInventory(
    dealerCode || '',
    { pageSize, sortBy: sortField, sortOrder, ...(serverFilters || {}) },
    { errorRetryInterval: 20000, revalidateOnFocus: false },
  )
  const { data: referenceData } = useReferenceData(['Category', 'InstallationMode', 'VehicleType'])

  const categoryOption = useMemo(() => {
    const options = [...new Set(referenceData?.[0]?.map((item: Lookups) => item))]
    return options.map(value => ({ label: value.displayName, value: value.code }))
  }, [referenceData])
  const installModeOption = useMemo(() => {
    const options = [...new Set(referenceData?.[1]?.map((item: Lookups) => item))]
    return options.map(value => ({ label: value.displayName, value: value.code }))
  }, [referenceData])
  const vehicleConditionOptions = useMemo(() => {
    const options = [...new Set(referenceData?.[2].map((value: Lookups) => value))]
    return options.map(value => ({ label: value.displayName, value: value.displayName }))
  }, [referenceData])
  // Derived props & callbacks
  const [selectedVins, setSelectedVins] = useState<InventoryItem['vin'][]>([])
  const isSelected = useCallback((vin: InventoryItem['vin']): boolean => new Set(selectedVins).has(vin), [selectedVins])
  const selectedRows = useMemo(() => pageData.filter(({ vin }) => isSelected(vin)), [pageData, isSelected])
  const { mutate: overrideAction, isLoading: isUpdating, columnTarget: publishTarget } = useBulkUpdate(
    'publish',
    selectedRows,
  )
  const {
    mutate: overrideDailyUpdateAction,
    isLoading: isDailyUpdateLoading,
    columnTarget: dailyUpdateTarget,
  } = useBulkUpdate('dailyInventoryUpdate', selectedRows)
  const onFilter = useCallback<TableFilterType>(
    (value, field, matchMode) => tableRef?.current?.filter(value, field, (matchMode || 'contains') as string),
    [tableRef],
  )
  const showMore = async () => {
    await setSize(size + 1)
  }
  const statusFilterOptions = () => {
    const options = ['Available', 'InInquiry', 'InContract', 'UnAvailable']
    return options.map(value => ({ label: value === 'InInquiry' ? 'Inquiry' : value, value }))
  }
  const [publishFilterValue, setPublishFilterValue] = useState<InventoryItem['publish'][]>()
  const [typeNameFilterValue, setTypeNameFilterValue] = useState<InventoryItem['typeName'][]>()
  const [statusFilterValue, setStatusFilterValue] = useState<InventoryItem['status'][]>()
  const [inventoryUpdateFilterValue, setInventoryUpdateFilterValue] = useState<
    InventoryItem['dailyInventoryUpdate'][]
  >()
  const [descriptionFilterValue, setDescriptionFilterValue] = useState('')
  const [selectedItem, setSelectedItem] = useState<InventoryItem>()
  const [showList, hideList] = useModal(
    () => (
      <Dialog
        blockScroll={featureFlags('tempAccessoryUIFlag')}
        onHide={() => {
          hideList()
        }}
        visible
        className={styles.dialog}
        header={
          <Header
            header={{
              heading: selectedItem?.makeModel || '',
              subheading: `VIN: ${selectedItem?.vin || ''}`,
              imageUrl: selectedItem?.photoUrls?.[0] || '',
            }}
          />
        }
      >
        <AssociatedList
          accessoriesData={accessoriesData}
          categoryOption={categoryOption}
          installModeOption={installModeOption}
          descriptionOptions={descriptionOptions}
          onCloseAccessory={hideList}
          item={selectedItem}
          dealerCode={dealerCode}
        />
      </Dialog>
    ),
    [selectedItem, categoryOption, installModeOption, descriptionOptions, accessoriesData, dealerCode],
  )

  const addonFilterFunction = (value: VehicleAccessories[], filter: string) => {
    return value?.find(e => e?._accessoryId === filter)
  }

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
    let initialValue = {} as IFilterInventory
    const getValue = (key: keyof IFilterInventory) => (filter[key].value ?? filter[key]) as string
    const processDate = (date: string) => {
      const expr = date.split('/')
      const numeric = (str: string) => {
        return str.includes('_') ? '' : str
      }
      const dateStr = [numeric(expr[2]), numeric(expr[0]), numeric(expr[1])] // [YYYY,MM,DD]
      if (dateStr.join('-').length !== 10) return

      return new Date(Number(dateStr[0]), Number(dateStr[1]) - 1, Number(dateStr[2]), 0, 0, 0, 0).toISOString()
    }
    const calculate = (key: keyof IFilterInventory) => {
      if (key === 'loadedOn' || key === 'updatedAt') return processDate(getValue(key))
      if (key === 'publish' || key === 'dailyInventoryUpdate') return getValue(key).length > 1 ? '' : getValue(key)
      return getValue(key)
    }
    Object.keys(filter).forEach(key => {
      const val = calculate(key as keyof IFilterInventory)
      initialValue = {
        ...initialValue,
        [key]: val === '' ? undefined : val,
      }
    })
    return initialValue
  }

  const [showReferral, onHideReferral] = useModal(
    () => <CustomerReferral onHide={onHideReferral} vin={referralVin} />,
    [referralVin],
  )

  // Render
  return (
    <>
      <div className="pt-0 pb-3 px-4 bg-white rounded">
        <Table
          ref={tableRef}
          onPage={() => {}} // If not defined dynamic `rows` isn't working
          emptyMessage={<MissingDataPlaceholder>{messages.emptyTable}</MissingDataPlaceholder>}
          value={pageData || []}
          // rows={limit} // commenting for auto loading
          totalRecords={total}
          selection={selectedRows}
          onSelectionChange={({ value }: { value: InventoryItem[] }) => {
            setSelectedVins(value.map(({ vin }) => vin))
            onSelectVin(value.map(({ vin, accessories }) => ({ vin, accessories })))
          }}
          className={styles['inventory-table']}
          onFilter={({ filters }) => {
            setClientFilters(filters)
            setServerFilters(getServerSideFilters(filters))
          }}
          lazy
          filters={clientFilters}
          sortField="updatedAt"
          sortOrder={-1}
          rowHover
          autoLayout
          {...props}
          {...sortProps}
        >
          <Column selectionMode="multiple" />
          <Column {...generateColumnProps('stockNumber')} />
          <Column
            {...generateColumnProps('makeModel')}
            body={(item: InventoryItem) => <strong className="text-dark">{item.makeModel}</strong>}
          />
          <Column {...generateColumnProps('vin')} />
          <Column
            {...generateColumnProps('publish')}
            filterElement={
              <div className={styles.toggleSwitchWrap}>
                <MultiSelect
                  small
                  name="publish"
                  onChange={e => {
                    onFilter(e?.value, 'publish', 'in')
                    setPublishFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.publish}
                  value={publishFilterValue}
                  options={
                    ([
                      {
                        label: stateMessages.listed,
                        value: true,
                      },
                      {
                        label: stateMessages.unlisted,
                        value: false,
                      },
                    ] as unknown) as SelectOption[]
                  }
                />
              </div>
            }
            body={({ publish, vin }: InventoryItem) => {
              const isColumnSelected = isSelected(vin)
              return (
                <StateColumn
                  publish={publish}
                  vin={vin}
                  overrideAction={isColumnSelected ? overrideAction : undefined}
                  isBulkLoading={isColumnSelected && isUpdating}
                  publishTarget={publishTarget}
                />
              )
            }}
          />
          <Column
            {...generateColumnProps('status')}
            filterElement={
              <div style={{ minWidth: '200px' }}>
                <MultiSelect
                  name="status"
                  small
                  value={statusFilterValue}
                  onChange={e => {
                    onFilter(e?.value, 'status', 'in')
                    setStatusFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.status}
                  options={statusFilterOptions()}
                />
              </div>
            }
            body={({ status }: InventoryItem) => (
              <span className="text-dark">{status === 'InInquiry' ? 'Inquiry' : status}</span>
            )}
          />
          <Column
            {...generateColumnProps('typeName')}
            filterElement={
              <div className={styles.toggleSwitchWrap}>
                <MultiSelect
                  small
                  name="typeName"
                  onChange={e => {
                    onFilter(e?.value, 'typeName', 'in')
                    setTypeNameFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.typeName}
                  value={typeNameFilterValue}
                  options={vehicleConditionOptions}
                />
              </div>
            }
          />
          {isAddonAccessible && (
            <Column
              {...generateColumnProps('accessories')}
              filterFunction={addonFilterFunction}
              filterElement={
                <div style={{ minWidth: '200px' }}>
                  <Select
                    name="accessories"
                    selectClass={cls([styles.selectClass, descriptionFilterValue.length > 0 && styles.noBackground])}
                    containerClass="mb-0"
                    onClear={
                      descriptionFilterValue.length > 0
                        ? () => {
                            setDescriptionFilterValue('')
                            onFilter('', 'accessories', 'custom')
                          }
                        : undefined
                    }
                    value={descriptionFilterValue}
                    onChange={e => {
                      onFilter(e?.target.value, 'accessories', 'custom')
                      setDescriptionFilterValue(e?.target.value)
                    }}
                    placeholder={messages.filterPlaceholders.addon}
                    options={descriptionOptions}
                  />
                </div>
              }
              body={(item: InventoryAccessoryType) => (
                <button
                  onClick={() => {
                    setSelectedItem(item)
                    showList()
                  }}
                  className={styles['clickable-link']}
                >
                  <>
                    <span key={item?.accessories?.[0]?._accessoryId} className="text-dark">
                      {item?.accessories?.[0]?.name || '...'}
                    </span>
                  </>
                </button>
              )}
            />
          )}
          <Column
            {...generateColumnProps('photoUrls', { sortable: false, filter: false })}
            body={({ photoUrls }: InventoryItem) =>
              photoUrls && photoUrls.length > 0 ? (
                <FullscreenGallery value={photoUrls}>{messages.viewImages}</FullscreenGallery>
              ) : null
            }
          />
          <Column
            {...generateColumnProps('mileage')}
            body={({ mileage }: InventoryItem) => <NumberDisplay className="text-dark" value={mileage} />}
          />
          <Column
            {...generateColumnProps('msrp')}
            body={({ msrp }: InventoryItem) => (
              <Currency skipDecimals className="text-dark font-weight-bold" value={msrp} />
            )}
          />
          <Column
            {...generateColumnProps('internetPrice')}
            body={({ internetPrice, vin }: InventoryItem) => (
              <EditablePriceColumn vin={vin} internetPrice={internetPrice} />
            )}
          />
          <Column
            {...generateColumnProps('dailyInventoryUpdate')}
            filterElement={
              <div className={styles.toggleSwitchWrap}>
                <MultiSelect
                  name="dailyInventoryUpdate"
                  small
                  value={inventoryUpdateFilterValue}
                  onChange={e => {
                    onFilter(e?.value, 'dailyInventoryUpdate', 'in')
                    setInventoryUpdateFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.dailyInventoryUpdate}
                  options={(inventoryFilterOptions as unknown) as SelectOption[]}
                />
              </div>
            }
            body={({ dailyInventoryUpdate, vin }: InventoryItem) => {
              const isColumnSelected = isSelected(vin)
              return (
                <InventoryUpdateColumn
                  dailyInventoryUpdate={dailyInventoryUpdate}
                  vin={vin}
                  overrideAction={isColumnSelected ? overrideDailyUpdateAction : undefined}
                  isBulkLoading={isColumnSelected && isDailyUpdateLoading}
                  dailyUpdateTarget={dailyUpdateTarget}
                />
              )
            }}
          />
          <Column
            key="_tools_"
            className={cls(styles.editColumn, { 'd-none': !featureFlags('tempCustomerReferalFlag') })}
            body={(item: InventoryItem) => (
              <InventoryTools
                row={item}
                onSendEmail={() => {
                  setReferralVin(item.vin)
                  showReferral()
                }}
              />
            )}
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

export default InventoryContainer
