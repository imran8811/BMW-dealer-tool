/* eslint-disable import/prefer-default-export */
import { CustomerDetails } from '@common/endpoints/typings.gen'

export const selectFullName = (customer?: CustomerDetails | null): string => {
  const { drivingLicenseDetails: license } = customer ?? {}
  return `${license?.firstName ?? ''} ${license?.lastName ?? ''}`.trim()
}
