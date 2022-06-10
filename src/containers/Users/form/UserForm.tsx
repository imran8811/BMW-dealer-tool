import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { mutateMany } from 'swr-mutate-many'
import useMutation from 'use-mutation'
import cls from 'classnames'

import sendForm from '@common/utilities/sendForm'
import { validateEmail } from '@common/utilities/validation'
import { BadRequest } from '@common/utilities/fetcher'
import { useDealershipContext } from '@common/utilities/dealershipContext'
import { Credentials } from '@common/utilities/credentialsStore'
import { UserAccount } from '@common/endpoints/useUsers'
import Input from '@components/Input'
import Button from '@components/Button'
import Form from '@components/Form'
import Select from '@components/Select'
import MaskedInput from '@components/MaskedInput'
import styles from './UserForm.module.scss'

type FormValues = {
  _id?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string | number
  jobTitle?: string
  roleCode?: string
  roleDisplayName?: string
  isActive: boolean
  dealerCode?: string
}

const messages = {
  phoneMask: '(999) 999-9999',
  input: {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone Number',
    job: 'Job title',
    role: 'Role',
    status: 'Status',
    roleDropdownPlaceholder: 'Select',
    statusDropdownPlaceholder: 'Select',
  },
  button: {
    save: 'Save',
    cancel: 'Cancel',
  },
  validation: {
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    emailRequired: 'Email is required',
    phoneNumberRequired: 'Phone number is required',
    phoneNumberFormat: 'Please provide correct phone number',
    jobTitleRequired: 'Job title is required',
    statusRequired: 'Status is required',
    roleRequired: 'Role is required',
  },
}

const validation = {
  firstName: {
    required: {
      value: true,
      message: messages.validation.firstNameRequired,
    },
  },
  lastName: {
    required: {
      value: true,
      message: messages.validation.lastNameRequired,
    },
  },
  email: {
    required: {
      value: true,
      message: messages.validation.emailRequired,
    },
    validate: {
      matchesPattern: validateEmail(),
    },
  },
  phoneNumber: {
    required: {
      value: true,
      message: messages.validation.phoneNumberRequired,
    },
    validate: {
      matchesPattern: (value: string | undefined) => {
        const regexp = /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/
        if (!value || !regexp.exec(value)) {
          return messages.validation.phoneNumberFormat
        }
        return true
      },
    },
  },
  jobTitle: {
    required: {
      value: true,
      message: messages.validation.jobTitleRequired,
    },
  },
  isActive: {
    required: {
      value: true,
      message: messages.validation.statusRequired,
    },
  },
  roleDisplayName: {
    required: {
      value: true,
      message: messages.validation.roleRequired,
    },
  },
}

const roles = [
  {
    label: 'Dealer admin',
    value: 'DealerAdmin',
  },
  {
    label: 'Dealer agent',
    value: 'DealerAgent',
  },
]

const statuses = [
  {
    label: 'Active',
    value: 'true',
  },
  {
    label: 'Inactive',
    value: 'false',
  },
]

const selectErrorMessage = (err: Error): string => {
  if (err instanceof BadRequest) {
    return err.getMessage()
  }
  return 'Unknown error'
}

type UserFormData = {
  handleFormClose: () => void
  userData?: UserAccount | Record<string, undefined> | undefined
}

const UserForm: FC<UserFormData> = ({ handleFormClose, userData }) => {
  const { getCurrentDealershipCode } = useDealershipContext()
  const dealerCode = getCurrentDealershipCode()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register, errors, control, setValue } = useForm<FormValues>({
    defaultValues: {
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      email: userData?.email,
      phoneNumber: userData?.phoneNumber,
      jobTitle: userData?.jobTitle,
      roleCode: userData?.roleCode,
      roleDisplayName: userData?.roleDisplayName,
      isActive: !!userData?.isActive,
    },
  })

  const setRole = useCallback(() => {
    if (!userData) {
      setValue('roleCode', 'DealerAdmin')
    }
  }, [userData, setValue])

  useEffect(() => {
    setRole()
  }, [setRole])

  const [saveUser, { error, status }] = useMutation<FormValues, unknown, Error>(
    async values => {
      const roleDisplayName = roles.find(({ value }) => value === values.roleCode)?.label

      const formData: FormValues = {
        ...values,
        roleDisplayName,
        dealerCode,
      }

      const isEdit = !!userData

      if (isEdit) {
        formData._id = userData?._id
      }
      const url = isEdit ? '/dealer-management/edit-account' : '/dealer-management/sign-up'

      return sendForm<Credentials>(url, formData, {
        withAuthentication: true,
        method: isEdit ? 'PUT' : 'POST',
      })
    },
    {
      onSuccess: async () => {
        await mutateMany('*/dealer-management/get-dealer-accounts*', undefined, true)
        handleFormClose()
      },
    },
  )

  return (
    <>
      <Form
        onSubmit={handleSubmit(async values => {
          void (await saveUser(values))
        })}
        error={error && selectErrorMessage(error)}
      >
        <div className={styles.row}>
          <div className={styles.cell}>
            <Input
              label={messages.input.firstName}
              name="firstName"
              error={errors?.firstName?.message}
              ref={register(validation.firstName)}
            />
          </div>
          <div className={styles.cell}>
            <Input
              label={messages.input.lastName}
              name="lastName"
              error={errors?.lastName?.message}
              ref={register(validation.lastName)}
            />
          </div>
        </div>
        <Input
          label={messages.input.email}
          name="email"
          type="email"
          error={errors?.email?.message}
          ref={register(validation.email)}
        />
        <div className="mb-3">
          <Controller
            control={control}
            name="phoneNumber"
            defaultValue={userData?.phoneNumber || ''}
            rules={validation.phoneNumber}
            render={({ onChange, value, name }) => (
              <MaskedInput
                error={errors?.phoneNumber?.message}
                name={name}
                label={messages.input.phone}
                small
                value={value as string}
                mask={messages.phoneMask}
                onChange={e => {
                  onChange(e?.value)
                }}
                placeholder={messages.phoneMask}
              />
            )}
          />
        </div>
        <Input
          label={messages.input.job}
          name="jobTitle"
          ref={register(validation.jobTitle)}
          error={errors?.jobTitle?.message}
        />
        <Controller
          control={control}
          name="roleCode"
          render={({ onChange, name, value }) => (
            <Select
              name={name}
              label={messages.input.role}
              value={value as FormValues['roleCode']}
              onChange={e => onChange(e?.target?.value)}
              options={roles}
              error={errors?.roleCode?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="isActive"
          render={({ onChange, name, value }) => (
            <>
              <Select
                name={name}
                label={messages.input.status}
                value={value ? 'true' : 'false'}
                onChange={e => {
                  onChange(e?.target?.value === 'true')
                }}
                options={statuses}
                error={errors?.roleDisplayName?.message}
              />
            </>
          )}
        />
        <div className={cls(styles.row, styles.centered)}>
          <Button className={styles.button} onClick={handleFormClose} secondary disabled={status === 'running'}>
            {messages.button.cancel}
          </Button>
          <Button className={styles.button} type="submit" loading={status === 'running' && 'Saving'}>
            {messages.button.save}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default UserForm
