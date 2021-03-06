import Currency from '@components/Currency'
import Form from '@components/Form'
import NumberInput from '@components/NumberInput'
import { IconName } from '@components/Icon/Icon'
import ListElement, { ListElementProps } from '@components/List/ListElement'
import { FC } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Dialog from '@components/Dialog'
import { useModal } from 'react-modal-hook'
import SectionHeading from '@components/SectionHeading'
import Button from '@components/Button'
import cls from 'classnames'
import { selectErrorMessage } from '@common/utilities/http-api'
import styles from './DealItems.module.scss'

type ItemProps = {
  editable?: IconName
  confirmationMsg?: string
  loading?: boolean
  onSave?: (values: FormValues['amountUpdate'], hide: () => unknown, itemKey: string) => unknown
  serverError?: Error | null
  itemKey?: string
  max?: number
  shouldHideOn?: unknown[]
}
type FormValues = {
  amountUpdate: number
}

const messages = {
  validation: 'is Required',
  heading: 'amount update',
  button: {
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
  },
  confirmation: 'Are you sure you want to change this amount? This may update other calculated amounts as well.',
}

const validation = (name: string) => ({
  required: {
    value: true,
    message: `${name} ${messages.validation}`,
  },
})

const UpdateForm: FC<Omit<ListElementProps, 'onEdit'> & ItemProps & { onClose: () => unknown }> = ({
  value,
  name,
  confirmationMsg,
  onClose,
  loading,
  onSave,
  serverError,
  itemKey,
  max,
}) => {
  const { handleSubmit, control, errors, watch } = useForm<FormValues>({
    defaultValues: {
      amountUpdate: Number(value),
    },
  })

  const updatedFormValue = watch()
  return (
    <Form
      onSubmit={handleSubmit(values => onSave?.(values.amountUpdate, onClose, itemKey as string))}
      error={serverError && selectErrorMessage(serverError)}
    >
      <Controller
        control={control}
        name="amountUpdate"
        rules={validation(name as string)}
        render={({ onChange, name: fieldName, value: fieldValue }) => (
          <NumberInput
            mode="currency"
            suffix="$"
            label={name}
            name={fieldName}
            displayName={name as string}
            fractionDigits={2}
            min={0}
            max={max || 1000000}
            left
            error={errors?.amountUpdate?.message}
            value={fieldValue as number}
            onChange={(_, newValue) => {
              onChange(newValue)
            }}
          />
        )}
      />
      <p className={cls(styles.paragraph, 'pt-3 text-center')}>{confirmationMsg || messages.confirmation}</p>
      <div className={cls(styles.row, 'pt-3')}>
        <Button className={cls(styles.button, styles.cancelBtn)} onClick={() => onClose()} secondary disabled={loading}>
          {messages.button.cancel}
        </Button>
        <Button
          className={cls(styles.button, styles.saveBtn)}
          type="submit"
          loading={loading && messages.button.saving}
          disabled={value === updatedFormValue.amountUpdate}
        >
          {messages.button.save}
        </Button>
      </div>
    </Form>
  )
}

const Item: FC<Omit<ListElementProps, 'onEdit'> & ItemProps> = ({
  value,
  name,
  editable,
  confirmationMsg,
  loading,
  serverError,
  onSave,
  shouldHideOn,
  ...props
}) => {
  const [show, hide] = useModal(
    () => (
      <Dialog
        onHide={() => {
          hide()
        }}
        visible
        className={styles['amount-update-dialog']}
        header={<SectionHeading className="text-uppercase">{messages.heading}</SectionHeading>}
      >
        <UpdateForm
          onClose={() => {
            hide()
          }}
          name={name}
          confirmationMsg={confirmationMsg}
          value={value}
          serverError={serverError}
          loading={loading}
          onSave={onSave}
          {...props}
        />
      </Dialog>
    ),
    [loading, serverError, value, onSave],
  )
  if (shouldHideOn && shouldHideOn.includes(value)) return <></>
  return (
    <ListElement
      value={typeof value === 'number' && (value ? <Currency hideUnit value={value} /> : '???')}
      valuePrefix="$"
      name={name}
      onEdit={() => show()}
      editable={editable}
      {...props}
    />
  )
}

export default Item
