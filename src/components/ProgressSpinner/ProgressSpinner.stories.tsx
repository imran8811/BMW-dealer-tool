import { Story, Meta } from '@storybook/react/types-6-0'

import ProgressSpinner, { ProgressSpinnerProps } from './ProgressSpinner'

const Component: Meta = {
  title: 'Components/ProgressSpinner',
  component: ProgressSpinner,
  argTypes: {
    size: {
      description: '`number` of pixels',
      defaultValue: 100,
    },
    strokeWidth: {
      description: "`string`. if `undefined`, it's calculated based on `size`",
    },
  },
}

export default Component

const Template: Story<ProgressSpinnerProps> = args => <ProgressSpinner {...args} />

export const example = Template.bind({})

example.args = {
  animationDuration: '2s',
  size: 100,
}
