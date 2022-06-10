import { Story, Meta } from '@storybook/react/types-6-0'

import NumberInput, { NumberInputProps } from './NumberInput'

const Component: Meta = {
  title: 'Controls/NumberInput',
  component: NumberInput,
  argTypes: {
    mode: {
      control: {
        type: 'select',
        options: ['decimal', 'currency', 'percentage'],
      },
    },
  },
}

export default Component

const Template: Story<NumberInputProps> = args => <NumberInput {...args} />

export const example = Template.bind({})

example.args = {
  name: 'id',
  mode: 'currency',
  label: 'Input',
  description: 'Description below the field',
  error: '',
  onClear: undefined,
}
