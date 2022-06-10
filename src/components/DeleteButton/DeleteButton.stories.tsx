import { Story, Meta } from '@storybook/react/types-6-0'

import DeleteButton, { DeleteButtonProps } from './deleteButton'

const Component: Meta = {
  title: 'Components/DeleteButton',
  component: DeleteButton,
}

export default Component

const Template: Story<DeleteButtonProps> = args => <DeleteButton {...args} />

export const example = Template.bind({})

example.args = {}
