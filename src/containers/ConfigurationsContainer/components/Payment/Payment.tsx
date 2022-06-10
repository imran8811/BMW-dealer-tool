import { FC, useCallback, useEffect, useState } from 'react'
import { mutate as swrMutate } from 'swr'
import { Controller, useForm } from 'react-hook-form'
import { PaymentsAccount } from '@common/endpoints/typings.gen'
import { selectErrorMessage, sendForm } from '@common/utilities/http-api'
import { StripeLinkType, StripePaymentUrlType } from '@common/endpoints/useMandatoryCheck'
import Button from '@components/Button/Button'
import Form from '@components/Form'
import NumberInput from '@components/NumberInput'
import cls from 'classnames'
import useMutation from 'use-mutation'
import useConfirm from '@common/utilities/useConfirm'
import styles from './Payment.module.scss'

type FormValues = {
  debitCardMaxAmount: number
  creditCardMaxAmount: number
  achMaxAmount: number
}

const messages = {
  title: 'Payment',
  input: {
    bankLimit: 'Bank account limit ($)',
    creditLimit: 'Credit card limit ($)',
    DebitLimit: 'debit card limit ($)',
  },
  placeholder: {
    typeHere: 'Type Here..',
    digits: '0000',
  },
  button: {
    save: 'Save',
    saving: 'Saving…',
  },
  validation: {
    creditCardMaxAmount: 'Credit Card Limit is Required',
    achMaxAmount: 'Bank Account Limit is Required',
    debitCardMaxAmount: 'Debit Card Limit is Required',
  },
}

const validation = (input: keyof typeof messages.validation) => ({
  required: {
    value: true,
    message: messages.validation[input],
  },
})

type PaymentUpdateType = PaymentsAccount & {
  _id?: string
}

type IPaymentType = {
  initialValues?: PaymentUpdateType
  dealerCode: string
}

const Payment: FC<IPaymentType> = ({ initialValues, dealerCode }) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { errors, control, handleSubmit, formState, reset } = useForm<FormValues>({
    defaultValues: {
      achMaxAmount: initialValues?.achMaxAmount,
      creditCardMaxAmount: initialValues?.creditCardMaxAmount,
      debitCardMaxAmount: initialValues?.debitCardMaxAmount,
    },
  })
  const { isDirty } = formState
  const [accountStatus, setAccountStatus] = useState<string>()
  const [stripeUrl, setStripeUrl] = useState<string>()
  /** Warning Popup for Payment */
  const { confirm } = useConfirm({
    className: styles.confirmPadding,
    message: 'Please configure at least one limit to complete the payment configuration.',
    hideAccept: true,
    icon: 'ocross',
    cancelText: 'OK',
  })
  const [getStripeUrl] = useMutation<StripeLinkType, StripePaymentUrlType, Error>(
    (values): Promise<StripePaymentUrlType> => {
      return sendForm<StripePaymentUrlType>('/payment-management/payments-account/get-account-link-url', values, {
        withAuthentication: true,
        method: 'POST',
      })
    },
    {
      onSuccess(data): void {
        setStripeUrl(data.data.url)
      },
    },
  )

  const getStripeConnectUrl = useCallback(
    (id: string | undefined) => {
      if (id) {
        const url = window.location.toString()
        const reqObj = {
          _id: id || '',
          refreshUrl: url,
          returnUrl: url,
        }
        void getStripeUrl(reqObj)
      }
    },
    [getStripeUrl],
  )
  useEffect(() => {
    setAccountStatus(initialValues?.status)
    getStripeConnectUrl(initialValues?._id)
  }, [initialValues, getStripeConnectUrl])

  const [savePaymentConfig, { error, status }] = useMutation<FormValues, PaymentUpdateType, Error>(
    (values): Promise<PaymentUpdateType> => {
      const newValue = {
        ...values,
        dealerCode,
      }
      const editData = {
        ...values,
        dealerCode,
        _id: initialValues?._id,
      }
      const url = initialValues?._id
        ? '/payment-management/payments-account/update-account'
        : '/payment-management/payments-account/create-account'
      return sendForm<PaymentUpdateType>(url, initialValues?._id ? editData : newValue, {
        withAuthentication: true,
        method: initialValues?._id ? 'PUT' : 'POST',
      })
    },
    {
      onSuccess(data): void {
        const { data: response } = data
        const value = {
          achMaxAmount: response.achMaxAmount,
          creditCardMaxAmount: response.creditCardMaxAmount,
          debitCardMaxAmount: response.debitCardMaxAmount,
          _id: response._id,
        }
        setAccountStatus(response.status)
        reset(value)
        void swrMutate(`/payment-management/payments-account/get-by-dealerCode/${dealerCode}`, undefined, true)
        getStripeConnectUrl(response._id)
      },
    },
  )

  return (
    <>
      <Form
        onSubmit={handleSubmit(async values => {
          if (values.achMaxAmount < 1 && values.creditCardMaxAmount < 1 && values.debitCardMaxAmount < 1) {
            confirm()
          } else {
            void (await savePaymentConfig(values))
          }
        })}
        error={error && selectErrorMessage(error)}
      >
        <div className="container bg-white rounded p-xl-5 p-lg-5 p-4 mt-2">
          <h2 className="section-subheading">{messages.title}</h2>
          <div className="row">
            <div className={cls(['col-xl-3 col-lg-3 col-md-6', styles.configColumn])}>
              <Controller
                control={control}
                name="achMaxAmount"
                rules={validation('achMaxAmount')}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    left
                    fractionDigits={0}
                    max={9999999999}
                    mode="currency"
                    label={messages.input.bankLimit}
                    name={name}
                    error={errors?.achMaxAmount?.message as string}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                    }}
                  />
                )}
              />
            </div>
            <div className={cls(['col-xl-3 col-lg-3 col-md-6', styles.configColumn])}>
              <Controller
                control={control}
                name="creditCardMaxAmount"
                rules={validation('creditCardMaxAmount')}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    min={0}
                    left
                    fractionDigits={0}
                    max={9999999999}
                    mode="currency"
                    label={messages.input.creditLimit}
                    name={name}
                    error={errors?.creditCardMaxAmount?.message as string}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                    }}
                  />
                )}
              />
            </div>
            <div className={cls(['col-xl-3 col-lg-3 col-md-6', styles.configColumn])}>
              <Controller
                control={control}
                name="debitCardMaxAmount"
                rules={validation('debitCardMaxAmount')}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    min={0}
                    left
                    fractionDigits={0}
                    max={9999999999}
                    mode="currency"
                    label={messages.input.DebitLimit}
                    error={errors?.debitCardMaxAmount?.message as string}
                    name={name}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                    }}
                  />
                )}
              />
            </div>
          </div>
          <div className={styles.stripeContainer}>
            Stripe Account Status: {accountStatus || 'Not Connected'}
            {accountStatus === 'InActive' && stripeUrl && ' | '}
            {accountStatus === 'InActive' && stripeUrl && (
              <a href={stripeUrl} className={styles.stripeLink}>
                Connect Stripe
              </a>
            )}
          </div>
          <div className="pt-4 d-flex justify-content-center">
            <Button
              type="submit"
              loading={(!isDirty && messages.button.save) || (status === 'running' && messages.button.saving)}
            >
              {messages.button.save}
            </Button>
          </div>
        </div>
      </Form>
    </>
  )
}
export default Payment
