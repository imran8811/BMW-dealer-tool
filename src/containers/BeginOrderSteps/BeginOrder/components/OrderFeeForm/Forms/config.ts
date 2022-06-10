import { FeeInput, FnIProducts } from '@common/endpoints/typings.gen'
import OdoStatement from '../OdoStatement'

export type OrderFeeFormValues = {
  fees: FeeInput[]
  odometer: number
  internetPrice: number
  odoStatement: string
  individualizedAgreement: string
  fniProducts: FnIProducts[]
}

export const orderFormMessages = {
  name: 'Name',
  amount: 'amount ($)',
  vendor: 'vendor',
  confirm: 'confirm',
  fee: 'Fees',
  error: 'Total amount should not be greater than vehicle price',
  total: 'TOTAL',
  vendorPlaceholder: 'Type here...',
  zeroError: 'Value should be greater than zero',
  sellingPrice: 'Selling price ($)',
  individualizedAgreement: 'individualized agreement',
  collection: 'collection',
  upfrontAmount: 'Upfront Amount',
  financedAmount: 'Financed Amount',
  add: 'ADD NEW',
  fniDialogHeader: 'Protection For Your New MINI',
  addProduct: 'ADD',
  removeProduct: 'REMOVE',
  cancel: 'Cancel',
  ...OdoStatement,
}
