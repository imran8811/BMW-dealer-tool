import { ChangeEvent, createRef, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import cls from 'classnames'
import { formatCurrency } from '@components/Currency'
import Input, { InputProps } from '@components/Input'
import styles from './NumberInput.module.scss'

export type NumberInputProps = {
  min?: number
  max?: number
  noMax?: boolean
  fractionDigits?: number
  currencySymbol?: string
  suffix?: string
  value?: number | string
  name: string
  error?: ReactNode
  label?: ReactNode
  placeholder?: string
  left?: boolean
  className?: string
  containerClass?: string
  mode?: 'decimal' | 'currency' | 'percentage'
  defaultValue?: number | string | true // prevents `undefined` on empty input, `true` => 0
  onChange?: (e: ChangeEvent | FocusEvent, value?: number) => void
  alphabeticalKeypad?: boolean
  customOnBlur?: () => unknown
  displayName?: string
} & Omit<InputProps, 'value' | 'onChange' | 'defaultValue'>

const NumberInput: FC<NumberInputProps> = ({
  value,
  label,
  placeholder,
  name,
  className,
  containerClass,
  error,
  noMax,
  left,
  onChange,
  mode,
  fractionDigits,
  max,
  min,
  suffix,
  defaultValue,
  alphabeticalKeypad,
  customOnBlur,
  displayName,
  ...props
}) => {
  const ref = createRef<HTMLInputElement & HTMLTextAreaElement>()
  const [errorText, setErrorText] = useState<string>('')
  const [isActive, setIsActive] = useState<boolean>()
  const options = useMemo(() => {
    const config: {
      suffix?: string
      fractionDigits?: number
      min?: number
      max?: number
    } = {}

    if (mode === 'currency') {
      config.fractionDigits = 2
    }

    if (mode === 'percentage') {
      config.suffix = '%'
      config.fractionDigits = 0
      config.min = 0
      config.max = noMax ? undefined : 100
    }

    if (fractionDigits !== undefined) {
      config.fractionDigits = fractionDigits
    }
    if (max !== undefined) {
      config.max = max
    }
    if (min !== undefined) {
      config.min = min
    }

    return config
  }, [fractionDigits, min, max, mode, noMax])

  /**
   * Parse `number` from input (initial value or keyboard input)
   * should return `undefined` on any error
   */
  const getParsedNumberValue = useCallback(
    (v?: number | string): number | undefined => {
      if (v === undefined || v === null || v === '' || Number.isNaN(v)) {
        if (defaultValue !== undefined) {
          return typeof defaultValue === 'number' || typeof defaultValue === 'string'
            ? getParsedNumberValue(defaultValue)
            : 0
        }
        return undefined
      }

      if (typeof v === 'string') {
        return getParsedNumberValue(Number.parseFloat(v))
      }

      if (options?.max !== undefined && v > options.max) {
        return options.max
      }
      if (options?.min !== undefined && v < options.min) {
        return options.min
      }
      if (options.fractionDigits !== undefined) {
        return Number.parseFloat(v.toFixed(options.fractionDigits))
      }

      return v
    },
    [defaultValue, options.fractionDigits, options.max, options.min],
  )

  /**
   * Set value of input during typing
   */
  const getStringValue = useCallback(
    (num: number | undefined) => {
      if (num === undefined || Number.isNaN(num)) {
        return ''
      }

      if (options.fractionDigits !== undefined) {
        return num.toFixed(options.fractionDigits)
      }

      return num.toString()
    },
    [options.fractionDigits],
  )

  // Internal state - needed for consistent output of `number` when formatting input (or "value when focused") as string
  const [internalStringValue, setInternalStringValue] = useState<string>(getStringValue(getParsedNumberValue(value)))
  // when value updates without calling onchange
  const setdisplayValue = useCallback(
    val => {
      setInternalStringValue(val)
    },
    [setInternalStringValue],
  )
  useEffect(() => {
    setdisplayValue(value)
  }, [setdisplayValue, value])

  /** Capitalize First Letter */
  const capFirstLetter = (str: string) =>
    str
      .toLowerCase()
      .split(' ')
      .map(e => `${e.charAt(0).toUpperCase()}${e.slice(1)}`)
      .join(' ')

  /**
   * Format what is visible when input isn't in focus
   */
  const formattedValue = useMemo<string>(() => {
    const numberValue = getParsedNumberValue(internalStringValue)

    if (numberValue === undefined) {
      return ''
    }

    if (mode === 'currency') {
      return formatCurrency(numberValue, {
        minimumFractionDigits: options.fractionDigits,
      })
    }

    if (mode === 'percentage') {
      return `${numberValue.toFixed(options.fractionDigits)}%`
    }

    if (options.fractionDigits !== undefined) {
      return `${numberValue.toFixed(options.fractionDigits)} ${suffix || ''}`
    }

    return `${numberValue} ${suffix || ''}`
  }, [internalStringValue, mode, options, getParsedNumberValue, suffix])

  return (
    <Input
      {...props}
      lang="en-US"
      data-testid="number-input-test-id"
      // eslint-disable-next-line no-nested-ternary
      inputMode={alphabeticalKeypad ? undefined : options.fractionDigits !== 0 ? 'decimal' : 'numeric'}
      onFocus={() => setIsActive(true)}
      onBlur={e => {
        if (onChange) {
          const num = getParsedNumberValue(internalStringValue)
          onChange(e, num)
          setInternalStringValue(getStringValue(num))

          setIsActive(false)
          customOnBlur?.()
        }
      }}
      // eslint-disable-next-line no-nested-ternary
      type={alphabeticalKeypad ? 'text' : isActive ? 'number' : 'text'}
      name={name}
      label={label}
      placeholder={placeholder}
      error={error || errorText}
      ref={ref}
      value={
        isActive && internalStringValue !== null && internalStringValue !== undefined
          ? internalStringValue
          : formattedValue // defaults to "" (empty string)
      }
      min={isActive ? options.min : undefined}
      max={isActive ? options.max : undefined}
      step={isActive && options.fractionDigits !== undefined ? 1 / 10 ** options.fractionDigits : undefined}
      onChange={e => {
        if (onChange) {
          const v: string = e?.target?.value
          if (min === 0 && Number.parseFloat(v) < 0) {
            setErrorText(`${capFirstLetter(displayName || name)} cannot be negative`)
            return
          }
          if (min && Number.parseFloat(v) < min) {
            setErrorText(`${capFirstLetter(displayName || name)} cannot be less than ${min}`)
            return
          }
          setErrorText('')
          /**
           * If input is greater than maximum value then don't let it enter the value
           */
          const diff = (max || Number.parseFloat(v || '0')) - Number.parseFloat(v || '0')
          if (diff >= 0 || (v === '-' && alphabeticalKeypad)) {
            setInternalStringValue(v)
            onChange(e, getParsedNumberValue(v))
          }
        }
      }}
      className={cls(styles.formControl, !left && styles.right, className)}
      containerClass={cls(styles.numberInputWrapper, containerClass)}
    />
  )
}

export default NumberInput
