import { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { DealershipTradeinConfig } from '@common/endpoints/typings.gen'
import Button from '@components/Button/Button'
import Input from '@components/Input/Input'
import Form from '@components/Form'
import NumberInput from '@components/NumberInput'
import { selectErrorMessage, sendForm } from '@common/utilities/http-api'
import useMutation from 'use-mutation'
import { mutate as swrMutate } from 'swr'

type FormValues = {
  provider: string
  percentage: number
}

const messages = {
  title: 'Trade-In',
  input: {
    percentage: 'Percentage',
    provider: 'Provider',
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
    percentage: 'Percentage  is Required',
    provider: 'Provider is Required',
  },
}

const validation = {
  percentage: {
    required: {
      value: true,
      message: messages.validation.percentage,
    },
  },
  provider: {
    required: {
      value: true,
      message: messages.validation.provider,
    },
  },
}

type ITradeInType = {
  initialValues?: DealershipTradeinConfig
  dealerCode: string
}

const Payment: FC<ITradeInType> = ({ initialValues, dealerCode }) => {
  const { register, errors, control, handleSubmit, formState, reset } = useForm<FormValues>({
    defaultValues: {
      provider: initialValues?.provider || 'KBB',
      percentage: initialValues?.percentage,
    },
  })

  const { isDirty } = formState
  const [saveTradeinConfig, { error, status }] = useMutation<FormValues, DealershipTradeinConfig, Error>(
    (values): Promise<DealershipTradeinConfig> => {
      const newValues = {
        ...values,
        provider: initialValues?.provider || 'KBB',
      }
      const url = `/dealer-management/dealer-config/update-tradein-config/${dealerCode}`
      return sendForm<DealershipTradeinConfig>(url, newValues, {
        withAuthentication: true,
        method: 'PATCH',
      })
    },
    {
      onSuccess(data): void {
        const { data: response } = data
        reset(response)
        void swrMutate(`/dealer-management/dealer-config/get-tradein-config/${dealerCode}`, undefined, true)
      },
    },
  )

  return (
    <>
      <Form
        onSubmit={handleSubmit(async values => void (await saveTradeinConfig(values)))}
        error={error && selectErrorMessage(error)}
      >
        <div className="container bg-white rounded p-xl-5 p-lg-5 p-4 mt-2">
          <h2 className="section-subheading">{messages.title}</h2>
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-6">
              <Input
                name="provider"
                disabled
                ref={register(validation.provider)}
                error={errors?.provider?.message as string}
                placeholder={messages.placeholder.typeHere}
                label={messages.input.provider}
              />
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <Controller
                control={control}
                name="percentage"
                rules={validation.percentage}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    mode="percentage"
                    left
                    noMax
                    label={messages.input.percentage}
                    name={name}
                    error={errors.percentage?.message}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                    }}
                  />
                )}
              />
            </div>
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
