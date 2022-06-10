import { Controller, UnpackNestedValue, useForm } from 'react-hook-form'
import { FC, ComponentProps, ReactNode } from 'react'
import Form from '@components/Form'
import { UpdateFeeTagParamType, useMutationFeeTag } from '@common/endpoints/useFeeTags'
import Input from '@components/Input'
import Select from '@components/Select'
import Button from '@components/Button'
import cls from 'classnames'
import { FeeTag } from '@common/endpoints/typings.gen'
import { selectErrorMessage } from '@common/utilities/sendForm'
import { useCharges } from '@common/endpoints/fees'
import { SelectOption } from '@common/utilities/selectOptions'

import styles from './feeTags.module.scss'

export const messages = {
  input: {
    chargeCode: 'Fee Name',
    stateCode: 'State',
    productCode: 'Financial Product',
    tagName: 'Tag Name',
  },
  button: {
    save: 'Save',
    cancel: 'Cancel',
  },
  validation: {
    chargeCode: 'Fee Name is Required',
    stateCode: 'State is Required',
    productCode: 'Financial Product is Required',
    tagName: 'Tag Name is Required',
  },
}

const validation = (field: keyof typeof messages.validation, required: boolean) => ({
  required: {
    value: required,
    message: `${messages.validation[field]}`,
  },
})

type FeeTagFormData = {
  handleFormClose: () => void
  feeTagData: FeeTag | null
  states: SelectOption[]
  financialProducts: SelectOption[]
  statesMap: Map<string, string>
}

type FormValues = UnpackNestedValue<FeeTag>

const FeeTagForm: FC<FeeTagFormData> = ({ feeTagData, handleFormClose, states, financialProducts }) => {
  const { handleSubmit, control, errors } = useForm<FeeTag>({
    defaultValues: {
      _id: feeTagData?._id,
      chargeCode: feeTagData?.chargeCode,
      productCode: feeTagData?.productCode,
      stateCode: feeTagData?.stateCode,
      tagName: feeTagData?.tagName,
    },
  })

  const { mutate, isLoading, error } = useMutationFeeTag(feeTagData?._id)

  const saveFeeTag = (data: UpdateFeeTagParamType) => {
    void mutate(data, {
      onSuccess() {
        handleFormClose()
      },
    })
  }

  const { options: chargeOptions = [] } = useCharges()

  type ControllerProps = ComponentProps<typeof Controller>
  type ControllerRenderFn = NonNullable<ControllerProps['render']>
  type ControllerRenderArgs = Parameters<ControllerRenderFn>[0]

  const ctl = (
    name: keyof Omit<FormValues, '_id'>,
    render: (args: { error: ReactNode; label: string } & ControllerRenderArgs) => ReturnType<ControllerRenderFn>,
  ) => (
    <Controller
      control={control}
      name={name}
      rules={validation(name, true)}
      render={props => render({ ...props, error: errors[name]?.message, label: messages.input[name] })}
    />
  )
  return (
    <>
      <Form onSubmit={handleSubmit(values => void saveFeeTag(values))} error={error && selectErrorMessage(error)}>
        <div>
          {ctl('chargeCode', props => (
            <Select {...props} placeholder=" " options={chargeOptions} data-testid="chargeCode" />
          ))}
        </div>
        <div>
          {ctl('stateCode', props => (
            <Select {...props} placeholder=" " options={states} data-testid="stateCode" />
          ))}
        </div>
        <div>
          {ctl('productCode', props => (
            <Select {...props} placeholder=" " options={financialProducts} data-testid="productCode" />
          ))}
        </div>
        <div>
          {ctl('tagName', props => {
            return <Input {...props} data-testid="tagName" />
          })}
        </div>
        <div className={cls(styles.row, styles.centered)}>
          <Button
            className={cls([styles.button, styles.cancelBtn])}
            onClick={() => handleFormClose()}
            secondary
            disabled={isLoading}
            data-testid="cancelBtn"
          >
            {messages.button.cancel}
          </Button>
          <Button
            data-testid="saveBtn"
            className={cls([styles.button, styles.saveBtn])}
            type="submit"
            loading={isLoading && 'Saving'}
          >
            {messages.button.save}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default FeeTagForm
