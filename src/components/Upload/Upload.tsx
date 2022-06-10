import { ChangeEvent, createRef, FC, useEffect, useState } from 'react'
import Field from '@components/Field'
import Button from '@components/Button'
import useUpload from '@common/endpoints/useUpload'
import { GetUploadUrls } from '@common/endpoints/typings.gen'
import cls from 'classnames'
import ProgressSpinner from '@components/ProgressSpinner'
import Icon from '@components/Icon'
import styles from './Upload.module.scss'

/**
 * Enum For Descrete Supported File Types copied from
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
 *
 * */
export enum FilesTypes {
  Audio = 'audio',
  Application = 'application',
  Font = 'font',
  Image = 'image',
  Model = 'model',
  Text = 'text',
  video = 'video',
}

export type ImageSelection = {
  name?: string
  path?: string
}

export type UploadProps = {
  /** Component Label */
  label: string

  /** Handler called after file upload, Returns `GetUploadUrls` object */
  onChange: (e: GetUploadUrls[] | undefined) => unknown

  /** Name of component */
  name: string

  /** Optional - upload button label */
  btnLabel?: string

  /** Array of supported formats `i.e ['jpg', 'jpeg', 'png']` */
  formats: Array<string>

  error?: string

  /** Optional - upload multiple files */
  multiple?: boolean

  /** Location of `Blob` to upload files to `blob storage service` */
  blobPath: string

  /** `FilesTypes` Enum  */
  fileType: keyof typeof FilesTypes

  /** PreSelected Images */
  defaultImages?: ImageSelection[]

  /** Change Orientation */

  listOrientation?: 'row' | 'column'

  /** Wrapper ClassName for Field  */
  wrapperClass?: string
}

const Upload: FC<UploadProps> = ({
  label,
  defaultImages,
  name,
  onChange,
  wrapperClass,
  btnLabel,
  formats,
  error,
  multiple,
  blobPath,
  fileType,
  listOrientation = 'column',
}) => {
  /** Hook for Uploading File through BlobService */
  const { mutate: upload } = useUpload()
  /**
   * TODO: Permission needs to be given
   const { mutate: removeFile } = useRemoveBlobImage()
   */
  const [uploadedFiles, setUploadedFiles] = useState<GetUploadUrls[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const inputRef = createRef<HTMLInputElement>()

  const row = listOrientation === 'row'

  /** Pre Selected Images should be populated */
  useEffect(() => {
    if (defaultImages) {
      setUploadedFiles(
        defaultImages.map(e => ({
          blobName: e.name || '',
          url: e.path || '',
          sasToken: '',
          containerName: '',
          filename: '',
          storageBlobName: '',
          blobPath: '',
        })),
      )
    }
  }, [defaultImages])

  /**
   * Handler called after file selection
   */
  const onSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const data = e?.target.files || []
    const files = Object.keys(data).map(f => data[f as keyof typeof data]) as File[]
    const supportedFiles = files.filter(f => formats.includes(f.type.split('/')[1]))
    /** Check if atleast one of the file should be of supported formats */
    if (supportedFiles.length > 0) {
      setIsLoading(true)
      /** Response after uploading files to blobstorage service */
      const response =
        (await upload({
          filenames: supportedFiles.map(s => s.name),
          imageType: blobPath,
          files: supportedFiles,
        })) || []
      const uploadedImages = multiple ? [...uploadedFiles, ...response] : [...response]
      setUploadedFiles(uploadedImages)
      onChange(uploadedImages)
      setIsLoading(false)
    }

    /** Unsupported format will display alert */

    // eslint-disable-next-line no-alert
    else alert(`Please select following file formats only: ${formats.join(', ')}`)
  }

  /** Bind onclick handler to hidden input type=file */
  const onClickFileEl = () => inputRef.current?.click()

  const removeImage = (image: GetUploadUrls) => {
    const filtered = uploadedFiles?.filter(f => f.url !== image.url)
    /**
     * TODO: Devops needs to give permission in order to implement this feature. Future Task!
        await removeFile({
          filenames: [image.blobName],
          imageType: blobPath,
        })
    */
    setUploadedFiles(filtered)
    onChange(filtered.length === 0 ? undefined : filtered)
  }

  return (
    <>
      {/* Hidden JSX Element */}
      <input
        type="file"
        ref={inputRef}
        className="d-none"
        onChange={onSelect}
        multiple={multiple}
        accept={`${FilesTypes[fileType]}/${formats.join(`,${FilesTypes[fileType]}/`)}`}
      />
      {isLoading && (
        <div className={styles.overlay}>
          <ProgressSpinner size={10} />
        </div>
      )}
      {/* JSX visible to client */}
      <Field name={name} className={wrapperClass && wrapperClass} label={row ? '' : label} error={error}>
        <div>
          {row ? (
            ''
          ) : (
            <>
              <div className={styles.uploadContainer}>
                <div className={styles.emptyContainer}>
                  <button type="button" className={cls([styles.emptyBox, 'text-left', 'pl-3'])} onClick={onClickFileEl}>
                    {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) uploaded.` : ' '}
                  </button>
                </div>
                <div className={styles.btnContainer}>
                  <Button type="button" onClick={onClickFileEl}>
                    {(btnLabel || 'upload').toUpperCase()}
                  </Button>
                </div>
              </div>
              <span className={styles.infoText}>Supported formats: {formats.join(', ').toUpperCase()}.</span>
            </>
          )}
          {uploadedFiles.length > 0 && (
            <>
              <div
                className={cls([
                  styles.imageslist,
                  row ? 'flex-nowrap justify-content-start' : 'justify-content-center',
                  'd-flex flex-row p-3 border ',
                ])}
              >
                {uploadedFiles?.map((image: GetUploadUrls) => (
                  <div key={image.blobName || ''} className={cls([styles.imageContent, row ? styles.padding_y_8 : ''])}>
                    <Icon name="clear" size={25} onClick={() => removeImage(image)} />
                    <img
                      className={row ? cls('p-0', styles.imageSquare) : 'p-2'}
                      src={image.url || ''}
                      alt={image.blobName || ''}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
          {row ? (
            <>
              <div className={styles.uploadContainer}>
                <div className={cls(styles.btnContainer, 'w-100')}>
                  <button type="button" className={styles.btn_outline_upload} onClick={onClickFileEl}>
                    {(btnLabel || 'upload').toUpperCase()}
                  </button>
                </div>
              </div>
              <span className={styles.infoText}>Supported formats: {formats.join(', ').toUpperCase()}.</span>
            </>
          ) : (
            ''
          )}
        </div>
      </Field>
    </>
  )
}

export default Upload
