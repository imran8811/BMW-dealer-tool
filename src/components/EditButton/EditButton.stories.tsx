import { Story, Meta } from '@storybook/react/types-6-0'

import EditButton, { EditButtonProps } from './EditButton'

const Component: Meta = {
  title: 'Components/EditButtons',
  component: EditButton,
}

export default Component

const Template: Story<EditButtonProps> = args => <EditButton {...args} />

export const example = Template.bind({})

example.args = {}
