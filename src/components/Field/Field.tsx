import { ReactNode, ReactElement, isValidElement, cloneElement, FC } from 'react'
import cls from 'classnames'
import Icon from '@components/Icon'
import styles from './Field.module.scss'

export type FieldProps = {
  name: string // unique key in the form
  children: ReactElement
  label?: ReactNode
  error?: ReactNode
  description?: ReactNode
  className?: string
  containerClass?: string
  small?: boolean
  optional?: boolean
  /** fix to stop scroll events when multiselect is in focus  */
  preventdefaultOnLabelClick?: boolean
  onClear?: () => void
}

const FieldComponent: FC<FieldProps> = ({
  containerClass,
  children,
  name,
  label,
  description,
  className,
  error,
  small,
  optional,
  preventdefaultOnLabelClick,
  onClear,
  ...props
}) => {
  const childEl = (
    <>
      {label && <span className={styles.labelSpan}>{label}</span>}{' '}
      {optional && <span className={styles.optional}>- Optional</span>}
      <div className={styles.fieldWrapper}>
        {isValidElement(children) &&
          cloneElement(children, {
            name,
            id: name,
            className: cls(error && 'is-invalid', small && styles.smallInput, className),
            'aria-describedby': description ? `${name}-description` : null,
            ...props,
          })}
        {onClear && (
          <button onClick={onClear} className={styles.clearButton}>
            <Icon size={24} name="clear" />
          </button>
        )}
      </div>
    </>
  )
  return (
    <div className={cls(styles.formGroup, small && styles.smallWrapper, containerClass)}>
      {preventdefaultOnLabelClick ? (
        <div className={`${styles.label} ${error ? styles['label--invalid'] : ''}`}>{childEl}</div>
      ) : (
        <label htmlFor={name} className={`${styles.label} ${error ? styles['label--invalid'] : ''}`}>
          {childEl}
        </label>
      )}
      {error && <div className={`${styles.error}`}>{error}</div>}
      {description && (
        <div className={styles.description} id={`${name}-description`}>
          {description}
        </div>
      )}
    </div>
  )
}

export default FieldComponent
