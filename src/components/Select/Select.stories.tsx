import { Story, Meta } from '@storybook/react/types-6-0'

import Select, { SelectProps } from './Select'

const Component: Meta = {
  title: 'Controls/Select',
  component: Select,
}

export default Component

const Template: Story<SelectProps> = args => <Select {...args} />

export const example = Template.bind({})

example.args = {
  options: [
    {
      value: 1,
      label: 'One',
    },
    {
      value: '2',
      label: 'Two',
    },
    {
      value: 3,
    },
  ],
  placeholder: 'Select an option',
}
