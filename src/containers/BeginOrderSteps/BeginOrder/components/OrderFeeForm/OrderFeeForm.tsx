import { Controller, useForm } from 'react-hook-form'
import React, { FC, useEffect, useState, useMemo } from 'react'
import cn from 'classnames'
import Button from '@components/Button'
import Form from '@components/Form'
import Divider from '@components/Divider'
import Text from '@components/Text'
import Currency from '@components/Currency'
import {
  FeeInput,
  FNIProductCoverage,
  FNIProductRate,
  FnIProducts,
  GetPricingDetailsResponse,
  Order,
  OrderDetails,
  ProductCode,
  VehicleDetails,
} from '@common/endpoints/typings.gen'
import { selectErrorMessage } from '@common/utilities/http-api'
import { useSaveFees, useUpdateOrder, OdoStatementEnum } from '@common/endpoints/orderTransitions'
import NumberInput from '@components/NumberInput'
import useConfirm from '@common/utilities/useConfirm'
import { useInventoryUpdate } from '@common/endpoints/useInventory'
import { useLatestPricing } from '@common/endpoints/usePricing'
import ProgressSpinner from '@components/ProgressSpinner'
import RadioGroup, { Radio } from '@components/RadioBoxes'
import useIndividualAgreement from '@common/endpoints/useIndividualizedAgreement'
import SelectableTextArea from '@components/SelectableTextArea'
import { SelectOption } from '@common/utilities/selectOptions'
import FeatureFlag, { Off, On } from '@containers/FeatureFlag'
import Tabs from '@components/Tabs'
import { usePenRates } from '@common/endpoints/useFinanceProducts'
import styles from './OrderFeeForm.module.scss'
import FeeForm from './Forms/feeForm'
import { OrderFeeFormValues as FormValues, orderFormMessages as messages } from './Forms/config'
import FnIForm from './Forms/fniForm'

export interface IOrderFeeFormProps {
  orderId: OrderDetails['_id']
  initialFees: Array<FeeInput>
  internetPrice: number
  onFinish?: () => unknown
  odometer: OrderDetails['odometer']
  dealerFee: Array<FeeInput>
  vin: VehicleDetails['vin']
  pricing: GetPricingDetailsResponse
  order: Order
  refetchOrderDetails: () => unknown
  odoStatement: OrderDetails['odoStatement']
  initialFnI: Array<FnIProducts>
}

const validation = {
  odometer: {
    required: {
      value: true,
      message: 'Odometer reading is required',
    },
    validate: {
      matchesPattern: (value: number) => (value > 0 ? true : messages.zeroError),
    },
  },
  sellingPrice: {
    required: {
      value: true,
      message: 'Selling Price is required',
    },
  },
  odoStatement: {
    required: {
      value: true,
      message: 'Acknowledgement Statement is Required',
    },
  },
  individualizedAgreement: {
    required: {
      value: false,
      message: 'Individualized Agreement is Required',
    },
  },
}

const OrderFeeForm: FC<IOrderFeeFormProps> = ({
  odometer,
  vin,
  internetPrice,
  initialFees,
  orderId,
  onFinish,
  dealerFee,
  order,
  pricing,
  refetchOrderDetails,
  odoStatement: odoDefaultStatement,
  initialFnI,
}) => {
  const [orderFniProducts, setOrderFniProducts] = useState<FnIProducts[]>(initialFnI)
  const [fniProductError, setFniProductError] = useState('')
  const saveFees = useSaveFees()
  const saveOdometer = useUpdateOrder()
  const tabOptions = useMemo(
    () => [
      { label: 'fees', key: 'fees' },
      { label: 'protection products', key: 'protection-products' },
    ],
    [],
  )
  const feeData = initialFees.length > 0 ? initialFees : dealerFee
  const {
    data: { individualizedAgreement: dealerAgreements } = { individualizedAgreement: [] },
  } = useIndividualAgreement(order.order.dealerCode)
  const [selectedAgreement, setAgreement] = useState<SelectOption | null>(null)

  const formMethod = useForm<FormValues>({
    defaultValues: {
      fees: initialFees,
      odometer,
      internetPrice,
      odoStatement: odoDefaultStatement
        ? Object.keys(odoDefaultStatement)?.find(f => odoDefaultStatement[f as keyof typeof odoDefaultStatement]) || ''
        : '',
      fniProducts: orderFniProducts,
    },
  })

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { watch, errors, control, handleSubmit, setValue, formState, setError } = formMethod

  const { isDirty, dirtyFields } = formState
  const feeValues = watch('fees')
  const formValues = watch()
  const { mutate: updateInternetPrice } = useInventoryUpdate('internetPrice')

  const disableSubmit =
    !(formValues?.odometer && formValues?.odometer > 0) ||
    !(formValues?.internetPrice && formValues?.internetPrice > 0) ||
    !formValues.odoStatement
  const allAmounts = feeValues.map((feeRate: FeeInput) => feeRate.amount || 0)
  const totalAmount = allAmounts.reduce((a, b) => a + b, 0)

  const { confirm: showConfirmErrorAddFniProduct } = useConfirm({
    className: styles.confirmPadding,
    message: fniProductError,
    hideAccept: true,
    icon: 'ocross',
    cancelText: 'OK',
  })

  const { confirm: confirmChangeSelection } = useConfirm({
    className: styles.confirmPadding,
    message: 'Are you sure you want to change the selection?  Your changes will be lost.',
    acceptBtnClass: 'utm-orders-btn-confirm-change-agreement-order-dialog',
    icon: 'ocross',
    swapButtons: true,
    onConfirm: () => setValue('individualizedAgreement', selectedAgreement?.label),
    onReject: () => setAgreement(null),
  })

  const { confirm: confirmSubmit } = useConfirm({
    className: styles.confirmPadding,
    message:
      `Are you sure you want to change the selling price from ${internetPrice} to ${formValues.internetPrice}? ` +
      'Please note that all calculations will be updated based on this change.',
    acceptBtnClass: 'utm-orders-btn-confirm-selling-price-order-dialog',
    onConfirm: () => handleSubmit(submit)(),
    icon: 'ocross',
    swapButtons: true,
  })

  const { mutate, data: pricingResponse, isLoading: isPricingLoading } = useLatestPricing()
  const updatedata = () => {
    const makeFee = feeData.map((initial, index) => ({ ...initial, ...formValues.fees[index] }))
    const fnIProductsCost = formValues.fniProducts
      ? orderFniProducts.map((initial, index) => ({ ...initial, ...formValues.fniProducts[index] }))
      : orderFniProducts
    const fees = initialFees.length > 0 ? makeFee : makeFee.filter(f => f.amount)
    const fniProducts = orderFniProducts.length > 0 ? fnIProductsCost : fnIProductsCost?.filter(f => f.dealerCost)
    const req = {
      ...order,
      order: {
        ...order.order,
        pricing: {
          ...order.order.pricing,
          sellingPrice: formValues.internetPrice,
        },
        fees,
        fniProducts,
        dealerFnIProducts: fniProducts,
      },
    }
    void mutate({ orderDetails: req })
  }

  const addFniProduct = (coverage: FNIProductCoverage, fniProduct: FNIProductRate) => {
    const index = orderFniProducts.findIndex(i => i.dealerProductType?.code === String(fniProduct.productType))
    if (index > -1) {
      setFniProductError('You can add only 1 product from each section.')
      showConfirmErrorAddFniProduct()
    } else {
      if (fniProduct.productType !== 7 && fniProduct.productType !== 2) {
        const index = orderFniProducts.findIndex(i => i.dealerProductType.code === '12')
        if (index > -1) {
          setFniProductError('This product is not allowed in combination with other selected product(s).')
          showConfirmErrorAddFniProduct()
          return
        }
        if (fniProduct.productType === 12) {
          const ind = orderFniProducts.findIndex(
            i => i.dealerProductType.code !== '7' && i.dealerProductType.code !== '2',
          )
          if (ind > -1) {
            setFniProductError('This product is not allowed in combination with other selected product(s).')
            showConfirmErrorAddFniProduct()
            return
          }
        }
      }
      const orderFniProduct: FnIProducts = ({} as unknown) as FnIProducts
      orderFniProduct.name = fniProduct.dealerProductDetails.productName
      orderFniProduct.productNameForCustomer = fniProduct.dealerProductDetails.productNameForCustomer
      orderFniProduct.formId = coverage.form.formId
      orderFniProduct.penProductId = fniProduct.productId
      orderFniProduct.rateId = coverage.rateId
      orderFniProduct.sessionId = fniProduct.sessionId
      orderFniProduct.retailPrice = coverage.retailPrice
      orderFniProduct.description = fniProduct.dealerProductDetails.productDescription
      orderFniProduct.mileage = coverage.termsMiles
      orderFniProduct.term = coverage.termsMonths
      orderFniProduct.deductibleAmount = coverage.amount
      orderFniProduct.coverageName = coverage.coverageName
      orderFniProduct.dealerCost = coverage.dealerCost
      orderFniProduct.deductibleType = coverage.deductibleType
      orderFniProduct.deductibleDescription = coverage.description
      orderFniProduct.fiMarkup = coverage.fiMarkup
      orderFniProduct.maxRetailPrice = coverage.maxRetailPrice
      orderFniProduct.minRetailPrice = coverage.minRetailPrice
      orderFniProduct.reducedAmount = coverage.reducedAmount
      orderFniProduct.dealerProductType = {
        code: String(fniProduct.productType),
        displayName: fniProduct.dealerProductDetails.productNameForCustomer,
      }
      orderFniProduct.customerProductType = {
        code: String(fniProduct.productType),
        displayName: fniProduct.dealerProductDetails.productNameForCustomer,
      }

      setOrderFniProducts(orderFniProducts.concat(orderFniProduct))
      setFniProductError('')
    }
  }
  const removeFniProduct = (coverage: FNIProductCoverage) => {
    if (orderFniProducts && orderFniProducts.length > 0) {
      const index = orderFniProducts.findIndex(
        f =>
          f.coverageName.toLowerCase() === coverage.coverageName.toLowerCase() &&
          f.term === coverage.termsMonths &&
          f.mileage === coverage.termsMiles,
      )
      if (index > -1) {
        setOrderFniProducts(orderFniProducts.filter((_, i) => i !== index))
      }
    }
  }

  const handleCancelFniProducts = () => {
    setOrderFniProducts(initialFnI)
  }

  const latestPricing = pricingResponse || pricing

  const penRatesPropsType = useMemo(
    () => ({
      dealerCode: order.vehicle.dealerCode,
      vin,
      mileage: order.vehicle.mileage,
      isNewVehicle: true,
      msrp: order.vehicle.msrp,
      internetPrice: order.vehicle.internetPrice,
      productCode: order.order?.productCode,
      term: latestPricing.term || 0,
      financedTermMileage: order.order.mileage || 0,
      apr: latestPricing.APR || 0,
      financedAmount:
        order?.order?.productCode === ProductCode.Lease
          ? latestPricing?.adjustedCapitalizedCost
          : latestPricing?.amountFinanced || 0,
      vehicleTrim: order.vehicle?.trimDescription || '',
    }),
    [order, vin, latestPricing],
  )
  const { data: penRates, mutate: getPenData, isLoading } = usePenRates(penRatesPropsType)
  useEffect(() => {
    void getPenData(penRatesPropsType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    setOrderFniProducts(initialFnI)
  }, [initialFnI])

  const saveOdometerData = (data: {
    odometer: number
    orderId: string
    internetPrice: number
    odoStatement: {
      OdoReflectsVehicleMileage: boolean
      OdoReflectsExcMechLimits: boolean
      OdoNotActualVehicleMileage: boolean
    }
    individualizedAgreement?: string
  }) =>
    saveOdometer.mutate(data, {
      onSuccess: () => {
        if (dirtyFields.internetPrice && data.internetPrice !== internetPrice) {
          void updateInternetPrice([{ internetPrice: data.internetPrice, vin }], {
            onSuccess: () => {
              void onFinish?.()
              refetchOrderDetails()
            },
            onFailure: ({ error }) => {
              setError('internetPrice', { message: error.data?.message })
            },
          })
        } else {
          void onFinish?.()
        }
      },
    })

  const submit = (values: FormValues) => {
    const makeFee = feeData.map((initial, index) => ({ ...initial, ...values.fees[index] }))
    const fees = initialFees.length > 0 ? makeFee : makeFee.filter(f => f.amount)
    const data = {
      odometer: values.odometer,
      internetPrice: values.internetPrice,
      odoStatement: {
        OdoReflectsVehicleMileage: values.odoStatement === OdoStatementEnum.OdoReflectsVehicleMileage,
        OdoReflectsExcMechLimits: values.odoStatement === OdoStatementEnum.OdoReflectsExcMechLimits,
        OdoNotActualVehicleMileage: values.odoStatement === OdoStatementEnum.OdoNotActualVehicleMileage,
      },
      individualizedAgreement: values.individualizedAgreement,
      orderId,
      dealerFnIProducts: orderFniProducts,
    }
    if (isDirty && dirtyFields.fees && fees.length > 0) {
      void saveFees.mutate(
        { orderId, fees },
        {
          onSuccess: () => {
            void saveOdometerData(data)
          },
        },
      )
    } else {
      void saveOdometerData(data)
    }
  }

  useEffect(() => {
    const defaultAgreement = dealerAgreements?.find(f => f.isDefault)
    setValue('individualizedAgreement', order.order.individualizedAgreement || defaultAgreement?.agreement)
    setAgreement(defaultAgreement ? { value: defaultAgreement._id, label: defaultAgreement.agreement } : null)
  }, [dealerAgreements, setValue, order])
  return (
    <div className="container">
      <div className="row">
        <Form
          className="w-100"
          error={selectErrorMessage(saveFees.error) || errors.internetPrice?.message}
          onSubmit={handleSubmit(submit)}
        >
          <div className="row px-3 py-2">
            <div className="col-sm-12 col-md-6 col-lg-8 py-1">
              <div className={styles.odometerCol}>
                <Controller
                  control={control}
                  name="odometer"
                  rules={validation.odometer}
                  render={({ onChange, ...props }) => (
                    <NumberInput
                      min={0}
                      left
                      placeholder={messages.vendorPlaceholder}
                      fractionDigits={0}
                      label={"Vehicle's Current Odometer Reading"}
                      error={errors?.odometer?.message as string}
                      {...props}
                      onChange={(_, newValue) => {
                        onChange(newValue)
                      }}
                    />
                  )}
                />
              </div>
              <Controller
                control={control}
                name="odoStatement"
                rules={validation.odoStatement}
                render={({ onChange, value, name, ...props }) => (
                  <RadioGroup
                    error={errors.odoStatement?.message}
                    name={name}
                    selectedValue={value as string}
                    onChange={onChange}
                    {...props}
                  >
                    <Radio
                      key={OdoStatementEnum.OdoReflectsVehicleMileage}
                      value={OdoStatementEnum.OdoReflectsVehicleMileage}
                    >
                      {messages[OdoStatementEnum.OdoReflectsVehicleMileage as keyof typeof messages]}
                    </Radio>
                    {messages[OdoStatementEnum.OdoReflectsExcMechLimits] && (
                      <Radio
                        key={OdoStatementEnum.OdoReflectsExcMechLimits}
                        value={OdoStatementEnum.OdoReflectsExcMechLimits}
                      >
                        {messages[OdoStatementEnum.OdoReflectsExcMechLimits as keyof typeof messages]}
                      </Radio>
                    )}
                    <Radio
                      key={OdoStatementEnum.OdoNotActualVehicleMileage}
                      value={OdoStatementEnum.OdoNotActualVehicleMileage}
                    >
                      {messages[OdoStatementEnum.OdoNotActualVehicleMileage as keyof typeof messages]}
                    </Radio>
                  </RadioGroup>
                )}
              />
            </div>
            <div className="col-sm-12 col-md-6 col-lg-4 py-1">
              <div className={styles.sellingPriceCol}>
                <Controller
                  control={control}
                  name="internetPrice"
                  rules={validation.sellingPrice}
                  render={({ onChange, ...props }) => (
                    <NumberInput
                      min={0}
                      left
                      displayName={messages.sellingPrice}
                      placeholder={messages.vendorPlaceholder}
                      fractionDigits={2}
                      label={messages.sellingPrice}
                      error={errors?.internetPrice?.message as string}
                      {...props}
                      onChange={(_, newValue) => {
                        onChange(newValue)
                      }}
                      customOnBlur={updatedata}
                    />
                  )}
                />
                <div className={styles.wrapOverlay}>
                  {isPricingLoading && (
                    <div className={styles.overlay}>
                      <ProgressSpinner size={10} />
                    </div>
                  )}
                  <p className={cn(styles.dueAtSignText, 'pt-2')}>
                    Monthly payment will be <span>${latestPricing?.monthlyPayment || ''}</span>
                  </p>
                  <p className={styles.dueAtSignText}>
                    Due at signing amount will be <span>${latestPricing?.dueAtSigning || ''}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <Divider />
          </div>

          <div className="col-12 py-1">
            <Controller
              control={control}
              name="individualizedAgreement"
              rules={validation.individualizedAgreement}
              render={({ name, value, onChange, ...props }) => (
                <SelectableTextArea
                  label={messages.individualizedAgreement}
                  onTextChange={s => {
                    onChange(s)
                  }}
                  onSelect={s => {
                    const currentAgreement = dealerAgreements?.find(f => f._id === selectedAgreement?.value)
                    setAgreement(s)
                    if (currentAgreement?.agreement !== formValues.individualizedAgreement) {
                      confirmChangeSelection()
                      return
                    }
                    onChange(s.label)
                  }}
                  name={name}
                  error={errors?.individualizedAgreement?.message as string}
                  value={value as string}
                  options={dealerAgreements?.map(option => ({ label: option.agreement, value: option._id })) || []}
                  {...props}
                />
              )}
            />
          </div>
          <div className="col-12">
            <Divider />
          </div>

          <div className="col-xl-8 offset-xl-2 mt-3 mt-md-5 px-0">
            <FeatureFlag flag="tempOrderFniFeeFlag">
              <On>
                <Tabs scrollBtnClass={styles.scrollBtnWrap} overrideClass={styles.overrideTab} items={tabOptions}>
                  <>
                    <FeeForm
                      updatedata={updatedata}
                      feeData={feeData}
                      formMethod={formMethod}
                      internetPrice={internetPrice}
                    />
                  </>
                  <>
                    {isLoading
                      ? 'Loading...'
                      : !!penRates?.length && (
                          <FnIForm
                            updatedata={updatedata}
                            fniData={orderFniProducts}
                            formMethod={formMethod}
                            penRates={penRates}
                            orderFniProducts={orderFniProducts}
                            addFniProduct={addFniProduct}
                            removeFniProduct={removeFniProduct}
                            handleCancelFniProducts={handleCancelFniProducts}
                            orderId={orderId}
                            setOrderFniProducts={setOrderFniProducts}
                          />
                        )}
                  </>
                </Tabs>
              </On>
              <Off>
                <FeeForm
                  updatedata={updatedata}
                  feeData={feeData}
                  formMethod={formMethod}
                  internetPrice={internetPrice}
                />
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
                  <Text className="d-flex justify-content-center font-weight-bold text-danger pt-2 pb-0">
                    {messages.error}
                  </Text>
                ) : null}
              </Off>
            </FeatureFlag>
            <Divider />
            <div className="d-flex justify-content-center pt-3">
              <Button
                type="button"
                onClick={() => {
                  if (dirtyFields.internetPrice) {
                    confirmSubmit()
                  } else {
                    void handleSubmit(submit)()
                  }
                }}
                className="utm-orders-fees-submit-btn"
                disabled={disableSubmit || totalAmount > internetPrice || !!errors.internetPrice?.message}
                loading={(saveFees.status === 'running' || saveOdometer.status === 'running') && 'Saving'}
              >
                {messages.confirm}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default OrderFeeForm
