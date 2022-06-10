import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { AccessoryRequest, CodeDisplayName, VehicleAccessories } from '@common/endpoints/typings.gen'
import Table, { Column, TableType, TableProps, MatchMode, TableFilterType } from '@components/Table'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import Button from '@components/Button'
import cls from 'classnames'
import MultiSelect from '@components/MultiSelect'
import NumberInput from '@components/NumberInput'
import ProgressSpinner from '@components/ProgressSpinner'
import Select from '@components/Select'
import {
  AccessoryReqType,
  deleteData,
  InventoryItem,
  useVehicalAccessory,
  invalidateVehicalAccessory,
  AccessoryRequestType,
} from '@common/endpoints/useInventory'
import { Controller, useForm } from 'react-hook-form'
import Input from '@components/Input'
import Form from '@components/Form'
import { SelectOption } from '@common/utilities/selectOptions'
import useMutation from 'use-mutation'
import sendForm, { selectErrorMessage } from '@common/utilities/sendForm'
import DeleteButtons from '@components/DeleteButton'
import { AccessoryType } from '@common/endpoints/useAccessories'
import useFeatureFlag from '@common/utilities/useFeatureFlag'
import { useModal } from 'react-modal-hook'
import Dialog from '@components/Dialog'
import FeatureFlag, { Off, On } from '@containers/FeatureFlag'
import { datafixObj } from './fixtures'
import styles from '../inventory.module.scss'
import AddRemoveAddon from './AddAddons'

type FormValues = {
  _accessoryId?: string
  name: string
  description: string
  category: string
  price: number
  supplier: string
  installationMode: string
  residualValueAdder: number
}
export const messages = {
  button: {
    cancel: 'Cancel',
    save: 'Save',
  },
  addAddon: 'Add New',
  cancelAdd: 'Back',
  emptyTable: 'No addon available',
  columns: {
    name: 'Product Name',
    description: 'description',
    category: 'category',
    price: 'price ($)',
    supplier: 'supplier',
    installationMode: 'Installation Mode',
  },
  filterPlaceholders: {
    name: 'Search By Product Name',
    description: 'Search By Description',
    category: 'Search By Category',
    price: 'Search By Price',
    supplier: 'Search By Supplier',
    installationMode: 'Search By Mode',
  },
  input: {
    description: 'Description',
    category: 'Category',
    price: 'Price',
    supplier: 'Supplier',
    installationMode: 'Installation Mode',
  },
  validation: {
    description: 'Description is Required',
    category: 'Category is Required',
    price: 'Price is Required',
    supplier: 'Supplier is Required',
    installationMode: 'InstallationMode is Required',
  },
}

const validation = (message: keyof typeof messages.validation) => ({
  required: {
    value: true,
    message: messages.validation[message],
  },
})

type ColumnMessage = { [K in keyof VehicleAccessories]?: string }

const generateColumnProps = (
  field: keyof VehicleAccessories,
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

const AssociationList: FC<
  TableProps & {
    dealerCode?: string
    accessoriesData: AccessoryType[] | undefined
    item: InventoryItem | undefined
    onCloseAccessory: () => unknown
    categoryOption: SelectOption[]
    installModeOption: SelectOption[]
    descriptionOptions: SelectOption[]
  }
> = ({
  descriptionOptions,
  accessoriesData,
  categoryOption,
  installModeOption,
  dealerCode,
  className,
  onCloseAccessory,
  item,
  ...props
}) => {
  const { featureFlags } = useFeatureFlag<boolean>()
  const { pageData, isLoading } = useVehicalAccessory(item?.vin || '')
  const { handleSubmit, register, control, errors, setValue, reset } = useForm<FormValues>()
  const tableRef = useRef<TableType>(null)
  const [supplierFilterValue, setSupplierFilterValue] = useState()
  const [descriptionFilterValue, setDescriptionFilterValue] = useState()
  const [categoryFilterValue, setCategoryFilterValue] = useState()
  const [categoryVal, setCategoryVal] = useState<string>('')
  const [descriptionVal, setDescriptionVal] = useState<string>('')
  const [nameVal, setNameVal] = useState<string>()
  const [selectedRow, setSetSelectedRow] = useState<VehicleAccessories>()
  const [installationModeVal, setInstallationModeVal] = useState<string>('')
  const [residualValueAdderVal, setResidualValueAdderVal] = useState<number>()
  const [modeFilterValue, setModeFilterValue] = useState()
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const datafixCompatibleModelsSD = (modal: CodeDisplayName, vinModal: string) => {
    if (modal.code === vinModal) return true
    // TODO: the below check should be removed in future
    if (datafixObj[vinModal as keyof typeof datafixObj] === modal.code) return true
    return false
  }
  /**
   * CR: `US 21725`
   * If 3 Addons with `PreInstalled` mode are selected, remove the `PreInstalled` Option
   */
  const installationModeOptionFilterd = useMemo(() => {
    const installationModeArr = pageData?.filter(f => f.installationMode.code === 'PreInstalled') || []
    if (installationModeArr?.length > 2) return installModeOption.filter(f => f.value !== 'PreInstalled')
    return installModeOption
  }, [pageData, installModeOption])

  const availableDescriptionOptions = useMemo(() => {
    const filtered =
      accessoriesData?.filter(f =>
        f.compatibleModels.find(modal => datafixCompatibleModelsSD(modal, item?.model || '')),
      ) || []
    const nonDuplicate = filtered.filter(f => (pageData?.find(p => p._accessoryId === f._id) ? undefined : f))
    return nonDuplicate?.map(value => ({ label: value.description, value: value._id }))
  }, [accessoriesData, item, pageData])

  const onFilter = useCallback<TableFilterType>(
    (value, field, matchMode) => tableRef?.current?.filter(value, field, (matchMode || 'contains') as string),
    [tableRef],
  )

  const codeDisplayObj = (e: string, options: SelectOption[]) => {
    const filtered = options?.filter(f => f.value === e)
    return {
      code: e,
      displayName: filtered?.[0]?.label || e,
    }
  }

  const [saveAccessory, { error, status }] = useMutation<FormValues, AccessoryReqType, Error>(
    (values): Promise<AccessoryReqType> => {
      // TODO: Feature Flag remove edit endpoint implementation
      const newValues = {
        description: codeDisplayObj(values.description, descriptionOptions).displayName,
        _accessoryId: values.description,
        name: nameVal,
        category: codeDisplayObj(values.category, categoryOption),
        price: values.price,
        supplier: values.supplier,
        installationMode: codeDisplayObj(values.installationMode, installModeOption),
        residualValueAdder: residualValueAdderVal,
      }
      const editValues = {
        ...selectedRow,
        installationMode: codeDisplayObj(values.installationMode, installModeOption),
        price: values.price,
        supplier: values.supplier,
        residualValueAdder: residualValueAdderVal,
      }
      const url = isEditing
        ? `/inventory-management/update-accessory/${item?.vin || ''}/${selectedRow?._accessoryId || ''}`
        : `/inventory-management/add-accessory-by-vin/${item?.vin || ''}`
      return sendForm<AccessoryReqType>(url, isEditing ? editValues : newValues, {
        withAuthentication: true,
        method: isEditing ? 'PUT' : 'POST',
      })
    },
    {
      onSuccess(data): void {
        void invalidateVehicalAccessory(data?.data)
        /**  If you want to close the accessory popup upon adding new entry
         * if (data.input.description) {
         *   onCloseAccessory()
         * }
         */
        reset()
        setCategoryVal('')
        setSetSelectedRow(undefined)
        setDescriptionVal('')
        setInstallationModeVal('')
        setIsEditing(false)
        setIsAdding(false)
      },
    },
  )

  const [deleteAccessory] = useMutation<VehicleAccessories, unknown, Error>(
    values => {
      const url = `/inventory-management/delete-accessory/${item?.vin || ''}/${values?._accessoryId}`
      return deleteData<AccessoryRequestType>(url, {
        withAuthentication: true,
        method: 'DELETE',
      })
    },
    {
      onSuccess(data): void {
        void invalidateVehicalAccessory(data.input)
        setSetSelectedRow(undefined)
      },
    },
  )

  const supplierFilterOptions = useMemo(() => {
    const options = [...new Set(pageData?.map(({ supplier }: VehicleAccessories) => supplier))]
    return options.map(value => ({ label: value, value }))
  }, [pageData])
  const descrptionFilterOptions = useMemo(() => {
    const options = [...new Set(pageData?.map(({ description }: VehicleAccessories) => description))]
    return options.map(value => ({ label: value, value }))
  }, [pageData])
  const modeFilterOptions = useMemo(() => {
    const options = [
      ...new Set(pageData?.map(({ installationMode }: VehicleAccessories) => installationMode?.displayName)),
    ]
    return options.map(value => ({ label: value, value }))
  }, [pageData])
  const categoryFilterOptions = useMemo(() => {
    const options = [...new Set(pageData?.map(({ category }: VehicleAccessories) => category?.displayName))]
    return options.map(value => ({ label: value, value }))
  }, [pageData])

  const sumOfPrice = useMemo(() => {
    const arrayofNumbers = pageData?.map(e => e.price)
    return arrayofNumbers && arrayofNumbers?.length > 0 ? arrayofNumbers?.reduce((a, b) => a + b) : 0
  }, [pageData])

  const categoryFitlerMethod = (value: AccessoryRequest['category'], filter: string[]) => {
    return filter.find(e => e === value.displayName)
  }
  const installationFitlerMethod = (value: AccessoryRequest['installationMode'], filter: string[]) => {
    return filter.find(e => e === value.displayName)
  }

  // Input Fields
  const descriptionField = () => {
    return (
      <Select
        name="description"
        label={messages.input.description}
        options={availableDescriptionOptions}
        value={descriptionVal}
        onChange={({ target: { value } }) => {
          setDescriptionVal(value)
          const selected = accessoriesData?.find(e => e._id === value)
          setCategoryVal(selected?.category.code || '')
          setInstallationModeVal(selected?.installationMode.code || '')
          setValue('category', selected?.category.code || '')
          setValue('supplier', selected?.supplier || '')
          setValue('price', selected?.price || '')
          setValue('installationMode', selected?.installationMode.code || '')
          setResidualValueAdderVal(selected?.residualValueAdder)
          setNameVal(selected?.name)
        }}
        placeholder={messages.input.description}
        ref={register(validation('description'))}
        error={errors?.description?.message as string}
      />
    )
  }

  const categoryFields = () => {
    return (
      <Select
        name="category"
        label={messages.input.category}
        options={categoryOption}
        value={categoryVal}
        onChange={({ target: { value } }) => setCategoryVal(value)}
        placeholder={messages.input.category}
        ref={register(validation('category'))}
        error={errors?.category?.message as string}
      />
    )
  }

  const priceFields = (defaultVal?: AccessoryRequest) => {
    return (
      <Controller
        control={control}
        name="price"
        defaultValue={defaultVal?.price || 0}
        rules={validation('price')}
        render={({ onChange, value, name }) => (
          <NumberInput
            mode="currency"
            label={defaultVal ? '' : messages.input.price}
            name={name}
            left
            min={0}
            placeholder={messages.input.price}
            value={value as number}
            onChange={(_, newValue) => onChange(newValue)}
            error={errors?.price?.message}
          />
        )}
      />
    )
  }

  const supplierFields = (defaultVal?: AccessoryRequest) => {
    return (
      <Input
        label={defaultVal ? '' : messages.input.supplier}
        name="supplier"
        defaultValue={defaultVal?.supplier}
        placeholder={messages.input.supplier}
        error={errors?.supplier?.message}
        ref={register(validation('supplier'))}
      />
    )
  }

  const installationFields = (defaultVal?: AccessoryRequest) => {
    return (
      <Select
        name="installationMode"
        label={defaultVal ? '' : messages.input.installationMode}
        options={
          isEditing && selectedRow?.installationMode.code === 'PreInstalled'
            ? installModeOption
            : installationModeOptionFilterd
        }
        value={installationModeVal}
        onChange={({ target: { value } }) => setInstallationModeVal(value)}
        placeholder={messages.input.installationMode}
        ref={register(validation('installationMode'))}
        error={errors?.installationMode?.message as string}
      />
    )
  }

  const onRowEditInitCallback = (e: VehicleAccessories) => {
    setIsEditing(true)
    setIsAdding(false)
    setValue('installationMode', e.installationMode.code)
    setResidualValueAdderVal(e.residualValueAdder)
    setInstallationModeVal(e.installationMode.code)
    setValue('supplier', e.supplier)
    setValue('price', e.price)
    setSetSelectedRow(e)
  }

  const filteredAddonByModels = useMemo(() => {
    const data =
      accessoriesData?.filter(f => {
        if (featureFlags('tempVehicleConditionInAddon')) {
          const isVehicleTypeMatched = f.vehicleType?.find(type => type.code === item?.typeName)
          if (!isVehicleTypeMatched) return undefined
        }
        const isModelMatched = f.compatibleModels.find(modal => modal.code === item?.modelCode)
        if (!isModelMatched) return undefined
        return f
      }) || []
    return data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessoriesData, item])

  const [showConfigureAddon, hideConfigureAddon] = useModal(
    () => (
      <Dialog
        blockScroll
        onHide={() => {
          hideConfigureAddon()
        }}
        visible
        className={cls(styles.dialog, styles.addonDialog)}
      >
        <AddRemoveAddon
          accessoriesData={filteredAddonByModels}
          onHideAddon={hideConfigureAddon}
          associatedAddons={pageData}
          vin={item?.vin}
          dealerCode={dealerCode}
          installModeOption={installModeOption}
        />
      </Dialog>
    ),
    [pageData, filteredAddonByModels, item, dealerCode, installModeOption],
  )

  if (isLoading && (!pageData || pageData?.length === 0 || status === 'running')) {
    return (
      <div className="py-5 text-center rounded bg-white">
        <ProgressSpinner />
      </div>
    )
  }

  // Render
  return (
    <>
      <div
        data-testid="associate-accessories-table"
        className={cls([styles.wrapper, 'pt-0 pb-3 px-4 bg-white rounded'])}
      >
        <Table
          editMode="row"
          className={featureFlags('tempAccessoryUIFlag') ? styles['association-list-table'] : ''}
          onRowEditInit={featureFlags('tempAccessoryUIFlag') ? undefined : ({ data }) => onRowEditInitCallback(data)}
          onRowEditCancel={featureFlags('tempAccessoryUIFlag') ? undefined : () => setIsEditing(false)}
          onRowEditSave={
            featureFlags('tempAccessoryUIFlag')
              ? undefined
              : () => {
                  void handleSubmit(async values => void (await saveAccessory(values)))()
                }
          }
          sortOrder={-1}
          sortField="category"
          ref={tableRef}
          onPage={() => {}} // If not defined dynamic `rows` isn't working
          emptyMessage={<MissingDataPlaceholder>{messages.emptyTable}</MissingDataPlaceholder>}
          value={pageData || []}
          rowHover
          autoLayout
          {...props}
        >
          {featureFlags('tempAccessoryUIFlag') && (
            <Column
              {...generateColumnProps('name')}
              filter
              sortable
              body={({ name }: VehicleAccessories) => <span className="text-dark">{name}</span>}
            />
          )}
          <Column
            {...generateColumnProps('description')}
            filter={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            sortable={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            body={({ description }: VehicleAccessories) => (
              <span title={description} className="text-dark">
                {description}
              </span>
            )}
            // editor={({ rowData }) => descriptionField(rowData)}
            filterElement={
              <div style={{ minWidth: '150px' }}>
                <MultiSelect
                  small
                  name="description"
                  onChange={e => {
                    onFilter(e?.value, 'description', 'in')
                    setDescriptionFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.description}
                  value={descriptionFilterValue}
                  options={descrptionFilterOptions}
                />
              </div>
            }
          />
          <Column
            {...generateColumnProps('category')}
            field="category.displayName"
            filter={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            sortable={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            body={({ category }: VehicleAccessories) => <span className="text-dark">{category?.displayName}</span>}
            // editor={({ rowData }) => categoryFields(rowData)}
            filterElement={
              <div style={{ minWidth: '150px' }}>
                <MultiSelect
                  small
                  name="category"
                  onChange={e => {
                    onFilter(e?.value, 'category', 'custom')
                    setCategoryFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.category}
                  value={categoryFilterValue}
                  options={categoryFilterOptions}
                />
              </div>
            }
            filterFunction={categoryFitlerMethod}
          />
          <Column
            {...generateColumnProps('price')}
            filter={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            sortable={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            editor={({ rowData }) => priceFields(rowData)}
            body={({ price }: VehicleAccessories) => (
              <span className={price > 0 ? 'text-dark' : styles['negative-price']}>{price}</span>
            )}
          />
          <Column
            {...generateColumnProps('installationMode')}
            field="installationMode.displayName"
            filter={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            sortable={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            body={({ installationMode }: VehicleAccessories) => (
              <span className="text-dark">{installationMode?.displayName}</span>
            )}
            editor={featureFlags('tempAccessoryUIFlag') ? undefined : ({ rowData }) => installationFields(rowData)}
            filterElement={
              <div style={{ minWidth: '150px' }}>
                <MultiSelect
                  small
                  name="installationMode"
                  onChange={e => {
                    onFilter(e?.value, 'installationMode', 'custom')
                    setModeFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.installationMode}
                  value={modeFilterValue}
                  options={modeFilterOptions}
                />
              </div>
            }
            filterFunction={installationFitlerMethod}
          />
          <Column
            {...generateColumnProps('supplier')}
            filter={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            sortable={featureFlags('tempAccessoryUIFlag') ? true : !isEditing}
            body={({ supplier }: VehicleAccessories) => <span className="text-dark">{supplier}</span>}
            editor={featureFlags('tempAccessoryUIFlag') ? undefined : ({ rowData }) => supplierFields(rowData)}
            filterElement={
              <div style={{ minWidth: '150px' }}>
                <MultiSelect
                  small
                  name="supplier"
                  onChange={e => {
                    onFilter(e?.value, 'supplier', 'in')
                    setSupplierFilterValue(e?.value)
                  }}
                  placeholder={messages.filterPlaceholders.supplier}
                  value={supplierFilterValue}
                  options={supplierFilterOptions}
                />
              </div>
            }
          />
          {!featureFlags('tempAccessoryUIFlag') &&
            !isAdding && ( // TODO: remove FF
              <Column
                className={cls([
                  styles.editor,
                  isEditing && styles.hideEditor,
                  featureFlags('tempAccessoryUIFlag') ? styles.editColumn : '',
                ])}
                rowEditor
                headerStyle={{ width: isEditing ? '7rem' : '1rem' }}
                bodyStyle={{ textAlign: 'center' }}
              />
            )}
          {!isEditing && ( // TODO: FF-- remove isEditing check only
            <Column
              headerStyle={{ width: '1rem' }}
              className={featureFlags('tempAccessoryUIFlag') ? styles.editColumn : ''}
              bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
              body={(col: VehicleAccessories) => (
                <div className="d-flex p-0 m-0">
                  <DeleteButtons
                    testId="delete-btn-addon-table"
                    className="d-inline"
                    icon="basket"
                    onClick={() => deleteAccessory(col)}
                  />
                </div>
              )}
            />
          )}
        </Table>
      </div>
      <FeatureFlag flag="tempAccessoryUIFlag">
        <On>
          <Button
            data-testid="popup-opener-associate-new-addon-btn"
            tertiary
            onClick={() => {
              showConfigureAddon()
            }}
            secondary
            fullWidth
            className="mt-2"
          >
            {messages.addAddon}
          </Button>

          <div className="row p-2 py-4">
            <div className="col-5 pl-5 ml-2">
              <b className="text-dark">Total:</b>
            </div>
            <div className="col px-3">
              <b data-testid="sum-of-addon-price" className="text-dark">{`$${sumOfPrice?.toFixed(2) || ''}`}</b>
            </div>
          </div>
          <div className={cls(styles.row, styles.centered)}>
            <Button
              className={styles.button}
              onClick={() => {
                onCloseAccessory()
              }}
              secondary
              disabled={status === 'running'}
            >
              {messages.button.cancel}
            </Button>

            <Button
              className={styles.button}
              onClick={() => {
                onCloseAccessory()
              }}
              loading={status === 'running' && 'Saving'}
            >
              {messages.button.save}
            </Button>
          </div>
        </On>
        <Off>
          <Form
            onSubmit={handleSubmit(async values => void (await saveAccessory(values)))}
            error={error && selectErrorMessage(error)}
          >
            {isAdding && (
              <Button
                tertiary
                onClick={() => {
                  setIsAdding(false)
                }}
                secondary={featureFlags('tempAccessoryUIFlag')} // TODO: FF ::always true
                fullWidth
                className="mt-2"
              >
                {messages.cancelAdd}
              </Button>
            )}
            {isAdding ? (
              <div className="row p-5">
                <div className="col-lg-3 col-xl-3 col-md-4 col-sm-12 p-1 m-0">{descriptionField()}</div>
                <div className="col-lg-2 col-xl-2 col-md-4 col-sm-12 p-1 m-0">{categoryFields()}</div>
                <div className="col-lg-2 col-xl-2 col-md-4 col-sm-12 p-1 m-0">{priceFields()}</div>
                <div className="col-lg-3 col-xl-3 col-md-4 col-sm-12  p-1 m-0">{installationFields()}</div>
                <div className="col-lg-2 col-xl-2 col-md-4 col-sm-12 p-1 m-0">{supplierFields()}</div>
              </div>
            ) : (
              <>
                {!isEditing && (
                  <Button
                    tertiary
                    onClick={() => {
                      setIsAdding(true)
                      reset()
                      setDescriptionVal('')
                      setCategoryVal('')
                      setInstallationModeVal('')
                    }}
                    fullWidth
                    className="mt-2"
                  >
                    {messages.addAddon}
                  </Button>
                )}
                <div className="row p-2 py-4">
                  <div className="col-5 pl-5 ml-2">
                    <b className="text-dark">Total:</b>
                  </div>
                  <div className="col px-3">
                    <b className="text-dark">{`$${sumOfPrice?.toFixed(2) || ''}`}</b>
                  </div>
                </div>
              </>
            )}
            <div className={cls(styles.row, styles.centered)}>
              <Button
                className={styles.button}
                onClick={() => {
                  setIsAdding(false)
                  setIsEditing(false)
                  onCloseAccessory()
                }}
                secondary
                disabled={status === 'running'}
              >
                {messages.button.cancel}
              </Button>
              {!isEditing && (
                <Button
                  className={styles.button}
                  type={!isAdding ? undefined : 'submit'}
                  onClick={() => {
                    if (!isAdding) {
                      setIsAdding(false)
                      setIsEditing(false)
                      onCloseAccessory()
                    }
                  }}
                  loading={status === 'running' && 'Saving'}
                  // disabled={!isAdding}
                >
                  {messages.button.save}
                </Button>
              )}
            </div>
          </Form>
        </Off>
      </FeatureFlag>
    </>
  )
}

export default AssociationList
