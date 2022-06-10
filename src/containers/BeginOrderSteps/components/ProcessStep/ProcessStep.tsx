import { FC } from 'react'
import Stepper, { StepModel } from '@components/Stepper'
import ProgressStep from '@components/ProgressStep'

export interface IProcessStep {
  steps: Array<StepModel>
  activeStep: number
  onBack?: () => unknown
}

const ProcessStep: FC<IProcessStep> = ({ onBack, steps, activeStep }) => {
  const stepsToShow = steps.map(res => {
    const step = { ...res }
    if (step.value < activeStep) {
      step.isCompleted = true
    } else if (step.value === activeStep) {
      step.isCurrent = true
    }
    return step
  })
  const activeStepIndex = activeStep - 1
  const currentStep = stepsToShow[activeStepIndex]
  const nextStep = stepsToShow[activeStep]

  const step = {
    currentLabel: currentStep?.label,
    nextLabel: nextStep ? `Next: ${nextStep.label}` : '',
    totalSteps: stepsToShow.length,
    currentStep: currentStep?.value,
  }

  return (
    <div className="col-sm-6 col-md-8 col-lg-6 co-xl-5 col-xxl-4 text-center text-sm-right">
      <div className="d-none d-lg-block">
        <Stepper steps={stepsToShow} />
      </div>
      <div className="d-lg-none d-block">
        <ProgressStep onBack={onBack} step={step} />
      </div>
    </div>
  )
}

export default ProcessStep
