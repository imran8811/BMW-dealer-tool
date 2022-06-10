import { FC } from 'react'
import cls from 'classnames'
import Icon from '@components/Icon'
import styles from './Step.module.scss'

export type StepModel = {
  label: string
  isCurrent: boolean
  isCompleted: boolean
  value: number
}

export interface StepProps {
  step: StepModel
}

const Step: FC<StepProps> = ({ step }) => {
  const stepClass = step.isCurrent ? 'p-highlight p-steps-current font-weight-bold' : ' p-disabled'
  return (
    <li className={cls(stepClass, 'p-steps-item')} role="tab" aria-selected="true" aria-expanded="true">
      <a className="p-menuitem-link" role="presentation">
        {step.isCompleted ? (
          <span className="p-steps-number font-weight-bold text-primary">
            <Icon name="checkmark" />
          </span>
        ) : (
          <span className={cls('p-steps-number font-weight-bold')}>{step.value}</span>
        )}
        <span className={cls('p-steps-title text-capitalize', styles.stepLabel)}>{step.label}</span>
      </a>
    </li>
  )
}

export default Step
