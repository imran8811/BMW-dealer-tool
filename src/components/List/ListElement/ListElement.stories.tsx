import { Story, Meta } from '@storybook/react/types-6-0'

import ListElement, { ListElementProps } from './ListElement'

const Component: Meta = {
  title: 'Components/List/ListElement',
  component: ListElement,
}

export default Component

const Template: Story<ListElementProps> = args => <ListElement {...args} />

export const example = Template.bind({})

example.args = {}

export const expandable = Template.bind({})

expandable.args = {
  expandable: true,
}
