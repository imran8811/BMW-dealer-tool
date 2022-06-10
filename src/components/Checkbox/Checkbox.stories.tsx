import { Story, Meta } from '@storybook/react/types-6-0'

import Checkbox, { CheckboxProps } from './Checkbox'

const Component: Meta = {
  title: 'Controls/Checkbox',
  component: Checkbox,
  argTypes: {
    onClick: { action: 'clicked' },
  },
}

export default Component

const Template: Story<CheckboxProps> = args => <Checkbox {...args} />

export const example = Template.bind({})

example.args = {
  name: 'checkbox',
  children: 'Label',
}
