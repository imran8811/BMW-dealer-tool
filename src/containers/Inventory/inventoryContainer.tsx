import { FC, useMemo, useState } from 'react'
import SectionHeading from '@components/SectionHeading'
import Button from '@components/Button'
import { useModal } from 'react-modal-hook'
import Dialog from '@components/Dialog'
import CompositeHeading from '@components/CompositeHeading'
import { useVehicalAccessoryList, VehicalAccessoryNameType, VinAccessoryType } from '@common/endpoints/useInventory'
import useAddonFeature from '@common/utilities/tenantFeaturesFlags'
import Inventory from './Inventory'
import BulkUpdateForm from './components/bulkUpdateForm'
import styles from './inventory.module.scss'

const messages = {
  title: 'Inventory Management',
  bulkAssociate: 'Bulk Update',
}

const InventoryPage: FC<{ dealerCode: string }> = ({ dealerCode }) => {
  const { pageData: accessoriesData } = useVehicalAccessoryList(dealerCode, true)
  const { isModuleAccessible: isAddonAccessible } = useAddonFeature(dealerCode)

  // Bulk Accessories
  const bulkAccessoriesOption = useMemo(() => {
    const options = [...new Set(accessoriesData?.map((item: VehicalAccessoryNameType) => item))]
    return options.map(value => ({ label: value.name, value: value._id }))
  }, [accessoriesData])

  const [selectedVin, setSelectedVin] = useState<VinAccessoryType[]>([])
  const [show, hide] = useModal(
    () => (
      <Dialog
        onHide={() => {
          hide()
        }}
        visible
        header={<SectionHeading>{messages.bulkAssociate}</SectionHeading>}
        className={styles.bulkUpdateDialog}
      >
        <BulkUpdateForm
          addonOption={bulkAccessoriesOption}
          accessoriesData={accessoriesData}
          selectedVin={selectedVin}
          onFormClose={() => {
            hide()
          }}
        />
      </Dialog>
    ),
    [bulkAccessoriesOption, selectedVin],
  )

  const selectedVins = (vins: VinAccessoryType[]) => {
    setSelectedVin(vins)
  }

  return (
    <>
      <CompositeHeading className="mt-5">
        <SectionHeading icon="gear">{messages.title}</SectionHeading>
        {isAddonAccessible && <Button onClick={() => show()}>{messages.bulkAssociate}</Button>}
      </CompositeHeading>
      {dealerCode && (
        <Inventory
          accessoriesData={accessoriesData}
          onSelectVin={selectedVins}
          descriptionOptions={bulkAccessoriesOption}
          dealerCode={dealerCode}
        />
      )}
    </>
  )
}

export default InventoryPage
