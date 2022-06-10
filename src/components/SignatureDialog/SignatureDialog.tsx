import { FC, useCallback, useEffect, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'

import Dialog, { DialogProps } from '@components/Dialog'
import Icon from '@components/Icon'
import Button from '@components/Button'
import cls from 'classnames'
import styles from './SignatureDialog.module.scss'

const options = {
  velocityFilterWeight: 0.5,
  throttle: 20,
}

const messages = {
  clear: 'Clear',
  submit: 'Submit',
}

const noop = () => {}

export type SignatureDialogProps = Omit<DialogProps, 'children' | 'onHide'> & {
  visible: boolean
  title?: string
  description?: string
  initialValue?: string
  isLoading?: boolean
  showError?: boolean
  onClose: () => unknown
  onSubmit: (pngDataUri?: string) => unknown
  onHide?: () => unknown
}

const SignatureDialog: FC<SignatureDialogProps> = ({
  title,
  description,
  initialValue,
  visible,
  isLoading,
  onClose,
  showError,
  onHide,
  onSubmit,
  ...props
}) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [isEmpty, setIsEmpty] = useState<boolean>(!initialValue)
  const [isDirty, setIsDirty] = useState<boolean>(false)
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null)

  const resetCanvas = useCallback<(loadInitialValue?: true) => void>(
    loadInitialValue => {
      if (canvas.current) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1)

        canvas.current.width = canvas.current.offsetWidth * ratio
        canvas.current.height = canvas.current.offsetHeight * ratio
        canvas.current.getContext('2d')?.scale(ratio, ratio)

        if (signaturePad) {
          signaturePad.clear()
          signaturePad.off()
        }

        const instance = new SignaturePad(canvas.current, {
          ...options,
          onEnd: () => {
            setIsEmpty(instance.isEmpty())
            setIsDirty(true)
          },
        })
        if (loadInitialValue && initialValue) {
          instance.fromDataURL(initialValue)
        }
        setSignaturePad(instance)
      }

      setIsEmpty(!loadInitialValue || !initialValue)
      setIsDirty(false)
    },
    [canvas, signaturePad, initialValue],
  )

  const submitImage = () => {
    if (signaturePad && isDirty) {
      const fileBase64 = signaturePad.toDataURL('image/png')
      return onSubmit(fileBase64)
    }

    return onSubmit()
  }

  useEffect(() => {
    if (!visible) {
      setIsInitialized(false)
    }
    if (!isInitialized && visible && canvas.current) {
      setIsInitialized(true)
      setTimeout(() => {
        resetCanvas(true)
      }, 200)
    }
  }, [visible, isInitialized, resetCanvas])
  const signatureClass = title ? title.toLowerCase().split(' ').join('-') : ''
  return (
    <Dialog {...props} visible={visible} onHide={onHide || noop} showHeader={false} className={styles.frame} {...props}>
      <section>
        <button className={cls(styles.backBtn, 'utm-sign-dialog-back-btn')} onClick={onClose}>
          <Icon name="chevron" />
        </button>
        <h3 className={styles.header}>{title}</h3>
        <div className={styles.element}>
          <main className={styles.main}>
            <figure className={styles.signature}>
              <div className={`pt-3 ${styles.label}`}>{description}</div>
            </figure>
            <canvas ref={canvas} className={styles.canvas} />
          </main>
          <div className={styles.buttons}>
            <Button
              secondary
              onClick={() => resetCanvas()}
              className={`mr-3 utm-sign-dialog-clear-btn utm-${signatureClass}-btn-clear`}
            >
              {messages.clear}
            </Button>
            <Button
              className={`utm-sign-dialog-submit-signature-btn utm-${signatureClass}-btn-submit`}
              type="submit"
              onClick={submitImage}
              disabled={isEmpty}
              loading={isLoading}
            >
              {messages.submit}
            </Button>
          </div>
          {showError && <p className="pt-2 text-center text-danger">Unknown Error</p>}
        </div>
      </section>
    </Dialog>
  )
}

export default SignatureDialog
