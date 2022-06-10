import { Story, Meta } from '@storybook/react/types-6-0'

import Field, { FieldProps } from './Field'

const Component: Meta = {
  title: 'Controls/Field',
  component: Field,
}

export default Component

const Template: Story<FieldProps> = args => <Field {...args} />

export const example = Template.bind({})

example.args = {
  children: <input />,
  name: 'id',
  label: 'Field',
  description: 'Common container for form fields like input and select',
  error: '',
}
