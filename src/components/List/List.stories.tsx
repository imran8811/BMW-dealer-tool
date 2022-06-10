import { Story, Meta } from '@storybook/react/types-6-0'

import List, { ListProps } from './List'
import ListElement from './ListElement'

const Component: Meta = {
  title: 'Components/List',
  component: List,
}

export default Component

const Template: Story<ListProps> = args => {
  return (
    <List {...args}>
      <ListElement name="Vehicle price" value="$42.000" />
      <ListElement name="Capital cost reduction" value="-$500" />
      <ListElement expandable name="Open it" value="-$500">
        <ListElement name="Wheel" value="$54.23" />
        <ListElement name="Suspension" value="$124.23" />
        <ListElement name="Driving wheel" value="$4.23" />
      </ListElement>
    </List>
  )
}

export const example = Template.bind({})

example.args = {}
