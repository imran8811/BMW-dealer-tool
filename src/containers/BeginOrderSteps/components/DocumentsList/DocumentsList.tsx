import { FC } from 'react'
import dynamic from 'next/dynamic'
import cls from 'classnames'

import { ContractDocument, WatermarkedContractDocument } from '@common/endpoints/typings.gen'
import { saveAs } from 'file-saver'
import Divider from '@components/Divider/Divider'
import Icon from '@components/Icon/Icon'
import styles from './DocumentsList.module.scss'
import DocumentMenu from './components/DocumentMenu'

const SignDocument = dynamic(() => import('./components/SignDocument'), { ssr: false })

export interface DocumentsListProps {
  contracts?: Partial<ContractDocumentSign>[]
  orderId?: string
  contractClassName?: string
  title?: string
  watermarkedContractDocs?: WatermarkedContractDocument[]
}
export type ContractDocumentSign = ContractDocument & {
  hideSign: boolean
}
const messages = {
  defaultTitle: 'Contracts',
  sign: 'Sign',
}

const DocumentsList: FC<DocumentsListProps> = ({
  contractClassName,
  contracts,
  title,
  orderId,
  watermarkedContractDocs,
}) => {
  const downloadAll = () => {
    contracts?.forEach(contract => {
      if (contract.path) saveAs(contract.path, contract.name)
    })
  }
  return (
    <div className="rounded bg-white p-xl-5 p-4 mb-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="section-subheading">{title || messages.defaultTitle}</h2>
        <a className={`text-muted ${styles.cursorPointer} utm-review-order-download-all-document-link`}>
          <Icon name="share" size={24} onClick={downloadAll} />
        </a>
      </div>
      {contracts && contracts.length > 0 && (
        <div className={contractClassName}>
          {contracts.map((contract: Partial<ContractDocumentSign>, index: number) => (
            <div key={contract.name}>
              {index !== 0 ? <Divider /> : null}
              <div className="d-flex justify-content-between align-items-center">
                <span className="d-flex d-inline-block">
                  <span className="text-primary">
                    <Icon name="document" size={24} />
                  </span>
                  <span className="pl-2">
                    <a
                      className={cls(
                        'text-decoration-none text-dark text-capitalize utm-review-order-view-document-link',
                        styles.fs20,
                      )}
                      href={contract.path}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {contract.displayName}
                    </a>
                  </span>
                </span>
                {!contract.hideSign && (
                  <span className="text-muted ml-auto">
                    {!contract.isSignedByDealer &&
                      orderId &&
                      contract.name &&
                      contract._id &&
                      contract.displayName === 'Contract' && (
                        <SignDocument _orderId={orderId} _documentId={contract._id} />
                      )}
                  </span>
                )}
                {orderId && (
                  <DocumentMenu
                    orderId={orderId}
                    contract={contract}
                    watermarkedContract={watermarkedContractDocs?.[index]}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentsList
