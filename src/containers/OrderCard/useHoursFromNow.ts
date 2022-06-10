import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

export const formatHoursFromNow = (input: string): string => {
  if (!input) {
    return ''
  }

  const date = dayjs(input)
  const h = dayjs().diff(date, 'hour')
  const m = dayjs().diff(date, 'minute') % 60

  return `${h}:${m.toString().padStart(2, '0')}`
}

export const useHoursFromNow = (date: string): string => {
  const [offerTime, setOfferTime] = useState<string>('')

  useEffect(() => {
    setOfferTime(formatHoursFromNow(date))
    const clock = setInterval(() => {
      setOfferTime(formatHoursFromNow(date))
    }, 30000)

    return () => clearInterval(clock)
  }, [date])

  return offerTime
}
