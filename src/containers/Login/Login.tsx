import { useForm } from 'react-hook-form'
import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import jwt_decode from 'jwt-decode'
import { useRouter } from 'next/router'

import routes from '@common/routes'
import { setCredentials, Credentials, UserData } from '@common/utilities/credentialsStore'
import sendForm from '@common/utilities/sendForm'
import useMutation from 'use-mutation'
import { validateEmail } from '@common/utilities/validation'
import { BadRequest } from '@common/utilities/fetcher'
import useUser from '@common/utilities/useUser'
import Input from '@components/Input'
import Button from '@components/Button'
import Form from '@components/Form'
import useSessionStorage from '@common/utilities/useSessionStorage'
import dayjs, { Dayjs } from 'dayjs'
import { ErrorDataType } from '@common/utilities/http-api'
import { DealerDomainsResponse } from '@common/endpoints/typings.gen'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig() as { publicRuntimeConfig: { tenantId: string } }
const TENANT_ID = publicRuntimeConfig.tenantId === 'fair' ? 'mini' : publicRuntimeConfig.tenantId

type FormValues = {
  email: string
  password: string
}

export const messages = {
  welcome: `Welcome to ${TENANT_ID.toUpperCase()}`,
  email: 'Email',
  password: 'Password',
  forgotPassword: 'Forgot your password?',
  newToMini: `New to ${TENANT_ID.toUpperCase()}?`,
  createAccount: 'Create Account',
  login: 'Login',
  passwordLength: 'Password length should not exceed 40 characters.',
  bruteForceErrorCode: '1005_0058_USER_ACCOUNT_BLOCKED',
  bruteForceMessage: (time: string) =>
    time !== '0:00'
      ? `Your account has been locked. You can try accessing it again after ${time} minutes.`
      : 'Try again with correct credentials.',
  placeholder: 'Type here…',
  successfulLogin: 'is login successful.',
  invalidDomainError: (domain: string) =>
    `Invalid credentials for this domain, looks like your domain is <a href="${domain}">${domain}</a>`,
  validation: {
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
  },
}

const validation = {
  email: {
    required: {
      value: true,
      message: messages.validation.emailRequired,
    },
    validate: {
      matchesPattern: validateEmail(),
    },
  },
  password: {
    required: {
      value: true,
      message: messages.validation.passwordRequired,
    },
    validate: {
      matchesPattern: (value: string | undefined) => (!(value && value.length < 41) ? messages.passwordLength : true),
    },
  },
}

const selectErrorMessage = (err?: Error): string => {
  if (err instanceof BadRequest) {
    return err.getMessage()
  }
  if (err instanceof Error) {
    return err.message.toString()
  }
  return 'Unknown error'
}

const Login: FC = () => {
  const [storedUrl, setStoredUrl] = useSessionStorage('PRE_LOGIN_URL')
  const [timeNow, setTimeNow] = useState<string>('')
  const [remainingTime, setRemainingTime] = useState<Dayjs | null>()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register, errors } = useForm<FormValues>()
  const [performLogin, { error, status }] = useMutation<FormValues, Credentials, Error>(
    values => {
      return sendForm('/dealer-management/passport-sign-in', values, {
        withAuthentication: false,
      })
    },
    {
      onSuccess: ({ data }) => {
        setCredentials(data)
        const token: UserData | undefined = jwt_decode(data.accessToken || '')
        if (token?.isNewUser) {
          void router.push(routes.createPassword)
        } else if (storedUrl) {
          setStoredUrl(routes.workqueue)
          void router.push(storedUrl === routes.login ? routes.workqueue : storedUrl)
        } else void router.push(routes.workqueue)
      },
      onFailure({ error: failureError }: { error: any }) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const errorObj = failureError?.data as ErrorDataType
        // Fetch Account Locked timeout from response
        if (errorObj?.errorCode === messages.bruteForceErrorCode) {
          const remainingSeconds = errorObj.message
          const timeInMinutes = Number(remainingSeconds) / 60
          const timeInSeconds = Number(remainingSeconds) % 60
          const time = dayjs().add(timeInMinutes, 'minute').add(timeInSeconds, 'second')
          setRemainingTime(time)
        }
      },
    },
  )

  const [loginWithCheckingDealerDomain, { error: errorDealerDomain, status: statusDealerDomain }] = useMutation<
    FormValues,
    DealerDomainsResponse,
    Error
  >(
    values => {
      setRemainingTime(null)
      setTimeNow('')
      return sendForm(
        '/dealer-management/get-dealer-domain',
        { email: values.email },
        {
          withAuthentication: false,
        },
      )
    },
    {
      onSuccess: async ({ data, input }) => {
        if (data.digitalRetailAdminWebsite) {
          const url = new URL(data.digitalRetailAdminWebsite)
          if (window.location.host !== url.host) {
            throw new Error(messages.invalidDomainError(data.digitalRetailAdminWebsite))
          }
        }
        await performLogin(input)
      },
      onFailure() {},
    },
  )

  const router = useRouter()
  const user = useUser()
  const isLoggedIn = user && Object.keys(user).length > 0

  useEffect(() => {
    if (router) {
      void router.prefetch(routes.workqueue)
    }
  }, [router])

  useEffect(() => {
    if (isLoggedIn && router) {
      void router.push(routes.workqueue)
    }
  }, [isLoggedIn, router])

  // Timer Functionality
  useEffect(() => {
    if (remainingTime) {
      const timerInterval = setInterval(() => {
        const h = remainingTime.diff(dayjs(), 'minute') % 60
        const m = remainingTime.diff(dayjs(), 'second') % 60
        if (h === 0 && m === 0) {
          setRemainingTime(null)
          clearInterval(timerInterval)
        }
        setTimeNow(`${h}:${m.toString().padStart(2, '0')}`)
      }, 1000)
      return () => clearInterval(timerInterval)
    }
  }, [timeNow, remainingTime])

  return !isLoggedIn ? (
    <>
      <h1 className="form-title text-center mb-4">{messages.welcome}</h1>
      <Form
        onSubmit={handleSubmit(async values => void (await loginWithCheckingDealerDomain(values)))}
        // Account Locked error message
        error={
          remainingTime || timeNow === '0:00'
            ? messages.bruteForceMessage(timeNow)
            : (errorDealerDomain || error) && selectErrorMessage(errorDealerDomain || error)
        }
        isReactNodeError={errorDealerDomain}
        method="POST"
      >
        <Input
          name="email"
          type="text"
          ref={register(validation.email)}
          label={messages.email}
          error={errors?.email?.message}
          placeholder={messages.placeholder}
        />
        <Input
          name="password"
          type="password"
          autoComplete="Off"
          ref={register(validation.password)}
          label={messages.password}
          error={errors?.password?.message}
          placeholder={messages.placeholder}
          description={
            <Link href={routes.forgotPass}>
              <a className="text-muted">{messages.forgotPassword}</a>
            </Link>
          }
        />
        <Button
          type="submit"
          disabled={!!remainingTime}
          center
          loading={[status, statusDealerDomain].includes('running') && 'Logging in'}
        >
          {messages.login}
        </Button>
      </Form>
    </>
  ) : null
}

export default Login
