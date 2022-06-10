import { FC } from 'react'
import { useForm, Controller } from 'react-hook-form'
import cls from 'classnames'
import { selectErrorMessage } from '@common/utilities/sendForm'
import Form from '@components/Form'
import Input from '@components/Input'
import Button from '@components/Button'
import { IndividualizedAgreement } from '@common/endpoints/typings.gen'
import { useMutateIndividualizedAgreement } from '@common/endpoints/useIndividualizedAgreement'

import styles from './IndividualizedAgreement.module.scss'

type FormValues = {
  _id: string
  agreement: string
  isDefault: boolean
}

const messages = {
  input: {
    agreement: 'Individualized Agreement',
  },
  button: {
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving',
  },
  placeholder: {
    typehere: 'Type Here...',
  },
  validation: {
    agreementRequired: 'Individualized Agreement is Required',
  },
}

const makeValidation = (field: keyof typeof messages.validation, required: boolean) => ({
  required: {
    value: required,
    message: messages.validation[field],
  },
})

type IndividualizedAgreementFormData = {
  onFormClose: () => void
  agreement?: IndividualizedAgreement | null
  dealerCode: string
}

const IndividualizedAgreementForm: FC<IndividualizedAgreementFormData> = ({ agreement, onFormClose, dealerCode }) => {
  const { mutate: createAgreement, status, error } = useMutateIndividualizedAgreement(dealerCode)
  const { handleSubmit, control, errors } = useForm<FormValues>({
    defaultValues: {
      agreement: agreement?.agreement || '',
    },
  })
  const isEdit = !!agreement

  const loading = status === 'running'
  return (
    <Form
      onSubmit={handleSubmit(async values => {
        await createAgreement({ ...agreement, ...values, method: isEdit ? 'PUT' : 'POST' })
        onFormClose()
      })}
      error={error && selectErrorMessage(error)}
      className={styles.form}
    >
      <Controller
        control={control}
        name="agreement"
        defaultValue={agreement?.agreement || ''}
        rules={makeValidation('agreementRequired', true)}
        render={({ onChange, value, name }) => (
          <Input
            row
            label={messages.input.agreement}
            name={name}
            onClear={value ? () => onChange('') : undefined}
            onChange={e => onChange(e.target.value)}
            value={value as string}
            error={errors?.agreement?.message}
            placeholder={messages.placeholder.typehere}
          />
        )}
      />
      <div className={cls(styles.row, 'pt-3')}>
        <Button
          className={cls(styles.button, styles.cancelBtn)}
          onClick={() => onFormClose()}
          secondary
          disabled={loading}
        >
          {messages.button.cancel}
        </Button>
        <Button
          className={cls(styles.button, styles.saveBtn)}
          type="submit"
          loading={loading && messages.button.saving}
        >
          {messages.button.save}
        </Button>
      </div>
    </Form>
  )
}

export default IndividualizedAgreementForm
