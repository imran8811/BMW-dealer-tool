import { FC } from 'react'

import { CustomerDetails } from '@common/endpoints/typings.gen'
import Currency from '@components/Currency'
import styles from './OrderDetailsCarInfomation.module.scss'

export interface ICarDetails {
  vin: string
  stockNumber: string
  typeName: string
  model: string
  make: string
  zip: number
  internetPrice: number
  photoUrls: Array<string>
  city: string
  state: string
  year: number
  vehicleDisplayName?: string
}

const messages = {
  stock: 'Stock:',
  vin: 'VIN:',
  typeName: 'Vehicle Type:',
  city: 'City, State:',
  CD: 'CD#:',
  price: 'Vehicle Price',
  dot: '.',
  comma: ',',
}

export interface IOrderDetailsCarInfomationProps {
  carDetails?: ICarDetails
  customer: CustomerDetails
  cdNumber?: string
  customAutoInfoClass?: string
}

const OrderDetailsCarInfomation: FC<IOrderDetailsCarInfomationProps> = ({
  carDetails,
  cdNumber,
  customAutoInfoClass,
}) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12 mt-0 mt-md-5 pt-md-0 pt-4">
          <h2 className={styles.titleMd}>
            {carDetails?.vehicleDisplayName ||
              `${carDetails?.year || ''} ${carDetails?.make || ''} ${carDetails?.model || ''}`}
          </h2>
        </div>
        <div className={customAutoInfoClass || 'col-md-9'}>
          <div className={styles.auto_info}>
            <div>
              <span>{messages.stock}</span> {carDetails?.stockNumber}
            </div>
            <div>
              <span>{messages.vin}</span> {carDetails?.vin}
            </div>
            <div>
              <span>{messages.typeName}</span> {carDetails?.typeName}
            </div>
            <div>
              <span>{messages.city}</span> {carDetails?.city}
              {messages.comma} {carDetails?.state}
              {messages.dot}
            </div>
            <div>
              <span>{messages.CD}</span> {cdNumber || ''}
            </div>
          </div>
        </div>
        <div className="col-md-3 py-3 py-lg-0 mb-0 mb-md-3">
          <h2 className="text-left">
            <div className={styles.price_title}>{messages.price}</div>
            <div className={styles.price}>
              {carDetails && <Currency skipDecimals value={carDetails.internetPrice} />}
            </div>
          </h2>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsCarInfomation
