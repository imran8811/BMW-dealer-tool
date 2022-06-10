import { FC, useEffect, useMemo, useRef, useState } from 'react'
import cls from 'classnames'

import useConfirm from '@common/utilities/useConfirm'
import { OrderDetails, TimeSlotState, HandOverMode } from '@common/endpoints/typings.gen'
import SectionHeading from '@components/SectionHeading'
import Carousel from '@components/Carousel'
import Button from '@components/Button'
import { useSelectTimeSlots } from '@common/endpoints/orderTransitions'
import dayjs, { Dayjs } from 'dayjs'
import { validateTimeZone } from '@common/utilities/timezone'
import styles from './SchedulerMobile.module.scss'
import { selectStats, selectSlots, Schedule } from '../../helpers'

const messages = {
  headingSubtitle: 'Set dealership availability',
  subtitlePickup: 'Let us know when the customer can come pick up their car.',
  subtitleDelivery: 'Let us know when you can deliver the car to the customer.',
  messagePickup:
    'You are about to submit your schedule. ' +
    'Once submitted, the customer can then select a date and time from ' +
    'your schedule to pick up their vehicle. Only your admin user can ' +
    'edit the schedule in the Account section at any time.',
  messageDelivery:
    'You are about to submit your schedule. ' +
    'Once submitted, the customer can then select a date and time from your schedule ' +
    'to get delivery of their vehicle. Only your admin user can edit the schedule ' +
    'in the Account section at any time.',
  selectedSlots: ' The following slots are already booked with some other customer.',
  dialogClickMsg: 'Please click confirm to proceed or edit.',
}

const stateToClass: Record<TimeSlotState, string> = {
  [TimeSlotState.Free]: styles.statusNotOffered,
  [TimeSlotState.UnConfirmed]: styles.statusOffered,
  [TimeSlotState.Taken]: styles.statusScheduled,
}

interface Props {
  order: OrderDetails
  schedule: Schedule
}

const STICKY_HEIGHT = 44

const SchedulerMobile: FC<Props> = ({ schedule, order }) => {
  const orderId = order._id
  const slots = selectSlots(schedule)
  const { vehicleHandOverMode } = order

  const todayRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasSlots = slots != null

  useEffect(() => {
    if (hasSlots && todayRef.current != null && scrollRef.current != null) {
      // we need to calculate offset first
      let offset = todayRef.current.offsetTop - scrollRef.current.offsetTop
      // we also need to add the height of the sticky header into the mix
      offset -= STICKY_HEIGHT

      scrollRef.current.scrollTo(0, offset)
    }
  }, [hasSlots])

  const proposeTimeSlots = useSelectTimeSlots()
  const [selectedMap, setSelected] = useState<Record<string, boolean>>({})
  const [selectedZonedMap, setZonedSelected] = useState<Record<string, boolean>>({})
  const [takenSlotsMap, setTakenSlotsMap] = useState<Record<string, boolean>>({})
  const takenSlots = useMemo(
    () =>
      Object.entries(takenSlotsMap)
        .filter(item => item[1])
        .map(item => item[0].split('_')),
    [takenSlotsMap],
  )
  const selectedArray = useMemo(
    () =>
      Object.entries(selectedZonedMap)
        .filter(item => item[1])
        .map(item => item[0]),
    [selectedZonedMap],
  )

  const mappedSlots = useMemo(() => {
    const mapped: { [key: string]: Array<string> } = {}
    takenSlots.forEach(item => {
      const date = item[0]
      mapped[date] = takenSlots.filter(s => s[1] && s[0] === date).map(it => it[1])
    })
    return mapped
  }, [takenSlots])

  const confirmMsg = (
    <>
      <p>
        {(vehicleHandOverMode === HandOverMode.Delivery ? messages.messageDelivery : messages.messagePickup) +
          (takenSlots.length > 0 ? messages.selectedSlots : '')}
      </p>
      {Object.keys(mappedSlots)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((item: string) => (
          <p key={item}>
            {item}{' '}
            {mappedSlots[item].map((slot, i) => (
              <b key={slot}>{`${i ? ',' : ''} ${slot}`}</b>
            ))}
          </p>
        ))}
      <p>{messages.dialogClickMsg}</p>
    </>
  )

  const { confirm } = useConfirm({
    title: 'Confirm Schedule?',
    confirmText: 'Confirm',
    cancelText: 'Edit',
    message: confirmMsg,
    onConfirm: () =>
      proposeTimeSlots.mutate({
        orderId,
        slots: selectedArray.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
      }),
    swapButtons: true,
    acceptBtnClass: 'utm-confirm-schedule-dialog-yes',
    rejectBtnClass: 'utm-confirm-schedule-dialog-edit',
  })

  const handleSlotClick = (key: string, state: TimeSlotState, date: Dayjs) => {
    /** Setting the key according to timezone */
    const zonedKey = dayjs.tz(date.format('YYYY-MM-DDTHH:mm:ss'), validateTimeZone(schedule.timezone)).format()
    if (state === TimeSlotState.Taken)
      setTakenSlotsMap({
        ...takenSlotsMap,
        [`${date.format('ddd, DD MMM, YYYY,')}_${date.format('hh:mm')}`]: !takenSlotsMap[
          `${date.format('ddd, DD MMM, YYYY,')}_${date.format('hh:mm')}`
        ],
      })
    setSelected({
      ...selectedMap,
      [key]: !selectedMap[key],
    })
    /** Seperate state to save value in db */
    setZonedSelected({
      ...selectedZonedMap,
      [zonedKey]: !selectedZonedMap[zonedKey],
    })
  }

  // FIXME: display error / loader
  if (slots == null) {
    return null
  }

  const stats = selectStats(schedule, slots)

  const items: React.ReactNode[] = []
  slots.forEach(day => {
    // first check for header
    // const prev = arr[index - 1]
    // if (prev == null || !prev.date.isSame(day.date, 'month')) {
    //   items.push(
    //     <h3 className={styles.monthHeading} key={`header-${day.key}`}>
    //       {day.date.format('MMM YYYY')}
    //     </h3>,
    //   )
    // }

    const isInPast = day.date.isBefore(schedule.today, 'day')

    // then add day
    items.push(
      <span>
        <h3 className={styles.monthHeading} key={`header-${day.key}`}>
          {day.date.format('MMM YYYY').toUpperCase()}
        </h3>
        <div
          className={cls(styles.singleDate, isInPast && styles.disabled, 'swiper-slide')}
          key={day.key}
          ref={day.date.isSame(schedule.today, 'day') ? todayRef : null}
        >
          <div className="row">
            <div className="col-12">
              <div className={styles.dayDate}>
                <span className={styles.schedulerDay}>{day.date.format('ddd')} </span>
                <span className={styles.schedulerDate}>{day.date.format('DD')}</span>
              </div>
            </div>
            <div className="col-12">
              <ul
                className={cls(
                  vehicleHandOverMode === HandOverMode.Delivery
                    ? cls(styles.timeSlots, styles.timeSlotsDelivery)
                    : styles.timeSlots,
                )}
              >
                {day.slots.map(slot => {
                  const comparisionSlot = slot.date
                  const comparisionCurrentTime = dayjs()
                    .tz(validateTimeZone(schedule.timezone))
                    .format('YYYY-MM-DDTHH:mm')
                  const isInPastHour = comparisionSlot.isBefore(comparisionCurrentTime, 'minute')
                  return (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <li
                      key={slot.key}
                      data-key={slot.key}
                      onClick={isInPast ? undefined : () => handleSlotClick(slot.key, slot.state, slot.date)}
                      className={cls(
                        stateToClass[slot.state],
                        selectedMap[slot.key] && styles.statusSelected,
                        isInPastHour ? [styles.disabled, 'not-selectable'] : '',
                      )}
                    >
                      <span>{slot.date.format('hh:mm')}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </span>,
    )
  })

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-lg-6">
          <SectionHeading
            subtitle={
              vehicleHandOverMode === HandOverMode.Delivery ? messages.subtitleDelivery : messages.subtitlePickup
            }
          >
            {messages.headingSubtitle}
          </SectionHeading>
        </div>
        <div className="col-lg-6">
          <ul className={styles.statesList}>
            <li className={styles.statusScheduled}>
              <span>
                Scheduled: <span>{stats[TimeSlotState.Taken]}</span>
              </span>
            </li>
            <li className={styles.statusOffered}>
              <span>
                Offered: <span>{stats[TimeSlotState.UnConfirmed]}</span>
              </span>
            </li>
            <li className={styles.statusNotOffered}>
              <span>
                Not Offered: <span>{stats[TimeSlotState.Free]}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <Carousel className={styles.carosalTopModified} navigation slidesPerView={1} initialSlide={7}>
        {items}
      </Carousel>
      <div className="clearfix mb-3">
        <Button
          className={cls(styles.pullRight, 'utm-schedular-confirm-time-slot-btn')}
          onClick={() => {
            if (selectedArray.length === 0) return
            confirm()
          }}
          disabled={selectedArray.length === 0}
          loading={proposeTimeSlots.status === 'running' && 'Saving'}
        >
          Confirm Schedule
        </Button>
      </div>
    </div>
  )
}

export default SchedulerMobile
