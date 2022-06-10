import { FC, ReactNode } from 'react'
import cls from 'classnames'
import styles from './Rating.module.scss'

export type RatingProps = {
  isActive: boolean
  className: string
  caption: string
  subTitle?: ReactNode
  onClick: () => void
}

const Rating: FC<RatingProps> = ({ isActive, className, caption, subTitle, onClick }) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
  <div className={`${styles.Selector} ${isActive ? styles.Active : ''}`} onClick={onClick}>
    <div className={styles.Circle}>
      <div className={cls(styles.Icon, className)} />
    </div>
    <div className={styles.Caption}>{caption}</div>
    <span>{subTitle}</span>
  </div>
)

export default Rating
