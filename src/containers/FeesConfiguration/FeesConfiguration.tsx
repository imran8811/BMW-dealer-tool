import React, { FC, SyntheticEvent, useCallback, useRef, useState } from 'react'
import { useModal } from 'react-modal-hook'
import { Menu } from 'primereact/menu'
import { DealerFeesConfig } from '@common/endpoints/typings.gen'
import { useDealershipFees, FeesFilterParams, useDeleteFee } from '@common/endpoints/fees'
import Button from '@components/Button'
import useConfirm from '@common/utilities/useConfirm'
import CompositeHeading from '@components/CompositeHeading'
import Dialog from '@components/Dialog'
import EditButton from '@components/EditButton'
import MultiSelect from '@components/MultiSelect'
import SectionHeading from '@components/SectionHeading'
import Currency from '@components/Currency'
import { SelectOption } from '@common/utilities/selectOptions'
import BetterTable from './components/BetterTable'
import { FilterRenderParams, TableSort } from './components/BetterTable/BetterTable'
import DealerFeeDefinition from './components/FeeForm'
import LoadMore from './components/LoadMore'
import StatusCell from './components/StatusCell'
import TaxableCell from './components/TaxableCell'

type Row = DealerFeesConfig
interface Props {
  dealerCode: string
}

const messages = {
  modalHeader: {
    add: 'Add Dealer Fees',
    edit: 'Edit fee',
  },
  header: 'Dealer Fees',
  buttons: {
    addNew: 'Add New',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
  boolFilter: {
    yes: 'Yes',
    no: 'No',
  },
}

const makeDropdownBoolFilter = (params: {
  placeholder: string
  serverField?: string
  labelYes?: string
  labelNo?: string
}) => ({
  serverField: params.serverField,
  render: ({ value, onChange }: FilterRenderParams<boolean[]>) => (
    <MultiSelect
      small
      name="status-filter"
      value={value}
      onChange={evt => onChange(evt.value)}
      placeholder={params.placeholder}
      options={
        ([
          { value: true, label: params.labelYes ?? messages.boolFilter.yes },
          { value: false, label: params.labelNo ?? messages.boolFilter.no },
        ] as unknown) as SelectOption[]
      }
    />
  ),
  getServerSide: (value: boolean[]) => (value.length === 1 ? value[0] : undefined),
})

const FeeTools: FC<{
  row: Row
  onEdit: (row: Row) => unknown
  onDelete: (row: Row) => unknown
}> = ({ row, onEdit, onDelete }) => {
  const menuRef = useRef<Menu>(null)
  const cb = useCallback((evt: SyntheticEvent): void => menuRef.current?.toggle(evt), [menuRef])
  const handleEdit = useCallback(() => void onEdit(row), [row, onEdit])
  const handleDelete = useCallback(() => void onDelete(row), [row, onDelete])

  return (
    <>
      <EditButton onClick={cb} icon="settings" />
      <Menu
        ref={menuRef}
        popup
        appendTo={document?.body}
        model={[
          { label: 'Edit', command: handleEdit },
          { label: 'Delete', command: handleDelete },
        ]}
      />
    </>
  )
}

const useFeeModal = ({ dealerCode }: { dealerCode: string }) => {
  const [item, setItem] = useState<Row | null>(null)

  const [showModal, hideModal] = useModal(
    () => (
      <Dialog
        visible
        onHide={hideModal}
        header={<SectionHeading>{messages.modalHeader[item == null ? 'add' : 'edit']}</SectionHeading>}
      >
        <DealerFeeDefinition onClose={hideModal} item={item} dealerCode={dealerCode} />
      </Dialog>
    ),
    [item, dealerCode],
  )

  return {
    createFee: (): void => {
      setItem(null)
      showModal()
    },
    editFee: (row: Row): void => {
      setItem(row)
      showModal()
    },
  }
}

const useDeleteFeeModal = ({ dealerCode }: { dealerCode: string }) => {
  const rowRef = useRef<Row>()
  const deleteFee = useDeleteFee({ dealerCode })

  const { confirm } = useConfirm({
    title: 'Deleting fee',
    message: 'Are you sure you want to delete this fee?',
    onConfirm: () => {
      void deleteFee.mutate(rowRef.current!)
    },
  })
  const handleDelete = useCallback(
    (row: Row) => {
      rowRef.current = row
      confirm()
    },
    [confirm, rowRef],
  )

  return {
    deleteFee: handleDelete,
  }
}

const FeesConfiguration: FC<Props> = ({ dealerCode }) => {
  const [filters, setFilters] = useState<FeesFilterParams>({})
  const [{ sortField: sortBy, sortOrder }, setSort] = useState<TableSort>({})
  const fees = useDealershipFees({ dealerCode, pageSize: -1, ...filters, sortBy, sortOrder })
  const { createFee, editFee } = useFeeModal({ dealerCode })
  const { deleteFee } = useDeleteFeeModal({ dealerCode })

  const columns = {
    chargeDisplayName: {
      header: 'Fee Name',
      filter: {
        placeholder: 'Search By Fee Name',
      },
      sort: true,
      template: (row: Row) => <strong>{row.chargeDisplayName}</strong>,
    },
    state: {
      header: 'State',
      template: (row: Row) => row.state?.map(r => r.displayName).join(', '),
      filter: {
        placeholder: 'Search By State',
      },
      sort: true,
    },
    isTaxable: {
      header: 'Taxable',
      filter: makeDropdownBoolFilter({
        placeholder: 'Search',
      }),
      sort: true,
      template: (row: Row) => <TaxableCell row={row} dealerCode={dealerCode} />,
    },
    isActive: {
      header: 'Status',
      filter: makeDropdownBoolFilter({
        placeholder: 'Search By Status',
        labelYes: messages.status.active,
        labelNo: messages.status.inactive,
      }),
      template: (row: Row) => <StatusCell row={row} dealerCode={dealerCode} />,
      sort: true,
    },
    financialProduct: {
      header: 'Financial Product',
      filter: {
        placeholder: 'Search By Financial Product',
      },
      template: (row: Row) => (
        <div style={{ minWidth: '180px' }}>{row.financialProduct.map(r => r.displayName).join(', ')}</div>
      ),
      sort: true,
    },
    defaultAmount: {
      header: 'Default Amount',
      filter: {
        placeholder: 'Search By Default Amount',
      },
      sort: true,
      template: (row: Row) => (
        <div style={{ minWidth: '170px' }}>
          <Currency value={row.defaultAmount} />
        </div>
      ),
    },
  }

  return (
    <div className="my-5">
      <CompositeHeading>
        <SectionHeading icon="gear">{messages.header}</SectionHeading>
        <Button type="button" onClick={createFee}>
          {messages.buttons.addNew}
        </Button>
      </CompositeHeading>
      <div className="pt-0 pb-3 px-4 bg-white mb-2 rounded">
        <BetterTable<Row, typeof columns>
          columns={columns}
          items={fees.pageData.filter(f => f._id !== undefined)}
          darkText
          serverSide
          onFiltersChange={({ serverFilters }: { serverFilters: FeesFilterParams }) => {
            setFilters(serverFilters)
          }}
          onSortChange={evt => setSort(evt)}
          tools={row => <FeeTools row={row} onEdit={editFee} onDelete={deleteFee} />}
        />
      </div>
      {!fees.isExhausted && <LoadMore onLoadMore={fees.loadMore} className="mb-2" />}
    </div>
  )
}

export default FeesConfiguration
