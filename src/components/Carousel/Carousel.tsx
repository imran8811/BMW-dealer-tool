import { Children, CSSProperties, FC, ReactNode, useState } from 'react'
import cls from 'classnames'
import SwiperCore, { Navigation, Pagination, Autoplay, SwiperOptions } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import styles from './Carousel.module.scss'

SwiperCore.use([Navigation, Pagination, Autoplay])

export type CarouselProps = SwiperOptions & {
  navigation?: boolean
  fullWidth?: boolean
  pagination?: boolean
  type?: 'bullets' | 'fraction' | 'progressbar' | 'custom'
  className?: string
  marginCompenstaion?: number | string
  children: ReactNode | ReactNode[]
  onSlideChange?: (e: SwiperCore) => unknown
  onSwiper?: (e: SwiperCore) => void
  style?: CSSProperties
}

const Carousel: FC<CarouselProps> = ({
  children,
  navigation,
  fullWidth,
  pagination,
  type,
  className,
  spaceBetween,
  slidesPerView,
  marginCompenstaion,
  onSlideChange,
  onSwiper,
  style,
  ...props
}) => {
  // `useState` replacement for `useRef`, because we need to re-render the component -- @see https://git.io/JTufr
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null)
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null)
  const isReady = !navigation || (prevEl && nextEl)
  const additionalMargin = typeof marginCompenstaion === 'number' ? `-${marginCompenstaion}px` : marginCompenstaion

  return (
    <div
      className={styles.wrapper}
      style={{
        marginLeft: additionalMargin,
        marginRight: additionalMargin,
        width: `calc(100% - (2 * ${additionalMargin || 0}))`,
        maxWidth: `calc(100% - (2 * ${additionalMargin || 0}))`,
      }}
    >
      <div
        className={cls(
          styles.wrapper,
          {
            [type === 'fraction' ? styles.navPaddingFraction : styles.navPadding]: navigation,
            [styles.fullWidth]: navigation && fullWidth,
          },
          className,
        )}
      >
        {navigation && (
          <div
            ref={setPrevEl}
            className={cls(styles.nav, styles.prev, type === 'fraction' && styles.navFractionTypeBack)}
          />
        )}
        <div className={styles.carousel}>
          <div className={styles.swiper}>
            {isReady && (
              <Swiper
                spaceBetween={spaceBetween || 0}
                slidesPerView={slidesPerView || 1}
                navigation={
                  navigation
                    ? {
                        prevEl: prevEl as HTMLDivElement,
                        nextEl: nextEl as HTMLDivElement,
                        hideOnClick: true,
                      }
                    : false
                }
                pagination={pagination ? { clickable: true, type: type || 'bullets' } : false}
                onSlideChange={onSlideChange}
                onSwiper={onSwiper}
                style={style || {}}
                {...props}
              >
                {Children.map(children, (child, index) => (
                  <SwiperSlide key={(child && typeof child === 'object' && 'key' in child && child.key) || index}>
                    {child}
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
        {navigation && (
          <div
            ref={setNextEl}
            className={cls(styles.nav, styles.next, type === 'fraction' && styles.navFractionTypeNext)}
          />
        )}
      </div>
    </div>
  )
}

export default Carousel
