import { FC } from 'react'
import cls from 'classnames'
import { TenantConfig } from '@common/endpoints/typings.gen'
import styles from './TitleTicker.module.scss'

const defaultMessages = {
  weekdays: 'Weekdays',
  weekend: 'Weekends',
  spacer: ' ',
}

const TitleTicker: FC<{ config?: TenantConfig }> = ({ config }) => {
  if (!config) return <></>
  return (
    <div className={styles.tickerWrapper}>
      <div className="container">
        <div className={cls(styles.headerTicker, 'row')}>
          <div className={cls(styles.support, 'col', 'col-lg-4', 'col-md-4', 'col-sm-12')}>
            {config.configuration.navBarContent.clientSupport.name}{' '}
            <a className={styles.contact} href={`tel:${config.configuration.navBarContent.clientSupport.phoneNo}`}>
              {config.configuration.navBarContent.clientSupport.phoneNo}
            </a>
            {defaultMessages.spacer}
            <a className={styles.contact} href={`mailto:${config.configuration.navBarContent.clientEmail}`}>
              {config.configuration.navBarContent.clientEmail}
            </a>
          </div>
          <div className={cls(styles.support, 'col', 'col-lg-4', 'col-md-4', 'col-sm-12')}>
            {config.configuration.navBarContent.shiftDigitalSupport.name}{' '}
            <a
              className={styles.contact}
              href={`tel:${config.configuration.navBarContent.shiftDigitalSupport.phoneNo}`}
            >
              {config.configuration.navBarContent.shiftDigitalSupport.phoneNo}
            </a>
            {defaultMessages.spacer}
            <a className={styles.contact} href={`mailto:${config.configuration.navBarContent.otozEmail}`}>
              {config.configuration.navBarContent.otozEmail}
            </a>
          </div>
          <div className={cls(styles.timing, 'col', 'col-lg-4', 'd-none', 'd-sm-block')}>
            <div>
              {defaultMessages.weekdays} {config.configuration.navBarContent.weekdaysSupport}
            </div>{' '}
            <div>
              {defaultMessages.weekend} {config.configuration.navBarContent.weekendsSupport}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TitleTicker
