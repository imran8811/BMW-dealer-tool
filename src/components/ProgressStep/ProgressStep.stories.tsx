import { Story, Meta } from '@storybook/react/types-6-0'
import ProgressStep, { ProgressStepProps } from './ProgressStep'

const Component: Meta = {
  title: 'Components/ProgressStep',
  component: ProgressStep,
}

export default Component

const Template: Story<ProgressStepProps> = args => <ProgressStep {...args} />

export const example = Template.bind({})

example.args = {
  step: {
    currentLabel: 'Begin Order',
    nextLabel: 'Set Availablilty',
    totalSteps: 3,
    currentStep: 1,
  },
}
