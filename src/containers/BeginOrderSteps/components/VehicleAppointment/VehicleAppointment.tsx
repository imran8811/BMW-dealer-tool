import { FC } from 'react'
import Icon from '@components/Icon'
import { HandOverMode, OrderDetails } from '@common/endpoints/typings.gen'
import RescheduleAppointmentLink from '../RescheduleAppointmentLink'

const messages = {
  scheduling: 'The customer is scheduling their',
  update: 'We will contact you when the appointment is confirmed. Check back for updates.',
  modes: {
    [HandOverMode.Pickup]: 'pickup',
    [HandOverMode.Delivery]: 'delivery',
  },
  reschedule: 'Reschedule Appointment',
}

export interface IVehicleAppointment {
  order: Pick<OrderDetails, '_id' | 'vehicleHandOverMode'>
}

const VehicleAppointment: FC<IVehicleAppointment> = ({ order }) => {
  const { _id: orderId, vehicleHandOverMode } = order

  return (
    <div className="row text-center align-items-center bg-white rounded p-3 pt-4 p-md-5">
      <div className="col mt-4 pt-4">
        <div className="text-primary">
          <Icon name="calanderTime" size={100} />
        </div>
        <h2 className="mt-3">
          {messages.scheduling} {messages.modes[vehicleHandOverMode]}
        </h2>
        <p className="text-muted">{messages.update}</p>
        <p>
          <RescheduleAppointmentLink
            classes="utm-timeslot-proposed-Reschedule-link"
            orderId={orderId}
            linkText={messages.reschedule}
          />
        </p>
      </div>
    </div>
  )
}

export default VehicleAppointment
