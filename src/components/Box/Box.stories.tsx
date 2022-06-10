import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import ListElement from '@components/List/ListElement'
import List from '@components/List'
import Divider from '@components/Divider'
import Box, { BoxProps } from './Box'

const Component: Meta = {
  title: 'Basic/Box',
  component: Box,
}

export default Component

const Template: Story<BoxProps> = args => <Box {...args} />

export const example = Template.bind({})

example.args = {
  content: <div>whatever</div>,
  title: 'Some title',
}

export const reviewSummary = Template.bind({})

reviewSummary.args = {
  children: (
    <>
      <List>
        <ListElement name="Vehicle price" value="$ 42,000.00" />
        <ListElement name="Capital Cost Reduction" value="$ (2,500.00)" />
        <ListElement expandable name="Financed Charges">
          <ListElement name="Fees" value="$ (1,351.00" />
          <ListElement name="License, Title, Registration" value="$ (350.00)" />
        </ListElement>
        <Divider />
        <ListElement name="Vehicle price" value="$ 42,000.00" />
        <ListElement name="Capital Cost Reduction" value="$ (2,500.00)" />
        <ListElement expandable name="Financed Charges">
          <ListElement name="Fees" value="$ (1,351.00" />
          <ListElement name="License, Title, Registration" value="$ (350.00)" />
        </ListElement>
      </List>
    </>
  ),
  title: 'Review summary',
}
