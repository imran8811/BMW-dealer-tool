import { FC, ReactNode } from 'react'
import cls from 'classnames'
import styles from './List.module.scss'

export type ListProps = {
  children: ReactNode
  className?: string
}

const List: FC<ListProps> = ({ children, className }) => {
  return <ul className={cls(styles.container, className)}>{children}</ul>
}

export default List
