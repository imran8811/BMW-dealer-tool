import { FC } from 'react'
import InputSwitch from '@components/InputSwitch'
import { InventoryItem, useInventoryUpdate } from '@common/endpoints/useInventory'
import { fetcher } from '@common/utilities/http-api'
import { VehicleAccessories } from '@common/endpoints/typings.gen'
import useConfirm from '@common/utilities/useConfirm'
import styles from '../inventory.module.scss'

export const messages = {
  listed: 'Listed',
  unlisted: 'Not listed',
}

export type StateColumnProps = Pick<InventoryItem, 'publish' | 'vin'> & {
  isBulkLoading?: boolean
  publishTarget?: boolean
  overrideAction?: (publish: boolean) => void
}

const StateColumn: FC<StateColumnProps> = ({ publish, vin, isBulkLoading, publishTarget, overrideAction }) => {
  const { mutate, isLoading } = useInventoryUpdate('publish')
  const isUpdating = isLoading || isBulkLoading
  let checked = publish
  if (isUpdating) {
    checked = !publish

    if (isBulkLoading) {
      checked = publishTarget !== undefined ? publishTarget : !publish
    }
  }

  const { confirm: showWarning } = useConfirm({
    className: styles.confirmPadding,
    message:
      'This vehicle has more than 3 Pre Installed add-ons associated.' +
      ' Please change or remove these add-ons to list this vehicle.',
    hideAccept: true,
    icon: 'ocross',
    cancelText: 'OK',
  })

  /**
   * `CR: US 21725`
   * Check & Block Action if there are more than three `PreInstalled` addons Associated with this vehicle
   * Will not be called with bulk actions
   */
  const getVehicleAddonsCount = (selectedVin: string) => {
    if (publish) {
      void mutate([{ vin, publish: !publish }])
      return
    }
    void fetcher<VehicleAccessories[]>(`/inventory-management/get-accessories/${selectedVin}`, {
      headers: {
        'content-type': 'application/json',
      },
      method: 'GET',
    }).then(data => {
      // eslint-disable-next-line promise/always-return
      if (data && data.length > 0) {
        const preInstalled = data.filter(f => f.installationMode.code === 'PreInstalled')
        if (preInstalled.length > 3) showWarning()
        else void mutate([{ vin, publish: !publish }])
      } else void mutate([{ vin, publish: !publish }])
    })
  }

  return (
    <InputSwitch
      key={vin} // prevent animation on filtering & sorting 😉
      name={vin}
      checked={checked}
      onChange={() => {
        if (overrideAction) {
          overrideAction(!publish)
        } else {
          getVehicleAddonsCount(vin)
        }
      }}
      disabled={isUpdating}
      className="text-dark"
    >
      {publish ? messages.listed : messages.unlisted}
    </InputSwitch>
  )
}

export default StateColumn
