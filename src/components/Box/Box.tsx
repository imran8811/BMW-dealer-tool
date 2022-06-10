import { FC, ReactNode } from 'react'
import cls from 'classnames'
import styles from './Box.module.scss'

export type BoxProps = {
  children?: ReactNode | string | number
  content?: ReactNode | string | number
  title?: ReactNode | string | number
  className?: string
}

const Box: FC<BoxProps> = ({ children, content, title, className }) => {
  return (
    <section className={cls(styles.container, className)}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <article>{content || children}</article>
    </section>
  )
}

export default Box
