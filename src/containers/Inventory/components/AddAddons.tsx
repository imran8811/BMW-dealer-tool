/* eslint-disable unicorn/no-for-loop */
import { VehicleAccessories } from '@common/endpoints/typings.gen'
import { AccessoryType } from '@common/endpoints/useAccessories'
import { useBulkAssociateAddons } from '@common/endpoints/useInventory'
import useConfirm from '@common/utilities/useConfirm'
import Accordion, { AccordionTab } from '@components/Accordion'
import Button from '@components/Button'
import Dialog from '@components/Dialog'
import Icon from '@components/Icon'
import SearchFilter from '@components/SearchFilter'
import SectionHeading from '@components/SectionHeading'
import Tabs from '@components/Tabs'
import React, { FC, useMemo, useState, useEffect } from 'react'
import { useModal } from 'react-modal-hook'
import cls from 'classnames'
import { ResponsiveImage } from 'types/images'
import useAddonFeature from '@common/utilities/tenantFeaturesFlags'
import { SelectOption } from '@common/utilities/selectOptions'
import styles from './AddAddonPopup.module.scss'

const ImgNotAvailable = require('./img-not-avl.png') as ResponsiveImage

export const messages = {
  heading: 'Add-ons',
  cancel: 'Cancel',
  confirm: 'Save',
  saving: 'Saving...',
  total: 'Total',
  add: 'Add',
  remove: 'Remove',
  detail: 'View Details',
  confirmCancel: 'Are you sure you want to cancel?',
}

type ParseDataType = {
  [x: string]: {
    [y: string]: AccessoryType[]
  }
}

const AddAddonsDialog: FC<{
  onHideAddon: () => void
  dealerCode?: string
  accessoriesData?: AccessoryType[]
  associatedAddons?: VehicleAccessories[]
  installModeOption?: SelectOption[]
  vin?: string
}> = ({ onHideAddon, accessoriesData, associatedAddons, vin, dealerCode, installModeOption }) => {
  const [addonData, setAddonData] = useState<AccessoryType[]>([])
  const [selected, setSelected] = useState<AccessoryType[]>([])

  const { mutate, status, error } = useBulkAssociateAddons()
  const { shouldShowImages } = useAddonFeature(dealerCode)

  const { confirm } = useConfirm({
    title: messages.confirmCancel,
    message: 'Your selection(s) will be lost.',
    confirmText: 'Yes',
    cancelText: 'No',
    onConfirm: () => onHideAddon(),
  })

  const { confirm: showWarning } = useConfirm({
    className: styles.confirmPadding,
    message:
      'You can add upto a maximum of 3 pre-installed add-ons.' +
      ' Please reduce pre-installed add-ons to 3 or less to proceed.',
    hideAccept: true,
    icon: 'ocross',
    cancelText: 'OK',
  })

  useEffect(() => {
    if (associatedAddons) {
      const data = associatedAddons.map(e => ({ ...e, _id: e._accessoryId }))
      setSelected((data as unknown) as AccessoryType[])
    }
  }, [associatedAddons])

  const filterAccessory = (search: string) => {
    const str = new RegExp(search.toLowerCase())
    return accessoriesData?.filter(f => {
      if (str.exec(f.category.displayName.toLowerCase())) return true
      if (str.exec(f.category.code.toLowerCase())) return true
      if (str.exec(f.installationMode.displayName.toLowerCase())) return true
      if (str.exec(f.installationMode.code.toLowerCase())) return true
      if (str.exec(f.name.toLowerCase())) return true
      if (str.exec(`${f.price}`.toLowerCase())) return true
      if (str.exec(f.partNo.toLowerCase())) return true
      if (str.exec(f.supplier.toLowerCase())) return true
      if (str.exec(`${f.residualValueAdder}`.toLowerCase())) return true
      if (str.exec(f.description.toLowerCase())) return true
      if (f.description.toLowerCase().includes(search)) return true
      if (f.name.toLowerCase().includes(search)) return true

      return false
    })
  }

  useEffect(() => {
    if (accessoriesData && addonData.length === 0) {
      // filter associated addons and render them on preinstalled UI
      const associatedIds = associatedAddons?.map(f => f._accessoryId)
      const allAccessories = accessoriesData.map(f => {
        if (associatedIds?.includes(f._id)) {
          return { ...f, installationMode: filterOptionByCode('PreInstalled', installModeOption) }
        }
        return f
      })
      setAddonData(allAccessories)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessoriesData])

  const parseAccessories = useMemo(() => {
    const selectedIds = new Set(selected.map(e => e._id))
    if (!addonData) return {}
    const catogories: ParseDataType = {}
    for (let index = 0; index < addonData.length; index += 1) {
      const currentCategoryKey = addonData[index].category.displayName
      const currentModeKey = addonData[index].installationMode.displayName
      const modeData = catogories?.[currentCategoryKey]?.[currentModeKey] || []
      if (selectedIds.has(addonData[index]._id)) {
        modeData.unshift(addonData[index])
      } else {
        modeData.push(addonData[index])
      }
      catogories[currentCategoryKey] = {
        ...catogories[currentCategoryKey],
        [currentModeKey]: modeData,
      }
    }
    return catogories
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addonData])

  const TabOptions = useMemo(() => {
    return Object.keys(parseAccessories).map(category => ({
      label: category,
      key: category,
    }))
  }, [parseAccessories])

  const onAddAccessory = (addon: AccessoryType) => {
    const defaultAddons = associatedAddons?.find(f => f._accessoryId === addon._id)
    if (defaultAddons) {
      // if associate item is removed and then again added
      setSelected([...selected, { ...addon, _accessoryId: addon._id }])
      return
    }
    setSelected([...selected, addon])
  }
  const onRemoveAccessory = (addon: AccessoryType) => {
    const previousMode = accessoriesData?.find(f => f._id === addon._id)?.installationMode.code
    if (previousMode === 'Optional') {
      // Addon is from Optional Mode change it's installed mode on UI
      changeInstallationMode(addon, 'Optional')
    }
    const data = selected.filter(f => f._id !== addon._id)
    setSelected(data)
  }

  const calculateTotal = useMemo(() => {
    const prices = selected.map(e => e.price)

    const total = prices.reduce((a: number, b: number) => {
      return a + b
    }, 0)
    return total.toFixed(2)
  }, [selected])

  const isSomethingChanged = useMemo(() => {
    const defaultId = selected.filter(e => e._accessoryId !== undefined)
    const isDefaultChanged = associatedAddons?.length !== defaultId.length
    const isNewAdded = selected.length !== defaultId.length
    const preInstalled = selected.length

    return {
      isDefaultChanged,
      isNewAdded,
      default: defaultId,
      disableSave: !isNewAdded && !isDefaultChanged,
      preInstalled,
    }
  }, [associatedAddons, selected])

  const filterOptionByCode = (code: string, options?: SelectOption[]) => {
    const mode = options?.find(f => f.value === code)
    return {
      displayName: mode?.label as string,
      code: mode?.value as string,
    }
  }

  const changeInstallationMode = (item: AccessoryType, mode: 'PreInstalled' | 'Optional') => {
    const selectedAddon = addonData.find(f => f._id === item._id) as AccessoryType
    const remainingAddons = addonData.filter(f => f._id !== item._id)

    setAddonData([
      ...remainingAddons,
      { ...selectedAddon, installationMode: filterOptionByCode(mode, installModeOption) },
    ])
  }

  const selectAddonMiddleWare = (mode: string, item: AccessoryType, callback: (item: AccessoryType) => void) => {
    if (isSomethingChanged.preInstalled < 3) {
      if (mode === 'Optional') {
        // if optional item is added then change it's installation mode to preinstalled
        changeInstallationMode(item, 'PreInstalled')
      }
      callback(item)
      return
    }
    showWarning()
  }

  const saveAddons = () => {
    if (isSomethingChanged.disableSave || vin === undefined) {
      return
    }
    const defaultId = new Set(isSomethingChanged.default.map(e => e._id || e._accessoryId))
    const removedItems = associatedAddons?.filter(f => !defaultId.has(f._accessoryId)) || []
    const associatedItems = selected?.filter(f => f._accessoryId === undefined) || []

    const data = {
      vin,
      associate:
        associatedItems.length === 0
          ? undefined
          : associatedItems.map(e => ({
              ...e,
              _accessoryId: e._id,
              _id: undefined,
              // changing the installation mode to preinstalled for all selected data
              installationMode: filterOptionByCode('PreInstalled', installModeOption),
            })),
      remove: removedItems?.length === 0 ? undefined : removedItems?.map(e => e._accessoryId),
    }

    void mutate(data, {
      onSuccess() {
        onHideAddon()
      },
    })
  }

  return (
    <>
      <div className="row">
        <div className="col-sm-12 col-lg-6">
          <SectionHeading className={styles['addon-section-heading']}>{messages.heading}</SectionHeading>
        </div>
        <div className="col-sm-12 col-lg-6 text-right">
          <SearchFilter
            inputTestId="addon-search-input"
            btnTestId="addon-search-btn"
            onSearch={value => setAddonData(filterAccessory(value) || [])}
          />
        </div>
      </div>
      <div>
        <div data-testid="add-remove-addon-test-id">
          <Tabs items={TabOptions}>
            {parseAccessories &&
              Object.keys(parseAccessories).map(category => (
                <>
                  <p>The add-ons you are adding here will appear as pre-installed to the customer.</p>
                  <Accordion
                    className={styles['addon-accordion']}
                    multiple
                    activeIndex={Object.keys(parseAccessories[category]).map((_, i) => i)}
                  >
                    {Object.keys(parseAccessories[category])
                      .sort((a, b) => b.localeCompare(a))
                      .map(mode => (
                        <AccordionTab header={mode}>
                          <>
                            <div className={styles['addon-list-wrap']}>
                              {parseAccessories[category][mode].map((item, index) => (
                                <AddonItemTemplate
                                  disableActions={status === 'running'}
                                  onAdd={() => selectAddonMiddleWare(mode, item, onAddAccessory)}
                                  onRemove={() => onRemoveAccessory(item)}
                                  isSelected={!!selected.find(f => f._id === item._id)}
                                  displayImage={shouldShowImages}
                                  // eslint-disable-next-line react/no-array-index-key
                                  key={index}
                                  data={item}
                                />
                              ))}
                            </div>
                          </>
                        </AccordionTab>
                      ))}
                  </Accordion>
                </>
              ))}
          </Tabs>
        </div>
      </div>
      <div className={styles.calculation}>
        <span>{messages.total}</span>
        <span data-testid="total-price-sum">${calculateTotal}</span>
      </div>
      <div className={styles.actionBtn}>
        <Button
          data-testid="cancel-btn-associate-addon-popup"
          secondary
          disabled={status === 'running'}
          onClick={() => {
            const { isNewAdded, isDefaultChanged } = isSomethingChanged

            if (isNewAdded || isDefaultChanged) {
              confirm()
              return
            }
            onHideAddon()
          }}
        >
          {messages.cancel}
        </Button>
        <Button
          data-testid="save-btn-associate-addon-popup"
          hoverPrimary
          disabled={status === 'running' || isSomethingChanged.disableSave}
          loading={status === 'running' && messages.saving}
          onClick={() => saveAddons()}
        >
          {messages.confirm}
        </Button>
      </div>
      {error && <p className={cls('text-center p-3', styles.error)}>{error?.message}</p>}
    </>
  )
}

const AddonItemTemplate: FC<{
  key: number
  data: AccessoryType
  isSelected: boolean
  disableActions: boolean
  onAdd: () => void
  onRemove: () => void
  displayImage?: boolean
}> = ({ key, data, isSelected, onAdd, onRemove, disableActions, displayImage }) => {
  const [showDetails, hideDetails] = useModal(
    () => (
      <Dialog
        blockScroll
        onHide={() => {
          hideDetails()
        }}
        visible
        className={styles['addon-desc-wrap']}
        header={
          <div data-testid="description-dialog-header">
            <Icon name="arrow" onClick={() => hideDetails()} />
            <h3>{data.name}</h3>
          </div>
        }
      >
        <div>
          <p data-testid="description-dialog-addon-association">{data.description}</p>
        </div>
      </Dialog>
    ),
    [],
  )
  return (
    <div className={cls(styles['addon-item'], displayImage ? '' : styles['hide-image'])} key={key}>
      <div className={styles.image}>
        <img alt={data.name} src={data.images?.[0]?.path || ImgNotAvailable.src} />
      </div>
      <span className={styles.title}>{data.name}</span>
      <span className={styles.price}>${data.price.toFixed(2)}</span>
      <button
        className={styles['detail-btn']}
        onClick={() => {
          if (disableActions) return
          showDetails()
        }}
      >
        {messages.detail}
      </button>
      <Button
        className={isSelected ? 'd-none' : ''}
        onClick={() => {
          if (disableActions) return
          onAdd()
        }}
        hoverPrimary
      >
        {messages.add}
      </Button>
      <Button
        className={!isSelected ? 'd-none' : ''}
        onClick={() => {
          if (disableActions) return
          onRemove()
        }}
        secondary
      >
        {messages.remove}
      </Button>
    </div>
  )
}

export default AddAddonsDialog
