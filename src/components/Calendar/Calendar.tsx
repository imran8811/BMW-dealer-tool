import { FC } from 'react'
import { Calendar as PrimeCalendar, CalendarProps as PrimeCalendarProps } from 'primereact/calendar'
import styles from './Calendar.module.scss'

export type CalendarProps = PrimeCalendarProps & {
  showButtonBar?: boolean
}

const Calendar: FC<CalendarProps> = ({ showButtonBar, ...props }) => (
  <PrimeCalendar
    dateFormat="mm/dd/yy"
    placeholder="MM/DD/YYYY"
    className={styles.calendar}
    inputClassName={styles.input}
    showButtonBar={showButtonBar === undefined ? true : showButtonBar}
    {...props}
  />
)

export default Calendar
