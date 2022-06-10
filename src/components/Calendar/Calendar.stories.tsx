import { Story, Meta } from '@storybook/react/types-6-0'

import Calendar, { CalendarProps } from './Calendar'

const Component: Meta = {
  title: 'Controls/Calendar',
  component: Calendar,
  argTypes: {
    showButtonBar: { description: 'Show "Today" and "Clear" buttons.' },
  },
}

export default Component

const Template: Story<CalendarProps> = args => (
  <div style={{ minHeight: '460px' }}>
    <Calendar {...args} />
  </div>
)

export const example = Template.bind({})

example.args = {
  showButtonBar: true,
}

example.parameters = {
  docs: {
    storyDescription: 'Extends [PrimeReact Calendar](https://primefaces.org/primereact/showcase/#/calendar)',
  },
}
