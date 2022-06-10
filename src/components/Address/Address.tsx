import { FC } from 'react'
import { Address as AddressProps } from '@common/endpoints/typings.gen'

export type { AddressProps }

const Address: FC<AddressProps> = ({ state, zipCode, city, streetAddress, apartmentOrSuite }) => (
  <>
    {streetAddress} {city}
    {(apartmentOrSuite || '') !== '' ? ` apt. ${apartmentOrSuite}` : ''}
    {streetAddress || city ? ', ' : ' '}
    {state} {zipCode}
  </>
)

export default Address
