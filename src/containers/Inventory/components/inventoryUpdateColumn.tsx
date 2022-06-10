import { FC } from 'react'
import InputSwitch from '@components/InputSwitch'
import { InventoryItem, useInventoryUpdate } from '@common/endpoints/useInventory'
import useConfirm from '@common/utilities/useConfirm'
import styles from '../inventory.module.scss'

export const messages = {
  yes: 'Yes',
  no: 'No',
}

export type InventoryUpdateColumnProps = Pick<InventoryItem, 'dailyInventoryUpdate' | 'vin'> & {
  isBulkLoading?: boolean
  dailyUpdateTarget?: boolean
  overrideAction?: (dailyInventoryUpdate: boolean) => void
}

const InventoryUpdateColumn: FC<InventoryUpdateColumnProps> = ({
  dailyInventoryUpdate,
  vin,
  isBulkLoading,
  dailyUpdateTarget,
  overrideAction,
}) => {
  const { mutate, isLoading } = useInventoryUpdate('dailyInventoryUpdate')
  const isUpdating = isLoading || isBulkLoading
  let checked = dailyInventoryUpdate
  if (isUpdating) {
    checked = !dailyInventoryUpdate

    if (isBulkLoading) {
      checked = dailyUpdateTarget !== undefined ? dailyUpdateTarget : !dailyInventoryUpdate
    }
  }

  const { confirm: showWarning } = useConfirm({
    className: styles.confirmPadding,
    message:
      'Inventory data for this vehicle will not be updated with any subsequent inventory file uploads, ' +
      'Select Confirm to proceed or Cancel to abort',
    icon: 'ocross',
    cancelText: 'Cancel',
    confirmText: 'Confirm',
    onConfirm: () => mutate([{ vin, dailyInventoryUpdate: !dailyInventoryUpdate }]),
    swapButtons: true,
  })

  return (
    <InputSwitch
      key={`${vin}-daily-inventory-update`} // prevent animation on filtering & sorting 😉
      name={`${vin}-daily-inventory-update`}
      checked={checked}
      onChange={() => {
        if (overrideAction) {
          overrideAction(!dailyInventoryUpdate)
        } else if (dailyInventoryUpdate) showWarning()
        else {
          void mutate([{ vin, dailyInventoryUpdate: !dailyInventoryUpdate }])
        }
      }}
      disabled={isUpdating}
      className="text-dark"
    >
      {dailyInventoryUpdate ? messages.yes : messages.no}
    </InputSwitch>
  )
}

export default InventoryUpdateColumn
