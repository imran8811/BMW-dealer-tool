import React, { FC } from 'react'
import { DealerFeesConfig as Row } from '@common/endpoints/typings.gen'
import { useUpdateFee } from '@common/endpoints/fees'
import CellSwitch from '../CellSwitch'

const messages = {
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
}

const StatusCell: FC<{ row: Row; dealerCode: string }> = ({ row, dealerCode }) => {
  const toggle = useUpdateFee({ dealerCode, fee: row })

  return (
    <CellSwitch
      name={`is-active-${row._id}`}
      checked={row.isActive}
      disabled={toggle.status === 'running'}
      onChange={isActive => toggle.mutate({ isActive })}
      labelYes={messages.status.active}
      labelNo={messages.status.inactive}
    />
  )
}

export default StatusCell
