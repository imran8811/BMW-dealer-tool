import { FC, useMemo } from 'react'
import cls from 'classnames'
import { VehicleDetails, CustomerDetails, OrderDetails, OrderState } from '@common/endpoints/typings.gen'
import useInsuranceByOrderId from '@common/endpoints/useInsurance'
import TradeIn from '../components/TradeIn'
import CarInfoHeader from '../components/CarInfoHeader/CarInfoHeader'
import PaymentInformation from '../components/PaymentInitiated/PaymentInformation'
import OrderSummary from '../components/OrderSummary/OrderSummary'
import VehicleAppointmentConfirmed from '../components/VehicleAppointmentConfirmed/VehicleAppointmentConfirmed'
import VehicleAppointment from '../components/VehicleAppointment/VehicleAppointment'
import DocumentsList, { ContractDocumentSign } from '../components/DocumentsList'
import styles from './OrderComplete.module.scss'
import DeliveryLocation from './components/DeliveryLocation'
import InsuranceDetails from '../components/Insurance'

export interface IOrderCompleteProps {
  vehicle: VehicleDetails
  customer: CustomerDetails
  order: OrderDetails
}

const OrderComplete: FC<IOrderCompleteProps> = ({ vehicle, customer, order }) => {
  const { data: insuranceDetails, isLoading } = useInsuranceByOrderId(order._id)
  const documents = useMemo(() => {
    const contracts = order.contractDocs as ContractDocumentSign[]
    const fniDocuments = order.fniProducts
      .filter(item => item.contractDocument && item.contractDocument.displayName)
      .map(({ contractDocument }) => ({
        ...contractDocument,
        hideSign: true,
      }))
    const data: ContractDocumentSign[] = [...contracts, ...fniDocuments]
    return data.filter(f => f !== undefined)
  }, [order])
  return (
    <div className="col mb-5 p-0">
      <div className="container">
        <CarInfoHeader carInfo={vehicle} cdNumber={order.referenceNumber} />
      </div>
      <div className="container">
        {order.state === OrderState.TimeSlotsProposed && <VehicleAppointment order={order} />}
        {order.state === OrderState.AppointmentScheduled && (
          <div className="row">
            <div className="col p-0 pl-xl-0">
              <VehicleAppointmentConfirmed order={order} customer={customer} />
            </div>
            {order.deliveryAddress && <DeliveryLocation address={order.deliveryAddress} />}
          </div>
        )}
      </div>

      <PaymentInformation customer={customer} order={order} />

      <div className="col bg-white rounded mt-2 mb-2">
        <div className="row align-items-center px-md-5 p-0 p-lg-5">
          <div className={cls(styles['border-bottom-md'], 'col-lg-6 m-4 pt-4 m-sm-3 px-md-4 px-0 m-md-0')}>
            <OrderSummary orderId={order._id} />
          </div>
          <div className="col-lg-6 px-xl-4 py-xl-0 p-0">
            <DocumentsList
              contractClassName={styles['border-left-md']}
              contracts={documents}
              orderId={order._id}
              watermarkedContractDocs={order.watermarkedContractDocs}
            />
          </div>
        </div>
      </div>
      {order?.tradeInVehicle && <TradeIn isEditable={[OrderState.Available].includes(order.state)} order={order} />}
      {insuranceDetails?.providerName && <InsuranceDetails isLoading={isLoading} insuranceDetails={insuranceDetails} />}
    </div>
  )
}

export default OrderComplete
