import { FC } from 'react'

import useOrders from '@common/endpoints/useOrders'
import SectionHeading from '@components/SectionHeading'
import ScheduleCards from './components/ScheduleCards'

const messages = {
  title: 'Schedule Pickup/Delivery',
  mobileTitle: 'Schedule',
  description:
    'Customers have signed their contracts for these vehicles. ' +
    'Finalize these orders by confirming they are still available and setting your weekly schedule.',
}

const Schedule: FC<{ dealerCode?: string }> = ({ dealerCode }) => {
  // TODO: pagination in slider?
  const { pageData, total, isLoading } = useOrders({ status: 'schedule', pageSize: 9999999, dealerCode })
  const showDetails = pageData && pageData.length > 0

  return showDetails ? (
    <>
      <SectionHeading icon="schedule" subtitle={showDetails && messages.description} className="mt-5" itemCount={total}>
        <span className="d-none d-sm-inline">{messages.title}</span>
        <span className="d-inline d-sm-none">{messages.mobileTitle}</span>
      </SectionHeading>
      <ScheduleCards data={pageData} isLoading={isLoading} />
    </>
  ) : null
}

export default Schedule
