import { FC } from 'react'
import useOrders from '@common/endpoints/useOrders'
import SectionHeading from '@components/SectionHeading'
import InquiriesCards from './components/InquiriesCards'

const messages = {
  title: 'Pending Sales',
  description: 'Are these vehicles available?',
}

const Inquiries: FC<{ dealerCode?: string }> = ({ dealerCode }) => {
  const { pageData, total, isLoading } = useOrders({ status: 'inquiry', pageSize: 9999999, dealerCode })
  const showDetails = pageData && pageData.length > 0

  return showDetails ? (
    <>
      <SectionHeading icon="bell" subtitle={showDetails && messages.description} className="mt-5" itemCount={total}>
        {messages.title}
      </SectionHeading>
      <InquiriesCards data={pageData} isLoading={isLoading} />
    </>
  ) : null
}

export default Inquiries
