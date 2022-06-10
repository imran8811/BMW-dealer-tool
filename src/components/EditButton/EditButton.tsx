import { FC, SyntheticEvent } from 'react'
import cls from 'classnames'
import Icon, { IconName } from '@components/Icon/Icon'
import styles from './EditButton.module.scss'

export type EditButtonProps = {
  onClick: (evt: SyntheticEvent) => void
  className?: string
  icon?: IconName
  testId?: string
}

const EditButtons: FC<EditButtonProps> = ({ onClick, className, testId, icon = 'editPencil' }) => {
  return (
    <button data-testid={testId} onClick={onClick} className={cls([styles.element, className && className])}>
      <Icon name={icon} size={22} />
    </button>
  )
}
export default EditButtons
