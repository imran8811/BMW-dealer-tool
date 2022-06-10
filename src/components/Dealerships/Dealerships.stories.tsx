import { Story, Meta } from '@storybook/react/types-6-0'

import Dealerships, { DealershipsProps } from './Dealerships'

const Component: Meta = {
  title: 'Components/Dealerships',
  component: Dealerships,
}

export default Component

const Template: Story<DealershipsProps> = args => <Dealerships {...args} />

export const example = Template.bind({})

example.args = {
  options: [
    {
      value: 1,
      label: 'Dealership 1',
    },
    {
      value: '2',
      label: 'default Dealership 2',
    },
    {
      value: 3,
      label: 'Dealership 3',
    },
  ],
  value: 1,
}
