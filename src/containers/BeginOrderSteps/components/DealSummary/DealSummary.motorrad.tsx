import Button from '@components/Button'
import { FC, useMemo, useState } from 'react'
import cls from 'classnames'
import List from '@components/List'
import ListElement from '@components/List/ListElement'
import {
  VehicleDetails,
  OrderDetails,
  Fee,
  Tax,
  OrderState,
  GetPricingDetailsResponse,
  ProductCode,
} from '@common/endpoints/typings.gen'
import Currency from '@components/Currency'
import Divider from '@components/Divider'
import { useMarkConfirmed, useCompleteOrder } from '@common/endpoints/orderTransitions'
import { capitalizeFirstLetter } from '@common/utilities/validation'
import TabView, { TabPanel } from '@components/DuoTabView'
import useFinanceTaxes, { TradeInStatus } from '@common/endpoints/useDealSummary'
import ProgressSpinner from '@components/ProgressSpinner'
import { calculateTradeInBalance } from '@common/utilities/formulae'
import useDealershipConfiguration from '@common/endpoints/useDealershipConfiguration'
import Text from '@components/Text'

import Item from './component/DealItems'
import styles from './DealSummary.module.scss'

export interface IDealSummaryProps {
  order: OrderDetails
  vehicle: VehicleDetails
  pricing: GetPricingDetailsResponse
  refetchOrderDetails?: (updatedTaxes?: boolean, tradeInStatus?: TradeInStatus) => unknown
  isLoading?: boolean
  onSelectTab?: (e: boolean | string) => unknown
  calculatedTradeInBalance?: ReturnType<typeof calculateTradeInBalance>
}

export const messages = {
  headings: {
    dealSummary: 'Deal Summary',
  },
  buttons: {
    [OrderState.Available]: 'CONFIRM ORDER',
    [OrderState.Delivered]: 'COMPLETE ORDER',
  },
  WithTradeIn: 'WITH TRADE-IN',
  WithoutTradeIn: 'WITHOUT TRADE-IN',
  errors: {
    minFinanceAmountError:
      '*The financed amount is less than the allowed limit. Please change or remove the trade in asset to continue.',
  },
}

const calculateTotalAmount = (ratesState: Array<Fee | Tax>) => {
  const allAmounts: Array<number> = ratesState.map((rateState: Fee | Tax) => rateState.amount)
  const totalAmount = allAmounts.reduce((a: number, b: number) => {
    return a + b // FIXME: floating point arithmetic ?!
  }, 0)
  return totalAmount
}

const calculateFinancedCharges = (order: OrderDetails, pricing: GetPricingDetailsResponse) => {
  const TotalFee = calculateTotalAmount(order.fees)
  const TotalTax = pricing?.taxTotal

  const total = TotalFee + TotalTax

  return total
}

// moto -> Finance + EasyRide
const DealSummary: FC<IDealSummaryProps> = ({
  order,
  vehicle,
  pricing,
  refetchOrderDetails,
  isLoading: isOrderLoading,
  onSelectTab,
}) => {
  const { data: dealershipConfig } = useDealershipConfiguration(vehicle.dealerCode)
  const calculatedTradeInBalance = calculateTradeInBalance(order)
  const shouldConfirmOrder: () => string = () => {
    if (!dealershipConfig || !pricing) return ''
    let financeAmount = pricing.amountFinanced
    if (order.productCode === ProductCode.EasyRide) financeAmount -= pricing.balloonAmount || 0
    if (financeAmount < dealershipConfig.minimumFinancedAmount) {
      return messages.errors.minFinanceAmountError
    }
    return ''
  }
  const [focusedDeal, setFocusedDeal] = useState(
    order.tradeInVehicle ? TradeInStatus.WithTradeIn : TradeInStatus.WithoutTradeIn,
  )

  const confirmed = useMarkConfirmed()
  const completed = useCompleteOrder()

  const costLabelMessage = 'total amount financed'
  const error = shouldConfirmOrder()
  return (
    <div className={cls('bg-white p-4 p-xl-5 mb-2 rounded', styles.dealSummary)}>
      <h2 className="section-subheading">{messages.headings.dealSummary}</h2>
      {[ProductCode.Finance, ProductCode.EasyRide].includes(order.productCode) && (
        <p className={styles.textHighlighted}>Below amounts are calculated using APR ({pricing?.APR})</p>
      )}

      {isOrderLoading && [OrderState.Available].includes(order.state) && (
        <div className={styles.overlay}>
          <ProgressSpinner size={50} />
        </div>
      )}
      {order.tradeInVehicle && [OrderState.Available].includes(order.state) && (
        <>
          <TabView
            onChangeTab={({ index }) => {
              const status = index === 0 ? TradeInStatus.WithTradeIn : TradeInStatus.WithoutTradeIn
              onSelectTab?.(status === TradeInStatus.WithTradeIn)
              setFocusedDeal(status)
              refetchOrderDetails?.(true, status)
            }}
          >
            <TabPanel disabled={!!error} header={messages.WithTradeIn} />
            <TabPanel disabled={!!error} header={messages.WithoutTradeIn} />
          </TabView>
        </>
      )}
      <List>
        <Item name="Vehicle price" value={vehicle.internetPrice} />
        <div className="pb-2">
          <ListElement
            value={<Currency hideUnit value={pricing?.downPayment} showBrackets />}
            valuePrefix="$"
            name="Down Payment"
          />
        </div>
        <FinancedCharges
          refetchOrderDetails={refetchOrderDetails}
          order={order}
          pricing={pricing}
          tradeInState={focusedDeal}
          calculatedTradeInBalance={calculatedTradeInBalance}
        />
      </List>
      <div className="pt-0 pb-2">
        <Divider />
      </div>
      <div className={cls('row align-items-stretch')}>
        <div className="col-sm-7  pt-1 text-center text-sm-left">
          <span className="text-uppercase font-weight-bold">{costLabelMessage}</span>
        </div>
        <div className="col-sm-5  text-center text-sm-right">
          <h2 className="text-primary font-weight-bold">
            {!isOrderLoading && <Currency value={pricing?.amountFinanced} />}
          </h2>
        </div>
      </div>
      <div className="pb-3">
        <Divider />
      </div>
      <List>
        {pricing?.downPayment && <Item name="Down Payment" value={pricing.downPayment} />}
        {pricing?.monthlyPayment && <Item name="Monthly Payment" value={pricing.monthlyPayment} />}
        {order.productCode === ProductCode.EasyRide && pricing?.balloonAmount && (
          <Item
            name={`Balloon (${pricing.balloonPercentage || 0}%)`}
            className="font-weight-bold"
            value={pricing.balloonAmount}
          />
        )}
        <Item name="Due at Signing" value={pricing?.dueAtSigning} />
        <Item name="Rebates" className="font-weight-bold" value={pricing?.rebateAndPromotions} />
        {order.tradeInVehicle && (
          <Item name="Trade-In" className="font-weight-bold" value={calculatedTradeInBalance?.tradeInBalance || 0} />
        )}
      </List>
      {(order.state === OrderState.Available || order.state === OrderState.Delivered) && (
        <div className="row">
          <div className="col">
            <Divider />
            <Text className="d-flex justify-content-center text-danger pt-2 pb-0">{shouldConfirmOrder()}</Text>
            <div className={cls('d-flex justify-content-center pt-3')}>
              <Button
                className={`uppercase utm-review-order-${
                  order.state === OrderState.Available ? 'confirm' : 'complete'
                }-btn`}
                loading={
                  order.state === OrderState.Available ? confirmed.status === 'running' : completed.status === 'running'
                }
                disabled={!!error}
                onClick={() => {
                  if (order.state === OrderState.Available) {
                    void confirmed.mutate({ orderId: order._id })
                  } else if (order.state === OrderState.Delivered) {
                    void completed.mutate({ orderId: order._id })
                  }
                }}
              >
                {messages.buttons[order.state]}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const FinancedCharges: FC<Omit<IDealSummaryProps, 'vehicle' | 'onSelectTab'> & { tradeInState: TradeInStatus }> = ({
  order,
  pricing,
  tradeInState,
  refetchOrderDetails,
  calculatedTradeInBalance,
}) => {
  const { mutate, loading } = useFinanceTaxes(order._id)
  const [apiError, setApiError] = useState<Error | null>(null)
  const orderKey = tradeInState === TradeInStatus.WithTradeIn ? 'updatedTaxesWithTradeIn' : 'updatedTaxesWithoutTradeIn'

  const addonSum = useMemo(() => {
    const arrayofNumbers = order.accessories?.map(e => e.price)
    return arrayofNumbers && arrayofNumbers?.length > 0 ? arrayofNumbers?.reduce((a, b) => a + b) : 0
  }, [order])

  const saveTaxes = (values: number, closeDialog: () => unknown, itemKey: string) => {
    setApiError(null)
    const requestBody =
      tradeInState === TradeInStatus.WithTradeIn
        ? { updatedTaxesWithTradeIn: { [itemKey]: values }, updatedTaxes: { [itemKey]: values } }
        : { updatedTaxesWithoutTradeIn: { [itemKey]: values }, updatedTaxes: { [itemKey]: values } }

    void mutate(requestBody, {
      onSuccess() {
        closeDialog()
        refetchOrderDetails?.(true, tradeInState)
      },
      onFailure({ error }) {
        const { data } = error as { data: null | Error }
        setApiError(data)
      },
    })
  }
  return (
    <>
      <Item expandable name="Financed Charges" value={calculateFinancedCharges(order, pricing)}>
        <Item name="Fees" className="mt-1" value={calculateTotalAmount(order.fees)} />
        {order.fees.map((fee: Fee) => (
          <Item key={fee.chargeCode} name={fee.chargeDisplayName} value={fee.amount} className="text-muted" />
        ))}

        <div>
          <Item name="Acquisition Fee (Waived with 50bps adder)" value={0} className="text-muted" />
          <Item name="Taxes" value={pricing?.taxTotal} />
          <>
            <Item
              key="taxOnSellingPrice"
              name="Tax On Selling Price"
              editable={
                [OrderState.Available].includes(order.state) && ProductCode.EasyRide !== order.productCode
                  ? 'editPencilWithEraser'
                  : undefined
              }
              value={order[orderKey]?.taxOnSellingPrice ?? pricing?.taxOnSellingPrice}
              className="text-muted"
              loading={loading}
              itemKey="taxOnSellingPrice"
              serverError={apiError}
              onSave={saveTaxes}
            />
            {order.fees.length > 0 && (
              <Item
                key="taxOnDealerFee"
                name="Tax On Dealer Fee"
                itemKey="taxOnDealerFee"
                value={order[orderKey]?.taxOnDealerFee ?? pricing?.taxOnDealerFee}
                className="text-muted"
                serverError={apiError}
                loading={loading}
                onSave={saveTaxes}
                shouldHideOn={[0, undefined, '0', null]}
              />
            )}
            {order.fniProducts.length > 0 && (
              <Item
                key="taxOnFnIProducts"
                name="Tax On FnI Products"
                value={order[orderKey]?.taxOnFnIProducts ?? pricing?.taxOnFnIProducts}
                itemKey="taxOnFnIProducts"
                serverError={apiError}
                className="text-muted"
                loading={loading}
                onSave={saveTaxes}
                shouldHideOn={[0, undefined, '0', null]}
              />
            )}
            {pricing &&
              (order[orderKey]?.taxOnNegativeTradeIn !== undefined || 'taxOnNegativeTradeIn' in pricing) &&
              tradeInState === TradeInStatus.WithTradeIn &&
              calculatedTradeInBalance &&
              calculatedTradeInBalance.tradeInBalance < 0 && (
                <Item
                  key="taxOnNegativeTradeIn"
                  name="Tax On Negative Trade-In"
                  value={order[orderKey]?.taxOnNegativeTradeIn ?? pricing.taxOnNegativeTradeIn}
                  itemKey="taxOnNegativeTradeIn"
                  serverError={apiError}
                  className="text-muted"
                  loading={loading}
                  onSave={saveTaxes}
                  shouldHideOn={[0, undefined, '0', null]}
                />
              )}
          </>
        </div>

        <Item name="Warranty and Protection Products" value={order.fniProductsSum} />
        {order.fniProducts.map(e => (
          <Item name={capitalizeFirstLetter(e.coverageName)} value={e.dealerCost} className="text-muted pr-1" />
        ))}
        {order?.accessories?.length > 0 && <Item name="Add-ons" value={addonSum} />}
        {order?.accessories?.map(e => (
          <Item key={e?.partNo} name={e?.name} value={e?.price} className="text-muted" />
        ))}
      </Item>
    </>
  )
}

export default DealSummary
