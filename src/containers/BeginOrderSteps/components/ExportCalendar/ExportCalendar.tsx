import { HandOverMode } from '@common/endpoints/typings.gen'
import dayjs, { Dayjs } from 'dayjs'
import { useCallback, useMemo } from 'react'
import cls from 'classnames'
import styles from './ExportCalendar.module.scss'

const ExportCalendar: React.FC<{
  customerLocation: string
  customerName: string
  timeSlot: string
  handoverMode: string
  timezone?: string
}> = ({ timeSlot, handoverMode, timezone, customerName, customerLocation }) => {
  /** Capitalize first letter */
  const capFirstLetter = useCallback(
    (str: string) =>
      str
        .toLowerCase()
        .split(' ')
        .map(e => `${e.charAt(0).toUpperCase()}${e.slice(1)}`)
        .join(' '),
    [],
  )

  /** Check if IOS browser */
  const isIOSBrowser = useCallback(() => {
    const ua = window.navigator.userAgent
    const iOS = !!/ipad/i.exec(ua) || !!/iphone/i.exec(ua) || !!/mac/i.exec(ua)
    const webkit = !!/webkit/i.exec(ua)

    return iOS && webkit
  }, [])

  /** Format the date string */
  const formatDate = useCallback((date: string | Dayjs) => `${dayjs(date).format('YYYYMMDDTHHmmss')}`, [])

  /** Build URL for exporting ics file */
  const encoded = useMemo(() => {
    /** Difference b/w start and end time Pickup-> 30minutes, Delivery-> 4hours */
    const difference = handoverMode === HandOverMode.Pickup ? 30 : 4 * 60
    const endtime = dayjs(timeSlot).add(difference, 'minute')

    /** random string fo UID  */
    const genId = () => `${Math.floor(Math.random() * 100 + 1)}vehicalappointment${Math.floor(Math.random() * 100 + 1)}`

    const url = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID://FAIRDEALERTOOL//Calendar//EN',
      'METHOD:PUBLISH',
      'CLASS:PUBLIC',
      'BEGIN:VEVENT',
      'PRIORITY:0',
      'SEQUENCE:0',
      'TRANSP:OPAQUE',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'REPEAT:1',
      'DURATION:PT15M',
      'ACTION:DISPLAY',
      'END:VALARM',
      `TZID:${timezone || ''}`,
      `UID: ${genId()}`,
      // `URL:${window.location.toString()}`,
      `DTSTART:${formatDate(timeSlot)}`,
      `DTEND:${formatDate(endtime)}`,
      `SUMMARY:${`Vehicle ${handoverMode} Appointment with ${capFirstLetter(customerName)}`}`,
      'DESCRIPTION: ',
      `LOCATION:${handoverMode === HandOverMode.Delivery ? customerLocation : ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('%0D%0A')
    // url for ios safari browser, mac chrome, mac safari, window chrome, window firefox
    // does not support ios chrome at the moment
    return `data:text/calendar;charset=utf8,${url}`
  }, [handoverMode, timeSlot, formatDate, timezone, customerName, customerLocation, capFirstLetter])

  return (
    <a
      download={`Appointment_with_${capFirstLetter(customerName)}`}
      href={encoded}
      className={cls(styles.textUnderline, 'utm-export-calender-link')}
      target={isIOSBrowser() ? 'blank' : undefined}
    >
      Export to Calendar
    </a>
  )
}

export default ExportCalendar
