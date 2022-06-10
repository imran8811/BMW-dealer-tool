import { FC, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import routes from '@common/routes'
import Icon from '@components/Icon'
import Button from '@components/Button'
import Box from '@components/Box'
import useConfirm from '@common/utilities/useConfirm'
import { useMarkAvailable, useMarkNotAvailable } from '@common/endpoints/orderTransitions'
import {
  CustomerDetails,
  OrderDetails,
  VehicleDetails,
  GetPricingDetailsResponse,
  OrderState,
} from '@common/endpoints/typings.gen'
import CustomerData from '@components/CustomerData'
import Currency from '@components/Currency'
import Details, { DetailsRow } from '@components/DetailsRows'
import cls from 'classnames'
import { capitalizeFirstLetter } from '@common/utilities/validation'
import Header from './components/Header'
import ImageCarousel from './components/ImageCarousel'
import TradeIn from '../BeginOrderSteps/components/TradeIn'
import styles from './InquiryPreview.module.scss'

const messages = {
  stock: 'Stock:',
  vin: 'VIN:',
  available: 'Available',
  notAvailable: 'Not Available',
  details: {
    title: 'Order Details',
    plan: 'Plan',
    amountDue: 'Amount Due at Signing',
  },
  payment: {
    title: 'Payment Breakdown',
    downPayment: 'Down Payment',
    monthlyPayment: "First Month's Payment",
    securityDeposit: 'Security Deposit',
    dueAtSigning: 'Due at Signing',
  },
  fniProducts: {
    title: 'F&I Products',
    wheel: 'Tire & Wheel Protection',
    emp: 'EMP',
    key: 'Key Protection',
  },
  customer: 'Customer',
}

export interface IInquiryPreviewProps {
  order: OrderDetails
  vehicle: VehicleDetails
  customer: CustomerDetails
  pricing: GetPricingDetailsResponse
}

const InquiryPreviewPage: FC<IInquiryPreviewProps> = ({ order, vehicle, customer, pricing }) => {
  const filterImages = useMemo(() => {
    const data = vehicle?.photoUrls.filter(f => f != null).slice(0, 18)
    return data
  }, [vehicle?.photoUrls])
  const available = useMarkAvailable()
  const notAvailable = useMarkNotAvailable()
  const router = useRouter()
  const orderId = order._id

  const { confirm } = useConfirm({
    title: 'Are you sure you want to mark this vehicle as not available?',
    message: 'This will cancel the order for the customer.',
    onConfirm: async () => {
      await notAvailable.mutate({ orderId })
      void router.push(routes.workqueue)
    },
    acceptBtnClass: 'utm-vehical-inquiry-dialog-btn-yes',
    rejectBtnClass: 'utm-vehical-inquiry-dialog-btn-no',
  })

  const cancellationReasons = useMemo(
    () =>
      order.orderCancellationDetails?.cancellationReason
        ?.trim()
        .split(',')
        .filter(item => item) || [],
    [order],
  )

  return (
    <>
      <div className="mt-4">
        <Link href={routes.workqueue}>
          <a>
            <Icon name="arrow" className="text-secondary" />
          </a>
        </Link>
      </div>
      <div className="row">
        <div className="col-12 col-xl-6 offset-xl-1">
          <ImageCarousel value={filterImages} />
        </div>
        <div className="mt-4 mt-lg-5 mt-xl-0 mt-xxl-5 col-12 col-xl-5">
          <Header
            trim={vehicle.trimDescription}
            stock={vehicle?.stockNumber}
            vin={vehicle?.vin}
            price={vehicle?.internetPrice}
            typeName={vehicle?.typeName}
            mileage={vehicle?.mileage}
          >
            {vehicle?.vehicleDisplayName || `${vehicle?.year} ${vehicle?.makeModel}`}
          </Header>
          {[
            OrderState.Cancelled,
            OrderState.NotAvailable,
            OrderState.NotAvailableAfterPayment,
            OrderState.ContractRejected,
          ].includes(order.state) ? (
            <ul className={cls(['pl-3', styles.cancelList])}>
              {cancellationReasons.map((reason: string) => {
                return (
                  <li key={reason}>
                    <span>{reason}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="mt-3 d-xs-block d-md-flex">
              <Button
                className="mb-2 mr-3 utm-vehical-inquiry-available-btn"
                onClick={() => available.mutate({ orderId })}
                loading={available.status === 'running' && 'Saving'}
              >
                {messages.available}
              </Button>
              <Button
                className="mb-2 utm-vehical-inquiry-un-available-btn"
                secondary
                onClick={confirm}
                loading={notAvailable.status === 'running' && 'Saving'}
              >
                {messages.notAvailable}
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className={styles.detailsGrid}>
        <Box title={messages.details.title}>
          <Details>
            <DetailsRow label={messages.details.plan}>
              <span className="text-primary">
                {pricing?.term && `${pricing?.term}-Months`} {order?.productDisplayName}
              </span>
            </DetailsRow>
            <DetailsRow label={messages.details.amountDue}>
              <Currency value={pricing?.dueAtSigning} />
            </DetailsRow>
          </Details>
        </Box>
        <Box title={messages.customer}>
          <CustomerData customer={customer} />
        </Box>
        <Box title={messages.payment.title}>
          <Details>
            {pricing?.downPayment !== undefined ? (
              <DetailsRow label={messages.payment.downPayment}>
                <Currency value={pricing?.downPayment} />
              </DetailsRow>
            ) : null}
            {pricing?.monthlyPayment !== undefined ? (
              <DetailsRow label={messages.payment.monthlyPayment}>
                <Currency value={pricing?.monthlyPayment} />
              </DetailsRow>
            ) : null}
            {order?.pricing !== undefined ? (
              <DetailsRow label={messages.payment.securityDeposit}>
                <Currency value={0} />
              </DetailsRow>
            ) : null}
            {pricing?.dueAtSigning !== undefined ? (
              <DetailsRow label={<span className="text-dark font-weight-bold">{messages.payment.dueAtSigning}</span>}>
                <Currency value={pricing?.dueAtSigning} className="font-weight-bold text-primary" />
              </DetailsRow>
            ) : null}
          </Details>
        </Box>
        <Box title={messages.fniProducts.title}>
          {order.fniProducts && (
            <Details>
              {order.fniProducts.map(e => (
                <DetailsRow alignValueOnTop label={capitalizeFirstLetter(e.coverageName)}>
                  <Currency value={e.dealerCost} />
                </DetailsRow>
              ))}
            </Details>
          )}
        </Box>
      </div>
      {order.tradeInVehicle && (
        <div className="pt-2">
          <TradeIn isEditable={[OrderState.Available].includes(order.state)} order={order} />
        </div>
      )}
    </>
  )
}

export default InquiryPreviewPage
