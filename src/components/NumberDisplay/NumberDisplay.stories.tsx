import { Story, Meta } from '@storybook/react/types-6-0'

import NumberDisplay, { NumberProps } from './NumberDisplay'

const Component: Meta = {
  title: 'Basic/NumberDisplay',
  component: NumberDisplay,
  argTypes: {
    style: {
      defaultValue: '',
      control: { type: 'select', options: ['decimal', 'percent'] },
    },
  },
}

export default Component

const Template: Story<NumberProps> = args => <NumberDisplay {...args} />

export const example = Template.bind({})

example.args = {
  value: -3890321.654,
  minimumFractionDigits: 0,
  style: 'decimal',
}
