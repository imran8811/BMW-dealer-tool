import { FC, ReactNode } from 'react'
import { Dialog as PrimeDialog, DialogProps as PrimeDialogProps } from 'primereact/dialog'
import cls from 'classnames'
import styles from './Dialog.module.scss'

export type DialogProps = PrimeDialogProps & {
  children: ReactNode
  className?: string
}

const Dialog: FC<DialogProps> = ({ children, className, ...props }) => (
  <PrimeDialog
    blockScroll
    maskClassName={cls(styles.dialogmask)}
    className={cls(styles.dialog, className)}
    focusOnShow={false}
    {...props}
  >
    {children}
  </PrimeDialog>
)

export default Dialog
