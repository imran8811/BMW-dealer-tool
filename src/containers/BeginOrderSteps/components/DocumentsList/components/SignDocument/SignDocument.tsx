import { FC, useMemo, useState } from 'react'

import useSignContract, { SignContractParams } from '@common/endpoints/useSignContract'
import useUpload from '@common/endpoints/useUpload'
import SignatureDialog from '@components/SignatureDialog'
import Button from '@components/Button'
import useUser from '@common/utilities/useUser'
import { signatureUpdate, SignatureType, useSignatureBase64 } from '@common/endpoints/useSignature'
import { invalidateOrder } from '@common/endpoints/orderTransitions'

const messages = {
  sign: 'Sign',
  signFullName: 'Sign for Vehicle',
  signInitials: 'Sign Your Initials',
}

const getInitial = (text?: string): string => (text && text.length > 0 ? `${text[0].toUpperCase()}.` : '')

export type SignDocumentProps = SignContractParams

const SignDocument: FC<SignDocumentProps> = ({ _orderId, _documentId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFailing, setIsFailing] = useState<boolean>(false)
  const { mutate: upload } = useUpload()
  const signatureFullName = useSignatureBase64(SignatureType.FullName)
  const signatureInitials = useSignatureBase64(SignatureType.Initial)
  const user = useUser()
  const [isSignatureOpen, setSignatureOpen] = useState<boolean>(false)
  const [areInitialsOpen, setInitialsOpen] = useState<boolean>(false)
  const { mutate: sign } = useSignContract()
  const fullName = useMemo<string>(() => `${user?.firstName || ''} ${user?.lastName || ''}`, [user])
  const initials = useMemo<string>(() => `${getInitial(user?.firstName)} ${getInitial(user?.lastName)}`, [user])

  const close = () => {
    setSignatureOpen(false)
    setInitialsOpen(false)
  }

  const openSignature = () => {
    setSignatureOpen(true)
    setInitialsOpen(false)
  }
  const openInitials = () => {
    setSignatureOpen(false)
    setInitialsOpen(true)
  }

  return (
    <>
      <Button className="utm-orders-sign-document-btn" small onClick={openSignature}>
        {messages.sign}
      </Button>
      <SignatureDialog
        onClose={close}
        isLoading={isLoading}
        showError={isFailing}
        initialValue={signatureFullName}
        onSubmit={async fileBase64 => {
          let data
          setIsFailing(false)
          setIsLoading(true)
          if (fileBase64) {
            const files = await upload({
              filenames: ['signature.png'],
              imageType: 'e-signatures',
              files: [fileBase64],
            })
            if (files && files.length > 0) {
              data = await signatureUpdate(SignatureType.FullName, files[0].blobName)
            }
          }
          setIsLoading(false)
          if (data?.error) {
            setIsFailing(!!data.error)
            return
          }
          openInitials()
        }}
        description={fullName}
        title={messages.signFullName}
        visible={!!isSignatureOpen}
      />
      <SignatureDialog
        onClose={openSignature}
        isLoading={isLoading}
        showError={isFailing}
        initialValue={signatureInitials}
        onSubmit={async fileBase64 => {
          setIsLoading(true)
          setIsFailing(false)
          let data
          if (fileBase64) {
            const files = await upload({
              filenames: ['initials.png'],
              imageType: 'e-signatures',
              files: [fileBase64],
            })

            if (files && files.length > 0) {
              data = await signatureUpdate(SignatureType.Initial, files[0].blobName)
            }
          }
          if (data?.error) {
            setIsFailing(!!data.error)
            setIsLoading(false)
            return
          }
          await sign({ _orderId, _documentId })
          void invalidateOrder({ orderId: _orderId })

          setIsLoading(false)
          close()
        }}
        description={initials}
        title={messages.signInitials}
        visible={!!areInitialsOpen}
      />
    </>
  )
}

export default SignDocument
