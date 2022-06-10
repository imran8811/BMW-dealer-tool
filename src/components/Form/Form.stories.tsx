import { Story, Meta } from '@storybook/react/types-6-0'

import Form, { FormProps } from './Form'

const Component: Meta = {
  title: 'Basic/Form',
  component: Form,
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
}

export default Component

const Template: Story<FormProps> = args => <Form {...args} />

export const example = Template.bind({})

example.args = {
  error: 'This is an error prop value on <Form> component',
}
