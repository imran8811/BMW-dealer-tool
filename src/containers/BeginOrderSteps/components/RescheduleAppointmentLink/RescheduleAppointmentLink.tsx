import { useRescheduleAppointment } from '@common/endpoints/orderTransitions'
import cls from 'classnames'
import styles from './RescheduleAppointmentLink.module.scss'

const messages = {
  inProgress: 'Rescheduling ...',
}

const RescheduleAppointmentLink: React.FC<{ orderId: string; linkText: string; classes?: string }> = ({
  orderId,
  linkText,
  classes,
}) => {
  const reschedule = useRescheduleAppointment()

  return (
    <a
      href="#"
      onClick={evt => {
        evt.preventDefault()
        if (reschedule.status !== 'running') {
          void reschedule.mutate({ orderId })
        }
      }}
      className={cls(styles.textUnderline, classes && classes)}
    >
      {reschedule.status === 'running' ? messages.inProgress : linkText}
    </a>
  )
}

export default RescheduleAppointmentLink
