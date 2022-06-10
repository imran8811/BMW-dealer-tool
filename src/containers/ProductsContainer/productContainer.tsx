import { FC, useMemo, useState } from 'react'

import SectionHeading from '@components/SectionHeading'
import CompositeHeading from '@components/CompositeHeading'
import Button from '@components/Button'
import { useModal } from 'react-modal-hook'
import Dialog from '@components/Dialog'
import { useDeletePenProduct, usePenProviders, DealerFnIProductType } from '@common/endpoints/useFinanceProducts'
import useDealershipConfiguration from '@common/endpoints/useDealershipConfiguration'
import useConfirm from '@common/utilities/useConfirm'
import useReferenceData from '@common/endpoints/useReferenceData'
import { Lookups } from '@common/endpoints/typings.gen'
import { SelectOption } from '@common/utilities/selectOptions'
import Table from './productTable'
import FormProducts from './form/addProduct'
import styles from './product.module.scss'

const messages = {
  title: 'F&I Products',
  modalHeader: 'Add F&I Products',
  addNew: 'Add New',
}

const ProductContainer: FC<{ dealerCode: string }> = ({ dealerCode }) => {
  const { data: dealerConfig } = useDealershipConfiguration(dealerCode)
  const { data: providers, error: providerError } = usePenProviders()
  const { mutate: deleteProduct } = useDeletePenProduct()
  const { data: tenantProductTypeList } = useReferenceData('FniCustomerProductType')
  const [selectedProduct, setSelectedProduct] = useState<DealerFnIProductType | null>(null)

  const tenantProductTypeOptions: SelectOption[] = useMemo(() => {
    return (
      ((tenantProductTypeList?.map((e: Lookups) => ({
        label: e.displayName,
        value: e.code,
      })) as unknown) as SelectOption[]) || []
    )
  }, [tenantProductTypeList])

  // If Dealer not Registered with Pen
  const { confirm: showPenDialog } = useConfirm({
    className: styles.confirmPadding,
    message: 'This dealer cannot add F&I products. Please register with PEN to add products.',
    hideAccept: true,
    icon: 'ocross',
    cancelText: 'OK',
  })

  // Delete F&IProducts
  const { confirm: showDelete } = useConfirm({
    title: 'Are you sure?',
    message: 'You are going to delete this product!',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => {
      void deleteProduct(selectedProduct as DealerFnIProductType)
      setSelectedProduct(null)
    },
    onReject: () => setSelectedProduct(null),
  })

  // Dialog for Add/Edit Products
  const [show, hide] = useModal(
    () => (
      <Dialog
        onHide={() => {
          hide()
          setSelectedProduct(null)
        }}
        visible
        className={styles.dialogform}
        header={<SectionHeading>{messages.modalHeader}</SectionHeading>}
      >
        <FormProducts
          onFormClose={() => {
            hide()
            setSelectedProduct(null)
          }}
          providers={providers}
          providerError={providerError}
          productData={selectedProduct}
          tenantProductTypeOptions={tenantProductTypeOptions}
          dealerCode={dealerCode}
          dealerConfig={dealerConfig}
        />
      </Dialog>
    ),
    [selectedProduct, providers, providerError, dealerCode, dealerConfig],
  )

  return (
    <>
      <CompositeHeading className="pt-4">
        <SectionHeading icon="gear">{messages.title}</SectionHeading>
        <Button
          onClick={() => {
            if (dealerConfig?.penDealerId) {
              show()
            } else {
              showPenDialog()
            }
          }}
        >
          {messages.addNew}
        </Button>
      </CompositeHeading>
      <Table
        dealerCode={dealerCode}
        onEdit={(item: DealerFnIProductType) => {
          setSelectedProduct(item)
          show()
        }}
        onDeleteRow={(item: DealerFnIProductType) => {
          setSelectedProduct(item)
          showDelete()
        }}
      />
    </>
  )
}

export default ProductContainer
