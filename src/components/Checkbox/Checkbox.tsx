import { ReactNode, forwardRef, InputHTMLAttributes } from 'react'
import styles from './Checkbox.module.scss'

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  key?: string | number
  name: string
  children?: ReactNode
  error?: ReactNode
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ key, name, children, error, ...props }, ref) => (
  <>
    {error && <div className={styles.error}>{error}</div>}
    <label htmlFor={String(key || name)} className={styles.checkbox}>
      <input type="checkbox" id={String(key || name)} name={name} {...props} ref={ref} />
      <span className={styles.label}>{children}</span>
    </label>
  </>
))

export default Checkbox
