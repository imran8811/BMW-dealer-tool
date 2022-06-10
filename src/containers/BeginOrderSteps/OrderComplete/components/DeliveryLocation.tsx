import React, { FC } from 'react'
import dynamic from 'next/dynamic'
import cls from 'classnames'
import { DeliveryAddress } from '@common/endpoints/typings.gen'
import styles from './DeliveryLocation.module.scss'

export interface IDeliveryLocationProps {
  address: DeliveryAddress
}

const messages = {
  deliveryLocation: 'Delivery Location',
}

const AddressMap = dynamic(() => import('@containers/BeginOrderSteps/components/AddressMap'), { ssr: false })
const formatDeliveryAddress = (addr: DeliveryAddress) =>
  `${addr.address} ${addr.address2 || ''} ${addr.city}, ${addr.state} ${addr.zipCode}`

const DeliveryLocation: FC<IDeliveryLocationProps> = ({ address }) => {
  return (
    <div className="mt-2 mt-lg-0 pr-xl-0 col-xxl-4 p-0 col-xl-5 col-lg-5 d-flex align-items-stretch">
      <div className="bg-white w-100 rounded p-3 pt-4 p-md-5">
        <div className="text-muted" style={{ fontSize: '18px' }}>
          {messages.deliveryLocation}
        </div>
        <h4>{formatDeliveryAddress(address)}</h4>
        <div className={cls('mt-3', styles.customerLocation)}>
          <AddressMap address={formatDeliveryAddress(address)} />
        </div>
      </div>
    </div>
  )
}

export default DeliveryLocation
