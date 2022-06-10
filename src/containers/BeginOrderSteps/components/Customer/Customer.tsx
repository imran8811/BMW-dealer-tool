import { FC } from 'react'
import { CustomerDetails } from '@common/endpoints/typings.gen'
import Address from '@components/Address'
import cls from 'classnames'
import { selectFullName } from '@common/selectors/customer'
import styles from './Customer.module.scss'

interface ICustomerProps {
  customer?: CustomerDetails
}

const messages = {
  heading: {
    customer: 'Customer',
  },
  title: {
    name: 'Name',
    address: 'Address',
    email: 'Email',
  },
}

const Customer: FC<ICustomerProps> = ({ customer }) => {
  return (
    <div className="rounded bg-white p-4 p-xl-5 mb-2">
      <h2 className="section-subheading">{messages.heading.customer}</h2>
      <div className="row">
        <div className="col-4 col-md-6">
          <span className="text-muted">{messages.title.name}</span>
        </div>
        <div className="col-8 col-md-6">
          <span className="text-primary">{selectFullName(customer)}</span>
        </div>
      </div>
      <div className="row">
        <div className="col-4 col-md-6">
          <span className="text-muted">{messages.title.address}</span>
        </div>

        <div className="col-8 col-md-6">
          {customer && customer.mailingAddress ? <Address {...(customer.mailingAddress || {})} /> : null}
        </div>
      </div>
      <div className="row">
        <div className="col-4 col-md-6">
          <span className="text-muted">{messages.title.email}</span>
        </div>
        <div className={cls('col-8 col-md-6', styles.wrapValue)}>{customer?.email}</div>
      </div>
    </div>
  )
}

export default Customer
