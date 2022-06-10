import dayjs from 'dayjs'
import utcPlugin from 'dayjs/plugin/utc'
import tzPlugin from 'dayjs/plugin/timezone'
import useSWR, { mutate as swrMutate } from 'swr'
import useMutation from 'use-mutation'
import { mutateMany } from 'swr-mutate-many'
import sendForm from '@common/utilities/sendForm'
import useDealershipConfiguration from '@common/endpoints/useDealershipConfiguration'
import { validateTimeZone } from '@common/utilities/timezone'
import { Fee, FeeInput, FnIProducts, OrderDetails, Schedule, TimeSlotsProposedInput } from './typings.gen'

dayjs.extend(utcPlugin)
dayjs.extend(tzPlugin)

type OrderID = OrderDetails['_id']

export enum OdoStatementEnum {
  OdoReflectsVehicleMileage = 'OdoReflectsVehicleMileage',
  OdoReflectsExcMechLimits = 'OdoReflectsExcMechLimits',
  OdoNotActualVehicleMileage = 'OdoNotActualVehicleMileage',
}

enum TransitionName {
  PlaceOrder = 'PlaceOrder',
  NotAvailable = 'NotAvailable',
  Available = 'Available',
  Confirmed = 'Confirmed',
  Submitted = 'Submitted',
  Rejected = 'Rejected',
  Approved = 'Approved',
  DocumentsSigned = 'DocumentsSigned',
  PaymentFailed = 'PaymentFailed',
  PaymentPerformed = 'PaymentPerformed',
  VehicleHandOverModeSelected = 'VehicleHandOverModeSelected',
  TimeSlotsProposed = 'TimeSlotsProposed',
  RescheduleTimeSlotsByCustomer = 'RescheduleTimeSlotsByCustomer',
  AppointmentScheduled = 'AppointmentScheduled',
  RescheduleTimeSlotsByDealer = 'RescheduleTimeSlotsByDealer',
  Delivered = 'Delivered',
  Complete = 'Complete',
  Cancelled = 'Canceled',
  NotAvailableAfterPayment = 'NotAvailableAfterPayment',
}

/**
 * Helper function for invalidating orders.
 */
export const invalidateOrder = async ({ orderId }: { orderId: OrderID }): Promise<void> => {
  await Promise.all([
    swrMutate(`/order-management/get-order-details/${orderId}`, undefined, true),
    mutateMany('*/order-management/get-orders*', undefined, true),
  ])
}

function executeTransition<T, D = unknown>(name: TransitionName, orderId: OrderID, data?: D): Promise<T> {
  const url = `/order-management/perform-transition/${orderId}/${name}`
  return sendForm(url, data ?? {})
}

/**
 * This hook is a mutation which  you can use to mark car as
 * being available.
 */
export const useMarkAvailable = () => {
  const [mutate, result] = useMutation<{ orderId: OrderID }, void>(
    ({ orderId }) => executeTransition(TransitionName.Available, orderId),
    { onSettled: ({ input }) => invalidateOrder(input) },
  )

  return { mutate, ...result }
}

export const useMarkConfirmed = () => {
  const [mutate, result] = useMutation<{ orderId: OrderID }, void>(
    ({ orderId }) => {
      return executeTransition(TransitionName.Confirmed, orderId)
    },
    { onSettled: ({ input }) => invalidateOrder(input) },
  )

  return { mutate, ...result }
}

/**
 * This hook is a mutation which you can use to mark a car
 * as not available.
 */

export const useMarkNotAvailable = () => {
  const [mutate, result] = useMutation<{ orderId: OrderID }, void>(
    ({ orderId }) => executeTransition(TransitionName.NotAvailable, orderId),
    { onSettled: ({ input }) => invalidateOrder(input) },
  )

  return { mutate, ...result }
}

/**
 * This hook is a mutation which you can use to cancel
 * the order.
 */

export const useNotAvailableAfterPayment = () => {
  const [mutate, result] = useMutation<{ orderId: OrderID }, void>(
    ({ orderId }) => executeTransition(TransitionName.NotAvailableAfterPayment, orderId),
    { onSettled: ({ input }) => invalidateOrder(input) },
  )

  return { mutate, ...result }
}

/**
 * This hook allows for fetching default fees for given order.
 */
export const useDefaultFees = (orderId: OrderID) => {
  const url = `/order-management/get-default-fees/${orderId}`
  const result = useSWR<Fee[], Error>(url)

  return {
    ...result,
    isLoading: !result.error && !result.data,
  }
}

type SaveFeesInput = {
  fees: FeeInput[]
  orderId: OrderID
}

/**
 * This hook can  be used for saving fees on an order.
 *
 * You will need to fetch fees first through get-order-details and get-default-fees
 * endpoints.
 */
export const useSaveFees = () => {
  const [mutate, result] = useMutation<SaveFeesInput, Fee[]>(
    async ({ orderId, fees }) => {
      const url = `/order-management/save-fees/${orderId}`
      return sendForm(url, { fees })
    },
    {
      onSuccess: ({ input }) => {
        void invalidateOrder(input)
      },
    },
  )

  return { mutate, ...result }
}

/**
 * Update Order for odometer reading
 */

export type UpdateOdometer = {
  odometer?: OrderDetails['odometer']
  odoStatement?: {
    OdoReflectsVehicleMileage: boolean
    OdoReflectsExcMechLimits: boolean
    OdoNotActualVehicleMileage: boolean
  }
  orderId: string
  individualizedAgreement?: string
  dealerFnIProducts?: FnIProducts[]
}

export const useUpdateOrder = () => {
  const [mutate, result] = useMutation<UpdateOdometer>(
    async ({ orderId, odometer, odoStatement, individualizedAgreement, dealerFnIProducts }) => {
      const url = `/order-management/update-order/${orderId}`
      return sendForm(url, { odometer, odoStatement, individualizedAgreement, dealerFnIProducts }, { method: 'PATCH' })
    },
    {
      onSuccess: ({ input: { orderId } }) => {
        const data = {
          orderId,
        }
        void invalidateOrder(data)
      },
    },
  )

  return { mutate, ...result }
}

const DATE_FMT = 'YYYY-MM-DD'

/**
 * This endpoint can be used to fetch a schedule suitable for given order.
 */
export const useSchedule = ({ dealerCode, orderId }: { dealerCode: string; orderId: string }) => {
  const dealer = useDealershipConfiguration()
  const { data: { dealerTimezone: timezone } = {} } = dealer

  const today = dayjs().tz(validateTimeZone(timezone))
  const startDate = today.subtract(7, 'day')
  const endDate = today.add(14, 'day')

  const result = useSWR<Schedule, Error>(() => {
    if (timezone) {
      const q = new URLSearchParams()
      q.append('startDate', startDate.format(DATE_FMT))
      q.append('endDate', endDate.format(DATE_FMT))
      return `/dealer-management/dealership/schedule-by-orderId/${dealerCode}/${orderId}?${q.toString()}`
    }
    return null
  })

  return {
    ...result,
    today,
    startDate,
    endDate,
    timezone,
    error: dealer.error ?? result.error,
    isValidating: dealer.isValidating || result.isValidating,
  }
}

/**
 * Select time slots which will be proposed to the customer and advance to the
 * next order state.
 */
export const useSelectTimeSlots = () => {
  const [mutate, result] = useMutation<{ orderId: OrderID; slots: string[] }, void>(async ({ orderId, slots }) => {
    await executeTransition<void, TimeSlotsProposedInput>(TransitionName.TimeSlotsProposed, orderId, {
      proposedDateTimeSlots: slots,
    })
    await invalidateOrder({ orderId })
  })

  return { mutate, ...result }
}

/**
 * Confirm delivery of the car to the customer.
 */
export const useConfirmDelivery = () => {
  const [mutate, result] = useMutation<{ orderId: OrderID }, void>(
    ({ orderId }) => {
      return executeTransition(TransitionName.Delivered, orderId)
    },
    { onSettled: ({ input }) => invalidateOrder(input) },
  )

  return { mutate, ...result }
}

/**
 * Mark order as in need of re-scheduling appointment.
 */
export const useRescheduleAppointment = () => {
  const [mutate, result] = useMutation<{ orderId: OrderID }, void>(async ({ orderId }) => {
    await executeTransition(TransitionName.RescheduleTimeSlotsByDealer, orderId)
    await invalidateOrder({ orderId })
  })

  return { mutate, ...result }
}

/**
 * Complete order by the dealer
 */
export const useCompleteOrder = () => {
  const [mutate, result] = useMutation<{ orderId: OrderID }, void>(
    ({ orderId }) => {
      return executeTransition(TransitionName.Complete, orderId)
    },
    { onSettled: ({ input }) => invalidateOrder(input) },
  )

  return { mutate, ...result }
}
