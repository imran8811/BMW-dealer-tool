import { Story, Meta } from '@storybook/react/types-6-0'

import DetailsRows, { DetailsRow, DetailsRowProps } from './DetailsRows'

const Component: Meta = {
  title: 'Components/DetailsRows',
  component: DetailsRows,
}

export default Component

const Template: Story<DetailsRowProps> = args => (
  <DetailsRows>
    <DetailsRow {...args} />
  </DetailsRows>
)

export const example = Template.bind({})

example.args = {
  label: 'label',
  children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
}
