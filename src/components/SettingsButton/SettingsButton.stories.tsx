import { Story, Meta } from '@storybook/react/types-6-0'

import SettingsButton, { SettingsButtonProps } from './SettingsButton'

const Component: Meta = {
  title: 'Components/SettingsButton',
  component: SettingsButton,
}

export default Component

const Template: Story<SettingsButtonProps> = args => <SettingsButton {...args} />

export const example = Template.bind({})

example.args = {}
