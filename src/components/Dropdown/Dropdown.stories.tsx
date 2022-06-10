import { Story, Meta } from '@storybook/react/types-6-0'

import Dropdown, { DropdownProps } from './Dropdown'

const Component: Meta = {
  title: 'Controls/Dropdown',
  component: Dropdown,
  argTypes: {
    onChange: { type: 'action' },
  },
}

const citySelectItems = [
  { label: 'New York', value: 'NY' },
  { label: 'Rome', value: 'RM' },
  { label: 'London', value: 'LDN' },
  { label: 'Istanbul', value: 'IST' },
  { label: 'Paris', value: 'PRS' },
]

export default Component

const Template: Story<DropdownProps> = args => (
  <div style={{ minHeight: '300px' }}>
    <Dropdown {...args} />
  </div>
)

export const example = Template.bind({})

example.args = {
  options: citySelectItems,
  value: citySelectItems[2].value,
}
