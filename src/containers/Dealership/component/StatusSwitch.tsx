/* eslint-disable max-len */
import { FC } from 'react'
import { Dealerships, Order, PaymentsAccount } from '@common/endpoints/typings.gen'
import { useDealershipStatusUpdate } from '@common/endpoints/useDealerships'
import Switch from '@components/InputSwitch'
import ProgressSpinner from '@components/ProgressSpinner'
import fetcher from '@common/utilities/fetcher'
import useConfirm from '@common/utilities/useConfirm'
import { statusMap } from '@common/endpoints/useOrders'
import { PaginatedResponse } from '@common/utilities/PaginationTypes'
import styles from '../dealership.module.scss'

export const messages = {
  statusActive: 'Active',
  statusInactive: 'Inactive',
}

const SwitchCell: FC<Dealerships & { testId?: string }> = ({ testId, ...item }) => {
  const { mutate, status } = useDealershipStatusUpdate()
  const { isActive, dealerCode } = item
  const { confirm } = useConfirm({
    className: styles.confirmPadding,
    message:
      'Payment configuration is missing against this dealership.' +
      ' Please fill up payment information before activating it.',
    hideAccept: true,
    icon: 'ocross',
    cancelText: 'OK',
  })
  const { confirm: activeOrderWarning } = useConfirm({
    className: styles.confirmPadding,
    message:
      'This dealership has active orders in their work queue. Please conclude the orders before deactivating this dealership.',
    hideAccept: true,
    icon: 'ocross',
    cancelText: 'OK',
  })

  const getOrderCount = () => {
    void fetcher<PaginatedResponse<Order>>(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `/order-management/get-orders?dealerCode=${dealerCode}&pageNo=1&pageSize=1&sortBy=createdAt&sortOrder=-1&state=${statusMap.inProgress}`,
      {
        headers: {
          'content-type': 'application/json',
        },
        method: 'GET',
      },
    ).then(data => {
      // eslint-disable-next-line promise/always-return
      if (data.total && data.total > 0) activeOrderWarning()
      else void mutate({ isActive, dealerCode })
    })
  }

  const getPaymentData = () => {
    void fetcher<PaymentsAccount>(
      `/payment-management/payments-account/get-by-dealerCode/${dealerCode}`,
      {
        method: 'GET',
      },
      {
        withAuthentication: true,
      },
    )
      .then(data => {
        // eslint-disable-next-line promise/always-return
        if (data?.achMaxAmount !== undefined && data.status === 'Active') void mutate({ isActive, dealerCode })
        else confirm()
      })
      .catch(() => {
        confirm()
      })
  }
  return (
    <div className={styles.wrapper} data-testid={testId}>
      {status === 'running' && (
        <div className={styles.overlay}>
          <ProgressSpinner size={10} />
        </div>
      )}
      <Switch
        name={`${item?._id}-status`}
        checked={item?.isActive}
        className={styles['switch-dealership-status']}
        onChange={() => {
          if (isActive) void getOrderCount()
          else void getPaymentData()
        }}
      />
      {item?.isActive ? messages.statusActive : messages.statusInactive}
    </div>
  )
}

export default SwitchCell
