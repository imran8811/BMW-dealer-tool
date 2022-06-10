import { Controller, useForm } from 'react-hook-form'
import { FC, useState, useEffect } from 'react'
import Form from '@components/Form'
import { invalidateAccessories, UpdateAccessoryParamType, AccessoryType } from '@common/endpoints/useAccessories'
import Select from '@components/Select'
import MultiSelect from '@components/MultiSelect'
import AutoComplete from '@components/Autocomplete'
import Input from '@components/Input'
import NumberInput from '@components/NumberInput'
import Button from '@components/Button'
import cls from 'classnames'
import useMutation from 'use-mutation'
import { AccessoryImage, CodeDisplayName } from '@common/endpoints/typings.gen'
import { SelectOption } from '@common/utilities/selectOptions'
import sendForm, { selectErrorMessage } from '@common/utilities/sendForm'
import Upload from '@components/Upload'
import useFeatureFlag from '@common/utilities/useFeatureFlag'

import useAddonFeature from '@common/utilities/tenantFeaturesFlags'
import styles from './addons.module.scss'

type FormValues = {
  _id: string
  description: string
  category: string
  isActive: string
  partNo: string
  price: number
  dealerCode: string
  supplier: string
  installationMode: string
  compatibleModels: CodeDisplayName[]
  images: string
  residualValueAdder: number
  name: string
}

const messages = {
  input: {
    description: 'Description',
    category: 'Category',
    status: 'Status',
    partNo: 'Part No.',
    price: 'Price',
    supplier: 'Supplier',
    name: 'Product Name',
    installationMode: 'Installed mode',
    images: 'Upload product Images',
    compatibleModels: 'Available Models',
  },
  button: {
    save: 'Save',
    cancel: 'Cancel',
  },
  validation: {
    descriptionRequired: 'Description is Required',
    categoryRequired: 'Category is Required',
    statusRequired: 'Status is Required',
    partNoRequired: 'Part Number is Required',
    priceRequired: 'Price is Required',
    supplierRequired: 'Supplier is Required',
    installationModeRequired: 'Installation Mode is Required',
    compatibleModels: 'Compatiable Models are required',
    imagesRequired: 'Product Images are Required',
    name: 'Name must be valid.',
  },
}

const validation = {
  description: {
    required: {
      value: true,
      message: messages.validation.descriptionRequired,
    },
  },
  isActive: {
    required: {
      value: true,
      message: messages.validation.statusRequired,
    },
  },
  supplier: {
    required: {
      value: true,
      message: messages.validation.supplierRequired,
    },
  },
  category: {
    required: {
      value: true,
      message: messages.validation.categoryRequired,
    },
  },
  partNo: {
    required: {
      value: false,
      message: messages.validation.partNoRequired,
    },
  },
  installationMode: {
    required: {
      value: true,
      message: messages.validation.installationModeRequired,
    },
  },
  compatibleModels: {
    required: {
      value: true,
      message: messages.validation.compatibleModels,
    },
  },
  images: {
    required: {
      value: false,
      message: messages.validation.imagesRequired,
    },
  },
  price: {
    required: {
      value: true,
      message: messages.validation.priceRequired,
    },
  },
  name: {
    required: {
      value: true,
      message: messages.validation.name,
    },
  },
}

const StatusOptions = [
  {
    label: 'Active',
    value: 'true',
  },
  {
    label: 'Inactive',
    value: 'false',
  },
]

type AddonFormData = {
  handleFormClose: () => void
  dealerCode: string
  masterData?: MasterType
  categoryOptions: SelectOption[]
  modalOptions?: SelectOption[]
  addonData?: AccessoryType | Record<string, undefined> | undefined
  InstallationOptions: SelectOption[]
}

type MasterType = {
  inputOptions: SelectOption[]
  oemData: AccessoryType[]
}

const AddonForm: FC<AddonFormData> = ({
  categoryOptions,
  modalOptions,
  masterData,
  addonData,
  handleFormClose,
  InstallationOptions,
  dealerCode,
}) => {
  const { shouldShowImages } = useAddonFeature(dealerCode)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register, control, errors, setValue } = useForm<FormValues>({
    defaultValues: {
      _id: addonData?._id,
      description: addonData?.description,
      isActive: addonData?.isActive ? 'true' : 'false',
      price: addonData?.price,
      partNo: addonData?.partNo,
      category: addonData?.category?.displayName,
      installationMode: addonData?.installationMode?.displayName,
      supplier: addonData?.supplier,
      compatibleModels: addonData?.compatibleModels,
      name: addonData?.name as string,
      residualValueAdder: addonData?.residualValueAdder,
    },
  })

  const [category, setCategory] = useState<string>('')
  const [supplier, setSupplier] = useState<string>('')
  const [statusData, setStatus] = useState('')
  const [compatibleModels, setCompatibleModels] = useState<string[]>([])
  const [images, setImages] = useState<AccessoryImage[]>([])
  const [installationModeVal, setInstallationModeVal] = useState('')
  const [residualValueAdder, setResidualvalueAdder] = useState<number>()
  const { featureFlags } = useFeatureFlag()
  useEffect(() => {
    if (addonData) {
      setCompatibleModels(addonData?.compatibleModels?.map(e => e.code) || [])
      setInstallationModeVal(addonData?.installationMode?.code || '')
      setCategory(addonData?.category?.code || '')
      setStatus(addonData?.isActive ? 'true' : 'false')
      setResidualvalueAdder(addonData?.residualValueAdder)
      setImages(addonData?.images || [])
    }
  }, [addonData])

  const makeModals = () => {
    const compatiableObj = compatibleModels.map(e => {
      const filtered = modalOptions?.filter(f => f.value === e)
      return {
        code: e,
        displayName: filtered?.[0]?.label || e,
      }
    })
    return compatiableObj
  }
  const codeDisplayObj = (e: string, options: SelectOption[]) => {
    const filtered = options?.filter(f => f.value === e)
    return {
      code: e,
      displayName: filtered?.[0]?.label || e,
    }
  }

  const [saveAccessory, { error, status }] = useMutation<FormValues, UpdateAccessoryParamType, Error>(
    (values): Promise<UpdateAccessoryParamType> => {
      const isEdit = !!addonData
      const id = addonData?._id
      const isActive = statusData === 'true'
      const supplierVal = values.supplier || supplier
      const newUserValues = {
        ...values,
        _id: id,
        isActive,
        compatibleModels: makeModals(),
        supplier: supplierVal,
        category: codeDisplayObj(category, categoryOptions),
        installationMode: codeDisplayObj(installationModeVal, InstallationOptions),
        dealerCode: isEdit ? `${dealerCode}` : dealerCode,
        residualValueAdder: residualValueAdder || 0,
      }

      const url = isEdit
        ? `/dealer-management/dealer-config/update-accessory/${dealerCode}/${id || ''}`
        : `/dealer-management/dealer-config/add-accessory/${dealerCode}` // ${dealerCode}/${addonData._id}`

      return sendForm<UpdateAccessoryParamType>(url, newUserValues, {
        withAuthentication: true,
        method: isEdit ? 'PUT' : 'POST',
      })
    },
    {
      onSuccess(data): void {
        void invalidateAccessories(data?.data)
        handleFormClose()
      },
    },
  )

  const onselectDescription = (val: string) => {
    const selected = masterData?.oemData.filter(e => e._id === val)
    if (selected) {
      setCompatibleModels(selected[0]?.compatibleModels?.map(e => e.code) || [])
      setValue('category', selected[0]?.category.code)
      setValue('name', selected[0]?.name)
      setValue('description', selected[0]?.description)
      setCategory(selected[0]?.category.code)
      setInstallationModeVal(selected[0]?.installationMode.code)
      setStatus(selected[0]?.isActive ? 'true' : 'false')
      setValue('installationMode', selected[0]?.installationMode.code)
      setValue('supplier', selected[0]?.supplier)
      setValue('images', selected[0]?.images)
      setImages(selected[0]?.images || [])
      setValue('isActive', selected[0]?.isActive ? 'true' : 'false')
      setValue('partNo', selected[0]?.partNo)
      setValue('price', selected[0]?.price)
      setResidualvalueAdder(selected[0]?.residualValueAdder)
      setSupplier(selected[0]?.supplier)
    }
  }
  return (
    <>
      <Form
        onSubmit={handleSubmit(async values => void (await saveAccessory(values)))}
        error={error && selectErrorMessage(error)}
      >
        <Input label={messages.input.name} error={errors?.name?.message} name="name" ref={register(validation.name)} />
        <Controller
          control={control}
          name="description"
          defaultValue={addonData?.description || ''}
          rules={validation.description}
          render={({ onChange, value, name }) => (
            <AutoComplete
              name={name}
              // field="description"
              label="Description"
              value={value as string}
              onChange={e => {
                if (typeof e.value === 'string') {
                  onChange(e?.value)
                  setSupplier('')
                }
              }}
              onSelect={({ value: { value: val } }) => {
                onselectDescription(val)
              }}
              options={masterData?.inputOptions || []}
              error={errors.description?.message}
            />
          )}
        />

        <Select
          name="category"
          label={messages.input.category}
          options={categoryOptions}
          value={category}
          onChange={({ target: { value } }) => setCategory(value)}
          placeholder={messages.input.category}
          ref={register(validation.category)}
          error={errors?.category?.message as string}
        />
        <Input
          label={messages.input.partNo}
          name="partNo"
          error={errors?.partNo?.message as string}
          ref={register(validation.partNo)}
        />
        <Controller
          control={control}
          name="price"
          defaultValue={addonData?.price || 0}
          rules={validation.price}
          render={({ onChange, value, name }) => (
            <NumberInput
              mode="currency"
              label={messages.input.price}
              name={name}
              left
              min={0}
              value={value as number}
              onChange={(_, newValue) => onChange(newValue)}
              error={errors?.price?.message}
            />
          )}
        />
        <Input
          label={messages.input.supplier}
          name="supplier"
          error={errors?.supplier?.message}
          ref={register(validation.supplier)}
          disabled={supplier?.length !== 0}
        />

        <Select
          name="installationMode"
          label={messages.input.installationMode}
          options={InstallationOptions}
          value={installationModeVal}
          onChange={e => setInstallationModeVal(e?.target?.value)}
          placeholder={messages.input.installationMode}
          ref={register(validation.installationMode)}
          error={errors?.installationMode?.message as string}
        />
        <MultiSelect
          name="CompatibleModels"
          multiClass={cls(styles.multiClass)}
          header
          showSelectAll
          id="CompatibleModels"
          label={messages.input.compatibleModels}
          options={modalOptions}
          value={compatibleModels}
          onChange={e => {
            setCompatibleModels(e?.target?.value)
          }}
        />
        {shouldShowImages && featureFlags('tempAccessoryUIFlag') ? (
          <Controller
            control={control}
            name="images"
            rules={validation.images}
            render={({ onChange, name }) => (
              <Upload
                error={errors?.images?.message as string}
                multiple
                wrapperClass={styles.uploadClass}
                onChange={e => {
                  onChange(e?.map(blob => ({ name: blob.blobName })) || undefined)
                }}
                defaultImages={images}
                name={name}
                blobPath="accessoryProductImages"
                label={messages.input.images}
                fileType="Image"
                formats={['jpg', 'jpeg', 'png']}
                listOrientation="row"
                btnLabel={messages.input.images}
              />
            )}
          />
        ) : (
          ''
        )}
        <Select
          name="isActive"
          label={messages.input.status}
          options={StatusOptions}
          value={statusData}
          onChange={e => setStatus(e?.target?.value)}
          placeholder={messages.input.status}
          ref={register(validation.isActive)}
          error={errors?.isActive?.message}
        />
        <div className={cls(styles.row, styles.centered)}>
          <Button
            className={cls([styles.button, styles.cancelBtn])}
            onClick={() => handleFormClose()}
            secondary
            disabled={status === 'running'}
          >
            {messages.button.cancel}
          </Button>
          <Button
            className={cls([styles.button, styles.saveBtn])}
            type="submit"
            loading={status === 'running' && 'Saving'}
          >
            {messages.button.save}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default AddonForm
