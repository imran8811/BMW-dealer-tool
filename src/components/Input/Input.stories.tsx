import { Story, Meta } from '@storybook/react/types-6-0'

import Input, { InputProps } from './Input'

const Component: Meta = {
  title: 'Controls/Input',
  component: Input,
  argTypes: {
    onClick: { action: 'clicked' },
    onChange: { action: 'changed' },
    onFocus: { action: 'focus' },
    onBlur: { action: 'blur' },
  },
}

export default Component

const Template: Story<InputProps> = args => <Input {...args} />

export const example = Template.bind({})

example.args = {
  name: 'id',
  label: 'Input',
  description: 'Description below the field',
  error: '',
}
