import { FC, SyntheticEvent, useCallback, useRef } from 'react'
import { Menu } from 'primereact/menu'
import { saveAs } from 'file-saver'
import { ContractDocument, WatermarkedContractDocument } from '@common/endpoints/typings.gen'
import EditButton from '@components/EditButton'
import useDocsDownloadAudit from '@common/endpoints/useAudit'

type DocumentMenuProps = {
  orderId: string
  contract: Partial<ContractDocument>
  watermarkedContract?: WatermarkedContractDocument
}

const DocumentMenu: FC<DocumentMenuProps> = ({ orderId, contract, watermarkedContract }) => {
  const menuRef = useRef<Menu>(null)
  const cb = useCallback((evt: SyntheticEvent): void => menuRef.current?.toggle(evt), [menuRef])
  const { mutate: sendAuditInfo } = useDocsDownloadAudit()

  return (
    <span className="ml-1">
      <EditButton onClick={cb} icon="settings" />
      <Menu
        ref={menuRef}
        popup
        appendTo={document?.body}
        model={[
          {
            label: 'View Document',
            command: () => {
              window.open(contract?.path, '_blank')
            },
          },
          {
            label: 'Download Original Doc.',
            command: () => {
              if (contract.path) {
                saveAs(contract.path, contract.name)

                if (contract._id) {
                  void sendAuditInfo({ _documentId: contract._id, _orderId: orderId })
                }
              }
            },
          },
          {
            label: 'Download Customer Copy',
            command: () => {
              if (watermarkedContract && watermarkedContract.path) {
                saveAs(watermarkedContract.path, watermarkedContract.name)

                if (watermarkedContract._id) {
                  void sendAuditInfo({ _documentId: watermarkedContract._id, _orderId: orderId })
                }
              }
            },
          },
        ]}
      />
    </span>
  )
}

export default DocumentMenu
