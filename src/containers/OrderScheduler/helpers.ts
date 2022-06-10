import { useSchedule } from '@common/endpoints/orderTransitions'
import { TimeSlotState } from '@common/endpoints/typings.gen'
import dayjs, { Dayjs } from 'dayjs'

// Result of the useSchedule function
export type Schedule = ReturnType<typeof useSchedule>

const DATE_FMT = 'YYYY-MM-DD'

/**
 * Based on schedule data from server prepare a grid of slots.
 */
export const selectSlots = (schedule: Pick<Schedule, 'timezone' | 'startDate' | 'endDate' | 'data'>) => {
  const { startDate, endDate, data } = schedule
  const days: Dayjs[] = []
  const stateMap = new Map<string, TimeSlotState>()
  if (data == null) {
    return null
  }

  ;(data.slots ?? []).forEach(slot => {
    stateMap.set(slot.timeSlot, slot.state)
  })

  for (let d = startDate; !d.isAfter(endDate, 'day'); d = d.add(1, 'day')) {
    days.push(d)
  }

  return days.map(day => {
    const startSlot = dayjs(`${day.format(DATE_FMT)} ${data.firstSlot}`)
    const endSlot = dayjs(`${day.format(DATE_FMT)} ${data.lastSlot}`)
    const hours: Dayjs[] = []

    for (let d = startSlot; !d.isAfter(endSlot); d = d.add(data.intervalInMinutes, 'minute')) {
      hours.push(d)
    }

    return {
      // to use with React
      key: day.format(DATE_FMT),
      date: day,
      slots: hours.map(slot => {
        const key = slot.toJSON()
        return {
          // to use with React / as value
          key,
          date: slot,
          state: stateMap.get(key) ?? TimeSlotState.Free,
        }
      }),
    }
  })
}

/**
 * Based on data from server calculate statistics for schedule slots.
 */
export function selectStats(schedule: Pick<Schedule, 'today'>, slots: ReturnType<typeof selectSlots>) {
  const stats: Record<TimeSlotState, number> = {
    [TimeSlotState.Free]: 0,
    [TimeSlotState.UnConfirmed]: 0,
    [TimeSlotState.Taken]: 0,
  }

  slots?.forEach(day => {
    if (day.date.isBefore(schedule.today, 'day')) return

    day.slots.forEach(slot => {
      stats[slot.state] += 1
    })
  })

  return stats
}
