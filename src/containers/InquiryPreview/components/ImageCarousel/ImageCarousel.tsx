import Carousel from '@components/Carousel'
import { FC } from 'react'

import styles from './ImageCarousel.module.scss'

const ImageCarousel: FC<{ value: string[] }> = ({ value }) => {
  return value && value.length > 0 ? (
    <Carousel
      slidesPerView={1}
      pagination
      loop
      className={styles.pagination}
      autoplay={{
        delay: 3000,
        disableOnInteraction: true,
      }}
    >
      {value.map((image, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`${index}-${image}`} className={styles.carouselImageContainer}>
          <img src={image} alt="" className={styles.carouselImage} />
        </div>
      ))}
    </Carousel>
  ) : null
}

export default ImageCarousel
