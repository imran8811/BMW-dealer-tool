import { FC, ReactNode, useRef } from 'react'
import { IInsurance } from '@common/endpoints/typings.gen'
import phoneNumberFormatFn from '@common/utilities/formatPhoneNumber'
import { useDateFormatter } from '@components/DateDisplay'
import Address from '@components/Address'
import Galleria, { GalleriaType } from '@components/Galleria'
import Icon from '@components/Icon'
import cls from 'classnames'
import ProgressSpinner from '@components/ProgressSpinner'
import styles from './Insurance.module.scss'

const messages = {
  heading: {
    insurance: 'Insurance',
  },
}

/*
 Template for Items in Insurance View: takes a heading and a value,
 **
 */
const ItemTemplate: FC<{ heading: string; value?: string | number | undefined | ReactNode }> = ({ heading, value }) => (
  <p className={styles['text-wrap']}>
    {heading}
    {value && <span className={styles['insurance-values-text']}>{value}</span>}
  </p>
)

/*
 ** Insurance values related Component
 */
const InsuranceComponent: FC<{ insurance: IInsurance }> = ({ insurance }) => {
  const dateFormatter = useDateFormatter()
  return (
    <>
      <ItemTemplate heading="Insurance Provider:" value={insurance.providerName} />
      <ItemTemplate
        heading="Insurance Contact:"
        value={phoneNumberFormatFn(insurance.contactNumber, '000-000-0000') || ''}
      />
      {insurance.policyNumber && <ItemTemplate heading="Policy Number:" value={insurance.policyNumber} />}
      {insurance.expiryDate && (
        <ItemTemplate heading="Expiration:" value={dateFormatter(insurance.expiryDate, 'date-day-first')} />
      )}
      {(insurance.city || insurance.address || insurance.state || insurance.zipCode) && (
        <ItemTemplate
          heading="Address:"
          value={
            <Address
              city={insurance.city || ''}
              streetAddress={insurance.address || ''}
              state={insurance.state?.displayName || ''}
              zipCode={insurance.zipCode || ''}
              apartmentOrSuite=""
            />
          }
        />
      )}
    </>
  )
}

/*
 ** Insurance Main component
 */
const InsuranceInfo: FC<{ insuranceDetails: IInsurance; isLoading: boolean }> = ({ insuranceDetails, isLoading }) => {
  const galleriaRef = useRef<GalleriaType>(null)
  const show = () => {
    if (galleriaRef && galleriaRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      galleriaRef.current.show()
    }
  }
  return isLoading ? (
    <div className="py-5 text-center">
      <ProgressSpinner />
    </div>
  ) : (
    <>
      <div className="rounded bg-white p-4 p-xl-5 mb-2">
        <p className={styles.heading}>{messages.heading.insurance}</p>
        <div className="row">
          <div className="col-md-6 col-sm-12 align-self-center">
            <InsuranceComponent insurance={insuranceDetails} />
          </div>
          <div className="col-sm-12 col-md-6">
            {insuranceDetails.documentURL && (
              <>
                <Galleria
                  fullScreen
                  ref={galleriaRef}
                  numVisible={3}
                  showThumbnails={false}
                  className={styles['galleria-wrap']}
                  item={(item: string) => <img className={styles.gallery} src={item} alt="" />}
                  value={[insuranceDetails.documentURL]}
                />

                <div className={cls(styles['image-wrapper'], 'ml-auto mr-auto')}>
                  <Icon onClick={show} className={styles['expand-image']} name="expand" size={32} />
                  <img className={styles.image} src={insuranceDetails.documentURL} alt="Insurance Details" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default InsuranceInfo
