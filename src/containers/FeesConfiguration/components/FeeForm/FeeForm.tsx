import { ComponentProps, FC, forwardRef, ReactNode } from 'react'
import { Controller, NestedValue, useForm, UnpackNestedValue } from 'react-hook-form'
import Button from '@components/Button/Button'
import NumberInput from '@components/NumberInput'
import Form from '@components/Form'
import Select, { SelectProps } from '@components/Select'
import MultiSelect from '@components/MultiSelect'
import { AddNewDealerFee, DealerFeesConfig, ReferenceDataTypes } from '@common/endpoints/typings.gen'
import { useCharges, useSaveFee } from '@common/endpoints/fees'
import useReferenceData, { referenceDataToOptions } from '@common/endpoints/useReferenceData'
import { selectErrorMessage } from '@common/utilities/sendForm'
import invariant from '@common/utilities/invariant'

export interface IDealerFeeProps {
  item?: DealerFeesConfig | null
  onClose: () => void
  dealerCode: string
}

type FormValuesDef = {
  fee: string
  state: NestedValue<string[]>
  financialProduct: NestedValue<string[]>
  defaultAmount: number
  isActive: boolean
  isTaxable: boolean
}

type FormValues = UnpackNestedValue<FormValuesDef>

const messages = {
  input: {
    fee: 'Fee Name',
    state: 'State',
    financialProduct: 'Financial Product',
    defaultAmount: 'Default Amount ($)',
    isActive: 'Status',
    isTaxable: 'Taxable',
  },
  button: {
    save: 'Save',
    cancel: 'Cancel',
  },
  validation: {
    fee: 'Fee Name Required',
    state: 'State Required',
    financialProduct: 'Financial Product required',
    defaultAmount: 'Default Amount ($) required',
    isActive: 'Status required',
    isTaxable: 'Required',
  },
  booleanSelect: {
    yes: 'Yes',
    no: 'No',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
}

const atLeastOne = (message: string) => (value: unknown[] | null | undefined) => (value?.length ?? 0) >= 1 || message

const validation = {
  fee: {
    required: {
      value: true,
      message: messages.validation.fee,
    },
  },
  state: {
    validate: atLeastOne(messages.validation.state),
  },
  financialProduct: {
    validate: atLeastOne(messages.validation.financialProduct),
  },
  defaultAmount: {
    required: messages.validation.defaultAmount,
  },
  isActive: {
    validate: (value: unknown) => value != null || messages.validation.isActive,
  },
  isTaxable: {
    validate: (value: unknown) => value != null || messages.validation.isTaxable,
  },
}

type BooleanSelectProps = Omit<SelectProps, 'onChange' | 'options' | 'value'> & {
  onChange: (value: boolean) => unknown
  labelYes?: string
  labelNo?: string
  value: boolean
}

const BooleanSelect = forwardRef<HTMLSelectElement, BooleanSelectProps>(
  ({ onChange, value, labelYes = messages.booleanSelect.yes, labelNo = messages.booleanSelect.no, ...props }, ref) => (
    <Select
      ref={ref}
      {...props}
      options={[
        { value: 'yes', label: labelYes },
        { value: 'no', label: labelNo },
      ]}
      value={value ? 'yes' : 'no'}
      onChange={({ target: { value } }) => onChange(value === 'yes')}
    />
  ),
)

function getDefaultValues(item: DealerFeesConfig): Partial<FormValues> {
  return {
    fee: item.chargeCode,
    defaultAmount: item.defaultAmount,
    isActive: item.isActive,
    isTaxable: item.isTaxable,
    state: item.state.map(item => item.code),
    financialProduct: item.financialProduct.map(item => item.code),
  }
}

const useOptions = () => {
  const { data = [[], []] } = useReferenceData([ReferenceDataTypes.USAState, ReferenceDataTypes.FinancialProduct])

  const states = referenceDataToOptions(data[0])
  const financialProducts = referenceDataToOptions(data[1])

  const statesMap = new Map(states.map(({ value, label }) => [value, label]))
  const financialProductsMap = new Map(financialProducts.map(({ value, label }) => [value, label]))

  return { states, financialProducts, statesMap, financialProductsMap }
}

const FeeForm: FC<IDealerFeeProps> = ({ item, onClose, dealerCode }) => {
  // a pre-defined list of possible fees for select field
  const { options: chargeOptions, chargeMap } = useCharges()

  // lists of statses and financial products for select fields
  const { states, financialProducts, statesMap, financialProductsMap } = useOptions()
  // form
  const { handleSubmit, errors, control } = useForm<FormValuesDef>({
    defaultValues:
      item == null
        ? { isActive: true, defaultAmount: 0, financialProduct: [], state: [], isTaxable: true }
        : getDefaultValues(item),
  })
  // mutation
  const save = useSaveFee({ dealerCode, item })
  // submit handler
  const saveDealerFee = async (values: FormValues) => {
    const { fee, defaultAmount, state, isActive, isTaxable, financialProduct } = values
    const charge = chargeMap.get(fee)
    invariant(charge != null, `unknown charge/fee type: ${fee}`)

    const result: AddNewDealerFee = {
      isActive,
      isTaxable,
      defaultAmount,
      state: state.map(code => ({ code, displayName: statesMap.get(code) || '' })),
      financialProduct: financialProduct.map(code => ({ code, displayName: financialProductsMap.get(code) || '' })),
      chargeCode: fee,
      chargeDisplayName: charge.chargeDisplayName,
      tagName: charge.tagName,
    }

    await save.mutate(result, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  type CtlProps = ComponentProps<typeof Controller>
  type RenderFn = NonNullable<CtlProps['render']>
  type RenderArgs = Parameters<RenderFn>[0]
  type FinalArgs = { error: ReactNode; label: string } & RenderArgs
  type FinalRet = ReturnType<RenderFn>

  const ctl = (name: keyof FormValues, render: (args: FinalArgs) => FinalRet) => (
    <Controller
      control={control}
      name={name}
      rules={validation[name]}
      render={props => render({ ...props, error: errors[name]?.message, label: messages.input[name] })}
    />
  )

  return (
    <>
      <Form onSubmit={handleSubmit(values => saveDealerFee(values))} error={selectErrorMessage(save.error)}>
        <div>
          {ctl('fee', props => (
            <Select {...props} placeholder=" " options={chargeOptions} />
          ))}
        </div>
        <div>
          {ctl('state', ({ onChange, ...props }) => (
            <MultiSelect
              {...props}
              options={states}
              filter
              header
              preventdefaultOnLabelClick
              selectedItemsLabel="{0} states selected"
              onChange={e => onChange(e.value)}
            />
          ))}
        </div>
        <div>
          {ctl('financialProduct', ({ onChange, ...props }) => {
            return (
              <MultiSelect
                {...props}
                onChange={e => {
                  onChange(e.value)
                }}
                options={financialProducts}
              />
            )
          })}
        </div>
        <div>
          {ctl('defaultAmount', ({ onChange, ...props }) => (
            <NumberInput
              {...props}
              mode="currency"
              className="text-left"
              onChange={(_, newValue) => onChange(newValue)}
            />
          ))}
        </div>
        <div>
          {ctl('isTaxable', props => (
            <BooleanSelect {...props} />
          ))}
        </div>
        <div>
          {ctl('isActive', props => (
            <BooleanSelect labelYes={messages.status.active} labelNo={messages.status.inactive} {...props} />
          ))}
        </div>
        <div className="pt-4 d-flex justify-content-center">
          <div className="d-flex justify-content-between">
            <Button type="button" secondary onClick={onClose} className="mr-3">
              {messages.button.cancel}
            </Button>
            <Button type="submit" loading={save.status === 'running' && 'Saving'}>
              {messages.button.save}
            </Button>
          </div>
        </div>
      </Form>
    </>
  )
}

export default FeeForm
