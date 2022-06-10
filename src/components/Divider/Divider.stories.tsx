import { Story, Meta } from '@storybook/react/types-6-0'

import Divider from './Divider'

const Component: Meta = {
  title: 'Basic/Divider',
  component: Divider,
}

export default Component

const Template: Story = args => <Divider {...args} />

export const example = Template.bind({})

example.args = {}
