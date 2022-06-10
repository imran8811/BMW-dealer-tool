import { InputHTMLAttributes, forwardRef } from 'react'
import cls from 'classnames'
import Field, { FieldProps } from '../Field'
import styles from './Input.module.scss'

export type InputProps = Omit<FieldProps, 'children'> &
  InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & {
    row?: number | boolean
  }

const InputComponent = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  ({ className, row, ...props }, ref) => (
    <Field className={cls([styles.formControl, styles.clearbtn, row && styles.textarea, className])} {...props}>
      {row ? <textarea ref={ref} /> : <input ref={ref} />}
    </Field>
  ),
)

export default InputComponent
