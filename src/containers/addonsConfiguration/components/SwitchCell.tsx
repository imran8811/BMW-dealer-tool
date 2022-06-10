import { FC } from 'react'
import Switch from '@components/InputSwitch'
import { AccessoryType, useAccessoriesUpdate } from '@common/endpoints/useAccessories'
import ProgressSpinner from '@components/ProgressSpinner'
import styles from './addons.module.scss'

const messages = {
  statusActive: 'Active',
  statusInactive: 'Inactive',
}

type AccessoriesParaType = AccessoryType

const SwitchCell: FC<AccessoriesParaType> = item => {
  const { mutate, status } = useAccessoriesUpdate()
  const { isActive: statusItem, _id: id } = item
  const updateStatus = () => {
    const updatedItem = {
      ...item,
      isActive: !item?.isActive,
    }
    void mutate(updatedItem)
  }
  return (
    <div className={styles.wrapper}>
      {status === 'running' && (
        <div className={styles.overlay}>
          <ProgressSpinner size={10} />
        </div>
      )}
      <Switch name={id} checked={statusItem} className={styles['switch-dealership-status']} onChange={updateStatus} />
      {statusItem ? messages.statusActive : messages.statusInactive}
    </div>
  )
}

export default SwitchCell
