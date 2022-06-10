import { FC, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import useMutation from 'use-mutation'
import cls from 'classnames'

import { validateEmail } from '@common/utilities/validation'
import { invalidateDealership, DealerShipFields } from '@common/endpoints/useDealerships'
import sendForm, { selectErrorMessage } from '@common/utilities/sendForm'
import { SelectOption } from '@common/utilities/selectOptions'
import Form from '@components/Form'
import Select from '@components/Select'
import Input from '@components/Input'
import Button from '@components/Button'
import MaskedInput from '@components/MaskedInput'
import { Dealerships } from '@common/endpoints/typings.gen'
import { websiteUrlRegex, zipCodeRegex } from '@common/utilities/constants'
import styles from './dealership.module.scss'

type FormValues = {
  name: string
  dealerCode: string
  email?: string
  address: string
  city: string
  state: string
  zipCode: string
  county: string
  digitalRetailEnabled: string
  contactNo: string
  address2: string
  digitalRetailWebsite: string
  digitalRetailAdminWebsite: string
  marketScanAccountNumber: string
}

export const messages = {
  phoneMask: '(999) - 999 - 9999',
  phoneMaskPlaceholder: '000 - 000 - 0000',
  zipCodeMask: '99999?-9999',
  zipCodePlaceHolder: '00000-0000',
  dealerCodeMask: '99999-99',
  dealerCodeMaskPlaceholder: '00000 - 00',
  input: {
    name: 'Dealership Name',
    dealerCode: 'Shift digital dealer id#',
    email: 'Email',
    address: 'Address Line',
    city: 'City',
    state: 'State',
    zipCode: 'Zip Code',
    digitalRetailEnabled: 'Digital Retail',
    contactNo: 'Contact Number',
    county: 'County',
    digitalRetailWebsite: 'Digital Retail Website',
    digitalRetailAdminWebsite: 'Digital Retail Admin Website',
    marketScanAccountNumber: 'MarketScan Account No.',
  },
  button: {
    save: 'Save',
    cancel: 'Cancel',
  },
  placeholder: {
    typehere: 'Type Here...',
    email: 'sample@sample.com',
    website: 'www.example.com',
  },
  validation: {
    nameRequired: 'Dealership Name is Required',
    dealerIdRequired: 'Shift Dealer Id is Required',
    emailRequired: 'Enter Correct Email Address',
    addressRequired: 'Address is Required',
    address2Required: 'Address is Required',
    cityRequired: 'City is Required',
    stateRequired: 'State is Required',
    zipCodeRequired: 'Valid Zip Code is Required',
    digitalRetailEnabledRequired: 'Digital Retail is Required',
    contactNoRequired: 'Contact Number is Required',
    county: 'County is Required',
    marketScanAccountNumber: 'Market Scan Account Number is Required.',
  },
  msACWarningText: 'For all states other than CA & FL, this is a mandatory field.',
}

export const customvalidation = (required?: boolean) => ({
  email: {
    required: {
      value: false,
      message: messages.validation.emailRequired,
    },
    validate: {
      matchesPattern: validateEmail(messages.validation.emailRequired),
    },
  },
  digitalRetailWebsite: {
    required: {
      value: false,
      message: `${messages.input.digitalRetailWebsite} is Required`,
    },
    validate: {
      matchesPattern: (value: string | undefined) => {
        if (value && !websiteUrlRegex.exec(value)) {
          return `Valid ${messages.input.digitalRetailWebsite} URL is Required`
        }
        if (!value && required) {
          return `${messages.input.digitalRetailWebsite} is Required`
        }
        return true
      },
    },
  },
  digitalRetailAdminWebsite: {
    required: {
      value: false,
      message: `${messages.input.digitalRetailAdminWebsite} is Required`,
    },
    validate: {
      matchesPattern: (value: string | undefined) => {
        if (value && !websiteUrlRegex.exec(value)) {
          return `Valid ${messages.input.digitalRetailAdminWebsite} URL is Required`
        }
        if (!value && required) {
          return `${messages.input.digitalRetailAdminWebsite} is Required`
        }
        return true
      },
    },
  },
  zipCode: {
    required: {
      value: true,
      message: messages.validation.zipCodeRequired,
    },
    validate: {
      matchesPattern: (value: string | undefined) => {
        if (value && !zipCodeRegex.exec(value)) {
          return messages.validation.zipCodeRequired
        }
        return true
      },
    },
  },
})
export const makeValidation = (field: keyof typeof messages.validation, required: boolean) => ({
  required: {
    value: required,
    message: messages.validation[field],
  },
})

export const digitalRetailOption = ['Enable', 'Disable']

type DealerShipFormData = {
  onFormClose: () => void
  dealerData?: DealerShipFields | undefined
  stateOptions?: SelectOption[]
}

const AddonForm: FC<DealerShipFormData> = ({ stateOptions, dealerData, onFormClose }) => {
  const { handleSubmit, register, control, errors, watch } = useForm<FormValues>({
    defaultValues: {
      name: dealerData?.name,
      email: dealerData?.email,
      digitalRetailEnabled: dealerData?.digitalRetailEnabled ? 'Enable' : 'Disable',
      state: dealerData?.state?.displayName,
      zipCode: dealerData?.zipCode,
      address: dealerData?.address,
      address2: dealerData?.address2 || '',
      city: dealerData?.city,
      contactNo: dealerData?.contactNo,
      dealerCode: dealerData?.dealerCode,
      county: dealerData?.county || '',
      digitalRetailWebsite: dealerData?.digitalRetailWebsite || '',
      digitalRetailAdminWebsite: dealerData?.digitalRetailAdminWebsite || '',
      marketScanAccountNumber: dealerData?.marketScanAccountNumber || '',
    },
  })

  const [stateSelect, setStateSelect] = useState<string>()

  useEffect(() => {
    if (dealerData) {
      setStateSelect(dealerData?.state?.code)
    }
  }, [dealerData])

  const [saveAccessory, { error, status }] = useMutation<FormValues, DealerShipFields | Dealerships, Error>(
    (values): Promise<DealerShipFields | Dealerships> => {
      const displayNameState = stateOptions?.filter(e => e.value === stateSelect)
      const isEdit = !!dealerData
      const newUserValues = {
        ...values,
        state: {
          code: stateSelect,
          displayName: displayNameState?.[0]?.label,
        },
        digitalRetailEnabled: values.digitalRetailEnabled === 'Enable',
        // address: `${values.address} ${values.address2 || ''}`,
        contactNo: values.contactNo.length > 0 ? values.contactNo.match(/\d+/g)?.join('') : undefined,
        isActive: dealerData?.isActive,
        marketScanAccountNumber: values.marketScanAccountNumber.length > 0 ? values.marketScanAccountNumber : null,
      }
      const url = !isEdit
        ? '/dealer-management/dealership/add-dealership'
        : '/dealer-management/dealership/update-dealership'
      return sendForm<DealerShipFields | Dealerships>(url, newUserValues, {
        withAuthentication: true,
        method: !isEdit ? 'POST' : 'PUT',
      })
    },
    {
      onSuccess(data): void {
        void invalidateDealership(data?.data)
        onFormClose()
      },
    },
  )

  return (
    <>
      <Form
        onSubmit={handleSubmit(async values => void (await saveAccessory(values)))}
        error={error && selectErrorMessage(error)}
        className={cls([styles.form])}
      >
        <div className="row py-0">
          <div className={cls([styles.columnLeft, 'col-xl-6 col-lg-6 col-md-12 col-sm-12'])}>
            <Controller
              control={control}
              name="name"
              defaultValue={dealerData?.name || ''}
              rules={makeValidation('nameRequired', true)}
              render={({ onChange, value, name }) => (
                <Input
                  label={messages.input.name}
                  name={name}
                  onClear={value ? () => onChange('') : undefined}
                  onChange={e => onChange(e.target.value)}
                  value={value as string}
                  error={errors?.name?.message}
                  placeholder={messages.placeholder.typehere}
                />
              )}
            />
          </div>
          <div className={cls([styles.columnRight, 'col-xl-6 col-lg-6 col-md-12 col-sm-12'])}>
            <Controller
              control={control}
              name="dealerCode"
              defaultValue={dealerData?.dealerCode || ''}
              rules={makeValidation('dealerIdRequired', true)}
              render={({ onChange, value, name }) => (
                <MaskedInput
                  onClear={value ? () => onChange('') : undefined}
                  error={errors?.dealerCode?.message}
                  name={name}
                  label={messages.input.dealerCode}
                  small
                  value={value as string}
                  mask={messages.dealerCodeMask}
                  onChange={e => {
                    onChange(e?.value)
                  }}
                  placeholder={messages.dealerCodeMaskPlaceholder}
                />
              )}
            />
          </div>
        </div>
        <Controller
          control={control}
          name="address"
          defaultValue={dealerData?.address || ''}
          rules={makeValidation('addressRequired', true)}
          render={({ onChange, value, name }) => (
            <Input
              label={`${messages.input.address} 1`}
              placeholder={messages.placeholder.typehere}
              error={errors?.address?.message}
              name={name}
              value={value as string}
              onClear={value ? () => onChange('') : undefined}
              onChange={e => onChange(e.target.value)}
            />
          )}
        />
        <Controller
          control={control}
          name="address2"
          rules={makeValidation('address2Required', false)}
          render={({ onChange, value, name }) => (
            <Input
              label={`${messages.input.address} 2`}
              optional
              value={value as string}
              placeholder={messages.placeholder.typehere}
              // error={errors?.address?.message}
              name={name}
              onClear={value ? () => onChange('') : undefined}
              onChange={e => onChange(e.target.value)}
            />
          )}
        />
        <div className="row py-0" style={{ maxWidth: 537 }}>
          <div className={cls([styles.columnLeftcity, 'col-xl-6 col-lg-6 col-md-12 col-sm-12'])}>
            <Controller
              control={control}
              name="city"
              defaultValue={dealerData?.city || ''}
              rules={makeValidation('cityRequired', true)}
              render={({ onChange, value, name }) => (
                <Input
                  label={messages.input.city}
                  value={value as string}
                  placeholder={messages.placeholder.typehere}
                  error={errors?.city?.message}
                  name={name}
                  onClear={value ? () => onChange('') : undefined}
                  onChange={e => onChange(e.target.value)}
                />
              )}
            />
          </div>

          <div className={cls([styles.columnRightemail, 'col-xl-6 col-lg-6 col-md-12 col-sm-12 pt-0'])}>
            <Select
              name="state"
              label={messages.input.state}
              options={stateOptions || []}
              value={stateSelect}
              onChange={e => setStateSelect(e.target.value)}
              placeholder={messages.input.state}
              ref={register(makeValidation('stateRequired', true))}
              error={errors?.state?.message}
            />
          </div>
        </div>
        <div className="row py-0" style={{ maxWidth: 537 }}>
          <div className={cls([styles.columnLeftcity, 'col-xl-6 col-lg-6 col-md-12 col-sm-12'])}>
            <Controller
              control={control}
              name="zipCode"
              defaultValue={dealerData?.zipCode || ''}
              rules={customvalidation().zipCode}
              render={({ onChange, value, name }) => (
                <MaskedInput
                  onClear={value ? () => onChange('') : undefined}
                  error={errors?.zipCode?.message}
                  name={name}
                  label={messages.input.zipCode}
                  small
                  value={value as string}
                  mask={messages.zipCodeMask}
                  onChange={e => {
                    onChange(e?.value)
                  }}
                  placeholder={messages.zipCodePlaceHolder}
                />
              )}
            />
          </div>
          <div className={cls([styles.columnRightemail, 'col-xl-6 col-lg-6 col-md-12 col-sm-12'])}>
            <Controller
              control={control}
              name="county"
              defaultValue={dealerData?.county || ''}
              rules={makeValidation('county', true)}
              render={({ onChange, value, name }) => (
                <Input
                  label={messages.input.county}
                  value={value as string}
                  placeholder={messages.placeholder.typehere}
                  error={errors?.county?.message}
                  name={name}
                  onClear={value ? () => onChange('') : undefined}
                  onChange={e => onChange(e.target.value)}
                />
              )}
            />
          </div>
        </div>

        <div className="row py-0">
          <div className={cls([styles.columnLeftcity, 'col-xl-6 col-lg-6 col-md-12 col-sm-12'])}>
            <Controller
              control={control}
              name="contactNo"
              defaultValue={dealerData?.contactNo || ''}
              rules={makeValidation('contactNoRequired', false)}
              render={({ onChange, value, name }) => (
                <MaskedInput
                  onClear={value ? () => onChange('') : undefined}
                  optional
                  error={errors?.contactNo?.message}
                  name={name}
                  label={messages.input.contactNo}
                  small
                  value={value as string}
                  mask={messages.phoneMask}
                  onChange={e => {
                    onChange(e?.value)
                  }}
                  placeholder={messages.phoneMaskPlaceholder}
                />
              )}
            />
          </div>
          <div className={cls([styles.columnRightemail, 'col-xl-6 col-lg-6 col-md-12 col-sm-12'])}>
            <Controller
              control={control}
              name="email"
              defaultValue={dealerData?.email || ''}
              rules={customvalidation().email}
              render={({ onChange, value, name }) => (
                <Input
                  label={messages.input.email}
                  optional
                  value={value as string}
                  placeholder={messages.placeholder.email}
                  error={errors?.email?.message}
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
          name="marketScanAccountNumber"
          defaultValue={dealerData?.marketScanAccountNumber || ''}
          rules={makeValidation('marketScanAccountNumber', false)}
          render={({ onChange, value, name }) => (
            <Input
              containerClass="mb-0"
              label={messages.input.marketScanAccountNumber}
              value={value as string}
              placeholder={messages.placeholder.typehere}
              error={errors?.marketScanAccountNumber?.message}
              name={name}
              onClear={value ? () => onChange('') : undefined}
              onChange={e => onChange(e.target.value)}
            />
          )}
        />
        <p>
          <small>{messages.msACWarningText}</small>
        </p>
        <Select
          name="digitalRetailEnabled"
          label={messages.input.digitalRetailEnabled}
          options={digitalRetailOption}
          placeholder={messages.input.digitalRetailEnabled}
          ref={register(makeValidation('digitalRetailEnabledRequired', true))}
          error={errors?.digitalRetailEnabled?.message}
        />

        <Controller
          control={control}
          name="digitalRetailWebsite"
          defaultValue={dealerData?.digitalRetailWebsite || ''}
          rules={customvalidation(watch('digitalRetailEnabled') === 'Enable').digitalRetailWebsite}
          render={({ onChange, value, name }) => (
            <Input
              label={messages.input.digitalRetailWebsite}
              value={value as string}
              placeholder={messages.placeholder.website}
              error={errors?.digitalRetailWebsite?.message}
              name={name}
              onClear={value ? () => onChange('') : undefined}
              onChange={e => onChange(e.target.value)}
            />
          )}
        />

        <Controller
          control={control}
          name="digitalRetailAdminWebsite"
          defaultValue={dealerData?.digitalRetailAdminWebsite || ''}
          rules={customvalidation(watch('digitalRetailEnabled') === 'Enable').digitalRetailAdminWebsite}
          render={({ onChange, value, name }) => (
            <Input
              label={messages.input.digitalRetailAdminWebsite}
              value={value as string}
              placeholder={messages.placeholder.website}
              error={errors?.digitalRetailAdminWebsite?.message}
              name={name}
              onClear={value ? () => onChange('') : undefined}
              onChange={e => onChange(e.target.value)}
            />
          )}
        />

        <div className={cls(styles.row, styles.centered, 'pt-2')}>
          <Button className={styles.button} onClick={() => onFormClose()} secondary>
            {messages.button.cancel}
          </Button>
          <Button className={styles.button} type="submit" loading={status === 'running'}>
            {messages.button.save}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default AddonForm
