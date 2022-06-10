import { FC, useEffect, useMemo, useRef, useState } from 'react'
import cls from 'classnames'
import { SelectableGroup } from 'react-selectable-fast'
import useConfirm from '@common/utilities/useConfirm'
import { OrderDetails, TimeSlotState, HandOverMode } from '@common/endpoints/typings.gen'
import SectionHeading from '@components/SectionHeading'
import Button from '@components/Button'
import { useSelectTimeSlots } from '@common/endpoints/orderTransitions'
import Divider from '@components/Divider'
import dayjs, { Dayjs } from 'dayjs'
import { validateTimeZone } from '@common/utilities/timezone'
import TimeSlot from '../TimeSlot'
import { selectStats, selectSlots, Schedule } from '../../helpers'
import styles from './Scheduler.module.scss'

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
  label: {
    scheduled: 'Scheduled: ',
    offered: 'Offered: ',
    notOffered: 'Not Offered: ',
  },

  button: {
    confirm: 'Confirm Schedule',
  },
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

type SelectableItem = {
  props: {
    slotKey: string
    state?: string
    slot?: string
    date: Dayjs
  }
}

const STICKY_HEIGHT = 44

const Scheduler: FC<Props> = ({ schedule, order }) => {
  const orderId = order._id
  const slots = selectSlots(schedule)
  const { vehicleHandOverMode } = order

  const todayRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasSlots = slots != null

  useEffect(() => {
    if (hasSlots && todayRef.current != null && scrollRef.current != null) {
      // we need to scroll to view first
      todayRef.current.scrollIntoView()
      // we also need to scroll little upward to the avoid header overlapping the view
      const offset = scrollRef.current.scrollTop - STICKY_HEIGHT
      scrollRef.current.scrollTo(0, offset)
    }
  }, [hasSlots])

  const proposeTimeSlots = useSelectTimeSlots()
  const [selectedSlots, setSelectedSlots] = useState<SelectableItem[]>([])
  const selectedItems = useMemo(
    () =>
      selectedSlots.map((item: SelectableItem) =>
        dayjs.tz(dayjs(item.props.slotKey).format('YYYY-MM-DDTHH:mm:ss'), validateTimeZone(schedule.timezone)).format(),
      ),
    [selectedSlots, schedule],
  )
  const takenItems = useMemo(
    () => selectedSlots.filter((item: SelectableItem) => item.props.state === TimeSlotState.Taken),
    [selectedSlots],
  )
  const mappedSlots = useMemo(() => {
    const mapped: { [key: string]: Array<string> } = {}
    takenItems.forEach((item: SelectableItem) => {
      const date = item.props.date.format('ddd, DD MMM, YYYY,')
      mapped[date] = takenItems
        .filter((s: SelectableItem) => s.props.slot && s.props.date.format('ddd, DD MMM, YYYY,') === date)
        .map((it: SelectableItem) => it.props.date.format('hh:mm'))
    })
    return mapped
  }, [takenItems])

  const selectedItem = (selectedItemsProps: Array<SelectableItem>) => {
    // const data = selectedItemsProps.map(slot => slot.props.slotKey)
    setSelectedSlots(selectedItemsProps)
  }

  const confirmMsg = (
    <>
      <p>
        {(vehicleHandOverMode === HandOverMode.Delivery ? messages.messageDelivery : messages.messagePickup) +
          (takenItems.length > 0 ? messages.selectedSlots : '')}
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
        slots: selectedItems.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
      }),
    swapButtons: true,
    acceptBtnClass: 'utm-confirm-schedule-dialog-yes',
    rejectBtnClass: 'utm-confirm-schedule-dialog-edit',
  })

  // FIXME: display error / loader
  if (slots == null) {
    return null
  }

  const stats = selectStats(schedule, slots)

  const items: React.ReactNode[] = []
  slots.forEach((day, index, arr) => {
    // first check for header
    const prev = arr[index - 1]
    if (prev == null || !prev.date.isSame(day.date, 'month')) {
      items.push(
        <h3 key={`header-${day.key}`} className="not-selectable">
          {day.date.format('MMM YYYY').toUpperCase()}
        </h3>,
      )
    }
    const isInPast = day.date.isBefore(schedule.today, 'day')

    // then add day
    items.push(
      <div
        className={cls(styles.singleDate, isInPast && styles.disabled)}
        key={day.key}
        ref={day.date.isSame(schedule.today, 'day') ? todayRef : null}
      >
        <div className="row">
          <div className="col-lg-2 not-selectable">
            <div className={styles.dayDate}>
              <span className={styles.schedulerDay}>{day.date.format('ddd')} </span>
              <span className={styles.schedulerDate}>{day.date.format('DD')}</span>
            </div>
          </div>
          <div className={cls(isInPast ? 'not-selectable' : '', 'col-lg-10')}>
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
                const isInPastHour = comparisionSlot.isBefore(comparisionCurrentTime, 'hour')
                return (
                  <li
                    key={slot.key}
                    data-key={slot.key}
                    className={cls(stateToClass[slot.state], isInPastHour ? [styles.disabled, 'not-selectable'] : '')}
                  >
                    <TimeSlot slotKey={slot.key} slot={slot.date.format('hh:mm')} state={slot.state} date={slot.date} />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>,
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
                {messages.label.scheduled}
                <span>{stats[TimeSlotState.Taken]}</span>
              </span>
            </li>
            <li className={styles.statusOffered}>
              <span>
                {messages.label.offered}
                <span>{stats[TimeSlotState.UnConfirmed]}</span>
              </span>
            </li>
            <li className={styles.statusNotOffered}>
              <span>
                {messages.label.notOffered}
                <span>{stats[TimeSlotState.Free]}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.schedulerWrap} ref={scrollRef}>
        <SelectableGroup
          className={styles.main}
          enableDeselect
          tolerance={0}
          deselectOnEsc={false}
          onSelectionFinish={selectedItem}
          ignoreList={['.not-selectable']}
        >
          {items}
        </SelectableGroup>
      </div>
      <Divider />
      <div className="clearfix mb-3">
        <Button
          className={cls(styles.pullRight, 'utm-schedular-confirm-btn')}
          onClick={() => {
            if (selectedItems.length === 0) return
            confirm()
          }}
          disabled={selectedItems.length === 0}
          loading={proposeTimeSlots.status === 'running' && 'Saving'}
        >
          {messages.button.confirm}
        </Button>
      </div>
    </div>
  )
}

export default Scheduler
