import { FC, useState } from 'react'
import { useRouter } from 'next/router'
import cls from 'classnames'
import Icon from '@components/Icon'
import Button from '@components/Button'
import Currency from '@components/Currency'
import Divider from '@components/Divider'
import styles from './CarInfoHeader.module.scss'

export interface ICarInfoHeaderProps {
  carInfo?: ICarDetails
  hideBackButton?: boolean
  cdNumber?: string
}
export interface ICarDetails {
  vin: string
  stockNumber: string
  model: string
  city: string
  state: string
  internetPrice: number
  photoUrls: Array<string>
  cd?: number
  make: string
  year: number
  vehicleDisplayName?: string
  typeName: string
  mileage?: number
}

const messages = {
  stock: 'Stock:',
  vin: 'VIN:',
  typeName: 'Vehicle Type:',
  mileage: 'Mileage:',
  city: 'City, State:',
  viewDetails: 'View More Details',
  hideDetails: 'View Less Details',
  price: 'Vehicle Price',
  cd: 'CD#:',
  comma: ',',
  dot: '.',
}

const CarInfoHeader: FC<ICarInfoHeaderProps> = ({ carInfo, hideBackButton, cdNumber }) => {
  const router = useRouter()
  const [showInfo, setShowInfo] = useState(false)
  return (
    <div className="row align-items-center">
      <div className="col-md-8 col-lg-8 col-xl-9">
        <div className="row align-items-center">
          <div className="col-4">
            <div className="row align-items-center">
              {hideBackButton ? null : (
                <div className="col-2 p-0 d-none d-md-block">
                  <Button onClick={() => router.back()} className={styles.btn_link}>
                    <Icon name="arrow" />{' '}
                  </Button>
                </div>
              )}
              <div className="col-10 p-0">
                <img
                  src={carInfo?.photoUrls[0]}
                  alt="carImage"
                  className={cls('img-fluid', styles.headerLeftCarImage)}
                />
              </div>
            </div>
          </div>
          <div className="col-8">
            <h2 className={cls(styles.fs18_sm)}>
              {carInfo?.vehicleDisplayName || `${carInfo?.year || ''} ${carInfo?.make || ''} ${carInfo?.model || ''}`}
            </h2>
            <p className="text-primary d-block d-md-none">
              <Button
                className={cls('text-capitalize text-left text-primary font-weight-normal', styles.btn_view)}
                onClick={() => setShowInfo(!showInfo)}
              >
                {showInfo ? messages.hideDetails : messages.viewDetails}
              </Button>
            </p>
          </div>
        </div>
      </div>
      <div
        className={
          showInfo
            ? 'col-md-4 col-lg-4 col-xl-3 ml-auto p-0 pb-3 d-block d-md-block'
            : 'col-md-4 col-lg-4 col-xl-3 col-xxl-2 ml-auto p-0 d-none d-md-block'
        }
      >
        <div className={styles.auto_info}>
          <div className="d-block d-md-none">
            <Divider />
          </div>
          <div>
            <span>{messages.stock}</span> {carInfo?.stockNumber}
          </div>
          <div>
            <span>{messages.vin}</span> {carInfo?.vin}
          </div>
          <div>
            <span>{messages.typeName}</span> {carInfo?.typeName}
          </div>
          <div>
            <span>{messages.mileage}</span> {carInfo?.mileage}
          </div>
          <div>
            <span>{messages.price}</span>{' '}
            {carInfo?.internetPrice && <Currency skipDecimals className="text-dark" value={carInfo.internetPrice} />}
          </div>
          <div>
            <span>{messages.city}</span> {carInfo?.city}
            {messages.comma} {carInfo?.state}
            {messages.dot}
          </div>
          <div>
            <span>{messages.cd}</span> {cdNumber || ''}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarInfoHeader
