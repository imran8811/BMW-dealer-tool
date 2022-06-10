import { FC } from 'react'
import { DealerFnIProductType, useFnIStatusUpdate } from '@common/endpoints/useFinanceProducts'
import Switch from '@components/InputSwitch'
import ProgressSpinner from '@components/ProgressSpinner'
import styles from '../product.module.scss'

const messages = {
  statusActive: 'Active',
  statusInactive: 'Inactive',
}

const SwitchCell: FC<DealerFnIProductType> = item => {
  const { mutate, status } = useFnIStatusUpdate()
  const { isActive, _id: id } = item
  return (
    <div className={styles.wrapper}>
      {status === 'running' && (
        <div className={styles.overlay}>
          <ProgressSpinner size={10} />
        </div>
      )}
      <Switch
        name={`${id}-status`}
        checked={isActive}
        className={styles['switch-finance-status']}
        onChange={(): unknown => mutate({ id, isActive })} // , { onFailure: () => showCheckFailed() })}
      />
      {isActive ? messages.statusActive : messages.statusInactive}
    </div>
  )
}

export default SwitchCell
