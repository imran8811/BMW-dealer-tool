import { FC } from 'react'
import Input from '@components/Input'
import { useMediaQuery } from '@react-hook/media-query'
import { breakpointUp } from '@common/utilities/mediaQueries'
import cn from 'classnames'
import NumberInput from '@components/NumberInput'
import Divider from '@components/Divider'
import Text from '@components/Text'
import Currency from '@components/Currency'
import { Controller, UseFormMethods } from 'react-hook-form'
import { FeeInput } from '@common/endpoints/typings.gen'
import styles from '../OrderFeeForm.module.scss'
import { OrderFeeFormValues, orderFormMessages as messages } from './config'

const OrderFee: FC<{
  formMethod: UseFormMethods<OrderFeeFormValues>
  feeData: FeeInput[]
  updatedata: () => unknown
  internetPrice: number
}> = ({ formMethod, feeData, updatedata, internetPrice }) => {
  const displayAsTable = useMediaQuery(breakpointUp('sm'))
  const { watch, register, control } = formMethod

  const feeValues = watch('fees')
  const allAmounts = feeValues.map((feeRate: FeeInput) => feeRate.amount || 0)
  const totalAmount = allAmounts.reduce((a, b) => a + b, 0)
  return (
    <>
      {displayAsTable && (
        <div className={`${styles.noGutters} row`}>
          <div key="name" className={`${styles.head} col-6`} />
          <div key="vendor" className={`${styles.head} col-4`}>
            {messages.vendor}
          </div>
          <div key="amount" className={`${styles.head} col-2`}>
            {messages.amount}
          </div>
        </div>
      )}
      {feeData.map((item, index) => {
        const prefix = `fees[${index}]`
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
              {item.chargeDisplayName}
            </div>
            <div key="vendor" className={`col-8 col-sm-4 d-flex flex-row align-items-center pr-2 pb-2 ${styles.cell}`}>
              <Input
                small
                label={displayAsTable ? undefined : messages.vendor}
                name={`${prefix}.vendorName`}
                ref={register()}
                placeholder={messages.vendorPlaceholder}
              />
            </div>
            <div key="amount" className={`col-4 col-sm-2 d-flex flex-row align-items-center pb-2 ${styles.cell}`}>
              <Controller
                name={`${prefix}.amount`}
                control={control}
                render={({ ref, ...props }) => (
                  <NumberInput
                    small
                    defaultValue
                    fractionDigits={2}
                    label={displayAsTable ? undefined : messages.amount}
                    {...props}
                    onChange={(_, value) => {
                      props.onChange(value)
                    }}
                    customOnBlur={updatedata}
                  />
                )}
              />
            </div>
          </div>
        )
      })}
      <Divider />
      <div className="d-flex justify-content-between pt-2 pb-0">
        <Text className="py-1 text-uppercase font-weight-bold">{messages.total}</Text>
        <h2 className={styles.price}>
          {totalAmount > internetPrice ? (
            <Currency value={internetPrice} hideUnit={false} />
          ) : (
            <Currency value={totalAmount} hideUnit={false} />
          )}
        </h2>
      </div>{' '}
      {totalAmount > internetPrice ? (
        <Text className="d-flex justify-content-center font-weight-bold text-danger pt-2 pb-0">{messages.error}</Text>
      ) : null}
    </>
  )
}

export default OrderFee
