import { Controller, useForm } from 'react-hook-form'
import { FC, useState, useEffect } from 'react'
import Form from '@components/Form'
import { UpdateAccessoryParamType, AccessoryType, useMutateAccessories } from '@common/endpoints/useAccessories'
import Select from '@components/Select'
import MultiSelect from '@components/MultiSelect'
import AutoComplete from '@components/Autocomplete'
import Input from '@components/Input'
import NumberInput from '@components/NumberInput'
import Button from '@components/Button'
import cls from 'classnames'
import { AccessoryImage } from '@common/endpoints/typings.gen'
import { SelectOption } from '@common/utilities/selectOptions'
import { selectErrorMessage } from '@common/utilities/sendForm'
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
  compatibleModels: string
  images: string
  residualValueAdder: number
  name: string
  vehicleType: string
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
    vehicleType: 'Vehicle Type',
  },
  button: {
    save: 'Save',
    cancel: 'Cancel',
  },
  validation: {
    description: 'Description is Required',
    category: 'Category is Required',
    status: 'Status is Required',
    partNo: 'Part Number is Required',
    price: 'Price is Required',
    supplier: 'Supplier is Required',
    installationMode: 'Installation Mode is Required',
    compatibleModels: 'Compatiable Models are required',
    images: 'Product Images are Required',
    name: 'Product Name is Required.',
    vehicleType: 'Vehicle Type is Required',
  },
}

const validation = (msg: keyof typeof messages.validation, required: boolean) => ({
  required: {
    value: required,
    message: messages.validation[msg],
  },
})

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
  vehicalOptions?: SelectOption[]
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
  vehicalOptions,
  handleFormClose,
  InstallationOptions,
  dealerCode,
}) => {
  const { shouldShowImages } = useAddonFeature(dealerCode)

  const defaultValues = (selected: AccessoryType | undefined, isEdit?: boolean) => ({
    _id: isEdit ? selected?._id : undefined,
    category: selected?.category.code,
    name: selected?.name,
    description: selected?.description,
    installationMode: selected?.installationMode.code,
    supplier: selected?.supplier,
    images: (selected?.images as unknown) as string,
    isActive: selected?.isActive ? 'true' : 'false',
    partNo: selected?.partNo,
    price: selected?.price,
    vehicleType: isEdit ? selected?.vehicleType?.map(e => e.code) : vehicalOptions?.map(e => e.value),
    compatibleModels: (selected?.compatibleModels?.map(e => e.code) as unknown) as string,
    residualValueAdder: selected?.residualValueAdder,
  })

  const { handleSubmit, register, control, errors, reset } = useForm<FormValues>()

  const [selectedMaster, setMaster] = useState<AccessoryType>()
  const [images, setImages] = useState<AccessoryImage[]>([])

  const { featureFlags } = useFeatureFlag()

  useEffect(() => {
    if (addonData) {
      setImages(addonData?.images || [])
      reset((defaultValues((addonData as unknown) as AccessoryType, true) as unknown) as FormValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addonData, reset])

  const codeDisplayObj = (e: string, options?: SelectOption[]) => {
    const filtered = options?.filter(f => f.value === e)
    return {
      code: e,
      displayName: filtered?.[0]?.label || e,
    }
  }

  const { mutate: saveAccessory, error, isLoading } = useMutateAccessories()

  const submit = (values: FormValues) => {
    const isEdit = !!addonData
    const id = addonData?._id

    const payload = {
      ...values,
      _id: id,
      supplier: selectedMaster?.supplier || values.supplier,
      isActive: values.isActive === 'true',
      dealerCode: isEdit ? `${dealerCode}` : dealerCode,
      residualValueAdder: addonData?.residualValueAdder || 0,
      compatibleModels: ((values.compatibleModels as unknown) as string[])
        .map(e => codeDisplayObj(e, modalOptions))
        .filter(f => f.code),
      category: codeDisplayObj(values.category, categoryOptions),
      installationMode: codeDisplayObj(values.installationMode, InstallationOptions),
      vehicleType: ((values.vehicleType as unknown) as string[]).map(e => codeDisplayObj(e, vehicalOptions)),
    }
    void saveAccessory(
      { payload: (payload as unknown) as UpdateAccessoryParamType, id, isEdit, dealerCode },
      {
        onSuccess() {
          handleFormClose()
        },
      },
    )
  }

  const onselectDescription = (val: string) => {
    const selected = masterData?.oemData.find(e => e._id === val)
    if (selected) {
      reset((defaultValues(selected) as unknown) as FormValues)
      setMaster(selected)
      setImages(selected?.images || [])
    }
  }
  return (
    <>
      <Form onSubmit={handleSubmit(values => submit(values))} error={error && selectErrorMessage(error)}>
        <Input
          label={messages.input.name}
          error={errors?.name?.message}
          name="name"
          ref={register(validation('name', true))}
        />
        <Controller
          control={control}
          name="description"
          defaultValue={addonData?.description || ''}
          rules={validation('description', true)}
          render={({ onChange, value, name }) => (
            <AutoComplete
              name={name}
              // field="description"
              label="Description"
              value={value as string}
              onChange={e => {
                if (typeof e.value === 'string') {
                  onChange(e?.value)
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
          placeholder={messages.input.category}
          ref={register(validation('category', true))}
          error={errors?.category?.message as string}
        />

        <Controller
          control={control}
          name="vehicleType"
          rules={validation('vehicleType', true)}
          render={({ onChange, value, name }) => (
            <MultiSelect
              name={name}
              multiClass={cls(styles.multiClass)}
              header
              showSelectAll
              id="vehicleType"
              label={messages.input.vehicleType}
              options={vehicalOptions}
              value={value as string[]}
              onChange={e => {
                onChange(e.target.value)
              }}
              error={errors?.vehicleType?.message}
            />
          )}
        />

        <Input
          label={messages.input.partNo}
          name="partNo"
          error={errors?.partNo?.message as string}
          ref={register(validation('partNo', false))}
        />
        <Controller
          control={control}
          name="price"
          defaultValue={addonData?.price || 0}
          rules={validation('price', true)}
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
          ref={register(validation('supplier', true))}
          disabled={!!selectedMaster}
        />

        <Select
          name="installationMode"
          label={messages.input.installationMode}
          options={InstallationOptions}
          placeholder={messages.input.installationMode}
          ref={register(validation('installationMode', true))}
          error={errors?.installationMode?.message as string}
        />

        <Controller
          control={control}
          name="compatibleModels"
          rules={validation('compatibleModels', true)}
          render={({ onChange, value, name }) => (
            <MultiSelect
              name={name}
              multiClass={cls(styles.multiClass)}
              header
              showSelectAll
              id="CompatibleModels"
              label={messages.input.compatibleModels}
              options={modalOptions}
              value={value as string[]}
              onChange={e => {
                onChange(e?.target?.value)
              }}
              error={errors.compatibleModels?.message}
            />
          )}
        />
        {shouldShowImages && featureFlags('tempAccessoryUIFlag') && (
          <Controller
            control={control}
            name="images"
            rules={validation('images', false)}
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
        )}
        <Select
          name="isActive"
          label={messages.input.status}
          options={StatusOptions}
          placeholder={messages.input.status}
          ref={register(validation('status', true))}
          error={errors?.isActive?.message}
        />
        <div className={cls(styles.row, styles.centered)}>
          <Button
            className={cls([styles.button, styles.cancelBtn])}
            onClick={() => handleFormClose()}
            secondary
            disabled={isLoading}
          >
            {messages.button.cancel}
          </Button>
          <Button className={cls([styles.button, styles.saveBtn])} type="submit" loading={isLoading && 'Saving'}>
            {messages.button.save}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default AddonForm
