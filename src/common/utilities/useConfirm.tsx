import React, { ReactNode, useState } from 'react'
import { useModal } from 'react-modal-hook'
import ConfirmDialog from '@components/ConfirmationDialog'
import { IconName } from '@components/Icon/Icon'

interface Options {
  title?: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  className?: string
  /** Gets called if user confirms the choice */
  onConfirm?: () => unknown
  /** Gets called if user rejects the choice */
  onReject?: () => unknown
  /** Call it to display only one option */
  hideReject?: boolean
  /** Call it to hide Reject button */
  hideAccept?: boolean
  icon?: IconName
  /** Call it to swap Confirm and Cancel buttons */
  swapButtons?: boolean
  acceptBtnClass?: string
  rejectBtnClass?: string
  /** Operate async operation before closing the dialog */
  onBeforeConfirm?: (resolve: (e: string) => unknown, reject: (e: string) => unknown) => unknown

  /** Loading state in case of server side dialog confirmation */
  isLoading?: boolean
}

/**
 * Displays a confirmation dialog.
 */
export default function useConfirm({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onReject,
  className,
  hideReject,
  hideAccept,
  icon,
  swapButtons,
  rejectBtnClass,
  acceptBtnClass,
  onBeforeConfirm,
  isLoading,
}: Options): {
  confirm: () => void
  cancel: () => void
} {
  const [dialogContent, setDialogContent] = useState<{
    title: 'Success' | 'Failure'
    message: string
    icon: IconName
    retryText?: string
    hideBtns?: boolean
  } | null>(null)

  const handleConfirmation = () => {
    if (onBeforeConfirm) {
      setDialogContent(null)
      const getResultFromPromise = new Promise((resolve, reject) => {
        void onBeforeConfirm(resolve, reject)
      })
      void getResultFromPromise
        .then(data => {
          // if API call is successfull then show success message and them close the dialog after 3 seconds
          setDialogContent({
            title: 'Success',
            message: data as string,
            icon: 'checkCircle',
            hideBtns: true,
          })
          setTimeout(() => {
            hide()
            onConfirm?.()
            setDialogContent(null)
          }, 3000)
          return data
        })
        .catch(error => {
          // if API call fails then show the error message
          setDialogContent({
            title: 'Failure',
            message: error as string,
            icon: 'ocross',
            retryText: 'Try Again',
          })
        })
    } else {
      hide()
      onConfirm?.()
    }
  }
  const [show, hide] = useModal(
    () => (
      <ConfirmDialog
        visible
        icon={dialogContent?.icon || icon}
        onClose={hide}
        title={title}
        secondaryTitle={dialogContent?.title || undefined}
        message={dialogContent?.message || message}
        className={className}
        acceptBtnText={dialogContent?.retryText || confirmText}
        rejectBtnText={cancelText}
        acceptBtnClass={acceptBtnClass}
        rejectBtnClass={rejectBtnClass}
        swapButtons={swapButtons}
        onAccept={hideAccept ? undefined : () => handleConfirmation()}
        onReject={
          hideReject
            ? undefined
            : () => {
                hide()
                setDialogContent(null)
                onReject?.()
              }
        }
        hideBtns={dialogContent?.hideBtns || false}
        isLoading={isLoading}
      />
    ),
    [title, message, icon, confirmText, cancelText, handleConfirmation, onReject],
  )

  return {
    confirm: (): void => {
      show()
    },
    cancel: (): void => {
      hide()
    },
  }
}
