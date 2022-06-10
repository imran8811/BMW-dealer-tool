import { Story, Meta } from '@storybook/react/types-6-0'

import SwitchCase, { SwitchCaseProps } from './SwitchCase'

const Component: Meta = {
  title: 'SwitchCase',
  component: SwitchCase,
}

export default Component

const Template: Story<SwitchCaseProps> = args => <SwitchCase {...args} />

export const example = Template.bind({})

example.args = {}
