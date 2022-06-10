import useMutation from 'use-mutation'
import sendForm from '@common/utilities/sendForm'
import { GetUploadUrls } from './typings.gen'
import BlobStorageService, { BlobType } from '../utilities/blobStorageService'
import { useSecrets, getDocumentUploadUrlsEndpoint } from './useTenantConfiguration'

type UploadInput = {
  files: File[] | string[]
  // names for files, array must be the same length as files
  filenames: string[]
  imageType: string
}

type DeleteFileType = Omit<UploadInput, 'files'>

const BASE_64_IMAGE_TYPES = new Set(['e-signatures'])

type UploadType = ReturnType<typeof useMutation>[1] & {
  mutate: (data: UploadInput) => Promise<GetUploadUrls[] | null | undefined>
  isReady: boolean
}

type DeleteType = ReturnType<typeof useMutation>[1] & {
  mutate: (data: DeleteFileType) => Promise<GetUploadUrls[] | null | undefined>
  isReady: boolean
}
const useUpload = (): UploadType => {
  const secrets = useSecrets()
  const storageAccountUrl = secrets.data?.STORAGE_ACCOUNT_URL
  const [mutate, result] = useMutation<UploadInput, GetUploadUrls[]>(async ({ imageType, files, filenames }) => {
    if (!storageAccountUrl) {
      throw new Error('Tried to upload files without storageAccountUrl provided')
    }

    const response = await sendForm<GetUploadUrls[]>(getDocumentUploadUrlsEndpoint, { filenames, imageType })
    const blobStorageService = new BlobStorageService()

    const promisesArray = response.map(({ sasToken, storageBlobName, containerName }, index) => {
      const type = BASE_64_IMAGE_TYPES.has(imageType) ? BlobType.Base64 : BlobType.File

      return blobStorageService.uploadToBlobStorage(
        files[index],
        {
          containerName,
          storageUri: storageAccountUrl,
          storageAccessToken: sasToken,
          blobName: storageBlobName,
        },
        type,
      )
    })

    await Promise.all(promisesArray)
    return response
  })

  return {
    mutate,
    isReady: storageAccountUrl != null && storageAccountUrl !== '',
    ...result,
  }
}

export const useRemoveBlobImage = (): DeleteType => {
  const secrets = useSecrets()
  const storageAccountUrl = secrets.data?.STORAGE_ACCOUNT_URL
  const [mutate, result] = useMutation<DeleteFileType, GetUploadUrls[]>(async ({ imageType, filenames }) => {
    if (!storageAccountUrl) {
      throw new Error('Tried to delete files without storageAccountUrl provided')
    }

    const response = await sendForm<GetUploadUrls[]>(getDocumentUploadUrlsEndpoint, { filenames, imageType })
    const blobStorageService = new BlobStorageService()

    const promisesArray = response.map(({ sasToken, storageBlobName, containerName }) => {
      return blobStorageService.deleteFile({
        containerName,
        storageUri: storageAccountUrl,
        storageAccessToken: sasToken,
        blobName: storageBlobName,
      })
    })

    await Promise.all(promisesArray)
    return response
  })

  return {
    mutate,
    isReady: storageAccountUrl != null && storageAccountUrl !== '',
    ...result,
  }
}

export default useUpload
