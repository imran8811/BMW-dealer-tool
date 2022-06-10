import useSWR, { ConfigInterface, mutate as swrMutate } from 'swr'
import sendForm from '@common/utilities/sendForm'
import imgToBase64 from '@common/utilities/imgToBase64'
import { useEffect, useState } from 'react'
import { BusinessPartyType, SignatureRequest, Signatures, SignaturesConfig, SignatureType } from './typings.gen'

export { SignatureType } from './typings.gen'

const getSignaturesEndpoint = '/dealer-management/get-signatures'

const useSignatures = (
  options?: ConfigInterface<SignaturesConfig, Error>,
): {
  data?: Signatures
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<SignaturesConfig, Error>(getSignaturesEndpoint, options)

  return {
    data: data && data.signatures,
    error,
    isLoading: !error && !data,
  }
}

export const useSignatureBase64 = (type: SignatureRequest['type']): string | undefined => {
  const [signature, setSignature] = useState<string>()
  const { data: signatures } = useSignatures()
  useEffect(() => {
    const key = type === SignatureType.FullName ? 'fullNameUrl' : 'initialUrl'
    if (!signatures || !signatures[key]) return

    void imgToBase64(signatures[key] as string).then(base64 => {
      return setSignature(base64)
    })
  }, [type, signatures, setSignature])

  return signature
}

export const signatureUpdate = async (
  type: SignatureRequest['type'],
  imageName: SignatureRequest['imageName'],
): Promise<{ data?: { signature: Signatures }; error?: string }> => {
  try {
    const data: { signature: Signatures } = await sendForm(
      '/dealer-management/update-signature',
      { imageName, type, userType: BusinessPartyType.Dealer },
      {
        method: 'PUT',
      },
    )
    void swrMutate(getSignaturesEndpoint, undefined, true)
    if (data.signature) return { data }
    return { error: 'An error has occurred.' }
  } catch {
    return { error: 'An error has occurred.' }
  }
}

export default useSignatures
