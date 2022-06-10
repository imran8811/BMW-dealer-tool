import sendForm from '@common/utilities/sendForm'
import { ApiError } from 'next/dist/next-server/server/api-utils'
import useMutation from 'use-mutation'
import { SignContractRequest, Order, BusinessPartyType } from './typings.gen'

const getSignContractEndpoint = '/order-management/sign-contract'

export type SignContractParams = Omit<SignContractRequest, 'userType'>

type SignContractType = ReturnType<typeof useMutation>[1] & {
  mutate: (data: SignContractParams) => Promise<Order | null | undefined>
}

const useSignContract = (): SignContractType => {
  const [mutate, result] = useMutation<SignContractParams, Order, ApiError>(
    async ({ _orderId, _documentId }: { _orderId: string; _documentId: string }) => {
      return sendForm(
        getSignContractEndpoint,
        { _orderId, _documentId, userType: BusinessPartyType.Dealer },
        {
          withAuthentication: true,
          method: 'PUT',
        },
      )
    },
  )

  return { mutate, ...result }
}

export default useSignContract
