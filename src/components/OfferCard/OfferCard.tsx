import React, { forwardRef, ReactNode } from 'react'
import cls from 'classnames'
import Text from '@components/Text'
import Button from '@components/Button'

import Currency from '@components/Currency'
import styles from './OfferCard.module.scss'

const messages = {
  available: 'Available',
  resume: 'Resume',
  notAvailable: 'Not available',
  stockHeader: 'Stock: ',
  vinHeader: 'VIN: ',
  imageDesc: 'Offered car',
  schedule: 'Schedule',
}

export type OfferCardProps = {
  href?: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => unknown
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => unknown
  inProgress?: string
  imageUrl?: string
  offerTitle?: string
  offerTime?: string | ReactNode
  offerPrice?: string | number
  stockNumber?: string | number
  vin?: string | number
  pickup?: boolean
  disabled?: boolean
  onConfirm?: () => unknown
  onReject?: () => unknown
  onResume?: () => unknown
  onSchedule?: () => unknown
  confirmLoading?: string | boolean
  rejectLoading?: string | boolean
}

const OfferCard = forwardRef<HTMLAnchorElement, OfferCardProps>(
  (
    {
      href,
      onClick,
      onMouseEnter,
      inProgress,
      imageUrl,
      offerTitle,
      offerTime,
      offerPrice,
      stockNumber,
      vin,
      pickup,
      disabled,
      onConfirm,
      onReject,
      onResume,
      onSchedule,
      confirmLoading,
      rejectLoading,
    },
    ref,
  ) => {
    const Element = href != null ? 'a' : 'section'
    const passClick = (fn?: () => unknown) => {
      const clickHandler = (e: React.UIEvent) => {
        e.preventDefault()
        fn?.()
      }
      return clickHandler
    }

    return (
      <article className={styles.wrapper}>
        <Element ref={ref} className={cls(styles.panel)} href={href} onClick={onClick} onMouseEnter={onMouseEnter}>
          {inProgress && (
            <div className={cls(styles.overlay)}>
              <Text>{inProgress}</Text>
            </div>
          )}
          <div className={cls(styles.header, disabled && styles.disabled)}>
            <span className={styles['offer-time']}>{offerTime}</span>
          </div>
          <div className={cls(styles['content-wrapper'])}>
            <h3 className={styles.title}>{offerTitle}</h3>
            {!pickup && (
              <p className={styles.price}>
                {typeof offerPrice === 'number' ? <Currency skipDecimals value={offerPrice} /> : offerPrice}
              </p>
            )}
            <section className={cls(styles.content, pickup && styles.pickup)}>
              <div className={styles['image-wrapper']}>
                <div className={styles['image-container']}>
                  <img src={imageUrl} alt={messages.imageDesc} className="offer-image" />
                </div>
              </div>
              <div className={styles.info}>
                <div className={styles['stock-wrapper']}>
                  <span className={styles.stock}>{messages.stockHeader}</span>
                  <span className={styles['stock-number']}>{stockNumber}</span>
                </div>
                <div className={styles['vin-wrapper']}>
                  <span className={styles.vin}>{messages.vinHeader}</span>
                  <span className={styles['vin-number']}>{vin}</span>
                </div>
                {pickup && (
                  <Button className="utm-workqueue-card-btn-schedule" secondary hoverPrimary onClick={onSchedule}>
                    {messages.schedule}
                  </Button>
                )}
              </div>
            </section>
            {!pickup && (
              <div>
                <Button
                  fullWidth
                  secondary
                  hoverPrimary
                  className={cls(styles['top-button'], 'utm-workqueue-card-btn-available')}
                  onClick={passClick(onConfirm)}
                  loading={confirmLoading}
                >
                  {messages.available}
                </Button>
                {!inProgress || (inProgress && !onResume) ? (
                  <Button
                    className="utm-workqueue-card-btn-not-available"
                    fullWidth
                    secondary
                    onClick={passClick(onReject)}
                    loading={rejectLoading}
                  >
                    {messages.notAvailable}
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    className={cls(styles['button-overlay'], 'utm-workqueue-card-btn-resume')}
                    onClick={passClick(onResume)}
                  >
                    {messages.resume}
                  </Button>
                )}
              </div>
            )}
          </div>
        </Element>
      </article>
    )
  },
)

export default OfferCard
