import { Story, Meta } from '@storybook/react/types-6-0'

import BaseLayout, { BaseLayoutProps } from './BaseLayout'

const Component: Meta = {
  title: 'Layouts/BaseLayout',
  component: BaseLayout,
}

export default Component

const Template: Story<BaseLayoutProps> = args => <BaseLayout {...args} />

export const example = Template.bind({})

example.args = {
  children: '[main]',
  aside: '[aside]',
  footer: '[footer]',
}
