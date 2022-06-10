import { FC } from 'react'

export type NumberProps = {
  value: number
  locale?: string
  style?: 'decimal' | 'percent'
  className?: string
  minimumFractionDigits?: number
}

export const useNumberFormatter = (
  value: NumberProps['value'],
  params?: Pick<NumberProps, 'style' | 'minimumFractionDigits' | 'locale'>,
): string =>
  new Intl.NumberFormat(params?.locale || 'en-US', {
    style: params?.style || 'decimal',
    minimumFractionDigits: params?.minimumFractionDigits || 0,
  }).format(value)

/**
 * File exports `useNumberFormatter` hook
 */
const NumberComponent: FC<NumberProps> = ({ value, style, locale, minimumFractionDigits, className }) => {
  const result = useNumberFormatter(value, { locale, minimumFractionDigits, style })
  return <span className={className}>{result}</span>
}

export default NumberComponent
