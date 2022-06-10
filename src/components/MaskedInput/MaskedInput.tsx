import { InputMask, InputMaskProps } from 'primereact/inputmask'
import { FC } from 'react'
import cls from 'classnames'
import Field from '../Field'
import styles from './MaskedInput.module.scss'

export interface MaskedInputProps extends InputMaskProps {
  label?: string
  error?: string
  name?: string
  small?: boolean
  optional?: boolean
  onClear?: () => void
}

const MaskedInput: FC<MaskedInputProps> = ({
  mask,
  label,
  name,
  value,
  maxlength,
  size,
  error,
  className,
  small,
  optional,
  onClear,
  ...props
}) => (
  <Field
    optional={optional}
    name={name || ''}
    onClear={onClear}
    error={error}
    label={label}
    className={cls(className, styles.formControl, onClear && styles.clearbtn)}
    small={small}
  >
    <InputMask mask={mask} value={value} maxlength={maxlength} size={size} {...props} />
  </Field>
)

export default MaskedInput
