import { FC } from 'react'
import cls from 'classnames'
import styles from './Currency.module.scss'

type FormatCurrencyOptions = {
  locale?: string
  currency?: string
  className?: string
  skipDecimals?: boolean
  hideUnit?: boolean
  showBrackets?: boolean
  minimumFractionDigits?: number
}

export type CurrencyProps = FormatCurrencyOptions & {
  value: number
  className?: string
  showBrackets?: boolean
}

export const formatCurrency = (value: number, options?: FormatCurrencyOptions): string => {
  const { currency, locale, skipDecimals, hideUnit, minimumFractionDigits } = options || {}
  const parts = new Intl.NumberFormat(locale || 'en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: minimumFractionDigits !== undefined ? minimumFractionDigits : 2,
  })
    ?.formatToParts?.(value)
    ?.map(({ type, value: text }) => {
      if (skipDecimals && Number.isInteger(value) && ['decimal', 'fraction'].includes(type)) {
        return ''
      }
      if (hideUnit && type === 'currency') {
        return ''
      }

      return text
    })

  return parts?.join('')?.trim() || `${value}`
}

const Currency: FC<CurrencyProps> = ({
  value,
  currency,
  locale,
  skipDecimals,
  hideUnit,
  minimumFractionDigits,
  showBrackets,
  className,
}) => {
  return (
    <span className={cls(className, showBrackets && styles.bracketArround)}>
      {formatCurrency(value, {
        currency,
        locale,
        skipDecimals,
        hideUnit,
        minimumFractionDigits,
      })}
    </span>
  )
}

export default Currency
