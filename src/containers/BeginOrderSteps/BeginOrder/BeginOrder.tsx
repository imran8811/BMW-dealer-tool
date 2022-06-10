import { FC } from 'react'
import ProgressSpinner from '@components/ProgressSpinner'
import { useDefaultFees } from '@common/endpoints/orderTransitions'
import { CustomerDetails, GetPricingDetailsResponse, OrderDetails, VehicleDetails } from '@common/endpoints/typings.gen'
import cls from 'classnames'
import OrderFeeForm from './components/OrderFeeForm'
import OrderDetailsCarInfomation from './components/OrderDetailsCarInfomation'
import Header, { IHeader } from '../components/Header'
import styles from './BeginOrder.module.scss'

const messages = {
  begin: 'Begin Order',
  noData: 'No data available',
}

export interface IBeginOrderProps {
  order: OrderDetails
  vehicle: VehicleDetails
  customer: CustomerDetails
  onFinish?: () => unknown
  pricing: GetPricingDetailsResponse
  refetchOrderDetails: () => unknown
}

const BeginOrder: FC<IBeginOrderProps> = ({ order, vehicle, onFinish, customer, pricing, refetchOrderDetails }) => {
  const orderId = order._id
  const defaultFees = useDefaultFees(orderId)

  const header: IHeader = {
    heading: messages.begin,
    imageUrl: vehicle?.photoUrls?.[0] ?? '',
  }

  return (
    <div className={cls(['col mb-5', styles.containerWrapper])}>
      {defaultFees.isLoading ? (
        <div className="d-flex justify-content-center">
          <ProgressSpinner animationDuration="2s" size={150} />
        </div>
      ) : (
        <main className="row">
          <div className="container">
            <Header header={header} wrapperClass={styles.headerWrapper} />
            <div className="row bg-white px-lg-5 pb-lg-5 px-3 pb-3 rounded">
              <OrderDetailsCarInfomation
                customAutoInfoClass="col-lg-8 col-md-9"
                carDetails={vehicle}
                customer={customer}
                cdNumber={order.referenceNumber}
              />
              <OrderFeeForm
                vin={vehicle.vin}
                order={{ order, vehicle, customer }}
                pricing={pricing}
                odometer={order.odometer}
                orderId={order._id}
                internetPrice={vehicle.internetPrice}
                onFinish={onFinish}
                refetchOrderDetails={refetchOrderDetails}
                odoStatement={order.odoStatement}
                initialFees={order.fees?.length > 0 ? order.fees : []}
                dealerFee={defaultFees.data || []}
                initialFnI={order.dealerFnIProducts || order.fniProducts || []}
              />
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

export default BeginOrder
