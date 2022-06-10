import { useMemo, useState } from 'react'
import CompositeHeading from '@components/CompositeHeading'
import Dialog from '@components/Dialog'
import Button from '@components/Button'
import {
  useMasterAccessories,
  useDeleteMasterAccessory,
  UpdateAccessoryParamType,
  AccessoryType,
  IAccessoryFilter,
} from '@common/endpoints/useMasterAccessories'
import { Accessories, Lookups } from '@common/endpoints/typings.gen'
import useConfirm from '@common/utilities/useConfirm'
import { useModal } from 'react-modal-hook'
import SectionHeading from '@components/SectionHeading'
import useReferenceData from '@common/endpoints/useReferenceData'
import { TableSort } from '@containers/FeesConfiguration/components/BetterTable/BetterTable'
import AddonTable from './masterAccessoryTable'
import MasterOEMAccessoryForm from './components/MasterAccessoryForm'
import styles from './components/masterAccessory.module.scss'

export const messages = {
  addNewAddon: 'Add New',
  modalHeader: 'Add New Add-on',
  loadMore: 'Load More',
}
const MasterAddons = () => {
  const [filters, setFilters] = useState<IAccessoryFilter>()
  const [{ sortField: sortBy, sortOrder }, setSort] = useState<TableSort>({})

  const { pageData, isLoading, total, setSize, size, isValidating } = useMasterAccessories({
    ...filters,
    sortBy,
    sortOrder,
  })
  const { data: referenceData } = useReferenceData(['Category', 'CompatibleModels', 'InstallationMode'])
  //  confirmation popup for deleting an accessory
  const { confirm, cancel } = useConfirm({
    title: 'Are you sure?',
    message: 'You are going to delete this accessory!',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => deleteAccessory(selectedItem as UpdateAccessoryParamType),
    onReject: () => setSelectedItem(undefined),
  })

  const { mutate } = useDeleteMasterAccessory()
  const deleteAccessory = (data: Accessories) => {
    void mutate(data, {
      onSuccess() {
        cancel()
      },
    })
  }
  const [selectedItem, setSelectedItem] = useState<Accessories>()
  const [activeAddon, setActiveAddon] = useState<AccessoryType | null>(null)

  const categoryOptions = useMemo(() => {
    const options = [...new Set(referenceData?.[0].map((value: Lookups) => value))]
    return options.map(value => ({ label: value.displayName, value: value.code }))
  }, [referenceData])

  const modalOptions = useMemo(() => {
    const options = [...new Set(referenceData?.[1].map((value: Lookups) => value))]
    return options.map(value => ({ label: value.displayName, value: value.code }))
  }, [referenceData])

  const InstallationOptions = useMemo(() => {
    const options = [...new Set(referenceData?.[2].map((value: Lookups) => value))]
    return options.map(value => ({ label: value.displayName, value: value.code }))
  }, [referenceData])

  const confirmDelete = (item: Accessories) => {
    setSelectedItem(item)
    confirm()
  }

  const showMore = async () => {
    await setSize(size + 1)
  }

  // Dialog for Add/Edit Accessories
  const [show, hide] = useModal(
    () => (
      <Dialog
        onHide={() => {
          hide()
          setActiveAddon(null)
        }}
        visible
        className={styles.addonFormDialog}
        header={<SectionHeading>{messages.modalHeader}</SectionHeading>}
      >
        <MasterOEMAccessoryForm
          categoryOptions={categoryOptions}
          modalOptions={modalOptions}
          InstallationOptions={InstallationOptions}
          handleFormClose={() => {
            hide()
            setActiveAddon(null)
          }}
          addonData={activeAddon}
        />
      </Dialog>
    ),
    [activeAddon, referenceData, InstallationOptions, modalOptions],
  )

  return (
    <>
      <CompositeHeading className="pt-4">
        <SectionHeading icon="gear">Master List of Add-Ons</SectionHeading>
        <Button onClick={() => show()}>{messages.addNewAddon}</Button>
      </CompositeHeading>
      <AddonTable
        data={pageData}
        modalOptions={modalOptions}
        isValidating={isValidating}
        categoryOptions={categoryOptions}
        isLoading={isLoading}
        onServerSideFilter={params => setFilters(params)}
        onSortChange={evt => setSort(evt)}
        deleteRow={confirmDelete}
        InstallationOptions={InstallationOptions}
        handleUserClick={item => {
          if (item) {
            show()
            setActiveAddon(item)
          }
        }}
      />
      {!isLoading && total && pageData.length > 0 && total > pageData.length && (
        <Button tertiary fullWidth className="mt-2" onClick={showMore}>
          {messages.loadMore}
        </Button>
      )}
    </>
  )
}

export default MasterAddons
