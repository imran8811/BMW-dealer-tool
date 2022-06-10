import { FC } from 'react'
import { useRouter } from 'next/router'
import ConfirmationDialog from '@components/ConfirmationDialog'
import { useModal } from 'react-modal-hook'
import ChangePasswordForm from './ChangePasswordForm'

const messages = {
  confirm: {
    title: 'Password changed',
    message: 'Password has been successfully changed, you can re-login using new credentials.',
    button: 'OK',
  },
}

const ChangePassword: FC = () => {
  const router = useRouter()
  const [showModal] = useModal(() => {
    const finish = () => {
      void router.push('/')
    }

    return (
      <ConfirmationDialog
        visible
        title={messages.confirm.title}
        message={messages.confirm.message}
        acceptBtnText={messages.confirm.button}
        onAccept={finish}
        onClose={finish}
        closeOnEscape={false}
        dismissableMask={false}
      />
    )
  })

  return (
    <div className="col-12 col-md-6 col-xl-4">
      <ChangePasswordForm onPasswordChange={showModal} />
    </div>
  )
}

export default ChangePassword
