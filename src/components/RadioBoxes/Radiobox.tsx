import { ReactNode, InputHTMLAttributes, FC, Children, cloneElement, isValidElement } from 'react'
import cls from 'classnames'
import styles from './Radiobox.module.scss'

export type RadioboxProps = InputHTMLAttributes<HTMLInputElement> & {
  key?: string
  children?: ReactNode
  error?: ReactNode
  value: string | number | boolean
  selectedValue?: string | number | boolean
  onChange?: (e: unknown) => unknown
}

export type RadioGroupProps = {
  defaultValue?: string | boolean | number
  onChange: (e: unknown) => unknown
  name: string
  selectedValue?: string | boolean | number
  groupClass?: string
  error?: ReactNode
  children?: ReactNode
}

export const Radio: FC<RadioboxProps> = ({ key, name, children, error, onChange, selectedValue, value, ...props }) => (
  <>
    <label htmlFor={key || String(value)} className={styles.radiobox}>
      <input
        type="checkbox"
        id={key || String(value)}
        name={name}
        value={value}
        onChange={e => {
          onChange?.(e.target.value === selectedValue ? null : e.target.value)
        }}
        checked={value === selectedValue || false}
        {...props}
      />
      <span className={styles.label}>{children}</span>
    </label>
  </>
)

const RadioGroup: FC<RadioGroupProps> = ({
  defaultValue,
  onChange,
  name,
  selectedValue,
  groupClass,
  error,
  children,
}) => (
  <>
    <div className={cls([groupClass, styles.radioWrap])}>
      {Children.map(children, child => {
        if (isValidElement(child)) {
          return cloneElement(child, { onChange, name, selectedValue, defaultValue, error })
        }
        return child
      })}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  </>
)

export default RadioGroup
