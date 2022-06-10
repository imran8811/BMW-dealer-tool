import { FC } from 'react'
import cls from 'classnames'
import Icon from '@components/Icon'
import styles from './DeleteButton.module.scss'

export type DeleteButtonProps = {
  onClick: () => void
  className?: string
  icon?: 'delete' | 'basket'
  testId?: string
}

const DeleteButtons: FC<DeleteButtonProps> = ({ onClick, className, icon, testId }) => {
  return (
    <button data-testid={testId} onClick={onClick} className={cls([styles.element, className && className])}>
      <Icon name={icon || 'delete'} size={22} />
    </button>
  )
}
export default DeleteButtons
