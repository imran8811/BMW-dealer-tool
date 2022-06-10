import { ChangeEventHandler, FC, ReactNode } from 'react'
import cls from 'classnames'

import styles from './InputSwitch.module.scss'

export type InputSwitchProps = {
  name: string
  children?: ReactNode
  className?: string
  checked?: boolean
  disabled?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  labelPlacement?: 'left' | 'right'
}

const InputSwitch: FC<InputSwitchProps> = ({
  name,
  onChange,
  className,
  disabled,
  checked,
  children,
  labelPlacement,
}) => (
  <div className={cls(styles.inputSwitch, disabled && styles.disabled, className)}>
    <label className={cls(styles.label)} htmlFor={name}>
      {children && labelPlacement === 'left' && <span className={styles.textLeft}>{children}</span>}
      <div className={cls(styles.indicator, checked && styles.checked)} />
      <input
        type="checkbox"
        className={styles.input}
        disabled={disabled}
        checked={checked}
        name={name}
        id={name}
        onChange={onChange}
      />
      {children && !labelPlacement && <span className={styles.textRight}>{children}</span>}
    </label>
  </div>
)

export default InputSwitch
