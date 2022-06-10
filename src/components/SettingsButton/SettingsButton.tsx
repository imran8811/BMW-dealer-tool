import { FC } from 'react'
import Icon from '@components/Icon'
import styles from './SettingsButton.module.scss'

export type SettingsButtonProps = {
  onClick: () => void
}

const SettingsButton: FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus
    <span role="button" onClick={onClick} className={styles.element}>
      <Icon name="settings" size={22} />
    </span>
  )
}
export default SettingsButton
