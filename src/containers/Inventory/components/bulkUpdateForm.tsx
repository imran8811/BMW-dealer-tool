import { useForm, Controller } from 'react-hook-form'
import { FC, useState } from 'react'
import Form from '@components/Form'
import Select from '@components/Select'
import MultiSelect from '@components/MultiSelect'
import Button from '@components/Button'
import cls from 'classnames'
import { Accessories } from '@common/endpoints/typings.gen'
import { SelectOption } from '@common/utilities/selectOptions'
import { selectErrorMessage } from '@common/utilities/sendForm'
import { AccessoryType } from '@common/endpoints/useAccessories'
import { useInventoryBulkUpdate, VinAccessoryType } from '@common/endpoints/useInventory'
import styles from '../inventory.module.scss'

type FormValues = {
  state: string
  addons: string
}

const messages = {
  input: {
    addon: 'Add-ons',
    state: 'Listing Status',
  },
  button: {
    save: 'Save',
    cancel: 'Cancel',
  },
  validation: {
    addonRequired: 'Add-ons is Required',
    stateRequired: 'Listing Status is Required',
  },
}

const validation = {
  addon: {
    required: {
      value: true,
      message: messages.validation.addonRequired,
    },
  },
  state: {
    required: {
      value: true,
      message: messages.validation.stateRequired,
    },
  },
}

const stateOptions = ['Listed', 'Not Listed']

type BulkAddonFormData = {
  onFormClose: () => void
  addonOption?: SelectOption[]
  accessoriesData?: AccessoryType[]
  selectedVin: VinAccessoryType[]
}

const BulkAddonForm: FC<BulkAddonFormData> = ({ selectedVin, accessoriesData, addonOption, onFormClose }) => {
  const { register, handleSubmit, errors, control } = useForm<FormValues>()
  const { mutate, status, error } = useInventoryBulkUpdate()

  const [selectedAddon, setSelectedAddon] = useState<string[]>([])
  const [stateData, setStateData] = useState<Accessories['supplier']>('')

  const saveForm = ({ state }: { state: string }) => {
    const accessoriesArr = selectedAddon.map(e => accessoriesData?.find(f => f._id === e))
    const responseAccessoryArr = accessoriesArr.map(e => ({
      _accessoryId: e?._id || '',
      name: e?.name || '',
      description: e?.description || '',
      category: {
        code: e?.category.code || '',
        displayName: e?.category.displayName || '',
      },
      price: e?.price || 0,
      supplier: e?.supplier || '',
      installationMode: {
        code: e?.installationMode.code || '',
        displayName: e?.installationMode.displayName || '',
      },
      residualValueAdder: e?.residualValueAdder || 0,
      createdAt: e?.createdAt || '',
      updatedAt: e?.updatedAt || '',
    }))
    const bulkUpdateInventory = selectedVin.map(e => {
      const duplicate = responseAccessoryArr?.filter(r => e.accessories?.find(f => f._accessoryId === r._accessoryId))
      const accessories = responseAccessoryArr?.filter(r =>
        duplicate?.find(d => d._accessoryId === r._accessoryId) ? undefined : r,
      )
      return {
        vin: e?.vin,
        accessories: duplicate.length > 0 ? accessories : responseAccessoryArr,
        publish: state === 'Listed',
      }
    })
    const obj = {
      bulkUpdateInventory,
    }
    void mutate(obj).then(() => onFormClose())
    // onFormClose()
  }
  return (
    <>
      <Form onSubmit={handleSubmit(values => saveForm(values))} error={error && selectErrorMessage(error)}>
        <Controller
          control={control}
          name="addons"
          rules={validation.addon}
          render={({ onChange, name }) => (
            <MultiSelect
              name={name}
              label={messages.input.addon}
              options={addonOption || []}
              value={selectedAddon}
              onChange={e => {
                onChange(e?.target?.value)
                setSelectedAddon(e?.target?.value)
              }}
              error={errors?.addons?.message}
            />
          )}
        />
        <Select
          name="state"
          label={messages.input.state}
          options={stateOptions}
          value={stateData}
          onChange={({ target: { value } }) => setStateData(value)}
          placeholder={messages.input.state}
          ref={register(validation.state)}
          error={errors?.state?.message}
        />

        <div className={cls(styles.row, styles.centered)}>
          <Button className={styles.button} onClick={() => onFormClose()} secondary>
            {messages.button.cancel}
          </Button>
          <Button className={styles.button} type="submit" disabled={status === 'running'}>
            {messages.button.save}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default BulkAddonForm
