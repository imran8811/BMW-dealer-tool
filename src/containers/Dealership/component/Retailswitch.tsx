import { FC } from 'react'
import { Dealerships } from '@common/endpoints/typings.gen'
import { useDealershipRetailUpdate } from '@common/endpoints/useDealerships'
import Switch from '@components/InputSwitch'
import ProgressSpinner from '@components/ProgressSpinner'
import styles from '../dealership.module.scss'

export const messages = {
  enabled: 'Enabled',
  disabled: 'Disabled',
}

const SwitchCell: FC<Dealerships & { testId?: string }> = ({ testId, ...item }) => {
  const { mutate, status } = useDealershipRetailUpdate()
  const editedItem = {
    ...item,
    digitalRetailEnabled: !item.digitalRetailEnabled,
  }
  return (
    <div className={styles.wrapper} data-testid={testId}>
      {status === 'running' && (
        <div className={styles.overlay}>
          <ProgressSpinner size={10} />
        </div>
      )}
      <Switch
        name={item?._id}
        checked={item?.digitalRetailEnabled}
        className={styles['switch-dealership-status']}
        onChange={(): unknown => mutate(editedItem)}
      />
      {item?.digitalRetailEnabled ? messages.enabled : messages.disabled}
    </div>
  )
}

export default SwitchCell
