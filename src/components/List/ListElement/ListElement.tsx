import { FC, ReactNode } from 'react'
import cls from 'classnames'
import Icon, { IconName } from '@components/Icon/Icon'
import FeaturesList from '../../FeaturesList'
import styles from './ListElement.module.scss'

export type ListElementProps = {
  name?: string | number
  value?: ReactNode
  expandable?: boolean
  content?: ReactNode
  children?: ReactNode
  valuePrefix?: string | number
  className?: string
  editable?: IconName
  onEdit?: () => unknown
}

const ElementBody: FC<ListElementProps> = ({
  editable,
  name,
  value,
  valuePrefix,
  className,
  expandable,
  content,
  children,
  onEdit,
}) => {
  if (expandable) {
    return (
      <FeaturesList value={value} title={name}>
        {children || content}
      </FeaturesList>
    )
  }

  return (
    <>
      <p className={className ? cls(styles.name, className) : styles.name}>{name}</p>
      {editable && (
        <span className="ml-auto pr-1">
          <Icon className={cls('text-muted mb-1', styles.hover)} size={16} onClick={onEdit} name={editable} />
        </span>
      )}
      {value && valuePrefix && (
        <span className={cls(styles.value, className, 'd-flex justify-content-between')}>
          <span>{valuePrefix}</span>
          <span>{value}</span>
        </span>
      )}
      {value && !valuePrefix && <span className={styles.value}>{value}</span>}
    </>
  )
}

const ListElement: FC<ListElementProps> = ({ name, ...props }) => {
  if (!name) return null

  return (
    <li className={styles.element}>
      <ElementBody name={name} {...props} />
    </li>
  )
}

export default ListElement
