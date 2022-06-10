import { Story, Meta } from '@storybook/react/types-6-0'

import Address, { AddressProps } from './Address'

const Component: Meta = {
  title: 'Basic/Address',
  component: Address,
}

export default Component

const Template: Story<AddressProps> = args => <Address {...args} />

export const example = Template.bind({})

example.args = {
  streetAddress: '2171 Sheringham Lane',
  city: 'Los Angeles',
  state: 'CA',
  zipCode: '90077',
}
