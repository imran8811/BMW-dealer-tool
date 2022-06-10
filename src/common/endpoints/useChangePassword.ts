import useMutation from 'use-mutation'
import { clearCredentials, Credentials } from '@common/utilities/credentialsStore'
import sendForm from '@common/utilities/sendForm'

export interface ChangePasswordInput {
  oldPassword: string
  confirmPassword: string
  newPassword: string
}

const useChangePassword = () => {
  const [mutate, result] = useMutation<ChangePasswordInput, Credentials, Error>(
    values =>
      sendForm('/dealer-management/update-password', values, {
        withAuthentication: true,
        method: 'PUT',
      }),
    {
      onSuccess: () => {
        clearCredentials()
      },
    },
  )

  return {
    mutate,
    ...result,
  }
}

export default useChangePassword
