import { FC, useMemo, useState } from 'react'
import {
  VehicleDetails,
  CustomerDetails,
  OrderState,
  GetPricingDetailsResponse,
  OrderDetails,
} from '@common/endpoints/typings.gen'
import cls from 'classnames'
import useInsuranceByOrderId from '@common/endpoints/useInsurance'
import { TradeInStatus } from '@common/endpoints/useDealSummary'
import Customer from '../components/Customer'
import Vehicle from '../components/Vehicle'
import TradeIn from '../components/TradeIn'
import DealSummary from '../components/DealSummary'
import Header, { IHeader } from '../components/Header'
import DocumentsList, { ContractDocumentSign } from '../components/DocumentsList'
import styles from './ReviewOrder.module.scss'
import InsuranceDetails from '../components/Insurance'

export interface IReviewOrderProps {
  order: OrderDetails
  vehicle: VehicleDetails
  customer: CustomerDetails
  pricing: GetPricingDetailsResponse
  onBack?: () => unknown
  refetchOrderDetails?: (updatedTaxes?: boolean, tradeInStatus?: TradeInStatus) => unknown
  isLoading?: boolean
}

const ReviewOrder: FC<IReviewOrderProps> = ({
  onBack,
  order,
  vehicle,
  customer,
  pricing,
  refetchOrderDetails,
  isLoading: isOrderDataLoading,
}) => {
  const { data: insuranceDetails, isLoading } = useInsuranceByOrderId(order._id)
  const [isTradeInFocused, setIsTradeInFocused] = useState(true)

  const documents = useMemo(() => {
    const contracts = order.contractDocs as ContractDocumentSign[] | undefined
    const fniDocuments = order.fniProducts
      .filter(item => item.contractDocument && item.contractDocument.displayName)
      .map(({ contractDocument }) => ({
        ...contractDocument,
        hideSign: true,
      }))
    const data: ContractDocumentSign[] = [...(contracts || []), ...(fniDocuments || [])]
    return data.filter(f => f !== undefined)
  }, [order])

  const isAppointmentScheduled =
    order.state === OrderState.AppointmentScheduled ||
    order.state === OrderState.TimeSlotsProposed ||
    order.state === OrderState.Complete ||
    order.state === OrderState.Delivered

  const isPricingLocked = ![
    OrderState.Draft,
    OrderState.Inquiry,
    OrderState.NotAvailable,
    OrderState.Available,
    OrderState.Confirmed,
    OrderState.WaitingForCreditDecision,
    OrderState.CreditStipulated,
  ].includes(order.state)

  const header: IHeader = {
    heading: order.state === OrderState.Available ? 'Review Order' : 'Order Summary',
    subheading: isAppointmentScheduled
      ? 'Electronic paperwork has been delivered to the customer to sign.'
      : 'Please confirm that the information below is accurate.',
    imageUrl: vehicle ? vehicle.photoUrls[0] : '',
  }

  return (
    <div className={cls(['col mb-5', styles.containerWrapper])}>
      <main className="row">
        <div className="container">
          <Header wrapperClass={styles.headerWrapper} header={header} onBack={onBack} />
          <div className="row">
            <div className="col-xl-7 p-0">
              <Vehicle vehicle={vehicle} />
              <Customer customer={customer} />
              {isAppointmentScheduled && (
                <DocumentsList
                  contracts={documents}
                  orderId={order._id}
                  watermarkedContractDocs={order.watermarkedContractDocs}
                />
              )}
              {order?.tradeInVehicle && (
                <TradeIn
                  isEditable={[OrderState.Available].includes(order.state)}
                  refetchOrderDetails={refetchOrderDetails}
                  order={order}
                  isTradeInFocused={isTradeInFocused}
                />
              )}

              {insuranceDetails?.providerName && (
                <InsuranceDetails isLoading={isLoading} insuranceDetails={insuranceDetails} />
              )}
            </div>
            <div className="col-xl-5 p-0 pl-xl-3 pr-xl-0 pr-xxl-0">
              <DealSummary
                order={order}
                isLoading={isOrderDataLoading}
                refetchOrderDetails={refetchOrderDetails}
                vehicle={vehicle}
                pricing={(isPricingLocked ? order.pricing : pricing) as GetPricingDetailsResponse}
                onSelectTab={e => setIsTradeInFocused(e as boolean)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReviewOrder
