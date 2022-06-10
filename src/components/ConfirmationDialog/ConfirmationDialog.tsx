import React, { FC, ReactNode } from 'react'
import cls from 'classnames'
import Dialog, { DialogProps } from '@components/Dialog'
import Button from '@components/Button'
import Icon from '@components/Icon'
import { IconName } from '@components/Icon/Icon'
import styles from './ConfirmationDialog.module.scss'

export type ConfirmationDialogProps = Omit<DialogProps, 'children' | 'onHide'> & {
  title?: string
  visible: boolean
  icon?: IconName
  message?: string | ReactNode
  classConfirm?: string
  className?: string
  rejectBtnText?: string
  acceptBtnText?: string
  swapButtons?: boolean
  rejectBtnClass?: string
  acceptBtnClass?: string
  onClose: () => unknown
  onReject?: () => unknown
  onAccept?: () => unknown
  isLoading?: boolean
  hideBtns?: boolean
  secondaryTitle?: string
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  title,
  message,
  rejectBtnText,
  acceptBtnText,
  classConfirm,
  visible,
  className,
  icon,
  swapButtons,
  rejectBtnClass,
  acceptBtnClass,
  onClose,
  onAccept,
  onReject,
  isLoading,
  hideBtns,
  secondaryTitle,
  ...props
}) => {
  return (
    <Dialog
      {...props}
      visible={visible}
      onHide={onClose}
      showHeader={false}
      className={cls([styles['confirm-dialog-container'], classConfirm && classConfirm, className && className])}
    >
      <div className={cls(styles.wrapbox)}>
        {title && <h3 className={cls(styles.title)}>{title}</h3>}
        {icon && (
          <div className={styles.icon}>
            <Icon size={132} name={icon} />
          </div>
        )}
        {secondaryTitle && <h3 className={cls(styles.title)}>{secondaryTitle}</h3>}
        {message &&
          (typeof message === 'string' ? (
            <p className={cls(styles.description)}>{message}</p>
          ) : (
            <div className={cls(styles.description)}>{message}</div>
          ))}

        <div className={swapButtons ? styles.buttonContainerSwap : styles.buttoncontainer}>
          {onAccept && (
            <Button
              onClick={onAccept}
              type="button"
              className={cls(
                !swapButtons && styles['btn-confirm-dialog'],
                'm-2',
                styles.responsiveBtn,
                acceptBtnClass && acceptBtnClass,
                hideBtns && 'd-none',
              )}
              secondary={!swapButtons}
              loading={isLoading && 'Saving...'}
              disabled={isLoading}
            >
              {acceptBtnText || 'Yes'}
            </Button>
          )}
          {onReject && (
            <Button
              className={cls(
                swapButtons && styles['btn-confirm-dialog'],
                styles.responsiveBtn,
                'm-2',
                rejectBtnClass && rejectBtnClass,
                hideBtns && 'd-none',
              )}
              onClick={onReject}
              type="button"
              secondary={swapButtons}
              disabled={isLoading}
            >
              {rejectBtnText || 'No'}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}

export default ConfirmationDialog
