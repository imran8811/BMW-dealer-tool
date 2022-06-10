import { FC } from 'react'
import cls from 'classnames'

import Icon from '@components/Icon'
import styles from './MissingDataPlaceholder.module.scss'

const messages = {
  default: 'No data available',
}

type MissingDataPlaceholderProps = {
  height?: string
  className?: string
  testId?: string
}

const MissingDataPlaceholder: FC<MissingDataPlaceholderProps> = ({ height, className, children, testId }) => {
  const minHeight = height || '370px'

  return (
    <div data-testid={testId} className={cls(styles.noData, className)} style={{ minHeight }}>
      <div className={styles.icon}>
        <Icon name="noData" size={60} />
      </div>
      <div>{children || messages.default}</div>
    </div>
  )
}

export default MissingDataPlaceholder
