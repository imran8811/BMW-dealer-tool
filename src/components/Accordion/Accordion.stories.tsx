import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import AccordionTab from './components/AccordionTab'

import Accordion, { AccordionProps } from './Accordion'

const Component: Meta = {
  title: 'Components/Accordion',
  component: Accordion,
}

export default Component

const Template: Story<AccordionProps> = args => <Accordion {...args} />

export const example = Template.bind({})

example.args = {
  children: (
    <AccordionTab header="Header I">
      <p>Lorem ipsum</p>
    </AccordionTab>
  ),
}
