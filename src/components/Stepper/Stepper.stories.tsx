import { Story, Meta } from '@storybook/react/types-6-0'
import Stepper, { StepperProps } from './Stepper'

const Component: Meta = {
  title: 'Components/Stepper',
  component: Stepper,
}

export default Component

const Template: Story<StepperProps> = args => <Stepper {...args} />

export const example = Template.bind({})
const steps = [
  {
    label: 'Begin Order',
    value: 1,
    isCurrent: false,
    isCompleted: true,
  },
  {
    label: 'Set Availablilty',
    value: 2,
    isCurrent: true,
    isCompleted: false,
  },
  {
    label: 'Complete Order',
    value: 3,
    isCurrent: false,
    isCompleted: false,
  },
]
example.args = {
  steps,
}
