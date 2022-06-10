import { FC, useEffect, useMemo, useState } from 'react'

import SectionHeading from '@components/SectionHeading'
import CompositeHeading from '@components/CompositeHeading'
import Button from '@components/Button'
import { Dealerships, Lookups } from '@common/endpoints/typings.gen'
import { useModal } from 'react-modal-hook'
import Dialog from '@components/Dialog'
import useDealerships, { DealerShipFields, IFilterDealerShips } from '@common/endpoints/useDealerships'
import useReferenceData from '@common/endpoints/useReferenceData'
import { TableSort } from '@containers/FeesConfiguration/components/BetterTable/BetterTable'
import Dealership from './dealershipTable'
import FormDealership from './AddDealership'

export const messages = {
  title: 'Manage Dealerships',
  loadMore: 'Load More',
  modalHeader: 'Add New Dealership',
  addNewDealership: 'Add New',
}

const DealershipManagementPage: FC = () => {
  const [filters, setFilters] = useState<IFilterDealerShips>({})
  const [{ sortField: sortBy, sortOrder }, setSort] = useState<TableSort>({})
  const { pageData, isLoading, total, setSize, size } = useDealerships({ ...filters, sortBy, sortOrder })
  const [selectedDealership, setSelectedDealership] = useState<Dealerships | DealerShipFields | undefined>()
  const { data: referenceData } = useReferenceData(['USAState'])
  const stateOptions = useMemo(() => {
    const options = [...new Set(referenceData?.[0].map((value: Lookups) => value))]
    return options.map(value => ({ label: value.displayName, value: value.code }))
  }, [referenceData])
  const showMore = async () => {
    await setSize(size + 1)
  }

  // Dialog for Add/Edit Accessories
  const [show, hide] = useModal(
    () => (
      <div data-testid="add-new-dealership-dialog">
        <Dialog
          onHide={() => {
            hide()
            setSelectedDealership(undefined)
          }}
          visible
          header={<SectionHeading>{messages.modalHeader}</SectionHeading>}
        >
          <FormDealership
            stateOptions={stateOptions}
            onFormClose={() => {
              hide()
              setSelectedDealership(undefined)
            }}
            dealerData={selectedDealership}
          />
        </Dialog>
      </div>
    ),
    [selectedDealership, stateOptions],
  )

  useEffect(() => {
    if (selectedDealership) {
      show()
    }
  }, [selectedDealership, show])

  return (
    <>
      <CompositeHeading className="pt-4">
        <SectionHeading data-testid="container-title" icon="gear">
          {messages.title}
        </SectionHeading>
        <Button data-testid="add-new-btn" onClick={() => show()}>
          {messages.addNewDealership}
        </Button>
      </CompositeHeading>
      <Dealership
        onEdit={item => {
          setSelectedDealership(item)
        }}
        onServerSideFilter={params => setFilters(params)}
        onSortChange={evt => setSort(evt)}
        data={pageData}
        isLoading={isLoading}
      />
      {!isLoading && total && pageData.length > 0 && total > pageData.length && (
        <Button data-testid="dealership-container-load-more" tertiary fullWidth className="mt-2" onClick={showMore}>
          {messages.loadMore}
        </Button>
      )}
    </>
  )
}

export default DealershipManagementPage
