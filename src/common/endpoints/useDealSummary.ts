import useMutation from 'use-mutation'
import sendForm from '@common/utilities/sendForm'
import { UpdateTaxesParams } from './typings.gen'

export enum TradeInStatus {
  WithTradeIn = 'WithTradeIn',
  WithoutTradeIn = 'WithoutTradeIn',
}

type UpdateTaxParamRequest = {
  updatedTaxesWithTradeIn?: UpdateTaxesParams
  updatedTaxesWithoutTradeIn?: UpdateTaxesParams
}

const useFinanceTaxes = (orderId: string) => {
  const [mutate, { status }] = useMutation<UpdateTaxParamRequest, null>(
    (props): Promise<null> => {
      return sendForm(`/order-management/update-order/${orderId}`, { ...props }, { method: 'PATCH' })
    },
  )
  return { mutate, loading: status === 'running' }
}

export default useFinanceTaxes
