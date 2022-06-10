import { useForm } from 'react-hook-form'
import { FC, useEffect, useState } from 'react'

import sendForm from '@common/utilities/sendForm'
import useMutation from 'use-mutation'
import { validateEmail } from '@common/utilities/validation'

import Input from '@components/Input'
import Button from '@components/Button'
import Form from '@components/Form'
import { useRouter } from 'next/router'
import routes from '@common/routes'
import useUser from '@common/utilities/useUser'

type FormValues = {
  email: string
}

const messages = {
  title: 'Forgot Password?',
  email: 'Enter your registered email address',
  submit: 'Send Reset link',
  back: 'Back To Login',
  infoMessage:
    'Please enter your registered email address for security purposes.' +
    ' When you receive the reset password email, please follow the instructions.',
  successMsg: 'Password reset information is sent to your email.',
  placeholder: 'Type here…',
  notFound: "We couldn't find any account against this email address. Please provide a valid Email ID",
  validation: {
    emailRequired: 'Email is required',
  },
}

const validation = {
  required: {
    value: true,
    message: messages.validation.emailRequired,
  },
  validate: {
    matchesPattern: validateEmail(),
  },
}

const ForgotPassword: FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const { handleSubmit, register, errors, reset, setError } = useForm<FormValues>()
  /** TODO: API integration is yet to be done */
  const [submitEmail, { error, status }] = useMutation<FormValues, FormValues, Error>(
    values =>
      sendForm('/dealer-management/forgot-password', values, {
        withAuthentication: false,
      }),
    {
      onSuccess() {
        reset()
        setIsSubmitted(true)
      },
      onFailure() {
        setError('email', { message: 'Please provide a valid Email ID' })
      },
    },
  )

  const user = useUser()
  const isLoggedIn = user && Object.keys(user).length > 0

  useEffect(() => {
    if (isLoggedIn && router) {
      void router.push(routes.workqueue)
    }
  }, [isLoggedIn, router])

  return (
    <>
      <h1 className="form-title text-center mb-4">{messages.title}</h1>
      {isSubmitted ? (
        <>
          <p className="text-muted mt-4 py-2 text-center">{messages.successMsg}</p>
          <Button type="button" center onClick={() => router.push(routes.login)}>
            {messages.back}
          </Button>
        </>
      ) : (
        <Form
          onSubmit={handleSubmit(async values => void (await submitEmail(values)))}
          error={error && messages.notFound}
        >
          <Input
            name="email"
            type="text"
            ref={register(validation)}
            label={messages.email}
            error={errors?.email?.message}
            placeholder={messages.placeholder}
          />
          <Button type="submit" center loading={status === 'running' && 'Verifying...'}>
            {messages.submit}
          </Button>
          <p className="text-muted mt-4 text-center">{messages.infoMessage}</p>
        </Form>
      )}
    </>
  )
}

export default ForgotPassword
