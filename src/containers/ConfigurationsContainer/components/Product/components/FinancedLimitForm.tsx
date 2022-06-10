import { FC, useEffect, useState } from 'react'
import Dialog from '@components/Dialog'
import SectionHeading from '@components/SectionHeading'
import Button from '@components/Button'
import Divider from '@components/Divider'
import Icon from '@components/Icon'
import Form from '@components/Form'
import { Controller, useForm } from 'react-hook-form'
import cls from 'classnames'
import { capitalizeFirstLetter } from '@common/utilities/validation'
import NumberInput from '@components/NumberInput'
import { CodeDisplayName, SpecificMinimumFinances } from '@common/endpoints/typings.gen'
import MultiSelect from '@components/MultiSelect'
import { SelectOption } from '@common/utilities/selectOptions'
import { useSaveFinnancedLimitConfig } from '@common/endpoints/useDealershipConfiguration'
import { selectErrorMessage } from '@common/utilities/http-api'
import styles from '../ProductForm.module.scss'

export const messages = {
  heading: 'SPECIAL FINANCED LIMIT',
  button: {
    addNew: 'ADD MORE',
    save: 'SAVE',
    cancel: 'CANCEL',
    saving: 'SAVING...',
  },
  input: {
    minFinancedAmount: 'MINIMUM FINANCED AMOUNT',
    compatibleModels: 'SELECT MODELS',
  },
  error: {
    minFinancedAmount: 'MINIMUM FINANCED AMOUNT',
    compatibleModels: 'MODEL',
  },
}

type FinanceFormType = {
  _id?: string
  minFinancedAmount?: number | null
  compatibleModels: string[] | null
}

type FormReturnType = {
  [x: string]: FinanceFormType
}

const getValidation = (str: keyof typeof messages.error) => ({
  required: {
    value: true,
    message: `${capitalizeFirstLetter(messages.error[str])} is Required`,
  },
})

const FinancnedLimitForm: FC<{
  onHide: () => unknown
  compatibleModels: SelectOption[]
  dealerCode: string
  specificMinimumFinances?: SpecificMinimumFinances[]
}> = ({ onHide, compatibleModels, dealerCode, specificMinimumFinances }) => {
  const { errors, control, handleSubmit, setValue } = useForm<FormReturnType>()
  const [financeLimitItems, setFinanceLimitItems] = useState<FinanceFormType[]>([])
  const { mutate: save, isLoading, error } = useSaveFinnancedLimitConfig(dealerCode)

  const handleFinanceLimitItems = (key: string, value: number | string[], index: number) => {
    const limitItems = [...financeLimitItems]
    if (limitItems[index]) {
      limitItems[index] = { ...limitItems[index], [key]: value }
      setFinanceLimitItems(limitItems)
    }
  }

  const onSelectModel = (value: string[], item: FinanceFormType, onChange: (e: unknown) => void, index: number) => {
    const values: FormReturnType = financeLimitItems.reduce((acc, val) => ({ ...acc, [val._id as string]: val }), {})
    const keys = Object.keys(values).filter(f => f !== item._id)
    const items: string[] = keys.reduce((prev: string[], curr: string) => {
      return [...prev, ...(values[curr].compatibleModels || [])]
    }, [])

    if (!items.some(element => value.includes(element))) {
      onChange(value)
      handleFinanceLimitItems('compatibleModels', value, index)
    }
  }

  useEffect(() => {
    if (specificMinimumFinances) {
      const parsed = specificMinimumFinances.reduce((prev: FinanceFormType[], curr: SpecificMinimumFinances) => {
        const data: FinanceFormType = {
          _id: curr._id,
          minFinancedAmount: curr.minFinancedAmount,
          compatibleModels: curr.compatibleModels.map(e => e.code),
        }
        return [...prev, ...[data]]
      }, [])
      setFinanceLimitItems(parsed)
    }
  }, [specificMinimumFinances])
  const onRemoveItem = (item: FinanceFormType) => {
    const items = financeLimitItems.filter(f => f._id !== item._id)
    setValue(`${item._id as string}`, undefined)
    setFinanceLimitItems(items)
  }

  const saveFinnacedLimit = () => {
    const data = financeLimitItems.map(item => ({
      minFinancedAmount: item.minFinancedAmount as number,
      compatibleModels:
        item.compatibleModels?.map((code: string) => {
          const { label, value } = compatibleModels.find(f => f.value === code) as SelectOption
          return {
            code: value,
            displayName: label,
          }
        }) || [],
    }))

    void save(data as SpecificMinimumFinances[], {
      onSuccess() {
        onHide()
      },
    })
  }

  return (
    <>
      <Dialog
        onHide={() => {
          onHide()
        }}
        visible
        className={styles.financeddialog}
        header={<SectionHeading>{messages.heading}</SectionHeading>}
      >
        <div data-testid="min-financed-amount-wrap">
          <Form onSubmit={handleSubmit(() => saveFinnacedLimit())} error={error && selectErrorMessage(error)}>
            <>
              {financeLimitItems &&
                financeLimitItems.map((item, index) => (
                  <>
                    {' '}
                    <div className={styles.financeRowWrap}>
                      <div className="col-lg-5 col-md-12 col-sm-12">
                        <Controller
                          control={control}
                          defaultValue={item.minFinancedAmount}
                          name={`${item._id as string}.minFinancedAmount`}
                          rules={getValidation('minFinancedAmount')}
                          render={({ onChange, name, value }) => (
                            <NumberInput
                              left
                              displayName={messages.input.minFinancedAmount}
                              mode="currency"
                              min={1}
                              max={100000}
                              name={name}
                              label={messages.input.minFinancedAmount}
                              error={errors?.[`${item._id as string}`]?.minFinancedAmount?.message}
                              value={value as number}
                              onChange={(_, newValue) => {
                                onChange(newValue)
                                handleFinanceLimitItems('minFinancedAmount', newValue as number, index)
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className="col-lg-5 col-md-12 col-sm-12">
                        {' '}
                        <Controller
                          control={control}
                          name={`${item._id as string}.compatibleModels`}
                          rules={getValidation('compatibleModels')}
                          defaultValue={item.compatibleModels}
                          render={({ onChange, name, value }) => (
                            <MultiSelect
                              name={name}
                              label={messages.input.compatibleModels}
                              value={value as Array<CodeDisplayName['code']>}
                              onChange={(e: { value: string[] }) => {
                                onSelectModel(e.value, item, onChange, index)
                              }}
                              error={errors?.[`${item._id as string}`]?.compatibleModels?.message}
                              options={compatibleModels}
                            />
                          )}
                        />
                      </div>
                      <div className={cls(styles.deleteBtn, 'col-lg-2 col-md-12 col-sm-12')}>
                        <Icon
                          name="basket"
                          size={25}
                          onClick={() => onRemoveItem(item)}
                          className={isLoading ? styles.loading : undefined}
                        />
                      </div>
                    </div>
                    <div className="d-lg-none">
                      <Divider />
                    </div>
                  </>
                ))}
              <div className="d-none d-lg-block d-xl-block">
                <Divider />
              </div>
              <div className="d-flex w-100" data-testid="add-more-btn">
                <Button
                  type="button"
                  className="my-3 w-100"
                  disabled={false}
                  secondary
                  onClick={() => {
                    const items = [...financeLimitItems]
                    items.push({
                      compatibleModels: null,
                      minFinancedAmount: null,
                      _id: `${Math.random().toString(36).slice(7)}${Date.now()}`,
                    })
                    setFinanceLimitItems(items)
                  }}
                >
                  {messages.button.addNew}
                </Button>
              </div>
              <Divider />
              <div data-testid="finance-gp-btns" className={cls(styles.financeSaveBtnWrap, 'pt-2')}>
                <Button className="w-100" onClick={() => onHide()} secondary>
                  {messages.button.cancel}
                </Button>
                <Button className="w-100" loading={isLoading && messages.button.saving} type="submit">
                  {messages.button.save}
                </Button>
              </div>
            </>
          </Form>
        </div>
      </Dialog>
    </>
  )
}

export default FinancnedLimitForm
