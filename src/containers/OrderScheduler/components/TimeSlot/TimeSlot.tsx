import { TimeSlotState } from '@common/endpoints/typings.gen'
import { Dayjs } from 'dayjs'
import { createSelectable, TSelectableItemProps } from 'react-selectable-fast'
import styles from './TimeSlot.module.scss'

type TSlotProps = {
  slot: string
  slotKey: string
  state: TimeSlotState
  date: Dayjs
}

const TimeSlot = createSelectable<TSlotProps>((props: TSelectableItemProps & TSlotProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { selectableRef, isSelected, isSelecting, slot } = props
  const classNames = [styles.item, isSelecting && styles.selecting, isSelected && styles.selected]
    .filter(Boolean)
    .join(' ')
  return (
    <div ref={selectableRef} className={classNames}>
      <span>{slot}</span>
    </div>
  )
})

export default TimeSlot
