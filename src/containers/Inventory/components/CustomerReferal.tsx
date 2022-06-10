import { useSendReferralEmail } from '@common/endpoints/useInventory'
import { selectErrorMessage } from '@common/utilities/http-api'
import { validateEmail } from '@common/utilities/validation'
import Button from '@components/Button'
import Dialog from '@components/Dialog'
import Form from '@components/Form'
import Input from '@components/Input'
import SectionHeading from '@components/SectionHeading'
import { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styles from './AddAddonPopup.module.scss'

type FormValues = {
  firstName: string
  lastName: string
  email: string
}

const messages = {
  heading: 'Send Invite',
  input: {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    typeHere: 'Type here...',
    emailPlaceholder: 'sample@sample.com',
  },
  buttons: {
    send: 'Send',
    cancel: 'Cancel',
    sending: 'Sending...',
  },
}

const validation = (field: keyof typeof messages.input, required: boolean, isEmail?: boolean) => ({
  required: {
    value: required,
    message: `${messages.input[field]} is Required`,
  },
  validate: !isEmail
    ? undefined
    : {
        matchesPattern: validateEmail(`Valid ${messages.input[field]} is Required`),
      },
})

const CustomerReferral: FC<{ onHide: () => unknown; vin: string }> = ({ onHide, vin }) => {
  const { control, errors, handleSubmit } = useForm<FormValues>()
  const { mutate: sendEmail, status, error } = useSendReferralEmail()

  const submit = async (values: FormValues) => {
    void (await sendEmail(
      { ...values, vin },
      {
        onSuccess() {
          onHide()
        },
      },
    ))
  }

  return (
    <Dialog
      onHide={() => {
        onHide()
      }}
      visible
      className={styles.customerReferralDialog}
      header={<SectionHeading>{messages.heading}</SectionHeading>}
    >
      <Form onSubmit={handleSubmit(submit)} error={error && selectErrorMessage(error)}>
        <>
          <div className="px-3">
            <div className="row">
              <div className="col-lg-6 col-md-6 col-sm-12 px-1">
                <Controller
                  control={control}
                  name="firstName"
                  rules={validation('firstName', false)}
                  render={({ onChange, value, name }) => (
                    <Input
                      label={messages.input.firstName}
                      value={value as string}
                      placeholder={messages.input.typeHere}
                      error={errors?.firstName?.message}
                      name={name}
                      onChange={e => onChange(e.target.value)}
                    />
                  )}
                />
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 px-1">
                <Controller
                  control={control}
                  name="lastName"
                  rules={validation('lastName', false)}
                  render={({ onChange, value, name }) => (
                    <Input
                      label={messages.input.lastName}
                      value={value as string}
                      placeholder={messages.input.typeHere}
                      error={errors?.lastName?.message}
                      name={name}
                      onChange={e => onChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>
            <div className="row">
              <div className="col px-1">
                <Controller
                  control={control}
                  name="email"
                  rules={validation('email', true, true)}
                  render={({ onChange, value, name }) => (
                    <Input
                      label={messages.input.email}
                      value={value as string}
                      placeholder={messages.input.emailPlaceholder}
                      error={errors?.email?.message}
                      name={name}
                      onChange={e => onChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>
            <div className="row pt-2">
              <div className="col-lg-6 col-md-6 col-sm-12 p-1">
                <Button className="w-100" onClick={() => onHide()} secondary>
                  {messages.buttons.cancel}
                </Button>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 p-1">
                <Button className="w-100" loading={status === 'running' && messages.buttons.sending} type="submit">
                  {messages.buttons.send}
                </Button>
              </div>
            </div>
          </div>
        </>
      </Form>
    </Dialog>
  )
}

export default CustomerReferral
