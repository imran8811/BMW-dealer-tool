import { FC, ButtonHTMLAttributes } from 'react'
import cls from 'classnames'
import styles from './Button.module.scss'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  center?: boolean
  secondary?: boolean
  tertiary?: boolean
  fullWidth?: boolean
  hoverPrimary?: boolean
  small?: boolean
  loading?: boolean | string
  'data-testid'?: string
}

const messages = {
  defaultLoadingText: 'Loading…',
}

const Button: FC<ButtonProps> = ({
  type,
  center,
  secondary,
  tertiary,
  fullWidth,
  hoverPrimary,
  className,
  loading,
  small,
  children,
  'data-testid': testId,
  ...props
}) => {
  const loadingText = typeof loading === 'string' ? `${loading}` : messages.defaultLoadingText

  return (
    <button
      data-testid={testId}
      type={type || 'button'}
      className={cls(
        styles.button,
        !secondary && !tertiary && styles.buttonPrimary,
        secondary && styles.buttonSecondary,
        tertiary && styles.buttonTertiary,
        hoverPrimary && styles.hoverPrimary,
        center && styles.center,
        fullWidth && styles.fullWidth,
        !!loading && styles.loading,
        small && styles.small,
        className,
      )}
      disabled={!!loading}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  )
}

export default Button
