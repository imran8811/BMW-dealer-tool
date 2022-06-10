import { FC } from 'react'

import Carousel from '@components/Carousel'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import { Order } from '@common/endpoints/typings.gen'
import InquiryCard from '@containers/OrderCard'
import ProgressSpinner from '@components/ProgressSpinner'

const breakpoints = {
  768: { slidesPerView: 1 },
  992: { slidesPerView: 3 },
  1230: { slidesPerView: 3 },
  1750: { slidesPerView: 4 },
}

const Schedule: FC<{
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
    <Carousel breakpoints={breakpoints} navigation fullWidth marginCompenstaion={10}>
      {data.map((details: Order) => (
        <InquiryCard key={details?.order?._id} pickup data={details} />
      ))}
    </Carousel>
  )
}

export default Schedule
