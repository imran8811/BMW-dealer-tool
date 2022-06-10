import { Story, Meta } from '@storybook/react/types-6-0'

import Button, { ButtonProps } from './Button'

const Component: Meta = {
  title: 'Basic/Button',
  component: Button,
  argTypes: {
    onClick: { action: 'clicked' },
    center: {
      type: 'boolean',
    },
    fullWidth: {
      type: 'boolean',
      defaultValue: false,
    },
    secondary: {
      type: 'boolean',
    },
    tertiary: {
      type: 'boolean',
    },
    hoverPrimary: {
      type: 'boolean',
    },
  },
}

export default Component

const Template: Story<ButtonProps> = args => <Button {...args} />

export const example = Template.bind({})

example.args = {
  children: 'Button',
  type: 'button',
}

export const secondary = Template.bind({})

secondary.args = {
  children: 'Secondary button style',
  secondary: true,
}
