import React, { FC } from 'react'
import { useMediaQuery } from '@react-hook/media-query'
import { breakpointUp } from '@common/utilities/mediaQueries'
import cn from 'classnames'
import NumberInput from '@components/NumberInput'
import { Controller, UseFormMethods } from 'react-hook-form'
import { FNIProductCoverage, FNIProductRate, FnIProducts } from '@common/endpoints/typings.gen'
import Divider from '@components/Divider'
import Text from '@components/Text'
import Currency from '@components/Currency'
import Button from '@components/Button'
import Dialog from '@components/Dialog'
import { useModal } from 'react-modal-hook'
import { OrderFeeFormValues, orderFormMessages as messages } from './config'
import AddProtectionProducts from './fniDialog'
import styles from '../OrderFeeForm.module.scss'

const FnIForm: FC<{
  formMethod: UseFormMethods<OrderFeeFormValues>
  fniData: FnIProducts[]
  updatedata: () => unknown
  penRates: FNIProductRate[]
  orderFniProducts: FnIProducts[]
  addFniProduct: (coverage: FNIProductCoverage, fniProduct: FNIProductRate) => void
  removeFniProduct: (coverage: FNIProductCoverage) => void
  handleCancelFniProducts: () => void
  orderId: string
  setOrderFniProducts: (products: FnIProducts[]) => void
}> = ({
  formMethod,
  fniData,
  updatedata,
  penRates,
  orderFniProducts,
  addFniProduct,
  removeFniProduct,
  handleCancelFniProducts,
  orderId,
  setOrderFniProducts,
}) => {
  const displayAsTable = useMediaQuery(breakpointUp('sm'))
  const { watch, control } = formMethod

  const fnIValues = watch('fniProducts')
  const allAmounts = fnIValues.map((fniProduct: FnIProducts) => fniProduct.dealerCost || 0)
  const totalAmount = allAmounts.reduce((a, b) => a + b, 0)

  const [showFniDialog, hideFniDialog] = useModal(
    () => (
      <Dialog
        blockScroll
        onHide={() => {
          hideFniDialog()
        }}
        visible
        className={styles['protection-products-dialog']}
        header={messages.fniDialogHeader}
      >
        <AddProtectionProducts
          penRates={penRates}
          onHide={hideFniDialog}
          orderFniProducts={orderFniProducts}
          addFniProduct={addFniProduct}
          removeFniProduct={removeFniProduct}
          handleCancel={handleCancelFniProducts}
          updatedata={updatedata}
          orderId={orderId}
        />
      </Dialog>
    ),
    [penRates, orderFniProducts],
  )
  return (
    <>
      {displayAsTable && (
        <div className={`${styles.noGutters} row`}>
          <div key="name" className={`${styles.head} col-6`}>
            {messages.name}
          </div>
          <div key="dealerCost" className={`${styles.head} col-2`}>
            {messages.amount}
          </div>
        </div>
      )}
      {fniData.length > 0 &&
        fniData.map((item, index) => {
          const prefix = `fniProducts[${index}]`
          return (
            <div key={prefix} className={`row ${styles.noGutters}`}>
              <div
                key="name"
                className={cn({
                  'col-12 col-sm-6 d-flex flex-row align-items-center': true,
                  [styles.cell]: true,
                  'pb-2': displayAsTable,
                })}
              >
                {item.coverageName}
              </div>
              <div key="dealerCost" className={`col-4 col-sm-2 d-flex flex-row align-items-center pb-2 ${styles.cell}`}>
                <Controller
                  name={`${prefix}.dealerCost`}
                  control={control}
                  render={({ ref, ...props }) => (
                    <NumberInput
                      small
                      defaultValue
                      fractionDigits={2}
                      label={displayAsTable ? undefined : messages.amount}
                      {...props}
                      onChange={(_, value) => {
                        const newOrderFniProducts = [...orderFniProducts]
                        newOrderFniProducts[index] = { ...newOrderFniProducts[index], dealerCost: value as number }
                        props.onChange(value)
                        setOrderFniProducts(newOrderFniProducts)
                      }}
                      customOnBlur={updatedata}
                    />
                  )}
                />
              </div>
            </div>
          )
        })}
      <div className="d-flex justify-content-center pt-3">
        <Button type="button" secondary fullWidth onClick={showFniDialog}>
          {messages.add}
        </Button>
      </div>
      <Divider />
      <div className="d-flex justify-content-between pt-2 pb-0">
        <Text className="py-1 text-uppercase font-weight-bold">{messages.total}</Text>
        <h2 className={styles.price}>{totalAmount > 0 ? <Currency value={totalAmount} hideUnit={false} /> : '-'}</h2>
      </div>{' '}
    </>
  )
}

export default FnIForm
