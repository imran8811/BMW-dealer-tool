import { FC, useState } from 'react'

import { CustomerDetails, OrderDetails, OrderState, VehicleDetails } from '@common/endpoints/typings.gen'
import { useSchedule } from '@common/endpoints/orderTransitions'
import OrderDetailsCarInfomation from '@containers/BeginOrderSteps/BeginOrder/components/OrderDetailsCarInfomation'
import Header, { IHeader } from '@containers/BeginOrderSteps/components/Header'
import cls from 'classnames'
import Scheduler from './components/Scheduler/Scheduler'
import SchedulerMobile from './components/SchedulerMobile/SchedulerMobile'
import OrderStatus from './components/OrderStatus/OrderStatus'
import styles from './OrderSchedule.module.scss'

const messages = {
  headingSubtitle: 'Complete Order',
  subtitle: '2020 Cooper Hardtop 4 Door',
  headingAvailable: 'Is this vehicle still available?',
  buttonAvailble: "Yes, it's available?",
  buttonNotAvailble: "No, it's not available",
}

interface Props {
  order: OrderDetails
  vehicle: VehicleDetails
  customer: CustomerDetails
  dealerCode: string
}

const CompleteOrder: FC<Props> = ({ dealerCode, order, vehicle, customer }) => {
  // we don't re-check availability when dealer re-schedules the appointment
  const shouldCheckAvailability = !(
    order.state === OrderState.RescheduleTimeSlotsByCustomer || order.state === OrderState.RescheduleTimeSlotsByDealer
  )
  const [schedulerVisible, toggleScheduler] = useState(!shouldCheckAvailability)
  const schedule = useSchedule({ dealerCode, orderId: order._id })
  const isMobileScreen = window.innerWidth < 768
  const header: IHeader = {
    heading: messages.headingSubtitle,
    imageUrl: vehicle?.photoUrls?.[0] ?? '',
  }

  return (
    <>
      <div className={cls(['col mb-5', styles.containerWrapper])}>
        <main className="row">
          <div className="container">
            <Header header={header} />
            <div className="row bg-white rounded">
              <OrderDetailsCarInfomation carDetails={vehicle} customer={customer} cdNumber={order.referenceNumber} />
              {schedulerVisible && isMobileScreen && <SchedulerMobile order={order} schedule={schedule} />}
              {schedulerVisible && !isMobileScreen && <Scheduler order={order} schedule={schedule} />}
              {!schedulerVisible && <OrderStatus order={order} onSelectedAvailable={() => toggleScheduler(true)} />}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default CompleteOrder
