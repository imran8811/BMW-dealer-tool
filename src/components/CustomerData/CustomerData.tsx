import { FC } from 'react'
import { CustomerDetails } from '@common/endpoints/typings.gen'
import Address from '@components/Address'
import Details, { DetailsRow } from '@components/DetailsRows'
import { selectFullName } from '@common/selectors/customer'

export type CustomerDataProps = {
  useMailingAddress?: boolean
  customer: CustomerDetails
}

const messages = {
  name: 'Name',
  address: 'Address',
  email: 'Email',
}

/**
 * TODO: refactor into DetailsRows
 */
const CustomerData: FC<CustomerDataProps> = ({ customer, useMailingAddress = false }) => (
  <Details>
    <DetailsRow label={messages.name}>
      <span className="text-primary">{selectFullName(customer)}</span>
    </DetailsRow>
    <DetailsRow label={messages.address}>
      <Address {...((useMailingAddress ? customer.mailingAddress : customer.parkingAddress) || {})} />
    </DetailsRow>
    <DetailsRow label={messages.email}>{customer.email}</DetailsRow>
  </Details>
)

export default CustomerData
