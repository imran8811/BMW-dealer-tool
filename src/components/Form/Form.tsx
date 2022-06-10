import { FC, ReactNode, FormHTMLAttributes } from 'react'
import styles from './Form.module.scss'

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  error?: ReactNode
  isReactNodeError?: ReactNode
}

const Form: FC<FormProps> = ({ error, children, isReactNodeError, ...props }) => (
  <form {...props}>
    {children}
    {isReactNodeError ? (
      <div className={styles.error} dangerouslySetInnerHTML={{ __html: (error || isReactNodeError) as string }} />
    ) : (
      <div className={styles.error}>{error}</div>
    )}
  </form>
)

export default Form
