import { FC } from 'react'

import { Order } from '@common/endpoints/typings.gen'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import Carousel from '@components/Carousel'
import ProgressSpinner from '@components/ProgressSpinner'
import InquiryCard from '@containers/OrderCard'

const breakpoints = {
  720: { slidesPerView: 2 },
  1230: { slidesPerView: 3 },
  1750: { slidesPerView: 5 },
}

const InquiriesTable: FC<{
  data?: Order[]
  isLoading: boolean
}> = ({ data, isLoading }) => {
  if (isLoading && (!data || data?.length === 0)) {
    return (
      <div className="py-5 text-center">
        <ProgressSpinner />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <MissingDataPlaceholder />
  }

  return (
    <div className="mb-5">
      <Carousel breakpoints={breakpoints} navigation fullWidth marginCompenstaion={10}>
        {data.map((details: Order) => (
          <InquiryCard key={details?.order?._id} data={details} />
        ))}
      </Carousel>
    </div>
  )
}

export default InquiriesTable
