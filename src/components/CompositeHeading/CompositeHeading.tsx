import { FC, ReactNode } from 'react'
import cls from 'classnames'
import styles from './CompositeHeading.module.scss'

export type CompositeHeadingProps = {
  children: ReactNode | Array<ReactNode>
  className?: string
}

const CompositeHeading: FC<CompositeHeadingProps> = ({ children, className }) => (
  <div className={cls(styles.element, className)}>{children}</div>
)

export default CompositeHeading
