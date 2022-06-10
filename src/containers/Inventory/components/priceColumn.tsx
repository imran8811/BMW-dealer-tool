import { InventoryItem, useInventoryUpdate } from '@common/endpoints/useInventory'
import useConfirm from '@common/utilities/useConfirm'
import Currency from '@components/Currency'
import Form from '@components/Form'
import Icon from '@components/Icon'
import NumberInput from '@components/NumberInput'
import ProgressSpinner from '@components/ProgressSpinner'
import { FC, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styles from '../inventory.module.scss'

type FormValues = {
  internetPrice: number
}

const messages = {
  input: {
    internetPrice: '9999.99',
  },
  sellingPriceDisplay: 'Selling Price',
  validation: 'Selling Price is Required',
  confirmationMsg: (previous: number, latest: number) =>
    `Are you sure you want to change the selling price from ${previous} to ${latest}?
    Please note that all calculations will be updated based on this change.`,
}

const validation = {
  required: {
    value: true,
    message: messages.validation,
  },
}

const EditablePriceColumn: FC<{ internetPrice: InventoryItem['internetPrice']; vin: InventoryItem['vin'] }> = ({
  internetPrice,
  vin,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>()
  const { handleSubmit, control, errors, watch, formState } = useForm<FormValues>()
  const { dirtyFields } = formState
  const newPrice = watch()
  const { mutate, isLoading } = useInventoryUpdate('internetPrice')
  const { confirm: showWarning } = useConfirm({
    className: styles.confirmPadding,
    message: messages.confirmationMsg(internetPrice, newPrice.internetPrice),
    icon: 'ocross',
    cancelText: 'Cancel',
    confirmText: 'Confirm',
    acceptBtnClass: styles.tryAgainBtn,
    onConfirm: () => setIsEditing(false),
    onBeforeConfirm: (resolve, reject) => {
      void mutate([{ internetPrice: newPrice.internetPrice, vin }], {
        onSuccess() {
          resolve('Vehicle price is updated successfully.')
        },
        onFailure({ error }) {
          reject(error.data?.message || 'Unknown Error')
        },
      })
    },
    swapButtons: true,
    isLoading,
    onReject: () => setIsEditing(false),
  })

  const submit = () => {
    if (dirtyFields.internetPrice) {
      showWarning()
    } else {
      setIsEditing(false)
    }
  }

  return (
    <>
      {!isEditing ? (
        <div key={vin}>
          <button className={styles.desktopEditableBtn} onClick={() => setIsEditing(true)}>
            <div className={styles.wrapBtn}>
              {isLoading && (
                <div className={styles.overlay}>
                  <ProgressSpinner size={10} />
                </div>
              )}
              <Currency skipDecimals className="text-dark font-weight-bold" value={internetPrice} />
              <Icon name="editPencil" className={styles.pencil} size={16} />
            </div>
          </button>
        </div>
      ) : (
        <ul key={vin} className="list-inline mb-0">
          <li className="list-inline-item">
            <Form onSubmit={handleSubmit(() => submit())}>
              <Controller
                control={control}
                name="internetPrice"
                defaultValue={internetPrice}
                rules={validation}
                render={({ onChange, value, name }) => (
                  <NumberInput
                    className={styles.editableInput}
                    mode="currency"
                    displayName={messages.sellingPriceDisplay}
                    name={name}
                    left
                    min={0}
                    placeholder={messages.input.internetPrice}
                    value={value as number}
                    onChange={(_, newValue) => onChange(newValue)}
                    error={errors?.internetPrice?.message}
                  />
                )}
              />
            </Form>
          </li>
          <li className="list-inline-item">
            <Icon name="checkmark" onClick={() => handleSubmit(() => submit())()} size={16} />
          </li>
          <li className="list-inline-item">
            <Icon name="transparentCross" onClick={() => setIsEditing(false)} size={24} />
          </li>
        </ul>
      )}
    </>
  )
}

export default EditablePriceColumn
