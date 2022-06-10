import Currency from '@components/Currency'
import { FC } from 'react'
import styles from './Header.module.scss'

const messages = {
  vehiclePrice: 'Vehicle Price',
  stock: 'Stock:',
  vin: 'VIN:',
  available: 'Available',
  notAvailable: 'Not Available',
  vehicleCondition: 'Vehicle Type:',
  mileage: 'Mileage:',
}

export type HeaderProps = {
  trim?: string | null
  stock: string
  vin: string
  price: number
  typeName: string
  mileage: number
}

const Header: FC<HeaderProps> = ({ children, trim, stock, vin, price, typeName, mileage }) => (
  <div className={styles.wrapper}>
    <div className="row">
      <div className="col-12 col-xxl-9">
        <h1 className={styles.title}>{children}</h1>
      </div>
    </div>
    <hr className={styles.divider} />
    {trim && <span className={styles.subtitle}>{trim}</span>}
    <div className="mt-3">
      <span className={`${styles.label} mr-1`}>{messages.stock} </span>
      <span>{stock}</span>
    </div>
    <div>
      <span className={`${styles.label} mr-1`}>{messages.vin} </span>
      <span>{vin}</span>
    </div>
    <div>
      <span className={`${styles.label} mr-1`}>{messages.vehicleCondition} </span>
      <span>{typeName}</span>
    </div>
    <div>
      <span className={`${styles.label} mr-1`}>{messages.mileage} </span>
      <span>{mileage}</span>
    </div>
    <div className="mt-3">
      <small>{messages.vehiclePrice}</small>
      <Currency skipDecimals className={styles.priceValue} value={price} />
    </div>
  </div>
)

export default Header
