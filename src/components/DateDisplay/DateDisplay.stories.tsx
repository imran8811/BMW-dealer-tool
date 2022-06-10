import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import { DateDisplayProps, DateDisplay } from './DateDisplay'

const Component: Meta = {
  title: 'Basic/DateDisplay',
  component: DateDisplay,
}

export default Component

const Template: Story<DateDisplayProps> = args => <DateDisplay {...args} />

export const withTimezone = Template.bind({})

withTimezone.args = {
  value: '2020-10-20T20:00:00Z',
  timezone: 'Europe/London',
}

export const defaultTimezone = Template.bind({})
defaultTimezone.args = {
  value: '2020-10-20T20:00:00Z',
}

export const dateFormat = Template.bind({})
dateFormat.args = {
  value: '2020-10-20T23:00:00Z',
  format: 'date',
}

export const timeOfDayFormat = Template.bind({})
timeOfDayFormat.args = {
  value: '2020-10-20T23:00:00Z',
  timezone: 'Europe/Warsaw',
  format: 'time-of-day',
}

export const shortDate = Template.bind({})
shortDate.args = {
  value: '2020-10-20T23:00:00Z',
  format: 'short-date',
}

export const timeFormat = Template.bind({})
timeFormat.args = {
  value: '2020-10-20T23:00:00Z',
  format: 'time',
}

export const dayNameFormat = Template.bind({})
dayNameFormat.args = {
  value: '2020-10-20T23:00:00Z',
  format: 'day-name',
}
