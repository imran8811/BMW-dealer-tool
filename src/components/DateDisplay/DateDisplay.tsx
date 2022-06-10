import React, { useCallback } from 'react'
import { validateTimeZone, useTimezone } from '@common/utilities/timezone'
import dayjs, { Dayjs } from 'dayjs'
import utcPlugin from 'dayjs/plugin/utc'
import tzPlugin from 'dayjs/plugin/timezone'

dayjs.extend(utcPlugin)
dayjs.extend(tzPlugin)

enum Formats {
  'date-time' = 'YYYY-MM-DD HH:mm:ss',
  date = 'MM/DD/YYYY',
  time = 'h:mm A',
  'short-date' = 'MMM D',
  'day-name' = 'dddd',
  // this is handled in a special way
  'time-of-day' = 'time-of-day',
  'date-day-first' = 'DD/MM/YYYY',
}

export type DateDisplayProps = {
  /**
   * This argument can be two things:
   *
   * 1) An UTC-formatted date string, like "2020-10-10T19:00:00Z"
   * 2) A Date object, it will be assumed to be in local time, eg.
   *    "Date Mon Oct 19 2020 05:37:41 GMT+0200 (Central European Summer Time)"
   */
  value: string | Date
  /**
   * If you need to override the timezone used.
   */
  timezone?: string | null
  /**
   * Format in which the date should be displayed
   */
  format?: keyof typeof Formats
}

const formatTimeOfDay = (d: Dayjs): string => {
  const hour = d.hour()

  if (hour >= 3 && hour < 12) {
    return 'Morning'
  }
  if (hour >= 12 && hour < 15) {
    return 'Afternoon'
  }
  if (hour >= 15 && hour < 20) {
    return 'Evening'
  }

  return 'Night'
}

type Formatter = (value: DateDisplayProps['value'], format?: DateDisplayProps['format']) => string

export const useDateFormatter = (params?: Pick<DateDisplayProps, 'timezone'>): Formatter => {
  const currentTimezone = useTimezone() // Default timezone we will be using
  const timezone2: string | undefined = validateTimeZone(params?.timezone ?? currentTimezone ?? undefined)
  return useCallback<Formatter>(
    (value, format = 'date-time') => {
      const zoned = dayjs(value).tz(timezone2)
      if (format === 'time-of-day') {
        return formatTimeOfDay(zoned)
      }
      return zoned.format(Formats[format])
    },
    [timezone2],
  )
}

/**
 * This component will format given date object in user's timezone.
 * File also exports `useDateFormatter` hook.
 */
export const DateDisplay: React.FC<DateDisplayProps> = ({ timezone, value, format }) => {
  const formatter = useDateFormatter({ timezone })

  return <>{formatter(value, format)}</>
}

export default DateDisplay
