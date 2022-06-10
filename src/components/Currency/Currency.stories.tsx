import { Story, Meta } from '@storybook/react/types-6-0'

import Currency, { CurrencyProps } from './Currency'

const Component: Meta = {
  title: 'Basic/Currency',
  component: Currency,
  argTypes: {
    skipDecimals: { type: 'boolean', defaultValue: true },
    hideUnit: { type: 'boolean', defaultValue: false },
    currency: {
      defaultValue: '',
      control: { type: 'select', options: ['USD', 'PLN', 'EUR', 'GBP'] },
    },
  },
}

export default Component

const Template: Story<CurrencyProps> = args => <Currency {...args} />

export const example = Template.bind({})

example.args = {
  value: 33050,
  locale: 'en-US',
}
