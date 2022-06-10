import { Story, Meta } from '@storybook/react/types-6-0'

import CustomerData, { CustomerDataProps } from './CustomerData'

const Component: Meta = {
  title: 'Components/CustomerData',
  component: CustomerData,
}

export default Component

const Template: Story<CustomerDataProps> = args => <CustomerData {...args} />

export const example = Template.bind({})

example.args = {}
