import { Story, Meta } from '@storybook/react/types-6-0'

import MaskedInput, { MaskedInputProps } from './MaskedInput'

const Component: Meta = {
  title: 'Controls/MaskedInput',
  component: MaskedInput,
  argTypes: {
    onChange: { action: 'changed' },
    small: { type: 'boolean' },
  },
}

export default Component

const Template: Story<MaskedInputProps> = args => <MaskedInput {...args} />

export const example = Template.bind({})

example.args = {
  name: 'phone',
  label: 'Phone No',
  mask: '9999-99999-99',
  small: false,
}
