import { FC } from 'react'
import Form from '@components/Form'
import Input from '@components/Input'
import { useForm } from 'react-hook-form'
import { BadRequest } from '@common/utilities/fetcher'
import Button from '@components/Button'
import SectionHeading from '@components/SectionHeading'
import useChangePassword, { ChangePasswordInput } from '@common/endpoints/useChangePassword'
import { passwordRegex } from '@common/utilities/constants'
import Link from 'next/link'
import routes from '@common/routes'

type FormValues = ChangePasswordInput

const messages = {
  title: 'Change Password',
  oldPassword: 'Current Password',
  confirmPassword: 'Confirm New Password',
  newPassword: 'New Password',
  placeholder: 'Type here...',
  save: 'Save',
  cancel: 'Cancel',
  validation: {
    oldPassword: 'Provide your current password',
    newPassword: 'New password is required',
    confirmNewPassword: 'You need to confirm new password',
    mustMatch: 'Passwords must match!',
    strongPassword: 'Password is not strong.',
  },
}

const selectErrorMessage = (err: Error): string => {
  if (err instanceof BadRequest) {
    return err.getMessage()
  }
  return 'Unknown error'
}

export type ChangePasswordFormProps = {
  onPasswordChange: () => void
}

const ChangePasswordForm: FC<ChangePasswordFormProps> = ({ onPasswordChange }) => {
  const { handleSubmit, register, errors, getValues, watch } = useForm<FormValues>()
  const passwordValue = watch('newPassword', '')
  const changePassword = useChangePassword()

  const validation = {
    oldPassword: {
      required: {
        value: true,
        message: messages.validation.oldPassword,
      },
    },
    newPassword: {
      required: {
        value: true,
        message: messages.validation.newPassword,
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
    confirmNewPassword: {
      required: {
        value: true,
        message: messages.validation.confirmNewPassword,
      },
      validate: {
        matchesNewPassword: (value: string | undefined) => {
          const { newPassword } = getValues()
          return newPassword === value || messages.validation.mustMatch
        },
      },
    },
  }

  const submitHandler = (values: FormValues) => {
    void changePassword.mutate(values, {
      onSuccess: () => void onPasswordChange(),
    })
  }

  return (
    <>
      <Form
        onSubmit={handleSubmit(submitHandler)}
        error={changePassword.error && selectErrorMessage(changePassword.error)}
        method="POST"
      >
        <SectionHeading className="mb-4 text-center">{messages.title}</SectionHeading>
        <Input
          name="oldPassword"
          ref={register(validation.oldPassword)}
          placeholder={messages.placeholder}
          error={errors?.oldPassword?.message}
          type="password"
          autoComplete="Off"
          label={messages.oldPassword}
        />
        <Input
          name="newPassword"
          ref={register(validation.newPassword)}
          placeholder={messages.placeholder}
          type="password"
          autoComplete="Off"
          error={errors?.newPassword?.message}
          label={messages.newPassword}
        />
        {(errors?.newPassword?.message || (passwordValue && !passwordRegex.exec(passwordValue))) && (
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
          ref={register(validation.confirmNewPassword)}
          placeholder={messages.placeholder}
          type="password"
          autoComplete="Off"
          error={errors?.confirmPassword?.message}
          label={messages.confirmPassword}
        />
        <div className="d-flex justify-content-center mt-3">
          <Link href={routes.workqueue}>
            <Button secondary disabled={changePassword.status === 'running'} className="mr-3">
              {messages.cancel}
            </Button>
          </Link>
          <Button type="submit" loading={changePassword.status === 'running' && 'Saving'}>
            {messages.save}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default ChangePasswordForm
