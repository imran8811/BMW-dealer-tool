import { Controller, useForm } from 'react-hook-form'
import { FC, useState, useEffect } from 'react'
import Form from '@components/Form'
import { UpdateAccessoryParamType, AccessoryType } from '@common/endpoints/useAccessories'
import Select from '@components/Select'
import MultiSelect from '@components/MultiSelect'
import Input from '@components/Input'
import NumberInput from '@components/NumberInput'
import Button from '@components/Button'
import cls from 'classnames'
import { CodeDisplayName } from '@common/endpoints/typings.gen'
import { SelectOption } from '@common/utilities/selectOptions'
import { selectErrorMessage } from '@common/utilities/sendForm'
import Upload from '@components/Upload'
import { useMasterAccessoryMutation } from '@common/endpoints/useMasterAccessories'
import useAddonFeature from '@common/utilities/tenantFeaturesFlags'

import styles from './masterAccessory.module.scss'

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

export const messages = {
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
const validation = (field: keyof typeof messages.validation, required: boolean) => ({
  required: {
    value: required,
    message: `${messages.validation[field]}`,
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
  categoryOptions: SelectOption[]
  modalOptions?: SelectOption[]
  addonData?: AccessoryType | null
  InstallationOptions: SelectOption[]
}

const AddonForm: FC<AddonFormData> = ({
  categoryOptions,
  modalOptions,
  addonData,
  handleFormClose,
  InstallationOptions,
}) => {
  const { shouldShowImages } = useAddonFeature()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register, control, errors } = useForm<FormValues>({
    defaultValues: {
      _id: addonData?._id,
      description: addonData?.description,
      isActive: addonData?.isActive === false ? 'false' : 'true',
      price: addonData?.price,
      partNo: addonData?.partNo,
      category: addonData?.category?.code,
      installationMode: addonData?.installationMode?.code,
      supplier: addonData?.supplier,
      compatibleModels: addonData?.compatibleModels,
      name: addonData?.name as string,
      residualValueAdder: addonData?.residualValueAdder,
      images: (addonData?.images as unknown) as string,
    },
  })
  const [category, setCategory] = useState<string>('')
  const [supplier] = useState<string>('')
  const [statusData, setStatus] = useState('true')
  const [compatibleModels, setCompatibleModels] = useState<string[]>([])
  const [installationModeVal, setInstallationModeVal] = useState('')
  const [residualValueAdder, setResidualvalueAdder] = useState<number>()
  useEffect(() => {
    if (addonData) {
      setCompatibleModels(addonData?.compatibleModels?.map(e => e.code) || [])
      setInstallationModeVal(addonData?.installationMode?.code || '')
      setCategory(addonData?.category?.code || '')
      setStatus(addonData?.isActive === false ? 'false' : 'true')
      setResidualvalueAdder(addonData?.residualValueAdder)
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

  const { mutate, status, error } = useMasterAccessoryMutation(addonData?._id)

  const saveAccessory = (data: UpdateAccessoryParamType) => {
    const id = addonData?._id
    const isActive = statusData === 'true'
    const newUserValues = {
      ...data,
      _id: id,
      isActive,
      compatibleModels: makeModals(),
      category: codeDisplayObj(category, categoryOptions),
      installationMode: codeDisplayObj(installationModeVal, InstallationOptions),
      residualValueAdder: residualValueAdder || 0,
    } as UpdateAccessoryParamType
    void mutate(newUserValues, {
      onSuccess() {
        handleFormClose()
      },
    })
  }

  return (
    <>
      <Form
        onSubmit={handleSubmit(values => saveAccessory((values as unknown) as UpdateAccessoryParamType))}
        error={error && selectErrorMessage(error)}
      >
        <Input
          label={messages.input.name}
          error={errors?.name?.message}
          name="name"
          ref={register(validation('name', true))}
          data-testid="name"
        />
        <Input
          row
          label={messages.input.description}
          name="description"
          error={errors?.description?.message as string}
          ref={register(validation('descriptionRequired', true))}
          data-testid="description"
        />

        <Select
          name="category"
          label={messages.input.category}
          options={categoryOptions}
          value={category}
          onChange={({ target: { value } }) => setCategory(value)}
          placeholder={messages.input.category}
          ref={register(validation('categoryRequired', true))}
          error={errors?.category?.message as string}
          data-testid="category"
        />
        <Input
          label={messages.input.partNo}
          name="partNo"
          error={errors?.partNo?.message as string}
          ref={register(validation('partNoRequired', true))}
          data-testid="partNo"
        />
        <Controller
          control={control}
          name="price"
          defaultValue={addonData?.price || 0}
          rules={validation('priceRequired', true)}
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
              data-testid={name}
            />
          )}
        />
        <Input
          label={messages.input.supplier}
          name="supplier"
          error={errors?.supplier?.message}
          ref={register(validation('supplierRequired', true))}
          disabled={supplier?.length !== 0}
          data-testid="supplier"
        />

        <Select
          name="installationMode"
          label={messages.input.installationMode}
          options={InstallationOptions}
          value={installationModeVal}
          onChange={e => setInstallationModeVal(e?.target?.value)}
          placeholder={messages.input.installationMode}
          ref={register(validation('installationModeRequired', true))}
          error={errors?.installationMode?.message as string}
          data-testid="installationMode"
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
          data-testid="CompatibleModels"
        />

        {shouldShowImages && (
          <Controller
            control={control}
            name="images"
            rules={validation('imagesRequired', false)}
            render={({ onChange, name }) => (
              <Upload
                error={errors?.images?.message as string}
                multiple
                wrapperClass={styles.uploadClass}
                onChange={e => {
                  onChange(e?.map(blob => ({ name: blob.blobName })) || undefined)
                }}
                defaultImages={addonData?.images}
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
          value={statusData}
          onChange={e => setStatus(e?.target?.value)}
          placeholder={messages.input.status}
          ref={register(validation('statusRequired', true))}
          error={errors?.isActive?.message}
          data-testid="isActive"
        />
        <div className={cls(styles.row, styles.centered)}>
          <Button
            className={cls([styles.button, styles.cancelBtn])}
            onClick={() => handleFormClose()}
            secondary
            disabled={status === 'running'}
            data-testid="cancelBtn"
          >
            {messages.button.cancel}
          </Button>
          <Button
            className={cls([styles.button, styles.saveBtn])}
            type="submit"
            loading={status === 'running' && 'Saving'}
            data-testid="saveBtn"
          >
            {messages.button.save}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default AddonForm
