import { Story, Meta } from '@storybook/react/types-6-0'

import NotFound from './NotFound'

const Component: Meta = {
  title: 'Layouts/NotFound',
  component: NotFound,
}

export default Component

const Template: Story = args => <NotFound {...args} />

export const example = Template.bind({})

example.args = {}
