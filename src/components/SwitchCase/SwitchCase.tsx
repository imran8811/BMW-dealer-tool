import { FC } from 'react'
import { OrderState } from '@common/endpoints/typings.gen'

export type SwitchCaseProps = {
  value: OrderState
}

const SwitchCaseComponent: FC<SwitchCaseProps> = ({ value }) => {
  switch (value) {
    case OrderState.Draft:
      return <span>Draft</span>
    case OrderState.Inquiry:
      return <span>Inquiry</span>
    case OrderState.NotAvailable:
      return <span>Not available</span>
    case OrderState.Available:
      return <span>Available</span>
    case OrderState.Confirmed:
      return <span>Confirmed</span>
    case OrderState.WaitingForCreditDecision:
      return <span>Waiting for credit decision</span>
    case OrderState.Rejected:
      return <span>Rejected</span>
    case OrderState.Approved:
      return <span>Approved</span>
    case OrderState.DocumentsSigned:
      return <span>Documents signed</span>
    case OrderState.PaymentFailed:
      return <span>Payment failed</span>
    case OrderState.PaymentPerformed:
      return <span>Payment performed</span>
    case OrderState.VehicleHandOverModeSelected:
      return <span>Vehicle handover mode selected</span>
    case OrderState.TimeSlotsProposed:
      return <span>TimeSlots proposed</span>
    case OrderState.AppointmentScheduled:
      return <span>Appointment scheduled</span>
    case OrderState.Delivered:
      return <span>Delivered</span>
    case OrderState.Complete:
      return <span>Complete</span>
    case OrderState.Cancelled:
      return <span>Canceled</span>
    case OrderState.RescheduleTimeSlotsByCustomer:
      return <span>Reschedule timeslots by customer</span>
    case OrderState.RescheduleTimeSlotsByDealer:
      return <span>Reschedule Timeslots by dealer</span>
    default:
      return <span>Invalid Action/State</span>
  }
}

export default SwitchCaseComponent
