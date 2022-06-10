import { FC } from 'react'
import Icon from '@components/Icon'
import cls from 'classnames'
import Link from 'next/link'
import styles from './OrderSummary.module.scss'

const messages = {
  title: 'Order Summary',
  view: 'View',
}

const OrderSummary: FC<{ orderId: string }> = ({ orderId }) => {
  return (
    <div className="text-center">
      <div className="text-primary">
        <Icon name="orderSummary" size={120} />
      </div>
      <h2 className="mt-4">{messages.title}</h2>
      <div className="d-flex justify-content-center pt-3 pb-5">
        <Link href={{ pathname: '/orders/[orderId]', query: { orderId, view: 'summary' } }} shallow={false}>
          <a className={cls('text-uppercase font-weight-bold utm-view-order-summary-btn', styles.btnPrimary)}>
            {messages.view}
          </a>
        </Link>
      </div>
    </div>
  )
}

export default OrderSummary
