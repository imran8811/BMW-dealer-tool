import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import cls from 'classnames'
import Form from '@components/Form'
import Select from '@components/Select'
import Input from '@components/Input'
import Button from '@components/Button'
import { DealerFnIProduct, DealershipGeneralConfig, PenProduct, PenProvider } from '@common/endpoints/typings.gen'
import { selectErrorMessage, sendForm } from '@common/utilities/http-api'
import NumberInput from '@components/NumberInput'
import {
  endpointSaveProduct,
  invalidateProducts,
  DealerFnIProductType,
  useProductByProvider,
} from '@common/endpoints/useFinanceProducts'
import ProgressSpinner from '@components/ProgressSpinner'
import SelectOptions, { SelectOption } from '@common/utilities/selectOptions'
import useMutation from 'use-mutation'
import { PenAction } from '@containers/ConfigurationsContainer/components/General/General'
import Upload, { ImageSelection } from '@components/Upload'
import { websiteUrlRegex } from '@common/utilities/constants'
import Icon from '@components/Icon'
import styles from '../product.module.scss'

const messages = {
  input: {
    name: 'PRODUCT NAME',
    productType: 'PRODUCT TYPE',
    tenantProductType: (tenantName: string) => `${tenantName} Product Type`,
    providerName: 'PROVIDER NAME',
    description: 'PRODUCT DESCRIPTION',
    markup: 'Markup Value',
    customerProductName: 'PRODUCT Name For Customer',
    urlName: 'URL Name',
    productUrl: 'Product URL',
    images: 'Upload product Images',
    markupType: 'Markup type',
    providerDealerCode: 'Provider Dealer Code',
  },
  markupInfo: 'This value can be negative as well',
  button: {
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    addMore: 'add more',
  },
  placeholder: {
    typehere: 'Type Here...',
    select: 'Select',
    url: 'www.sample.com',
  },
  validation: {
    nameRequired: 'Product Name is Required',
    productTypeRequired: 'Product Type is Required',
    providerNameRequired: 'Provider Name is Required',
    descriptionRequired: 'Description is Required',
    markupRequired: 'Markup is Required',
    customerProductName: 'Product Name For Customer is Required',
    imagesRequired: 'Product Images are Required',
    markupTypeRequired: 'Markup Type is Required',
    providerDealerCode: 'Provider Dealer Code is Required',
    urlNameRequired: 'URL Name is Required',
    productUrlRequired: 'Valid Product URL is Required',
    tenantProductTypeRequired: 'Product Type is Required',
    validProductUrlMissing: 'This is not a valid URL',
  },
}

const markupTypeOption = ['Percentage']

const validation = (field: keyof typeof messages.validation, required: boolean, tenant?: string) => ({
  required: {
    value: required,
    message: `${tenant ? `${tenant} ` : ''}${messages.validation[field]}`,
  },
})

const customValidation = (required: boolean) => ({
  productUrl: {
    required: {
      value: false,
      message: messages.validation.productUrlRequired,
    },
    validate: {
      matchesPattern: (value: string | undefined) => {
        if (value && !websiteUrlRegex.exec(value)) {
          return messages.validation.validProductUrlMissing
        }
        if (!value && required) {
          return messages.validation.productUrlRequired
        }
        return true
      },
    },
  },
  productname: {
    required: {
      value: false,
      message: messages.validation.urlNameRequired,
    },
    validate: {
      matchesPattern: (value: string | undefined) => {
        if (!value && required) {
          return messages.validation.urlNameRequired
        }
        return true
      },
    },
  },
})
type FinanceFormProps = {
  onFormClose: () => void
  productData?: DealerFnIProductType | null
  providers?: PenProvider[]
  providerError?: Error
  dealerCode: string
  dealerConfig: DealershipGeneralConfig | undefined
  tenantProductTypeOptions: SelectOption[] | []
}

type FormValues = Pick<DealerFnIProduct, 'productName' | 'productDescription' | 'markup'> & {
  name: string
  provider: string
  productType: string
  markupAlphabetical: number
  markupType: string
  tenantProductType: string
  images: string
  marketing: { [name: string]: { name: string; url: string } }
  providerDealerCode: string
}
const AddProductsForm: FC<FinanceFormProps> = ({
  dealerConfig,
  dealerCode,
  productData,
  onFormClose,
  providers,
  providerError,
  tenantProductTypeOptions,
}) => {
  const { mutate, data: productsByProvider, status: productByProviderStatus } = useProductByProvider()
  const { register, control, errors, setValue, handleSubmit, watch, clearErrors } = useForm<FormValues>({
    defaultValues: {
      productName: productData?.productNameForCustomer,
      productDescription: productData?.productDescription,
      markup: productData?.markup,
      markupAlphabetical: productData?.markup,
      name: productData?.productName,
      productType: productData?.productType,
      provider: productData?.providerName,
      providerDealerCode: productData?.providerDealerCode,
    },
  })

  useEffect(() => {
    setTenantProductTypeVal(productData?.customerProductType?.code || '')
  }, [productData])

  const [marketingMat, setMarketingMat] = useState([
    { name: '', url: '', tempId: `${Math.random().toString(36).slice(7)}${Date.now()}` },
  ])

  const [saveProduct, { error, status }] = useMutation<FormValues, PenProduct, Error>(
    (values): Promise<PenProduct> => {
      const selectedProvider = providers?.find(f => `${f.providerId}` === providerNameVal)
      const selectedProduct = productsByProvider?.find(f => `${f.productId}` === productNameVal)
      let marketingUrls = [{ name: '', url: '' }]
      if (values.marketing) {
        marketingUrls = Object.keys(values.marketing).map(e => ({
          name: values.marketing[e].name || '',
          url: values.marketing[e].url || '',
        }))
      }
      const filterMarketingUrls = marketingUrls.filter(f => f.url.length > 0)
      const isEdit = !!productData?.providerName
      const newValues = {
        penDealerId: dealerConfig?.penDealerId || 0,
        productId: selectedProduct?.productId,
        productName: productsByProvider?.find(f => `${f.productId}` === productNameVal)?.name,
        productType: productTypeVal,
        providerDealerCodeFormat: selectedProduct?.providerDealerCodeFormat,
        providerDealerCodeName: selectedProduct?.providerDealerCodeName,
        providerId: selectedProvider?.providerId || '',
        dealerCode,
        productNameForCustomer: values.productName,
        productDescription: values.productDescription,
        providerName: selectedProvider?.name || '',
        isActive: true,
        markup: values.markup,
        ContractPrefixOverride: null,
        ratingMethods: selectedProduct?.ratingMethods,
        regExpValidator: selectedProduct?.regExpValidator,
        validatorPrompt: selectedProduct?.validatorPrompt,
        action: isEdit ? PenAction.Update : PenAction.Register,
        providerDealerCode: values.providerDealerCode,
        marketing: filterMarketingUrls,
        images: values.images,
        dealerFniProductId: isEdit ? productData?._id : undefined,
        customerProductType: {
          code: tenantProductTypeVal,
          displayName: tenantProductTypeOptions.find(f => f.value === tenantProductTypeVal)?.label as string,
        },
      }

      return sendForm<PenProduct>(endpointSaveProduct, newValues, {
        withAuthentication: true,
        method: 'POST',
      })
    },
    {
      onSuccess(data): void {
        void invalidateProducts(data?.data)
        onFormClose()
      },
    },
  )

  const providerOptions = useMemo(() => {
    return providers?.map((e: PenProvider) => ({ label: e.name, value: e.providerId })) || []
  }, [providers])

  const productTypes = useMemo(() => {
    const options = [...new Set(productsByProvider?.map(({ productType }: PenProduct) => productType))]
    return options?.map(value => ({ label: value, value }))
  }, [productsByProvider])

  const getProductsByType = useCallback(
    (productType: PenProduct['productType']) => {
      const data = productsByProvider?.filter(f => f.productType === productType)
      const options = data?.map(({ name, productId }) => ({ label: name, value: productId })) || []
      setProductsByTypeOption(options)
    },
    [productsByProvider],
  )

  const onRemoveMarketingItem = (item: typeof marketingMat[0]) => {
    const data = marketingMat.filter(f => f.tempId !== item.tempId)
    setMarketingMat(data)
  }

  const [productNameVal, setProductNameVal] = useState('')
  const [providerNameVal, setProviderNameVal] = useState('')
  const [productTypeVal, setProductTypeVal] = useState('')
  const [tenantProductTypeVal, setTenantProductTypeVal] = useState('')
  const [markupTypeVal, setMarkupTypeVal] = useState('Percentage')
  const [productsByTypeOption, setProductsByTypeOption] = useState<SelectOptions>([])

  /** Prepopulate Initial values for updating pen product */
  const getInitialValues = useCallback(
    (data: typeof productData) => {
      if (data) {
        setValue(
          'images',
          data?.images.map((e: ImageSelection) => ({
            name: e.name as string,
            url: e.path as string,
            tempId: `${Math.random().toString(36).slice(7)}${Date.now()}`,
          })) || [],
        )
        const marketing =
          data?.marketing?.map(e => {
            const id = `${Math.random().toString(36).slice(7)}${Date.now()}`
            return {
              name: e.name,
              url: e.url,
              tempId: id,
            }
          }) || []
        setMarketingMat(marketing)
        setProductNameVal(`${data.productId}`)
        setProviderNameVal(`${data.providerId}`)
        if (!productsByProvider) void mutate({ providerId: `${data.providerId}` })
        setProductTypeVal(data.productType)
        getProductsByType(data.productType)
      }
    },
    [getProductsByType, setValue, mutate, productsByProvider],
  )
  useEffect(() => {
    if (productData) {
      getInitialValues(productData)
    }
  }, [productData, getInitialValues])

  return (
    <>
      <Form
        onSubmit={handleSubmit(async values => saveProduct(values))}
        error={(providerError && selectErrorMessage(providerError)) || (error && selectErrorMessage(error))}
        className={cls([styles.form])}
      >
        <div className={styles.markupcol}>
          <div className={styles.markupTypeCol}>
            <Select
              name="provider"
              label={messages.input.providerName}
              disabled={!!productData}
              options={providerOptions}
              value={providerNameVal}
              onChange={({ target: { value } }) => {
                void mutate({ providerId: value })
                setProviderNameVal(value)
                setProductTypeVal('')
                setProductNameVal('')
                setValue('productName', '')
                setValue('productDescription', '')
                setValue('markup', '')
                setValue('markupAlphabetical', '')
              }}
              placeholder={messages.placeholder.select}
              ref={register(validation('providerNameRequired', true))}
              error={errors?.provider?.message}
            />
          </div>
          <div className={styles.markupTypeCol2}>
            {productByProviderStatus === 'running' && (
              <div className={styles.overlay}>
                <ProgressSpinner size={10} />
              </div>
            )}
            <Controller
              control={control}
              name="providerDealerCode"
              rules={validation('providerDealerCode', true)}
              render={({ onChange, value, name }) => (
                <Input
                  label={messages.input.providerDealerCode}
                  value={value as string}
                  placeholder={messages.placeholder.typehere}
                  error={errors?.providerDealerCode?.message}
                  name={name}
                  onChange={e => onChange(e.target.value)}
                />
              )}
            />
          </div>
        </div>

        <div className={styles.markupcol}>
          <div className={styles.markupTypeCol}>
            <Select
              name="productType"
              disabled={!!productData}
              label={messages.input.productType}
              options={productTypes}
              value={productTypeVal}
              onChange={({ target: { value } }) => {
                getProductsByType(value)
                setProductTypeVal(value)
                setProductNameVal('')
                setValue('productName', '')
                setValue('productDescription', '')
                setValue('markup', '')
                setValue('markupAlphabetical', '')
              }}
              placeholder={messages.placeholder.select}
              ref={register(validation('productTypeRequired', true))}
              error={errors?.productType?.message}
            />
          </div>
          <div className={styles.markupTypeCol2}>
            <Select
              name="tenantProductType"
              label={messages.input.tenantProductType('BMW')}
              options={tenantProductTypeOptions as SelectOptions}
              value={tenantProductTypeVal}
              onChange={({ target: { value } }) => {
                setTenantProductTypeVal(value)
              }}
              placeholder={messages.placeholder.select}
              ref={register(validation('tenantProductTypeRequired', true, 'BMW'))}
              error={errors?.tenantProductType?.message}
            />
          </div>
        </div>

        <div className={styles.markupcol}>
          <div className={styles.markupTypeCol}>
            <Select
              name="name"
              label={messages.input.name}
              disabled={!!productData}
              options={productsByTypeOption}
              value={productNameVal}
              onChange={({ target: { value } }) => {
                setProductNameVal(value)
                setValue('productName', productsByProvider?.find(f => `${f.productId}` === value)?.name)
                setValue('productDescription', '')
                setValue('markup', '')
                setValue('markupAlphabetical', '')
                clearErrors('productName')
              }}
              placeholder={messages.placeholder.select}
              ref={register(validation('nameRequired', true))}
              error={errors?.name?.message}
            />
          </div>
          <div className={styles.markupTypeCol2}>
            <Controller
              control={control}
              name="productName"
              rules={validation('customerProductName', true)}
              render={({ onChange, value, name }) => (
                <Input
                  label={messages.input.customerProductName}
                  value={value as string}
                  placeholder={messages.placeholder.typehere}
                  error={errors?.productName?.message}
                  name={name}
                  onClear={value ? () => onChange('') : undefined}
                  onChange={e => onChange(e.target.value)}
                />
              )}
            />
          </div>
        </div>

        <Controller
          control={control}
          name="productDescription"
          rules={validation('descriptionRequired', true)}
          render={({ onChange, value, name }) => (
            <Input
              row
              label={messages.input.description}
              value={value as string}
              placeholder={messages.placeholder.typehere}
              error={errors?.productDescription?.message}
              name={name}
              onChange={e => onChange(e.target.value)}
            />
          )}
        />

        <Controller
          control={control}
          name="images"
          rules={validation('imagesRequired', true)}
          render={({ onChange, name }) => (
            <Upload
              error={errors?.images?.message as string}
              multiple
              onChange={e => {
                onChange(e?.map(blob => ({ name: blob.blobName })) || undefined)
              }}
              defaultImages={productData?.images}
              name={name}
              blobPath="fni-products-images"
              label={messages.input.images}
              fileType="Image"
              formats={['jpg', 'jpeg', 'png']}
            />
          )}
        />
        {marketingMat.map(e => (
          <div className={styles.markupcol} key={e.tempId}>
            <div className={styles.urlName}>
              <Controller
                control={control}
                name={`marketing.${e.tempId}.name`}
                defaultValue={e.name}
                rules={customValidation(!!watch(`marketing.${e.tempId}.url`, '')).productname}
                render={({ onChange, value, name }) => (
                  <Input
                    label={messages.input.urlName}
                    value={value as string}
                    placeholder={messages.placeholder.typehere}
                    error={errors?.marketing?.[`${e.tempId}`]?.name?.message}
                    name={name}
                    onClear={value ? () => onChange('') : undefined}
                    onChange={event => onChange(event.target.value)}
                  />
                )}
              />
            </div>
            <div className={styles.markupTypeCol2}>
              <Controller
                control={control}
                name={`marketing.${e.tempId}.url`}
                defaultValue={e.url}
                rules={customValidation(!!watch(`marketing.${e.tempId}.name`, '')).productUrl}
                render={({ onChange, value, name }) => (
                  <Input
                    label={messages.input.productUrl}
                    value={value as string}
                    placeholder={messages.placeholder.url}
                    error={errors?.marketing?.[`${e.tempId}`]?.url?.message}
                    name={name}
                    onClear={value ? () => onChange('') : undefined}
                    onChange={event => onChange(event.target.value)}
                  />
                )}
              />
            </div>
            <div className={styles.markupTypeCol3}>
              <Icon name="basket" size={24} className="mt-2" onClick={() => onRemoveMarketingItem(e)} />
            </div>
          </div>
        ))}
        <Button
          className={cls([styles.button, 'w-100 my-2'])}
          onClick={() => {
            const items = [...marketingMat]
            items.push({
              name: '',
              url: '',
              tempId: `${Math.random().toString(36).slice(7)}${Date.now()}`,
            })
            setMarketingMat(items)
          }}
          secondary
        >
          {messages.button.addMore}
        </Button>

        <div className={styles.markupcol}>
          <div className={styles.markupTypeCol}>
            <Select
              name="markupType"
              label={messages.input.markupType}
              options={markupTypeOption}
              value={markupTypeVal}
              onChange={({ target: { value } }) => {
                setMarkupTypeVal(value)
              }}
              placeholder={messages.placeholder.select}
              ref={register(validation('markupTypeRequired', true))}
              error={errors?.markupType?.message}
            />
          </div>
          <div className={styles.markupTypeCol2}>
            {/* Markup Controller for Desktop Devices */}
            <div className={styles.markupDesktop}>
              <Controller
                control={control}
                name="markup"
                rules={validation('markupRequired', true)}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    mode="decimal"
                    suffix="%"
                    label={messages.input.markup}
                    name={name}
                    fractionDigits={2}
                    max={100}
                    min={-100}
                    left
                    error={errors?.markup?.message}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                      setValue('markupAlphabetical', newValue)
                    }}
                  />
                )}
              />
            </div>
            {/* Same Controller but for mobile screens */}
            <div className={styles.markupMobile}>
              <Controller
                control={control}
                name="markupAlphabetical"
                rules={validation('markupRequired', true)}
                render={({ onChange, name, value }) => (
                  <NumberInput
                    mode="decimal"
                    suffix="%"
                    label={`${messages.input.markup} (Numbers Only)`}
                    name={name}
                    fractionDigits={2}
                    max={100}
                    min={-100}
                    left
                    alphabeticalKeypad
                    error={errors?.markup?.message}
                    value={value as number}
                    onChange={(_, newValue) => {
                      onChange(newValue)
                      setValue('markup', newValue)
                    }}
                  />
                )}
              />
            </div>
            <p className={styles.markupInfo}>{messages.markupInfo}</p>
          </div>
        </div>
        <div className={cls(styles.row, styles.centered, 'pt-2')}>
          <Button className={styles.button} onClick={() => onFormClose()} secondary>
            {messages.button.cancel}
          </Button>
          <Button className={styles.button} loading={status === 'running' && messages.button.saving} type="submit">
            {messages.button.save}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default AddProductsForm
