import { FC } from 'react'
import { useForm, Controller } from 'react-hook-form'
import useMutation from 'use-mutation'
import cls from 'classnames'
import sendForm, { selectErrorMessage } from '@common/utilities/sendForm'
import Form from '@components/Form'
import Input from '@components/Input'
import NumberInput from '@components/NumberInput'
import Button from '@components/Button'
import { TradeInStatus } from '@common/endpoints/useDealSummary'
import { OrderTradeIn } from '@common/endpoints/typings.gen'

import styles from './TradeIn.module.scss'

type FormValues = {
  offer: number
  leaseBalance: number
  comment: string
}

const messages = {
  input: {
    offer: 'Offer Amount',
    leaseBalance: 'Lease Balance',
    comment: 'comment',
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
    offerRequired: 'Offer amount is Required',
    leaseBalanceRequired: 'Lease Balance is Required',
    commentRequired: 'Comment is Required',
  },
}

const makeValidation = (field: keyof typeof messages.validation, required: boolean) => ({
  required: {
    value: required,
    message: messages.validation[field],
  },
})

export interface TradeInData {
  offer: number
  leaseBalance: number
  comment: string
}

type TradeInFormData = {
  onFormClose: () => void
  tradeInVehicle?: OrderTradeIn
  orderId: string
  refetchOrderDetails?: (updatedTaxes?: boolean, tradeInStatus?: TradeInStatus) => unknown
}

const TradeInForm: FC<TradeInFormData> = ({ tradeInVehicle, onFormClose, orderId, refetchOrderDetails }) => {
  const offer = Number((tradeInVehicle?.offer || 0).toFixed(2))
  const leaseBalance = tradeInVehicle?.tradeInLeaseBalance?.leaseBalance || 0
  const comment = tradeInVehicle?.comment || ''
  const { handleSubmit, control, errors } = useForm<FormValues>({
    defaultValues: {
      offer,
      leaseBalance,
      comment,
    },
  })

  const [saveTradeInValues, { error, status }] = useMutation<FormValues, TradeInData, Error>(
    (values): Promise<TradeInData> => {
      const url = `/order-management/update-tradein-vehicle/${orderId}`
      return sendForm<TradeInData>(
        url,
        {
          ...values,
          offer: values.offer && Number(values.offer.toFixed(2)),
          leaseBalance: tradeInVehicle?.tradeInLeaseBalance && values.leaseBalance,
        },
        {
          withAuthentication: true,
          method: 'PATCH',
        },
      )
    },
    {
      onSuccess: () => {
        refetchOrderDetails?.()
        onFormClose()
      },
    },
  )
  const loading = status === 'running'
  return (
    <Form
      onSubmit={handleSubmit(async values => void (await saveTradeInValues(values)))}
      error={error && selectErrorMessage(error)}
      className={styles.form}
    >
      <Controller
        control={control}
        name="offer"
        defaultValue={offer}
        rules={makeValidation('offerRequired', true)}
        render={({ onChange, value, name }) => (
          <NumberInput
            label={messages.input.offer}
            name={name}
            onChange={(_, newValue) => {
              onChange(newValue)
            }}
            value={value as string}
            error={errors?.offer?.message}
            placeholder={messages.placeholder.typehere}
            mode="currency"
            fractionDigits={2}
            min={0}
            left
          />
        )}
      />

      <Controller
        control={control}
        name="leaseBalance"
        defaultValue={leaseBalance}
        rules={makeValidation('leaseBalanceRequired', true)}
        render={({ onChange, value, name }) => (
          <NumberInput
            displayName="Lease balance"
            label={messages.input.leaseBalance}
            name={name}
            onChange={(_, newValue) => {
              onChange(newValue)
            }}
            value={value as number}
            error={errors?.leaseBalance?.message}
            placeholder={messages.placeholder.typehere}
            mode="currency"
            disabled={!tradeInVehicle?.tradeInLeaseBalance}
            fractionDigits={2}
            min={0}
            left
          />
        )}
      />

      <Controller
        control={control}
        name="comment"
        defaultValue={comment}
        rules={makeValidation('commentRequired', true)}
        render={({ onChange, value, name }) => (
          <Input
            row
            label={messages.input.comment}
            name={name}
            onChange={e => onChange(e.target.value)}
            value={value as number}
            error={errors?.comment?.message}
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

export default TradeInForm
