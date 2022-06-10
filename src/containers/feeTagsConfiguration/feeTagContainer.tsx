import { useState } from 'react'
import CompositeHeading from '@components/CompositeHeading'
import Dialog from '@components/Dialog'
import Button from '@components/Button'
import useFeeTag, {
  UpdateFeeTagParamType,
  FeeTagType,
  IFeeTagFilter,
  useDeleteFeeTag,
  useOptions,
} from '@common/endpoints/useFeeTags'
import { FeeTag } from '@common/endpoints/typings.gen'
import useConfirm from '@common/utilities/useConfirm'
import { useModal } from 'react-modal-hook'
import SectionHeading from '@components/SectionHeading'
import { TableSort } from '@containers/FeesConfiguration/components/BetterTable/BetterTable'

import FeeTagTable from './feeTagsTable'
import FeeTagForm from './components/FeeTagForm'

export const messages = {
  addNewFeeTag: 'Add New',
  modalHeader: 'Add New Fee Tag',
  updateModalHeader: 'Update Fee Tag',
  loadMore: 'Load More',
}

const FeeTags = () => {
  const [filters, setFilters] = useState<IFeeTagFilter>({} as IFeeTagFilter)
  const [{ sortField: sortBy, sortOrder }, setSort] = useState<TableSort>({})
  const feeTagOptions = useOptions()
  const { pageData, isLoading, total, setSize, size } = useFeeTag({
    ...filters,
    sortBy,
    sortOrder,
  })
  //  confirmation popup for deleting an fee tag
  const { confirm, cancel } = useConfirm({
    title: 'Are you sure?',
    message: 'You are going to delete this fee tag!',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => deleteFeeTag((selectedItem as unknown) as UpdateFeeTagParamType),
    onReject: () => setSelectedItem(null),
  })

  const { mutate } = useDeleteFeeTag()
  const deleteFeeTag = (data: FeeTag) => {
    void mutate(data, {
      onSuccess() {
        cancel()
      },
    })
  }
  const [selectedItem, setSelectedItem] = useState<FeeTag | null>(null)
  const [activeFeeTag, setActiveFeeTag] = useState<FeeTagType | null>(null)

  const confirmDelete = (item: FeeTag) => {
    setSelectedItem(item)
    confirm()
  }

  const showMore = async () => {
    await setSize(size + 1)
  }

  // Dialog for Add/Edit FeeTag
  const [show, hide] = useModal(
    () => (
      <Dialog
        onHide={() => {
          hide()
          setActiveFeeTag(null)
        }}
        visible
        header={<SectionHeading>{activeFeeTag ? messages.updateModalHeader : messages.modalHeader}</SectionHeading>}
      >
        <FeeTagForm
          handleFormClose={() => {
            hide()
            setActiveFeeTag(null)
          }}
          feeTagData={activeFeeTag}
          {...feeTagOptions}
        />
      </Dialog>
    ),
    [activeFeeTag, feeTagOptions],
  )

  return (
    <>
      <CompositeHeading className="pt-4">
        <SectionHeading icon="gear">Fee Tag Configuration</SectionHeading>
        <Button onClick={() => show()}>{messages.addNewFeeTag}</Button>
      </CompositeHeading>
      <FeeTagTable
        data={pageData}
        isLoading={isLoading}
        onServerSideFilter={params => setFilters(params)}
        onSortChange={evt => setSort(evt)}
        deleteRow={confirmDelete}
        handleUserClick={item => {
          if (item) {
            show()
            setActiveFeeTag(item)
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

export default FeeTags
