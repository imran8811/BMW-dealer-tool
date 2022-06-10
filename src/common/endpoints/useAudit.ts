import sendForm from '@common/utilities/sendForm'
import { ApiError } from 'next/dist/next-server/server/api-utils'
import useMutation from 'use-mutation'
import { DealerDocsDownloadAudit, DealerDocsDownloadAuditResult } from './typings.gen'

const docsDownloadAuditEndpoint = '/dealer-management/dealer-docs-download-audit'

type DocsDownloadAuditType = ReturnType<typeof useMutation>[1] & {
  mutate: (data: DealerDocsDownloadAudit) => Promise<DealerDocsDownloadAuditResult | null | undefined>
}

const useDocsDownloadAudit = (): DocsDownloadAuditType => {
  const [mutate, result] = useMutation<DealerDocsDownloadAudit, DealerDocsDownloadAuditResult, ApiError>(
    async ({ _orderId, _documentId }: DealerDocsDownloadAudit) => {
      return sendForm(
        docsDownloadAuditEndpoint,
        { _orderId, _documentId },
        {
          withAuthentication: true,
          method: 'POST',
        },
      )
    },
  )

  return { mutate, ...result }
}

export default useDocsDownloadAudit
