import { FC } from 'react'
import cls from 'classnames'

import useConfirm from '@common/utilities/useConfirm'
import { useNotAvailableAfterPayment } from '@common/endpoints/orderTransitions'
import { OrderDetails } from '@common/endpoints/typings.gen'
import SectionHeading from '@components/SectionHeading'
import Button from '@components/Button'
import styles from './OrderStatus.module.scss'

const staticText = {
  headingSubtitle: 'Complete Order',
  subtitle: '2020 Cooper Hardtop 4 Door',
  headingAvailable: 'Is this vehicle still available?',
  buttonAvailable: "Yes, it's available?",
  buttonNotAvailble: "No, it's not available",
}

interface Props {
  order: OrderDetails
  onSelectedAvailable: () => unknown
}

const OrderStatus: FC<Props> = ({ order, onSelectedAvailable }) => {
  const NotAvailableAfterPayment = useNotAvailableAfterPayment()
  const { confirm } = useConfirm({
    title: 'Are you sure you want to mark this vehicle as not available?',
    message: 'This will cancel the order for the customer.',
    onConfirm: () => NotAvailableAfterPayment.mutate({ orderId: order._id }),
    acceptBtnClass: 'utm-schedular-unavailable-dialog-btn-yes',
    rejectBtnClass: 'utm-schedular-unavailable-dialog-btn-no',
  })

  return (
    <div className="container mt-2 mb-5">
      <div className="box-bottom mt-3 mb-5">
        <SectionHeading>{staticText.headingAvailable}</SectionHeading>
        <Button className={cls(styles.btnAvailable, 'mb-3 utm-schedular-available-btn')} onClick={onSelectedAvailable}>
          {staticText.buttonAvailable}
        </Button>
        <Button
          className={cls(styles.btnAvailable, 'utm-schedular-un-available-btn')}
          onClick={confirm}
          secondary
          loading={NotAvailableAfterPayment.status === 'running' && 'Saving'}
        >
          {staticText.buttonNotAvailble}
        </Button>
      </div>
    </div>
  )
}

export default OrderStatus
