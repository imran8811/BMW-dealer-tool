import { FC, ReactNode } from 'react'
import styles from './SectionHeading.module.scss'
import Icon, { IconProps } from '../Icon'

export type SectionHeadingProps = {
  itemCount?: ReactNode
  subtitle?: ReactNode
  className?: string
  icon?: IconProps['name']
  'data-testid'?: string
}

const SectionHeading: FC<SectionHeadingProps> = ({
  children,
  className,
  subtitle,
  itemCount,
  icon,
  'data-testid': testId,
}) => (
  <div className={className} data-testid={testId}>
    <h2 className={styles.mainheading}>
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} size={24} />
        </span>
      )}
      {children} {itemCount !== undefined && <span className={styles.itemcount}>{itemCount}</span>}
    </h2>
    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
  </div>
)

export default SectionHeading
