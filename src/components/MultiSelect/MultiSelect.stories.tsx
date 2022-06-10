import { Story, Meta } from '@storybook/react/types-6-0'

import MultiSelect, { MultiSelectProps } from './MultiSelect'

const Component: Meta = {
  title: 'Controls/MultiSelect',
  component: MultiSelect,
  argTypes: {
    small: { type: 'boolean' },
    header: { type: 'boolean' },
  },
}

export default Component

const mock = [
  { label: 'New York', value: 'NY' },
  { label: 'Rome', value: 'RM' },
  { label: 'London', value: 'LDN' },
  { label: 'Istanbul', value: 'IST' },
  { label: 'Paris', value: 'PRS' },
]

const Template: Story<MultiSelectProps> = args => (
  <div style={{ minHeight: '300px' }}>
    <MultiSelect {...args} />
  </div>
)

export const example = Template.bind({})

example.args = {
  options: mock,
  value: [mock[2].value, mock[4].value],
  header: false,
}
