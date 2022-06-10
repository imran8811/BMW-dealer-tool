import { Story, Meta } from '@storybook/react/types-6-0'

import RadioGroup, { RadioboxProps, Radio, RadioGroupProps } from './Radiobox'

const Component: Meta = {
  title: 'Controls/RadioBox',
  component: RadioGroup,
  argTypes: {
    onClick: { action: 'clicked' },
  },
}

export default Component

const Template: Story<RadioboxProps & RadioGroupProps> = args => (
  <RadioGroup {...args}>
    <Radio value="1" key="1" name="1" />
  </RadioGroup>
)

export const example = Template.bind({})

example.args = {
  name: 'radiobox',
  children: 'Label',
}
