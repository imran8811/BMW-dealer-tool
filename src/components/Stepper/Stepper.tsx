import { FC } from 'react'
import Step, { StepModel } from './components/Step'

export interface StepperProps {
  steps: Array<StepModel>
}

const Stepper: FC<StepperProps> = ({ steps }) => {
  return (
    <div id="pr_id_8" className="p-steps p-component">
      <ul role="tablist">
        {steps.length > 0 &&
          steps.map(step => {
            return <Step step={step} key={step.value} />
          })}
      </ul>
    </div>
  )
}

export default Stepper
