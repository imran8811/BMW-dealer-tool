import { FC } from 'react'
import cls from 'classnames'
import styles from './Vehicle.module.scss'

export interface IVehicle {
  vin: string
  mileage: number
  typeName: string
  doors: number
  model: string
  year: number
  stockNumber: string
  photoUrls: Array<string>
  internetPrice: number
}

interface IVehicleProps {
  vehicle: IVehicle
}

const messages = {
  heading: {
    vehicle: 'Vehicle',
  },
  title: {
    vehicle: 'Vehicle',
    vin: 'Vin',
    stock: 'Stock',
    typeName: 'Vehicle Type',
    mileage: 'Mileage',
  },
}

const Vehicle: FC<IVehicleProps> = ({ vehicle }) => {
  return (
    <div className="rounded bg-white p-4 p-xl-5 mb-2">
      <h2 className="section-subheading">{messages.heading.vehicle}</h2>
      <div className="row">
        <div className="col-4 col-md-6">
          <span className="text-muted">{messages.title.vehicle}</span>
        </div>
        <div className="col-8 col-md-6">
          <span className="text-primary">{`${vehicle.year} ${vehicle.model} ${vehicle.doors || ''}${
            vehicle.doors ? ' Doors' : ''
          }`}</span>
        </div>
      </div>
      <div className="row">
        <div className="col-4 col-md-6">
          <span className="text-muted">{messages.title.vin}</span>
        </div>
        <div className={cls('col-8 col-md-6', styles.wrapValue)}>{vehicle.vin}</div>
      </div>
      {vehicle.stockNumber && (
        <div className="row">
          <div className="col-4 col-md-6">
            <span className="text-muted">{messages.title.stock}</span>
          </div>
          <div className="col-8 col-md-6">{vehicle.stockNumber}</div>
        </div>
      )}
      <div className="row">
        <div className="col-4 col-md-6">
          <span className="text-muted">{messages.title.typeName}</span>
        </div>
        <div className="col-8 col-md-6">{vehicle.typeName}</div>
      </div>
      <div className="row">
        <div className="col-4 col-md-6">
          <span className="text-muted">{messages.title.mileage}</span>
        </div>
        <div className="col-8 col-md-6">{vehicle.mileage}</div>
      </div>
    </div>
  )
}

export default Vehicle
