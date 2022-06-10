import { FC } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import useConfirm from '@common/utilities/useConfirm'
import OfferCard from '@components/OfferCard'
import { HandOverMode, Order, OrderState } from '@common/endpoints/typings.gen'
import { useMarkAvailable, useMarkNotAvailable } from '@common/endpoints/orderTransitions'
import { useHoursFromNow } from './useHoursFromNow'

const stateMessages: Record<string, (order: Order) => string> = {
  [OrderState.Available]: () => 'You have not completed the availability check.\n\nPlease Resume',
  [OrderState.Confirmed]: () => 'Credit application in progress',
  [OrderState.WaitingForCreditDecision]: () => 'Credit decision in progress',
  [OrderState.Approved]: () => 'Credit application approved, customer is providing insurance details.',
  [OrderState.CreditStipulated]: () => 'The credit application has resulted in some stips',
  [OrderState.WaitingForContractDecision]: () => 'Preparing documents for the customer to sign',
  [OrderState.ContractApproved]: () => 'Customer signing in progress',
  [OrderState.DocumentsSigned]: () => 'Payment of due amount in progress',
  [OrderState.PaymentPerformed]: () => 'Payment Successful',
  [OrderState.TimeSlotsProposed]: ({ order }) =>
    order.vehicleHandOverMode === HandOverMode.Delivery
      ? 'Customer is scheduling their delivery'
      : 'Customer is scheduling their pickup',
}

const messages = {
  saving: 'Saving',
  confirmed: 'Confirmed',
  confirmationTitle: 'Are you sure you want to mark this vehicle as not available?',
  confirmationText: 'This will cancel the order for the customer.',
  notImplemented: 'Not implemented: ',
  hrsSuffix: ' hrs',
}

const InquiryCard: FC<{ data: Order; pickup?: boolean }> = ({ data, pickup }) => {
  const router = useRouter()
  const available = useMarkAvailable()
  const notAvailable = useMarkNotAvailable()

  const offerTime = useHoursFromNow(pickup ? data?.order?.updatedAt : data?.order?.orderPlaceAt)

  const { vehicle, order } = data
  const orderId = data.order._id

  const defaults = {
    pickup,
    offerTitle: `${vehicle?.year} ${vehicle?.makeModel}`,
    imageUrl: (vehicle?.photoUrls?.length && vehicle?.photoUrls[0]) || '',
    stockNumber: vehicle?.stockNumber,
    vin: vehicle?.vin,
    offerPrice: vehicle?.internetPrice,
    offerTime: offerTime ? (
      <span className="text-uppercase">
        {offerTime}
        {messages.hrsSuffix}
      </span>
    ) : (
      ''
    ),
  }

  const stateMsg = stateMessages[order.state]?.(data) || `${messages.notImplemented}${order.state}`

  const { confirm } = useConfirm({
    title: messages.confirmationTitle,
    message: messages.confirmationText,
    onConfirm: () => notAvailable.mutate({ orderId }),
    acceptBtnClass: 'utm-workqueue-unavailable-confirmation-btn-yes',
    rejectBtnClass: 'utm-workqueue-unavailable-confirmation-btn-no',
  })

  const linkProps = {
    href: '/orders/[orderId]',
    as: `/orders/${orderId}`,
    passHref: true,
  }

  // Dealer needs to mark order as "Available" or "Not Available"
  if (order.state === OrderState.Inquiry) {
    return (
      <Link {...linkProps}>
        <OfferCard
          {...defaults}
          onConfirm={() =>
            available.mutate(
              { orderId },
              {
                onSuccess: () => {
                  void router.push('/orders/[orderId]', `/orders/${orderId}`)
                },
              },
            )
          }
          onReject={confirm}
          confirmLoading={available.status === 'running' && messages.saving}
          rejectLoading={notAvailable.status === 'running' && messages.saving}
        />
      </Link>
    )
  }

  // Dealer needs to fill out fees
  if (order.state === OrderState.Available) {
    return (
      <Link {...linkProps}>
        <OfferCard
          {...defaults}
          inProgress={stateMsg}
          onResume={() => {
            void router.push('/orders/[orderId]', `/orders/${orderId}`)
          }}
        />
      </Link>
    )
  }

  // Dealer needs to schedule pickup or delivery
  if (
    order.state === OrderState.VehicleHandOverModeSelected ||
    order.state === OrderState.RescheduleTimeSlotsByCustomer ||
    order.state === OrderState.RescheduleTimeSlotsByDealer
  ) {
    return (
      <Link {...linkProps}>
        <OfferCard
          {...defaults}
          onSchedule={() => {
            void router.push('/orders/[orderId]', `/orders/${orderId}`)
          }}
        />
      </Link>
    )
  }

  return (
    <Link {...linkProps}>
      <OfferCard {...defaults} inProgress={stateMsg} offerTime={messages.confirmed} disabled />
    </Link>
  )
}

export default InquiryCard
