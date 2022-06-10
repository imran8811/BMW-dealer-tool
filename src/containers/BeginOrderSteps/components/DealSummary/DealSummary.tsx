/* eslint-disable react/jsx-no-literals */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface

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
  const TotalTax =
    order.productCode === ProductCode.Lease
      ? pricing?.totalSalesUseTax + pricing?.taxOnCapitalizedCostReduction
      : pricing?.taxTotal

  const total = TotalFee + TotalTax

  return total
}

// fair -> Finance + Lease
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
    if (order.productCode === ProductCode.Finance && pricing.amountFinanced < dealershipConfig.minimumFinancedAmount) {
      return messages.errors.minFinanceAmountError
    }
    if (order.productCode === ProductCode.Lease && pricing.residualValue + 1 > pricing.adjustedCapitalizedCost) {
      return messages.errors.minFinanceAmountError
    }
    return ''
  }
  const [focusedDeal, setFocusedDeal] = useState(
    order.tradeInVehicle ? TradeInStatus.WithTradeIn : TradeInStatus.WithoutTradeIn,
  )

  const confirmed = useMarkConfirmed()
  const completed = useCompleteOrder()

  const costLabelMessage =
    order.productCode !== ProductCode.Finance ? 'adjusted capitalized cost' : 'total amount financed'
  const error = shouldConfirmOrder()
  return (
    <div className={cls('bg-white p-4 p-xl-5 mb-2 rounded', styles.dealSummary)}>
      <h2 className="section-subheading">{messages.headings.dealSummary}</h2>
      {order.productCode === ProductCode.Lease && (
        <p className={styles.textHighlighted}>
          Below amounts are calculated using RV (${pricing?.residualValue}) and money factor ({pricing?.APR})
        </p>
      )}

      {order.productCode === ProductCode.Finance && (
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
      <List className={order.productCode === ProductCode.Lease ? 'pt-4' : undefined}>
        <Item name="Vehicle price" value={vehicle.internetPrice} />
        <div className="pb-2">
          {order.productCode === ProductCode.Finance && (
            <ListElement
              value={<Currency hideUnit value={pricing?.downPayment} showBrackets />}
              valuePrefix="$"
              name="Down Payment"
            />
          )}
          {order.productCode === ProductCode.Lease && (
            <ListElement
              value={<Currency hideUnit value={pricing?.capitalizedCostReduction} showBrackets />}
              valuePrefix="$"
              name="Capital Cost Reduction"
            />
          )}
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
            {order.productCode === ProductCode.Lease && <Currency value={pricing?.adjustedCapitalizedCost} />}
            {!isOrderLoading && order.productCode === ProductCode.Finance && (
              <Currency value={pricing?.amountFinanced} />
            )}
          </h2>
        </div>
      </div>
      <div className="pb-3">
        <Divider />
      </div>

      {pricing?.downPayment && <Item name="Down Payment" value={pricing.downPayment} />}
      {pricing?.monthlyPayment && <Item name="Monthly Payment" value={pricing.monthlyPayment} />}

      <List>
        {order.productCode !== ProductCode.Finance && (
          <div className="pb-2">
            <Item name="Residual Value" value={pricing?.residualValue} />
          </div>
        )}

        {order.productCode !== ProductCode.Finance && (
          <Item expandable name="Due at Signing" value={pricing?.dueAtSigning}>
            <span>
              <Item name="First Month's payment" className="mt-1" value={pricing.monthlyPayment} />
              <Item className="text-muted" name="Base Monthly payment" value={pricing.baseMonthlyPayment} />
              <Item className="text-muted" name="Sales Tax" value={pricing.monthlySalesUseTax} />
              <Item name="Capitalized Cost Reduction (Cash)" value={pricing.capitalizedCostReduction} />
              <Item name="Security Deposit" value={0} />
              <Item expandable name="Fees" value={0}>
                {/* {order.pricing.fees.map((fee: Fee) => (
                  <Item key={fee.chargeCode} name={fee.chargeDisplayName} value={fee.amount} className="text-muted" />
                ))} */}
              </Item>

              <Item expandable name="Taxes" value={calculateTotalAmount(order.taxes)}>
                {order.taxes.map((tax: Tax) => (
                  <Item
                    key={tax.taxCode}
                    name={tax.taxDisplayName}
                    value={tax.amount}
                    className="text-muted"
                    shouldHideOn={[0, undefined, '0', null]}
                  />
                ))}
              </Item>
              <Item expandable name="Warranty and Protection Products" value={0} />
              <Item expandable name="Additional Charges" value={order.additionalFee} />
            </span>
          </Item>
        )}
        {order.productCode === ProductCode.Finance && <Item name="Due at Signing" value={pricing?.dueAtSigning} />}
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
        const { data } = error
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
        {/* <Item name="License, Title, Registration" value={order?.pricing.licenseTitleReg} className="text-muted" />
            <Item name="Smog" value={order?.pricing.smog} className="text-muted" />
            <Item name="Transfer" value={order?.pricing.transfer} className="text-muted" />
            <Item name="Electronic Title" value={order?.pricing.electronic} className="text-muted" />
            <Item name="Documentation Fee" value={order?.pricing.docFee} className="text-muted" />
            {order.productCode === 'Lease' ? (
            <Item
              name="Acquisition Fee (Waived with 50bps adder)"
              value={order?.pricing.acquisition}
              className="text-muted"
            />
            ) : null} */}
        <div>
          <Item name="Acquisition Fee (Waived with 50bps adder)" value={0} className="text-muted" />
          <Item
            name="Taxes"
            value={
              order.productCode === ProductCode.Lease
                ? pricing?.totalSalesUseTax + pricing?.taxOnCapitalizedCostReduction
                : pricing?.taxTotal
            }
            shouldHideOn={[0, undefined, '0', null]}
          />
          <>
            {order.productCode === ProductCode.Lease && (
              <Item
                key="totalSalesUseTax"
                name="Sales/Use Tax"
                value={pricing?.totalSalesUseTax}
                className="text-muted"
              />
            )}
            {order.productCode === ProductCode.Finance && (
              <>
                <Item
                  key="taxOnSellingPrice"
                  name="Tax On Selling Price"
                  editable={[OrderState.Available].includes(order.state) ? 'editPencilWithEraser' : undefined}
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
            )}
            {order.productCode === ProductCode.Lease && (
              <>
                <Item
                  name="Tax on Capitalized Cost Reduction"
                  key="taxOnCapitalizedCostReduction"
                  value={pricing?.taxOnCapitalizedCostReduction}
                  className="text-muted"
                  loading={loading}
                  shouldHideOn={[0, undefined, '0', null]}
                />
                {'taxOnPositiveTradeIn' in pricing && (
                  <Item
                    name="Tax On Positive Trade-In"
                    key="taxOnPositiveTradeIn"
                    value={pricing?.taxOnPositiveTradeIn}
                    className="text-muted"
                    shouldHideOn={[0, undefined, '0', null]}
                  />
                )}
              </>
            )}
          </>
        </div>

        <Item name="Warranty and Protection Products" value={order.fniProductsSum} />
        {order.fniProducts.map(e => (
          <Item name={capitalizeFirstLetter(e.coverageName)} value={e.dealerCost} className="text-muted pr-1" />
        ))}
        {/* <Item name="Additional Charges" value={0} /> */}
        {order?.accessories?.length > 0 && <Item name="Add-ons" value={addonSum} />}
        {order?.accessories?.map(e => (
          <Item key={e?.partNo} name={e?.name} value={e?.price} className="text-muted" />
        ))}
      </Item>
    </>
  )
}

export default DealSummary
