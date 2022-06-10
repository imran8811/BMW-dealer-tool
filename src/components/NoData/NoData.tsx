import { FC } from 'react'
import cls from 'classnames'
import Icon, { IconProps } from '@components/Icon'
import styles from './NoData.module.scss'

const messages = {
  default: 'No data available',
}

type NoDataProps = {
  height?: string
  icon?: IconProps['name']
  className?: string
}

const NoData: FC<NoDataProps> = ({ height, children, icon, className }) => {
  const minHeight = height || '370px'

  return (
    <div className={cls(styles.noData, className)} style={{ minHeight }}>
      <div className={styles.icon}>
        <Icon name={icon || 'noData'} size={60} />
      </div>
      <div>{children || messages.default}</div>
    </div>
  )
}

export default NoData
