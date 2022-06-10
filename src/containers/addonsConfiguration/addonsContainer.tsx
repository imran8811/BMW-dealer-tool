import { FC, useMemo, useState } from 'react'
import CompositeHeading from '@components/CompositeHeading'
import Dialog from '@components/Dialog'
import Button from '@components/Button'
import useAccessories, {
  invalidateAccessories,
  useMasterOEM,
  deleteData,
  UpdateAccessoryParamType,
  AccessoryType,
  IAccessoryFilter,
} from '@common/endpoints/useAccessories'
import { Accessories, Lookups } from '@common/endpoints/typings.gen'
import useConfirm from '@common/utilities/useConfirm'
import useMutation from 'use-mutation'
import { useModal } from 'react-modal-hook'
import SectionHeading from '@components/SectionHeading'
import useReferenceData from '@common/endpoints/useReferenceData'
import { TableSort } from '@containers/FeesConfiguration/components/BetterTable/BetterTable'
import FeatureFlag, { Off, On } from '@containers/FeatureFlag'
import AddonTable from './addonsTable'
import AddonForm from './components/AddonForm'
import OldAddonForm from './components/OldAddonForm'
import styles from './components/addons.module.scss'

const messages = {
  addNewAddon: 'Add New',
  modalHeader: 'Add New Add-on',
  loadMore: 'Load More',
}

type AddonContainerProps = {
  dealerCode: string
}
const Addons: FC<AddonContainerProps> = ({ dealerCode }) => {
  const [filters, setFilters] = useState<IAccessoryFilter>()
  const [{ sortField: sortBy, sortOrder }, setSort] = useState<TableSort>({})

  const { pageData, isLoading, total, setSize, size, isValidating } = useAccessories(dealerCode, {
    ...filters,
    sortBy,
    sortOrder,
  })
  const { pageData: masterData } = useMasterOEM()
  const { data: referenceData } = useReferenceData(['Category', 'CompatibleModels', 'InstallationMode', 'VehicleType'])
  //  confirmation popup for deleting an accessory
  const { confirm, cancel } = useConfirm({
    title: 'Are you sure?',
    message: 'You are going to delete this accessory!',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => deleteAccessory(selectedItem as UpdateAccessoryParamType),
    onReject: () => setSelectedItem(undefined),
  })

  const [deleteAccessory] = useMutation<UpdateAccessoryParamType, unknown, Error>(
    values => {
      const url = `/dealer-management/dealer-config/delete-accessory/${dealerCode}/${values?._id}`
      return deleteData<Accessories>(url, {
        withAuthentication: true,
        method: 'DELETE',
      })
    },
    {
      onSuccess(data): void {
        cancel()
        void invalidateAccessories(data?.input)
      },
    },
  )
  const [selectedItem, setSelectedItem] = useState<Accessories>()
  const [activeAddon, setActiveAddon] = useState<AccessoryType | Record<string, undefined> | undefined>()
  const oemMasterData = useMemo(() => {
    const options = [...new Set(masterData?.map((item: AccessoryType) => item))]
    const inputOptions = options
      .map(({ description, _id: id }) => ({ label: description, value: id }))
      .sort((a, b) => a.label.localeCompare(b.label))
    const oemData = options.map(value => value)
    return { inputOptions, oemData }
  }, [masterData])

  const categoryOptions = useMemo(() => {
    const options = [...new Set(referenceData?.[0].map((value: Lookups) => value))]
    return options.map(value => ({ label: value.displayName, value: value.code }))
  }, [referenceData])

  const modalOptions = useMemo(() => {
    const options = [...new Set(referenceData?.[1].map((value: Lookups) => value))]
    return options
      .map(value => ({ label: value.displayName, value: value.code }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [referenceData])

  const InstallationOptions = useMemo(() => {
    const options = [...new Set(referenceData?.[2].map((value: Lookups) => value))]
    return options.map(value => ({ label: value.displayName, value: value.code }))
  }, [referenceData])

  const vehicalOptions = useMemo(() => {
    const options = [...new Set(referenceData?.[3].map((value: Lookups) => value))]
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
          setActiveAddon(undefined)
        }}
        visible
        className={styles.addonFormDialog}
        header={<SectionHeading>{messages.modalHeader}</SectionHeading>}
      >
        <FeatureFlag flag="tempVehicleConditionInAddon">
          <On>
            <AddonForm
              categoryOptions={categoryOptions}
              modalOptions={modalOptions}
              vehicalOptions={vehicalOptions}
              masterData={oemMasterData}
              InstallationOptions={InstallationOptions}
              handleFormClose={() => {
                hide()
                setActiveAddon(undefined)
              }}
              addonData={activeAddon}
              dealerCode={dealerCode}
            />
          </On>
          <Off>
            <OldAddonForm
              categoryOptions={categoryOptions}
              modalOptions={modalOptions}
              masterData={oemMasterData}
              InstallationOptions={InstallationOptions}
              handleFormClose={() => {
                hide()
                setActiveAddon(undefined)
              }}
              addonData={activeAddon}
              dealerCode={dealerCode}
            />
          </Off>
        </FeatureFlag>
      </Dialog>
    ),
    [activeAddon, oemMasterData, referenceData, vehicalOptions, InstallationOptions, modalOptions, dealerCode],
  )

  return (
    <>
      <CompositeHeading className="pt-4">
        <SectionHeading icon="gear">Add-ons Configuration</SectionHeading>
        <Button onClick={() => show()}>{messages.addNewAddon}</Button>
      </CompositeHeading>
      <AddonTable
        data={pageData}
        modalOptions={modalOptions}
        dealerCode={dealerCode}
        isValidating={isValidating}
        categoryOptions={categoryOptions}
        isLoading={isLoading}
        onServerSideFilter={params => setFilters(params)}
        onSortChange={evt => setSort(evt)}
        vehicleConditions={vehicalOptions}
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

export default Addons
