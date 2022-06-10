import { FC } from 'react'
import {
  ProgressSpinner as PrimeProgressSpinner,
  ProgressSpinnerProps as PrimeProgressSpinnerProps,
} from 'primereact/progressspinner'

export type ProgressSpinnerProps = PrimeProgressSpinnerProps & {
  size?: number
}

const ProgressSpinner: FC<ProgressSpinnerProps> = ({ size, ...props }) => {
  const defaultSize = 100
  const width = `${(size || defaultSize) / 16}rem`
  const strokeWidth = `${100 / (size || defaultSize)}`

  return <PrimeProgressSpinner strokeWidth={strokeWidth} style={{ width, height: width }} {...props} />
}

export default ProgressSpinner
