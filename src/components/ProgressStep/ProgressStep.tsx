import { FC } from 'react'
import cls from 'classnames'
import Icon from '@components/Icon'
import styles from './ProgressStep.module.scss'

type ProcessStepModal = {
  currentLabel: string
  nextLabel?: string
  totalSteps: number
  currentStep: number
}

export interface ProgressStepProps {
  step: ProcessStepModal
  onBack?: () => unknown
}

const Steps: FC<ProgressStepProps> = ({ onBack, step }) => {
  const stepperValue = Math.floor((step.currentStep / step.totalSteps) * 100)
  return (
    <div className="d-flex justify-content-start align-items-center">
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          <Icon name="arrow" className="text-secondary " />
        </button>
      )}
      <div className={cls(styles['progress--circle'], styles[`progress--${stepperValue}`])}>
        <div className={styles.progress__number}>
          {step.currentStep}/{step.totalSteps}
        </div>
      </div>
      <div className={cls(styles.steps, '')}>
        <div className={cls(styles.current, 'text-uppercase text-left')}>{step.currentLabel}</div>
        {step.nextLabel ? <div className={styles.next}>{step.nextLabel}</div> : null}
      </div>
    </div>
  )
}

export default Steps
