import React, { FC } from 'react'
import cls from 'classnames'
import InputSwitch from '@components/InputSwitch'

const messages = {
  yes: 'Yes',
  no: 'No',
}

interface Props {
  name: string
  checked: boolean
  disabled?: boolean
  labelYes?: string
  labelNo?: string
  onChange?: (value: boolean) => unknown
}

const CellSwitch: FC<Props> = ({
  name,
  checked = false,
  disabled = false,
  labelYes = messages.yes,
  labelNo = messages.no,
  onChange,
}) => (
  <span className="d-flex align-content-center">
    <InputSwitch name={name} checked={checked} onChange={evt => onChange?.(evt.target.checked)} disabled={disabled} />
    <span className={cls('ml-1', checked ? 'text-dark' : 'text-muted')}>{checked ? labelYes : labelNo}</span>
  </span>
)

export default CellSwitch
