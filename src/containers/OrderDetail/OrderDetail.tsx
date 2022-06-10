import React, { FC, useEffect, useState } from 'react'
import { GetPricingDetailsResponse, Order, OrderState } from '@common/endpoints/typings.gen'
import { AppError } from '@common/utilities/ErrorBoundary'
import useOrder from '@common/endpoints/useOrder'
import usePricing from '@common/endpoints/usePricing'
import invariant from '@common/utilities/invariant'
import useQuery from '@common/utilities/useQuery'
import { BeginOrder, ReviewOrder } from '@containers/BeginOrderSteps'
import InquiryPreview from '@containers/InquiryPreview/InquiryPreview'
import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import OrderLayout from '@layouts/OrderLayout'
import { useRouter } from 'next/router'
import routes from '@common/routes'
import CompleteOrder from '@containers/OrderScheduler'
import SigningContract from '@containers/BeginOrderSteps/SigningContract'
import OrderComplete from '@containers/BeginOrderSteps/OrderComplete'
import ProgressSpinner from '@components/ProgressSpinner'
import { useDealershipContext } from '@common/utilities/dealershipContext'
import { useIsSuperUser } from '@common/utilities/useUser'
import useConfirm from '@common/utilities/useConfirm'
import { TradeInStatus } from '@common/endpoints/useDealSummary'
import { ServerSideData } from '@common/utilities/pageProps'

enum BeginOrderSteps {
  'BeginOrder' = 'BeginOrder',
  'ReviewOrder' = 'ReviewOrder',
}

const stateToStepMap: Record<OrderState, number> = {
  [OrderState.Draft]: 1,
  [OrderState.Inquiry]: 1,
  [OrderState.NotAvailable]: 1,
  [OrderState.Available]: 1,
  [OrderState.Confirmed]: 1,
  [OrderState.WaitingForCreditDecision]: 1,
  [OrderState.Rejected]: 1,
  [OrderState.Approved]: 1,
  [OrderState.CreditError]: 1,
  [OrderState.CreditStipulated]: 1,
  [OrderState.WaitingForContractDecision]: 1,
  [OrderState.ContractRejected]: 1,
  [OrderState.ContractApproved]: 1,
  [OrderState.DocumentsSigned]: 1,
  [OrderState.PaymentFailed]: 1,
  [OrderState.PaymentPerformed]: 1,
  [OrderState.VehicleHandOverModeSelected]: 2,
  [OrderState.TimeSlotsProposed]: 2,
  [OrderState.AppointmentScheduled]: 3,
  [OrderState.Delivered]: 3,
  [OrderState.Complete]: 3,
  [OrderState.Cancelled]: 3,
  [OrderState.RescheduleTimeSlotsByCustomer]: 2,
  [OrderState.RescheduleTimeSlotsByDealer]: 2,
  [OrderState.NotAvailableAfterPayment]: 2,
}

const useOrderWizard = () => {
  const q = useQuery()
  const orderId = q.get('orderId')
  invariant(orderId != null, 'Missing orderId param. Was the side rendered in SSG mode?')
  const showSummary = q.get('view') === 'summary'
  return {
    showSummary,
    ...useOrder(orderId),
  }
}

const OrderDetail: FC<ServerSideData> = props => {
  const router = useRouter()
  const { getCurrentDealershipCode, setCurrentDealershipCode } = useDealershipContext()
  const {
    data,
    error: orderError,
    isLoading,
    showSummary,
    mutate: refetchOrderDetails,
    isValidating: isOrderValidating,
  } = useOrderWizard()
  const isSuperUserMode = useIsSuperUser()
  if (data?.vehicle && isSuperUserMode) {
    setCurrentDealershipCode(data.vehicle.dealerCode)
  }
  const dealerCode = getCurrentDealershipCode()
  const {
    data: pricing,
    isLoading: isPricingLoading,
    isValidating: isPricingValidating,
    error: pricingError,
    refetchPricingWithNewOrderDetails: refreshPricing,
  } = usePricing(data)

  const [beginOrderStep, setBeginOrderStep] = useState(BeginOrderSteps.BeginOrder)
  /**
   * If order is cancelled during the process, following popup is displayed
   */
  const [orderInitialState, setOrderInitialState] = useState(data?.order.state)

  const { confirm: confirmCancel } = useConfirm({
    title: 'Order Canceled',
    message: 'This order has been canceled. Please refer to the order in the canceled section for more information.',
    cancelText: 'back to orders',
    hideAccept: true,
    onReject: () => router.push(routes.workqueue),
    rejectBtnClass: 'utm-orders-btn-cancelled-order-dialog',
  })

  useEffect(() => {
    if (orderInitialState && orderInitialState !== OrderState.Cancelled && data?.order.state === OrderState.Cancelled) {
      confirmCancel()
    }
    if (!isLoading && !isPricingLoading) {
      setOrderInitialState(data?.order.state)
    }
  }, [orderInitialState, data, confirmCancel, isLoading, isPricingLoading])

  const ErrorStatusCode = orderError?.data?.status
  if (ErrorStatusCode && [400, 403].includes(ErrorStatusCode)) {
    throw new AppError(orderError?.data)
  }

  if (isLoading || isPricingLoading) {
    return (
      <LayoutWithNavigation serverSideProps={props} pagekey="Orders">
        <div className="py-5 text-center">
          <ProgressSpinner />
        </div>
      </LayoutWithNavigation>
    )
  }

  const error = orderError || pricingError
  // show Error screen only when there is no data and API call fails
  if (error && !pricing && !data) {
    throw new AppError(error.data)
  }

  invariant(data != null, 'At this point data should be available!')

  const { order, customer, vehicle } = data
  const activeStep = stateToStepMap[order.state]

  /**
   * So this page doubles as a summary view. If someone requests a summary for
   * an order that's what we show.
   */
  if (
    (order.state === OrderState.Available && beginOrderStep === BeginOrderSteps.ReviewOrder) ||
    showSummary ||
    [OrderState.Complete, OrderState.Delivered].includes(order.state)
  ) {
    return (
      <OrderLayout
        serverSideProps={props}
        onBack={order.state === OrderState.Available ? () => setBeginOrderStep(BeginOrderSteps.BeginOrder) : undefined}
        activeStep={activeStep}
      >
        <ReviewOrder
          order={order}
          vehicle={vehicle}
          customer={customer}
          isLoading={isPricingValidating || isOrderValidating}
          pricing={pricing as GetPricingDetailsResponse}
          onBack={
            order.state === OrderState.Available ? () => setBeginOrderStep(BeginOrderSteps.BeginOrder) : undefined
          }
          refetchOrderDetails={async (updatedTaxes?: boolean, tradeInStatus?: TradeInStatus) => {
            const updatedOrder = await refetchOrderDetails()
            await refreshPricing?.({ orderDetails: updatedOrder as Order, updatedTaxes, tradeInStatus })
          }}
        />
      </OrderLayout>
    )
  }

  if (
    [
      OrderState.Inquiry,
      OrderState.Cancelled,
      OrderState.NotAvailable,
      OrderState.NotAvailableAfterPayment,
      OrderState.ContractRejected,
    ].includes(order.state)
  ) {
    return (
      <LayoutWithNavigation serverSideProps={props} pagekey="Orders" className="pb-5">
        <InquiryPreview
          order={order}
          vehicle={vehicle}
          customer={customer}
          pricing={pricing as GetPricingDetailsResponse}
        />
      </LayoutWithNavigation>
    )
  }

  if (order.state === OrderState.Available && beginOrderStep === BeginOrderSteps.BeginOrder) {
    return (
      <OrderLayout serverSideProps={props} activeStep={activeStep}>
        <BeginOrder
          order={order}
          vehicle={vehicle}
          customer={customer}
          pricing={pricing as GetPricingDetailsResponse}
          refetchOrderDetails={async () => {
            const updatedOrder = await refetchOrderDetails()
            await refreshPricing?.({ orderDetails: updatedOrder as Order })
          }}
          onFinish={() => setBeginOrderStep(BeginOrderSteps.ReviewOrder)}
        />
      </OrderLayout>
    )
  }

  if (
    order.state === OrderState.VehicleHandOverModeSelected ||
    order.state === OrderState.RescheduleTimeSlotsByCustomer ||
    order.state === OrderState.RescheduleTimeSlotsByDealer
  ) {
    return (
      <OrderLayout serverSideProps={props} activeStep={activeStep}>
        {dealerCode && <CompleteOrder dealerCode={dealerCode} order={order} customer={customer} vehicle={vehicle} />}
      </OrderLayout>
    )
  }

  if (
    [
      OrderState.Confirmed,
      OrderState.WaitingForCreditDecision,
      OrderState.Approved,
      OrderState.Rejected,
      OrderState.CreditError,
      OrderState.CreditStipulated,
      OrderState.WaitingForContractDecision,
      OrderState.DocumentsSigned,
      OrderState.PaymentPerformed,
      OrderState.PaymentFailed,
      OrderState.ContractApproved,
    ].includes(order.state)
  ) {
    return (
      <OrderLayout serverSideProps={props} activeStep={activeStep}>
        <SigningContract order={order} vehicle={vehicle} />
      </OrderLayout>
    )
  }

  if ([OrderState.AppointmentScheduled, OrderState.TimeSlotsProposed].includes(order.state)) {
    return (
      <OrderLayout serverSideProps={props} activeStep={activeStep}>
        <OrderComplete order={order} customer={customer} vehicle={vehicle} />
      </OrderLayout>
    )
  }

  throw new AppError({ title: 'Order state not implemented yet', description: order?.state })
}

export default OrderDetail
