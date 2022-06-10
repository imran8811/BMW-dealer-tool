import { FC } from 'react'
import Form from '@components/Form'
import Button from '@components/Button'
import Input from '@components/Input'
import { Credentials } from '@common/utilities/credentialsStore'

import { useForm } from 'react-hook-form'
import useMutation from 'use-mutation'
import sendForm from '@common/utilities/sendForm'
import { useRouter } from 'next/router'
import routes from '@common/routes'
import { BadRequest } from '@common/utilities/fetcher'
import SectionHeading from '@components/SectionHeading'
import { passwordRegex } from '@common/utilities/constants'
import styles from './CreatePasswordForm.module.scss'

const messages = {
  heading: 'Create Password',
  password: 'Password',
  confirm: 'Confirm password',
  placeholder: 'Type here...',
  button: 'Save',
  validation: {
    password: 'Password is required',
    confirmPassword: 'Confirm password',
    strongPassword: 'Password is not strong.',
  },
}

const selectErrorMessage = (err: Error): string => {
  if (err instanceof BadRequest) {
    return err.getMessage()
  }
  return 'Unknown error'
}

type FormValues = {
  password: string
  confirmPassword: string
}

const CreatePasswordForm: FC = () => {
  const { handleSubmit, register, errors, getValues, watch } = useForm<FormValues>()
  const passwordValue = watch('password', '')

  const validation = {
    password: {
      required: {
        value: true,
        message: messages.validation.password,
      },
      validate: {
        matchesPattern: (value: string | undefined) => {
          if (value && !passwordRegex.exec(value)) {
            return messages.validation.strongPassword
          }
          return true
        },
      },
    },
    confirmPassword: {
      required: {
        value: true,
        message: messages.validation.confirmPassword,
      },
      validate: {
        matchesPreviousPassword: (value: string | undefined) => {
          const { password } = getValues()
          return password === value || 'Passwords should match!'
        },
      },
    },
  }

  const router = useRouter()

  const [createPassword, { error, status }] = useMutation<FormValues, Credentials, Error>(
    values =>
      sendForm('/dealer-management/create-password', values, {
        withAuthentication: true,
        method: 'PUT',
      }),
    {
      onSuccess(): void {
        void router.push(routes.workqueue)
      },
    },
  )

  return (
    <section className={styles.wrapper}>
      <SectionHeading className={styles.heading}>{messages.heading}</SectionHeading>
      <Form
        className={styles.form}
        onSubmit={handleSubmit(async values => void (await createPassword(values)))}
        error={error && selectErrorMessage(error)}
        method="POST"
      >
        <Input
          ref={register(validation.password)}
          error={errors?.password?.message}
          name="password"
          label={messages.password}
          placeholder={messages.placeholder}
          type="password"
          autoComplete="Off"
        />
        {(errors?.password?.message || (passwordValue && !passwordRegex.exec(passwordValue))) && (
          <>
            {' '}
            <small className="text-secondary font-weight-light">The password should contain:</small>
            <ul className="text-secondary font-weight-light">
              <li>
                <small>at least 08-35 characters</small>
              </li>
              <li>
                <small>at least one uppercase letter</small>
              </li>
              <li>
                <small>at least one numeric character</small>
              </li>
              <li>
                <small>at least one special character</small>
              </li>
            </ul>{' '}
          </>
        )}
        <Input
          name="confirmPassword"
          label={messages.confirm}
          placeholder={messages.placeholder}
          ref={register(validation.confirmPassword)}
          error={errors?.confirmPassword?.message}
          type="password"
          autoComplete="Off"
        />
        <Button type="submit" loading={status === 'running' && 'Saving'} className={styles.button}>
          {messages.button}
        </Button>
      </Form>
    </section>
  )
}

export default CreatePasswordForm
