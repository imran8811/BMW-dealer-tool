import { FC, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import cls from 'classnames'

import {
  CodeDisplayName,
  ReferenceData,
  ScheduledOptions,
  SetDealerRequest,
  SpecificMinimumFinances,
} from '@common/endpoints/typings.gen'
import { useIsSuperUser } from '@common/utilities/useUser'
import { SelectOption } from '@common/utilities/selectOptions'
import { additionalInfoOptions, referenceDataToOptions } from '@common/endpoints/useReferenceData'
import {
  useDealershipGeneralConfigurationUpdate,
  DealershipGeneralConfigType,
  registerDealerEndpoint,
  unregisterPenDealerEndpoint,
  updatePenDealerEndpoint,
  TimeZones,
  invalidateGenConfig,
} from '@common/endpoints/useDealershipConfiguration'
import Input from '@components/Input/Input'
import Button from '@components/Button/Button'
import MaskedInput from '@components/MaskedInput'
import NumberInput from '@components/NumberInput'
import Form from '@components/Form'
import Select from '@components/Select'
import MultiSelect from '@components/MultiSelect'
import ToolTip from '@components/Tooltip'
import { selectErrorMessage, sendForm } from '@common/utilities/http-api'
import useDealerships from '@common/endpoints/useDealerships'
import useMutation from 'use-mutation'
import { websiteUrlRegex, zipCodeRegex } from '@common/utilities/constants'
import { useTenantFeatureFlags, useFniFeature } from '@common/utilities/tenantFeaturesFlags'
import { useModal } from 'react-modal-hook'
import { FinancedLimitByModelForm } from '../Product'
import styles from './General.module.scss'

export interface GeneralConfigurationProps {
  dealerCode: string
  initialValues: Partial<DealershipGeneralConfigType>
  referenceData: ReferenceData['lookups'][]
}
export enum PenAction {
  Register = 'REGISTER',
  Update = 'UPDATE',
  Unregister = 'UNREGISTER',
}

const messages = {
  labels: {
    general: 'General',
  },
  phoneNumber: {
    mask: '999 - 999 - 9999',
    placeholder: '000 - 000 - 0000',
  },
  zipCode: {
    mask: '99999?-9999',
    placeholder: '00000-0000',
  },
  typehere: 'Type Here..',
  input: {
    availableProducts: 'Available Products',
    defaultProduct: 'Default Product',
    assetsAutoPublished: 'should Assets be automatically listed?',
    defaultMileageOnVDP: 'Default mileage on VDP',
    defaultLeaseTermsOnVDP: 'Default lease term on VDP',
    defaultFinanceTermsOnVDP: 'Default Finance Term on VDP',
    leaseDownPaymentLowerLimit: 'Down Payment Lower Limit (Lease)',
    financeDownPaymentLowerLimit: 'Down Payment Lower Limit (Finance)',
    minimumFinancedAmount: 'Minimum financed amount',
    defaultDownPayment: 'Default down payment',
    scheduledOptions: 'Schedule options',
    dealerTimezone: 'time zone',
    contactNumber: 'Contact number',
    customerSupportNumber: 'Customer support number',
    zipCode: 'Zip',
    city: 'City',
    state: 'State',
    dealershipAddress: 'Dealership Address',
    contactName: 'Contact Name',
    fax: 'Fax Number',
    website: 'Website',
    observesDayLightSaving: 'Does this Dealership observe Daylight Saving?',
    county: 'County',
    email: 'Email Address',
  },
  button: {
    save: 'Save',
    saving: 'Saving…',
    registerPen: 'Register with Pen',
    unregisterPen: 'UnRegister with Pen',
    update: 'Update Pen Info',
  },
  select: {
    assetsAutoPublishedTrue: 'Yes',
    assetsAutoPublishedFalse: 'No',
  },
  validation: {
    availableProducts: 'Select available products',
    defaultProduct: 'Default Product is required',
    assetsAutoPublished: 'Select an Asset Auto Published option',
    defaultMileageOnVDP: 'Default mileage on vdp required',
    defaultLeaseTermsOnVDP: 'Default lease term on vdp required',
    defaultFinanceTermsOnVDP: 'Default Finance Term on VDP required',
    leaseDownPaymentLowerLimit: 'Lease Down Payment Products Required',
    financeDownPaymentLowerLimit: 'Finance Down Payment Required',
    minimumFinancedAmount: 'Minimum financed amount is required',
    defaultDownPayment: 'Default down payment value is required',
    scheduledOptions: 'Schedule options required',
    dealerTimezone: 'Dealer time zone required',
    contactNumber: 'Contact Number Required',
    customerSupportNumber: 'Customer Service Number Required',
    zipCode: 'Zip Code Required',
    city: 'City Required',
    state: 'State Required',
    dealershipAddress: 'Dealership Address Required',
    contactName: 'Contact Name Required',
    fax: 'Fax Number Required',
    website: 'Website Required',
    observesDayLightSaving: 'Daylight Saving Required',
    county: 'County Required',
  },
}

const validatePattern = (value: string | undefined, regex: RegExp, displaymsg: keyof typeof messages.validation) => {
  const regexp = regex
  if (value && !regexp.exec(value)) {
    return messages.validation[displaymsg]
  }
  return true
}

const getValidation = (name: keyof typeof messages.validation, validationMessage?: string, regExp?: RegExp) => ({
  required: {
    value: true,
    message: messages.validation[name],
  },
  validate:
    validationMessage && regExp
      ? {
          matchesPattern: (value: string | undefined) => {
            if (value && !regExp.exec(value)) {
              return validationMessage
            }
            return true
          },
        }
      : undefined,
})
const getValidationMileage = (name: keyof typeof messages.validation, required: boolean) => ({
  required: {
    value: required,
    message: messages.validation[name],
  },
})
const getValidationMinFinancedAmount = (name: keyof typeof messages.validation) => ({
  required: {
    value: true,
    message: messages.validation[name],
  },
  validate: {
    matchesPattern: (value: number) => (value > 0 ? true : 'Value should be greater than zero'),
  },
})

const webValidation = {
  required: {
    value: true,
    message: messages.validation.website,
  },
  validate: {
    matchesPattern: (value: string | undefined) => validatePattern(value, websiteUrlRegex, 'website'),
  },
}

/**
 * Fields that we need to change in order to map it with `<select>` values
 */
type FormTypeOverrides = {
  defaultProduct: CodeDisplayName['code']
  availableProducts: CodeDisplayName['code'][]
  state: CodeDisplayName['code']
  assetsAutoPublished: CodeDisplayName['code']
  observesDayLightSaving: boolean | string | undefined
}

type FormType = Omit<DealershipGeneralConfigType, keyof FormTypeOverrides> & FormTypeOverrides
type PenFormType = Omit<FormType, 'observesDayLightSaving'> & {
  observesDayLightSaving: string
}
const General: FC<GeneralConfigurationProps> = ({ dealerCode, initialValues, referenceData }) => {
  const isSuperUser = useIsSuperUser()
  const { mutate: update, error, isLoading } = useDealershipGeneralConfigurationUpdate(dealerCode)
  const { pageData } = useDealerships({ pageSize: 100 })
  const dealerData = useMemo(() => pageData.find(f => f.dealerCode === dealerCode), [pageData, dealerCode])
  const { isModuleAccessible: isPenEnabled } = useFniFeature(dealerCode)
  const { isFinanceByModelEnabled } = useTenantFeatureFlags()

  const defaultValues = useMemo<FormType>(
    () => ({
      assetsAutoPublished: initialValues?.assetsAutoPublished ? 'true' : 'false',
      availableProducts: initialValues?.availableProducts?.map(({ code }) => code) || [],
      city: initialValues?.city || '',
      contactNumber: initialValues?.contactNumber || '',
      customerSupportNumber: initialValues?.customerSupportNumber || '',
      dealershipAddress: initialValues?.dealershipAddress || '',
      dealerTimezone: initialValues?.dealerTimezone || '',
      defaultDownPayment: initialValues?.defaultDownPayment || 0,
      defaultFinanceTermsOnVDP: initialValues?.defaultFinanceTermsOnVDP || 0,
      defaultLeaseTermsOnVDP: initialValues?.defaultLeaseTermsOnVDP || 0,
      defaultMileageOnVDP: initialValues?.defaultMileageOnVDP || 0,
      defaultProduct: initialValues?.defaultProduct?.code || '',
      financeDownPaymentLowerLimit: initialValues?.financeDownPaymentLowerLimit || 0,
      leaseDownPaymentLowerLimit: initialValues?.leaseDownPaymentLowerLimit || 0,
      minimumFinancedAmount: initialValues?.minimumFinancedAmount || 0,
      scheduledOptions: initialValues?.scheduledOptions || ScheduledOptions.PickupDelivery,
      state: initialValues?.state?.code || '',
      zipCode: initialValues?.zipCode || '',
      county: initialValues?.county || '',
      specificMinimumFinances: initialValues.specificMinimumFinances,
      /**
       * Pen Related New Fields
       */
      contactName: initialValues?.contactName || '',
      fax: initialValues?.fax as number,
      website: initialValues?.website || '',
      observesDayLightSaving: initialValues?.observesDayLightSaving ? 'Yes' : 'No',
      penDealerId: initialValues?.penDealerId as number,
    }),
    [initialValues],
  )

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register, errors, control, formState, watch, setValue, reset } = useForm<FormType>({
    defaultValues,
  })
  const { isDirty } = formState
  const usaStates = referenceDataToOptions(referenceData[0])
  const finantialProducts = referenceDataToOptions(referenceData[1])
  const compatibleModels = referenceDataToOptions(referenceData[6])

  /**
   * `Timezones` Need to be updated at backend in the `reference data`
   *  Hard Coded Timezones will be used till API is fixed
   */
  // const timeZones = timeZoneOptions(referenceData[2])
  const defaultFinanceTerms = additionalInfoOptions(referenceData[3])
  const defaultLeaseTerms = additionalInfoOptions(referenceData[4])
  // const defaultMileage = additionalInfoOptions(referenceData[5])

  const watchDealershipAddress = watch('dealershipAddress', defaultValues.dealershipAddress)
  const watchAvailableProducts = watch('availableProducts', defaultValues.availableProducts)
  const defaultProductOptions: Array<SelectOption> = finantialProducts.filter(
    ({ value }) => watchAvailableProducts.includes(`${value}`), // only allow available product as a default one
  )
  const defaultMileageOptions = defaultProductOptions.find(e => e.value === 'Lease')
    ? additionalInfoOptions(referenceData[5])
    : []

  const makeReqObject = (values: FormType) => {
    const stateOption = usaStates.find(({ value }) => value === values.state)
    const state: CodeDisplayName | undefined = stateOption
      ? { code: `${stateOption.value}`, displayName: stateOption.label || '' }
      : initialValues?.state || { code: '', displayName: '' }
    const availableProducts = finantialProducts
      .filter(({ value }) => values.availableProducts.includes(`${value}`))
      .map(({ value, label }) => ({ code: `${value}`, displayName: label || '' }))
    const defaultProductOption = defaultProductOptions.find(({ value }) => value === values.defaultProduct)
    const defaultProduct: CodeDisplayName = defaultProductOption
      ? { code: `${defaultProductOption.value}`, displayName: defaultProductOption.label || '' }
      : initialValues?.defaultProduct || { code: '', displayName: '' }
    return {
      defaultProduct,
      state,
      availableProducts,
    }
  }
  const saveGeneralConfiguration = (values: FormType) => {
    const { defaultProduct, state, availableProducts } = makeReqObject(values)
    const resolveOverrides: Pick<DealershipGeneralConfigType, keyof FormTypeOverrides> = {
      defaultProduct,
      state,
      availableProducts,
      observesDayLightSaving: values.observesDayLightSaving === 'Yes',
      assetsAutoPublished: values.assetsAutoPublished === 'true',
    }

    void update({ ...values, ...resolveOverrides }).then(() => {
      return reset(values)
    })
  }

  const createPenReqObject = (values: PenFormType | FormType, action: PenAction) => {
    return {
      action,
      penDealerId: action === PenAction.Register ? 0 : initialValues?.penDealerId,
      dealerCode,
      dealershipName: dealerData?.name || '',
      address1: values.dealershipAddress,
      address2: '',
      city: values.city,
      state: values.state,
      zipCode: values.zipCode.toString().split('_')[0],
      phone: values.contactNumber,
      fax: values.fax || '',
      email: dealerData?.email || '',
      contactName: values.contactName,
      website: values.website,
      timeZone: values.dealerTimezone,
      observesDayLightSaving: values.observesDayLightSaving === 'Yes',
      isTestDealer: false,
    }
  }

  const [unRegisterDealerPen, { error: unRegisterError, status: unRegisterStatus }] = useMutation<
    FormType,
    SetDealerRequest,
    Error
  >(
    (values): Promise<SetDealerRequest> => {
      const reqObj = createPenReqObject(values, PenAction.Unregister)
      return sendForm<SetDealerRequest>(unregisterPenDealerEndpoint, reqObj, {
        withAuthentication: true,
        method: 'PUT',
      })
    },
    {
      onSuccess() {
        invalidateGenConfig(dealerCode)
      },
    },
  )

  const [updateDealerPen, { error: updatePenError, status: updatePenStatus }] = useMutation<
    FormType,
    SetDealerRequest,
    Error
  >(
    (values): Promise<SetDealerRequest> => {
      const reqObj = createPenReqObject(values, PenAction.Update)
      return sendForm<SetDealerRequest>(updatePenDealerEndpoint, reqObj, {
        withAuthentication: true,
        method: 'PUT',
      })
    },
    {
      onSuccess() {
        invalidateGenConfig(dealerCode)
      },
    },
  )

  const [registerDealerPen, { error: registerPenError, status: registerPenStatus }] = useMutation<
    FormType,
    SetDealerRequest,
    Error
  >(
    (values): Promise<SetDealerRequest> => {
      const reqObj = createPenReqObject(values, PenAction.Register)
      return sendForm<SetDealerRequest>(registerDealerEndpoint, reqObj, {
        withAuthentication: true,
        method: 'POST',
      })
    },
    {
      onSuccess() {
        invalidateGenConfig(dealerCode)
      },
    },
  )

  const [showFinanceForm, onHideFinanceForm] = useModal(
    () => (
      <FinancedLimitByModelForm
        compatibleModels={compatibleModels}
        onHide={onHideFinanceForm}
        dealerCode={dealerCode}
        specificMinimumFinances={initialValues.specificMinimumFinances}
      />
    ),
    [dealerCode, compatibleModels, initialValues],
  )

  /**
   * Temporary `Timezone` Solution till the API is resolved
   */
  const timeZones = useMemo(() => {
    const zone = Object.keys(TimeZones) as Array<keyof typeof TimeZones>
    return zone.map(e => ({
      label: TimeZones[e] as string,
      value: TimeZones[e] as string,
    }))
  }, [])

  const specialFinancedModels = useMemo(() => {
    const models: string[] =
      initialValues.specificMinimumFinances?.reduce((prev: string[], curr: SpecificMinimumFinances) => {
        const models = curr.compatibleModels.map(e => e.displayName)
        return [...prev, ...models]
      }, []) || []
    return models.length > 0 ? `(${[...new Set(models)].sort((a, b) => a.localeCompare(b)).join(', ')})` : ''
  }, [initialValues])

  return (
    <Form
      onSubmit={handleSubmit(saveGeneralConfiguration)}
      error={
        (error && selectErrorMessage(error)) ||
        (updatePenError && selectErrorMessage(updatePenError)) ||
        (registerPenError && selectErrorMessage(registerPenError)) ||
        (unRegisterError && selectErrorMessage(unRegisterError))
      }
      className="container bg-white rounded p-xl-5 p-lg-5 p-4"
    >
      <h2 className="section-subheading">{messages.labels.general}</h2>
      <div className="row">
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Controller
            control={control}
            name="availableProducts"
            rules={getValidation('availableProducts')}
            render={({ onChange, name, value }) => (
              <MultiSelect
                name={name}
                label={messages.input.availableProducts}
                value={value as Array<CodeDisplayName['code']>}
                onChange={(e: { value: CodeDisplayName['code'] }) => {
                  onChange(e.value)
                }}
                options={finantialProducts}
              />
            )}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Select
            error={errors?.defaultProduct?.message}
            ref={register(getValidation('defaultProduct'))}
            label={messages.input.defaultProduct}
            name="defaultProduct"
            options={defaultProductOptions}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Select
            error={errors?.assetsAutoPublished?.message}
            ref={register(getValidation('assetsAutoPublished'))}
            label={messages.input.assetsAutoPublished}
            name="assetsAutoPublished"
            options={[
              { label: messages.select.assetsAutoPublishedTrue, value: 'true' },
              { label: messages.select.assetsAutoPublishedFalse, value: 'false' },
            ]}
          />
        </div>
        {isSuperUser && (
          <>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Select
                error={errors?.defaultMileageOnVDP?.message}
                ref={register(getValidationMileage('defaultMileageOnVDP', defaultMileageOptions.length > 0))}
                label={messages.input.defaultMileageOnVDP}
                name="defaultMileageOnVDP"
                // options={defaultMileage}
                options={defaultMileageOptions}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Select
                error={errors?.defaultLeaseTermsOnVDP?.message}
                ref={register(getValidation('defaultLeaseTermsOnVDP'))}
                label={messages.input.defaultLeaseTermsOnVDP}
                name="defaultLeaseTermsOnVDP"
                options={defaultLeaseTerms}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Select
                error={errors?.defaultFinanceTermsOnVDP?.message}
                ref={register(getValidation('defaultFinanceTermsOnVDP'))}
                label={messages.input.defaultFinanceTermsOnVDP}
                name="defaultFinanceTermsOnVDP"
                options={defaultFinanceTerms}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Controller
                control={control}
                name="leaseDownPaymentLowerLimit"
                rules={getValidation('leaseDownPaymentLowerLimit')}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    mode="percentage"
                    label={messages.input.leaseDownPaymentLowerLimit}
                    name={name}
                    max={100}
                    error={errors?.leaseDownPaymentLowerLimit?.message}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                    }}
                  />
                )}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Controller
                control={control}
                name="financeDownPaymentLowerLimit"
                rules={getValidation('financeDownPaymentLowerLimit')}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    mode="percentage"
                    label={messages.input.financeDownPaymentLowerLimit}
                    name={name}
                    max={100}
                    error={errors?.financeDownPaymentLowerLimit?.message}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                    }}
                  />
                )}
              />
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6 flex-column', styles.configColumn)}>
              <Controller
                control={control}
                name="minimumFinancedAmount"
                rules={getValidationMinFinancedAmount('minimumFinancedAmount')}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    containerClass={isFinanceByModelEnabled ? 'mb-0' : ''}
                    mode="currency"
                    // currency="USD"
                    // min={0}
                    max={100000}
                    min={1}
                    name={name}
                    label={messages.input.minimumFinancedAmount}
                    error={errors?.minimumFinancedAmount?.message}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                    }}
                  />
                )}
              />
              {isFinanceByModelEnabled && (
                <ToolTip
                  data={specialFinancedModels}
                  id="special-financed-limit"
                  className={cls(styles.modelListLink, 'mr-auto mb-0')}
                  onClick={showFinanceForm}
                  position="bottom"
                  element="p"
                >
                  Add Special Financed Limit <span>{specialFinancedModels}</span>
                </ToolTip>
              )}
            </div>
            <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
              <Controller
                control={control}
                name="defaultDownPayment"
                rules={getValidation('defaultDownPayment')}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    mode="percentage"
                    name={name}
                    max={20}
                    label={messages.input.defaultDownPayment}
                    error={errors?.defaultDownPayment?.message}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                    }}
                  />
                )}
              />
            </div>
          </>
        )}
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Select
            error={errors?.scheduledOptions?.message}
            ref={register(getValidation('scheduledOptions'))}
            label={messages.input.scheduledOptions}
            name="scheduledOptions"
            options={Object.values(ScheduledOptions)}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Controller
            control={control}
            name="contactNumber"
            rules={getValidation('contactNumber')}
            render={({ onChange, name, value }) => (
              <MaskedInput
                label={messages.input.contactNumber}
                name={name}
                mask={messages.phoneNumber.mask}
                placeholder={messages.phoneNumber.placeholder}
                error={errors?.contactNumber?.message}
                value={`${(value as string) || ''}`}
                onChange={(e: { value: number }) => {
                  onChange(e.value)
                }}
              />
            )}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Controller
            control={control}
            name="customerSupportNumber"
            rules={getValidation('customerSupportNumber')}
            render={({ onChange, name, value }) => (
              <MaskedInput
                label={messages.input.customerSupportNumber}
                name={name}
                mask={messages.phoneNumber.mask}
                placeholder={messages.phoneNumber.placeholder}
                error={errors?.customerSupportNumber?.message}
                value={`${(value as string) || ''}`}
                onChange={(e: { value: number }) => {
                  onChange(e.value)
                }}
              />
            )}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Select
            error={errors?.dealerTimezone?.message}
            ref={register(getValidation('dealerTimezone'))}
            label={messages.input.dealerTimezone}
            name="dealerTimezone"
            options={timeZones}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Controller
            control={control}
            name="fax"
            rules={getValidation('fax')}
            render={({ onChange, name, value }) => (
              <MaskedInput
                label={messages.input.fax}
                name={name}
                mask={messages.phoneNumber.mask}
                placeholder={messages.phoneNumber.placeholder}
                error={errors?.fax?.message}
                value={`${(value as string) || ''}`}
                onChange={(e: { value: number }) => {
                  onChange(e.value)
                }}
              />
            )}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Input label={messages.input.email} name="emailNoEdit" disabled value={dealerData?.email || ''} />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Input
            error={errors?.website?.message}
            ref={register(webValidation)}
            name="website"
            label={messages.input.website}
            placeholder={messages.typehere}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Input
            error={errors?.contactName?.message}
            ref={register(getValidation('contactName'))}
            name="contactName"
            label={messages.input.contactName}
            placeholder={messages.typehere}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Select
            error={errors?.observesDayLightSaving?.message}
            ref={register(getValidation('observesDayLightSaving'))}
            label={messages.input.observesDayLightSaving}
            name="observesDayLightSaving"
            options={['Yes', 'No'].map(e => ({ label: e, value: e }))}
          />
        </div>
      </div>
      <div className="row">
        <div className={cls('col-xl-6 col-lg-6 col-md-12 col-sm-12', styles.configColumn)}>
          <Input
            error={errors?.dealershipAddress?.message}
            ref={register(getValidation('dealershipAddress'))}
            name="dealershipAddress"
            label={messages.input.dealershipAddress}
            onClear={
              watchDealershipAddress
                ? () => {
                    setValue('dealershipAddress', '')
                  }
                : undefined
            }
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Input
            label={messages.input.city}
            name="city"
            ref={register(getValidation('city'))}
            error={errors?.city?.message}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Select
            label={messages.input.state}
            options={usaStates}
            name="state"
            ref={register(getValidation('state'))}
            error={errors?.state?.message}
          />
        </div>
      </div>
      <div className="row">
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Controller
            control={control}
            name="zipCode"
            rules={getValidation('zipCode', `Valid ${messages.validation.zipCode}`, zipCodeRegex)}
            render={({ onChange, name, value }) => (
              <MaskedInput
                label={messages.input.zipCode}
                name={name}
                mask={messages.zipCode.mask}
                placeholder={messages.zipCode.placeholder}
                error={errors?.zipCode?.message}
                value={`${(value as string) || ''}`}
                onChange={(e: { value: number }) => {
                  onChange(e.value)
                }}
              />
            )}
          />
        </div>
        <div className={cls('col-xl-3 col-lg-4 col-md-6 col-sm-6', styles.configColumn)}>
          <Input
            label={messages.input.county}
            name="county"
            ref={register(getValidation('county'))}
            error={errors?.county?.message}
          />
        </div>
      </div>
      <div className={cls([styles.wrap, 'pt-4 justify-content-center'])}>
        <div className="p-1">
          <Button
            type="submit"
            secondary={!isDirty}
            loading={
              (!isDirty && messages.button.save) ||
              (isLoading &&
                messages.button.saving &&
                (registerPenStatus !== 'running' || unRegisterStatus !== 'running' || updatePenStatus !== 'running'))
            }
          >
            {messages.button.save}
          </Button>
        </div>
        <div className="p-1">
          <Button
            onClick={() => {
              /** On clicking this Button we will save the configurations and then
               * `register` with those configurations at `PEN`
               *
               * On Clicking UnRegister it will `un register` from `PEN`
               */
              if (!isPenEnabled) {
                return
              }
              void handleSubmit(data => {
                saveGeneralConfiguration(data)
                if (initialValues.penDealerId) {
                  void unRegisterDealerPen(data)
                } else {
                  void registerDealerPen(data)
                }
              })()
            }}
            secondary={initialValues.defaultProduct ? undefined : true}
            disabled={initialValues.defaultProduct && isPenEnabled ? undefined : true}
            loading={(registerPenStatus === 'running' || unRegisterStatus === 'running') && messages.button.saving}
          >
            {initialValues?.penDealerId ? messages.button.unregisterPen : messages.button.registerPen}
          </Button>
        </div>
        <div className="p-1">
          <Button
            onClick={() => {
              /**
               * On clicking this Button we will `Update General Configuration`  and
               * `Update PEN settings` as well
               */
              if (!isPenEnabled) {
                return
              }
              void handleSubmit(data => {
                saveGeneralConfiguration(data)
                void updateDealerPen(data)
              })()
            }}
            secondary={initialValues?.penDealerId && isDirty ? undefined : true}
            disabled={initialValues?.penDealerId && isDirty && isPenEnabled ? undefined : true}
            loading={(!isDirty && messages.button.update) || (updatePenStatus === 'running' && messages.button.saving)}
          >
            {messages.button.update}
          </Button>
        </div>
      </div>
    </Form>
  )
}

export default General
