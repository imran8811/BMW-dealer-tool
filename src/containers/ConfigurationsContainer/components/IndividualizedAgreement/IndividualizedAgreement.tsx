import { ChangeEvent, FC, useState, useEffect } from 'react'
import InputSwitch, { InputSwitchProps } from '@components/InputSwitch'
import cls from 'classnames'
import Icon from '@components/Icon'
import { useMutateIndividualizedAgreement } from '@common/endpoints/useIndividualizedAgreement'
import { IndividualizedAgreement } from '@common/endpoints/typings.gen'
import { useModal } from 'react-modal-hook'
import Dialog from '@components/Dialog'
import SectionHeading from '@components/SectionHeading'
import Button from '@components/Button'
import ProgressSpinner from '@components/ProgressSpinner'
import IndividualizedAgreementForm from './IndividualizedAgreementForm'
import styles from './IndividualizedAgreement.module.scss'

const messages = {
  title: 'Individualized Agreement',
  default: 'Default',
  heading: {
    addIndividualizedAgreement: 'Add New Agreement',
    updateIndividualizedAgreement: 'Update Agreement',
  },
}

type IndividualizedAgreementProps = {
  dealerCode: string
  agreements: IndividualizedAgreement[]
}

const IndividualizedAgreements: FC<IndividualizedAgreementProps> = ({ dealerCode, agreements }) => {
  const { mutate: mutateIndividualizedAgreement, isLoading: isLoadingDelete } = useMutateIndividualizedAgreement(
    dealerCode,
  )
  const loader = (
    <div className={styles.overlay}>
      <ProgressSpinner size={50} />
    </div>
  )
  const [selectedAgreement, setSelectedAgreement] = useState<IndividualizedAgreement | null>(null)

  const onDeleteAgreement = async (agreement: IndividualizedAgreement) => {
    await mutateIndividualizedAgreement({ ...agreement, method: 'DELETE' })
  }

  const onUpdateAgreement = async (agreement: IndividualizedAgreement) => {
    await mutateIndividualizedAgreement({ ...agreement, method: 'PUT' })
  }
  const onChangeDefault = async (e: ChangeEvent<InputSwitchProps>, agree: IndividualizedAgreement) => {
    await onUpdateAgreement({ ...agree, isDefault: e.target.checked || false })
  }

  const [onEditAgreement, onClose] = useModal(
    () => (
      <Dialog
        onHide={() => {
          onClose()
          setSelectedAgreement(null)
        }}
        visible
        header={
          <SectionHeading>
            {selectedAgreement
              ? messages.heading.updateIndividualizedAgreement
              : messages.heading.addIndividualizedAgreement}
          </SectionHeading>
        }
        className={styles.individualizedAgreementForm}
      >
        <IndividualizedAgreementForm
          onFormClose={() => {
            onClose()
            setSelectedAgreement(null)
          }}
          dealerCode={dealerCode}
          agreement={selectedAgreement}
        />
      </Dialog>
    ),
    [dealerCode, selectedAgreement],
  )

  useEffect(() => {
    if (selectedAgreement) onEditAgreement()
  }, [selectedAgreement, onEditAgreement])

  return (
    <>
      <div className="container bg-white rounded p-xl-5 p-lg-5 p-4 mt-2">
        <h2 className="section-subheading">{messages.title}</h2>
        <div className={cls(styles.individualizedAgreement)}>
          {isLoadingDelete && loader}
          {agreements.map(agreement => (
            <div className={cls(styles.agreement, 'row', 'align-items-start')} key={agreement._id}>
              <div className="col-md-9">
                <p>{agreement.agreement}</p>
              </div>
              <div className={cls(styles.iconBtns, 'd-flex justify-content-center col-md-1')}>
                <span>
                  <Icon onClick={() => setSelectedAgreement(agreement)} name="editPencil" />
                </span>
                <span>
                  <Icon onClick={() => onDeleteAgreement(agreement)} name="delete" />
                </span>
              </div>
              <div className={cls(styles.switch, 'col-md-2 d-flex justify-content-center')}>
                <InputSwitch
                  name={agreement._id}
                  checked={agreement.isDefault}
                  labelPlacement="left"
                  onChange={e => onChangeDefault(e, agreement)}
                >
                  {messages.default}
                </InputSwitch>
              </div>
              <div className="col-md-12">
                <hr className="solid" />
              </div>
            </div>
          ))}
          <div className="w-100 my-3">
            <Button secondary className="m-auto" onClick={onEditAgreement}>
              Add New
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
export default IndividualizedAgreements
