import { Controller, useForm } from 'react-hook-form'
import React, { FC, useEffect, useState } from 'react'
import cn from 'classnames'
import Button from '@components/Button'
import Form from '@components/Form'
import Divider from '@components/Divider'
import Text from '@components/Text'
import Currency from '@components/Currency'
import Input from '@components/Input'
import { FeeInput, GetPricingDetailsResponse, Order, OrderDetails, VehicleDetails } from '@common/endpoints/typings.gen'
import { selectErrorMessage } from '@common/utilities/http-api'
import { useSaveFees, useUpdateOrder, OdoStatementEnum } from '@common/endpoints/orderTransitions'
import NumberInput from '@components/NumberInput'
import SectionHeading from '@components/SectionHeading'
import { useMediaQuery } from '@react-hook/media-query'
import { breakpointUp } from '@common/utilities/mediaQueries'
import useConfirm from '@common/utilities/useConfirm'
import { useInventoryUpdate } from '@common/endpoints/useInventory'
import { useLatestPricing } from '@common/endpoints/usePricing'
import ProgressSpinner from '@components/ProgressSpinner'
import RadioGroup, { Radio } from '@components/RadioBoxes'
import useIndividualAgreement from '@common/endpoints/useIndividualizedAgreement'
import SelectableTextArea from '@components/SelectableTextArea'
import { SelectOption } from '@common/utilities/selectOptions'
import OdoStatement from './OdoStatement'
import styles from './OrderFeeForm.module.scss'

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
}

const messages = {
  amount: 'amount ($)',
  vendor: 'vendor',
  confrim: 'confirm',
  fee: 'Fees',
  error: 'Total amount should not be greater than vehicle price',
  total: 'TOTAL',
  vendorPlaceholder: 'Type here...',
  zeroError: 'Value should be greater than zero',
  sellingPrice: 'Selling price ($)',
  individualizedAgreement: 'individualized agreement',
  ...OdoStatement,
}

type FormValues = {
  fees: FeeInput[]
  odometer: number
  internetPrice: number
  odoStatement: string
  individualizedAgreement: string
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
}) => {
  const saveFees = useSaveFees()
  const saveOdometer = useUpdateOrder()
  const feeData = initialFees.length > 0 ? initialFees : dealerFee
  const {
    data: { individualizedAgreement: dealerAgreements } = { individualizedAgreement: [] },
  } = useIndividualAgreement(order.order.dealerCode)
  const [selectedAgreement, setAgreement] = useState<SelectOption | null>(null)

  const { register, watch, errors, control, handleSubmit, setValue, formState, setError } = useForm<FormValues>({
    defaultValues: {
      fees: initialFees,
      odometer,
      internetPrice,
      odoStatement: odoDefaultStatement
        ? Object.keys(odoDefaultStatement)?.find(f => odoDefaultStatement[f as keyof typeof odoDefaultStatement]) || ''
        : '',
    },
  })

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
  const displayAsTable = useMediaQuery(breakpointUp('sm'))

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

  const { mutate, data: pricingResponse, status: isPricingLoading } = useLatestPricing()

  const updatedata = () => {
    const makeFee = feeData.map((initial, index) => ({ ...initial, ...formValues.fees[index] }))
    const fees = initialFees.length > 0 ? makeFee : makeFee.filter(f => f.amount)
    const req = {
      ...order,
      order: {
        ...order.order,
        pricing: {
          ...order.order.pricing,
          sellingPrice: formValues.internetPrice,
        },
        fees,
      },
    }
    void mutate({ orderDetails: req })
  }

  const latestPricing = pricingResponse || pricing

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
                  {isPricingLoading === 'running' && (
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
            <SectionHeading>{messages.fee}</SectionHeading>
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
                  <div
                    key="vendor"
                    className={`col-8 col-sm-4 d-flex flex-row align-items-center pr-2 pb-2 ${styles.cell}`}
                  >
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
              <Text className="d-flex justify-content-center font-weight-bold text-danger pt-2 pb-0">
                {messages.error}
              </Text>
            ) : null}
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
                {messages.confrim}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default OrderFeeForm
