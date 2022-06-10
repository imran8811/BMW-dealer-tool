import { useState } from 'react'
import {
  InventoryItem,
  UpdateVehicleEnum,
  useInventoryUpdate,
  UpdateVehicleParamUnion,
} from '@common/endpoints/useInventory'

const toggleStatus = (bulkType: keyof typeof UpdateVehicleEnum, column: boolean) => ({ vin }: InventoryItem) => ({
  vin,
  [bulkType]: column,
})

const useBulkUpdate = (
  bulkType: keyof typeof UpdateVehicleEnum,
  selected?: InventoryItem[],
): {
  isLoading: boolean
  mutate: (column: boolean) => Promise<null | undefined>
  columnTarget?: boolean
} => {
  const [columnTarget, setColumnTarget] = useState<boolean>()
  const { mutate, isLoading } = useInventoryUpdate(bulkType)

  const updateInventory = (column: boolean) => {
    setColumnTarget(column)
    const data = ((selected ? selected.map(toggleStatus(bulkType, column)) : []) as unknown) as UpdateVehicleParamUnion
    return mutate(data)
  }

  return { mutate: updateInventory, isLoading, columnTarget }
}

export default useBulkUpdate
