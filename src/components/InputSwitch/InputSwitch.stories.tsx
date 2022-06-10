import { Story, Meta } from '@storybook/react/types-6-0'
import { useState } from 'react'

import InputSwitch, { InputSwitchProps } from './InputSwitch'

const Component: Meta = {
  title: 'Controls/InputSwitch',
  component: InputSwitch,
  argTypes: {
    checked: { type: 'boolean' },
    disabled: { type: 'boolean' },
    onChange: { action: 'changed' },
  },
}

export default Component

const Template: Story<InputSwitchProps> = ({ ...args }) => <InputSwitch {...args} />
const StatefulTemplate: Story<InputSwitchProps> = ({ checked, ...args }) => {
  const [state, setState] = useState<boolean>(checked || false)
  return <InputSwitch checked={state} {...args} onChange={() => setState(!state)} />
}

export const example = StatefulTemplate.bind({})

example.args = {
  name: 'example',
  children: 'label',
}

export const checked = Template.bind({})

checked.args = {
  checked: true,
  name: 'example-checked',
  children: 'Checked',
}

export const unchecked = Template.bind({})

unchecked.args = {
  checked: false,
  name: 'example-unchecked',
  children: 'Unchecked',
}
