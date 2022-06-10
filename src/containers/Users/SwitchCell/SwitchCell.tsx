import { UserAccount } from '@common/endpoints/useUsers'
import { FC, useEffect, useState } from 'react'
import sendForm from '@common/utilities/sendForm'
import { Credentials } from '@common/utilities/credentialsStore'
import InputSwitch from '@components/InputSwitch'

import ProgressSpinner from '@components/ProgressSpinner'
import { mutate } from 'swr'
import styles from './SwitchCell.module.scss'

const messages = {
  statusActive: 'Active',
  statusInactive: 'Inactive',
}

const SwitchCell: FC<UserAccount> = item => {
  const [isActive, setIsActive] = useState(item?.isActive)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsActive(item.isActive)
  }, [item.isActive])

  const onSwitch = (): void => {
    const value = {
      ...item,
      isActive: !item?.isActive,
      _id: item?._id,
    }

    setIsLoading(true)

    sendForm<Credentials>('/dealer-management/edit-account', value, {
      withAuthentication: true,
      method: 'PUT',
    })
      .then(() => {
        setIsActive(!isActive)
        void mutate('/dealer-management/get-dealer-accounts', undefined, true)
        setIsLoading(false)
        return true
      })
      .catch(() => setIsLoading(false))
  }

  return (
    <div className={styles.wrapper}>
      {isLoading && (
        <div className={styles.overlay}>
          <ProgressSpinner size={10} />
        </div>
      )}
      <InputSwitch name={item?._id || 'switch-cell'} checked={isActive} className={styles.switch} onChange={onSwitch} />
      {isActive ? messages.statusActive : messages.statusInactive}
    </div>
  )
}

export default SwitchCell
