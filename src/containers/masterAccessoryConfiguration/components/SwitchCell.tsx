import { FC } from 'react'
import Switch from '@components/InputSwitch'
import { AccessoryType, useMasterAccessoryMutation } from '@common/endpoints/useMasterAccessories'
import ProgressSpinner from '@components/ProgressSpinner'
import styles from './masterAccessory.module.scss'

const messages = {
  statusActive: 'Active',
  statusInactive: 'Inactive',
}

const SwitchCell: FC<AccessoryType> = item => {
  const { mutate, status } = useMasterAccessoryMutation(item?._id)
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
      <Switch name={id} checked={statusItem} className={styles['switch-master-addon-status']} onChange={updateStatus} />
      {statusItem ? messages.statusActive : messages.statusInactive}
    </div>
  )
}

export default SwitchCell
