import { FC } from 'react'
import cls from 'classnames'
import CarInfoHeader from '@containers/BeginOrderSteps/components/CarInfoHeader/CarInfoHeader'
import { OrderDetails, VehicleDetails } from '@common/endpoints/typings.gen'
import CreditApplication from './components/CreditApplication/CreditApplication'
import OrderSummary from './components/OrderSummary/OrderSummary'
import styles from './SigningContract.module.scss'

interface Props {
  vehicle: VehicleDetails
  order: OrderDetails
}

const SigningContract: FC<Props> = ({ vehicle, order }) => {
  return (
    <div className="col">
      <div className="container">
        <CarInfoHeader carInfo={vehicle} cdNumber={order.referenceNumber} />
      </div>
      <div className="container bg-white rounded">
        <div className="row align-items-center p-md-5 p-4">
          <div className={cls(styles['border-right-md'], 'col-md-6  p-3 p-md-5')}>
            <CreditApplication orderId={order.orderId} orderState={order.state} />
          </div>
          <div className="col-md-6 m-60 p-md-5 p-3 ">
            <OrderSummary orderId={order._id} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SigningContract
