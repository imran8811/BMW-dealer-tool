import { Order, OrderState } from '@common/endpoints/typings.gen'
import { ApiError } from '@common/utilities/http-api'
import { PaginatedResponse } from '@common/utilities/PaginationTypes'

import useInfinitePagination, {
  InfinitePaginationQuery,
  UseInfinitePaginationReturn,
} from '@common/utilities/useInifinitePagination'
import { SWRInfiniteConfigInterface } from 'swr'

export const statusMap = {
  inquiry: [
    OrderState.Inquiry,
    OrderState.Confirmed,
    OrderState.Available,
    OrderState.WaitingForCreditDecision,
    OrderState.CreditStipulated,
    OrderState.ContractApproved,
    OrderState.WaitingForContractDecision,
    OrderState.Approved,
    OrderState.DocumentsSigned,
    OrderState.PaymentFailed,
    OrderState.PaymentPerformed,
  ],
  schedule: [
    OrderState.VehicleHandOverModeSelected,
    OrderState.RescheduleTimeSlotsByCustomer,
    OrderState.RescheduleTimeSlotsByDealer,
    OrderState.TimeSlotsProposed,
  ],
  appointment: [OrderState.AppointmentScheduled],
  completed: [OrderState.Delivered, OrderState.Complete],
  cancelled: [
    OrderState.Cancelled,
    OrderState.NotAvailableAfterPayment,
    OrderState.NotAvailable,
    OrderState.CreditError,
    OrderState.ContractRejected,
    OrderState.Rejected,
  ],
  delivered: [OrderState.Delivered],
  get all() {
    return [
      ...this.inquiry,
      ...this.schedule,
      ...this.appointment,
      ...this.completed,
      ...this.cancelled,
      ...this.delivered,
    ]
  },
  get inProgress() {
    return [...this.inquiry, ...this.schedule, ...this.appointment, ...this.delivered]
  },
  get allButCancelled() {
    return [...this.inquiry, ...this.schedule, ...this.appointment, ...this.completed, ...this.delivered]
  },
}

const endpoint = '/order-management/get-orders'

const useOrders = (
  query: {
    status?: keyof typeof statusMap
    dealerCode?: string
  } & InfinitePaginationQuery,
  swrConfig?: SWRInfiniteConfigInterface<PaginatedResponse<Order[]>, ApiError>,
): UseInfinitePaginationReturn<Order> => {
  return useInfinitePagination<Order, { state?: string[]; sortBy?: string; sortOrder?: number; dealerCode?: string }>(
    query.dealerCode && query.dealerCode !== '0' ? endpoint : null,
    {
      ...(({ status, ...q }) => q)(query), // omit status from query
      state: query.status ? statusMap[query.status] : undefined,
      sortBy: 'createdAt',
      sortOrder: -1,
    },
    swrConfig,
  )
}

export const useOrdersCount = (dealerCode?: string, allOrders?: boolean): UseInfinitePaginationReturn<Order> =>
  useOrders(
    {
      status: allOrders ? 'all' : 'allButCancelled',
      pageSize: 1,
      dealerCode,
    },
    { revalidateOnFocus: false },
  )

export default useOrders
