import React, { FC } from 'react'
import { DealerFeesConfig as Row } from '@common/endpoints/typings.gen'
import { useUpdateFee } from '@common/endpoints/fees'
import CellSwitch from '../CellSwitch'

const TaxableCell: FC<{ row: Row; dealerCode: string }> = ({ row, dealerCode }) => {
  const toggle = useUpdateFee({ dealerCode, fee: row })

  return (
    <CellSwitch
      name={`is-taxable-${row._id}`}
      checked={row.isTaxable}
      disabled={toggle.status === 'running'}
      onChange={isTaxable => toggle.mutate({ isTaxable })}
    />
  )
}

export default TaxableCell
