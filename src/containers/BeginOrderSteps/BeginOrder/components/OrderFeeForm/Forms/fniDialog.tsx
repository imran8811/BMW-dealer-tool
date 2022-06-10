import Button from '@components/Button'
import Tabs from '@components/Tabs'
import { FC, useMemo } from 'react'
import { ResponsiveImage } from 'types/images'
import Currency from '@components/Currency'
import { FNIProductCoverage, FNIProductRate, FnIProducts } from '@common/endpoints/typings.gen'
import cls from 'classnames'
import ImageCarousel from '@containers/BeginOrderSteps/components/ImageCarousel'
import { useUpdateOrder } from '@common/endpoints/orderTransitions'

import { orderFormMessages as messages } from './config'
import styles from '../OrderFeeForm.module.scss'

const ImgNotAvailable = require('@common/assets/img-not-avl.png') as ResponsiveImage

const AddProtectionProductsDialogContent: FC<{
  onHide: () => unknown
  penRates: FNIProductRate[]
  orderFniProducts: FnIProducts[]
  addFniProduct: (coverage: FNIProductCoverage, fniProduct: FNIProductRate) => void
  removeFniProduct: (coverage: FNIProductCoverage) => void
  handleCancel: () => void
  updatedata: () => unknown
  orderId: string
}> = ({ onHide, penRates, addFniProduct, removeFniProduct, orderFniProducts, handleCancel, updatedata, orderId }) => {
  const { mutate: updateOrder, status } = useUpdateOrder()
  const tabOptions = useMemo(
    () =>
      penRates.map(rate => ({
        label: rate.dealerProductDetails.productName,
        key: rate.dealerProductDetails.productName,
      })),
    [penRates],
  )
  return (
    <>
      <Tabs customId="add-protection-dialog-tabs" items={tabOptions}>
        {penRates.map(rate => (
          <ProtectionTabContent
            key={rate.dealerProductDetails.productName}
            rate={rate}
            addFniProduct={addFniProduct}
            removeFniProduct={removeFniProduct}
            orderFniProducts={orderFniProducts}
          />
        ))}
      </Tabs>
      <div className={cls(styles.buttonWrap, 'mt-5')}>
        <div className="col-lg-6 col-sm-12 col-md-6">
          <Button
            className="w-100 mb-2"
            onClick={() => {
              handleCancel()
              onHide()
            }}
            secondary
          >
            {messages.cancel}
          </Button>
        </div>
        <div className="col-lg-6 col-sm-12 col-md-6">
          <Button
            className="w-100 mb-2"
            onClick={async () => {
              await updateOrder({ dealerFnIProducts: orderFniProducts, orderId })
              updatedata()
            }}
            loading={status === 'running'}
            hoverPrimary
          >
            {messages.confirm}
          </Button>
        </div>
      </div>
    </>
  )
}

const ProtectionTabContent: FC<{
  rate: FNIProductRate
  addFniProduct: (coverage: FNIProductCoverage, fniProduct: FNIProductRate) => void
  removeFniProduct: (coverage: FNIProductCoverage) => void
  orderFniProducts: FnIProducts[]
}> = ({ rate, addFniProduct, removeFniProduct, orderFniProducts }) => {
  return (
    <div key={rate.dealerProductDetails.productName}>
      <div className="row">
        <div className="mt-4 mt-lg-5 mt-xl-0 mt-xxl-5 col-12 col-xl-5">
          <h6>{rate.dealerProductDetails.productName}</h6>
          <p>{rate.dealerProductDetails.productDescription}</p>
        </div>
        <div className="col-12 col-xl-6 offset-xl-1">
          {rate.dealerProductDetails?.images?.length ? (
            <ImageCarousel value={rate.dealerProductDetails.images.map(image => image.path)} />
          ) : (
            <img alt="" src={ImgNotAvailable.src} />
          )}
        </div>
      </div>
      <div className={styles.addonsContainer}>
        {rate.coverages.map(coverage => (
          <FniProductTemplate
            key={coverage.coverageName}
            onAdd={() => addFniProduct(coverage, rate)}
            onRemove={() => removeFniProduct(coverage)}
            coverage={coverage}
            isSelected={
              !!orderFniProducts.find(f => {
                return (
                  f.coverageName.toLowerCase() === coverage.coverageName.toLowerCase() &&
                  f.term === coverage.termsMonths &&
                  f.mileage === coverage.termsMiles
                )
              })
            }
          />
        ))}
      </div>
    </div>
  )
}

const FniProductTemplate: FC<{
  onAdd: () => unknown
  onRemove: () => unknown
  coverage: FNIProductCoverage
  isSelected: boolean
}> = ({ onAdd, onRemove, coverage, isSelected }) => {
  return (
    <div className={styles.addonWrap}>
      <div className={styles.addonHeading}>
        <span>{coverage.coverageName}</span>
      </div>
      <div className={styles.addonMeta}>
        <p>Term: {coverage.termsMonths}</p>
        <p>
          Mileage: <Currency value={coverage.termsMiles} hideUnit />
        </p>
        <p>
          Deductible: <Currency value={coverage.amount} />
        </p>
      </div>
      <div className={styles.addonPrice}>
        <b>
          <Currency value={coverage.dealerCost} />{' '}
        </b>
        <p className={styles.salePrice}>Sale Price</p>
      </div>
      <div className={styles.addonButton}>
        <Button
          className={isSelected ? 'd-none' : ''}
          onClick={() => {
            onAdd()
          }}
          hoverPrimary
        >
          {messages.addProduct}
        </Button>
        <Button
          className={!isSelected ? 'd-none' : ''}
          onClick={() => {
            onRemove()
          }}
          secondary
        >
          {messages.removeProduct}
        </Button>
      </div>
    </div>
  )
}

export default AddProtectionProductsDialogContent
