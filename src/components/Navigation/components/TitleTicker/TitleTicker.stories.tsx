import { Story, Meta } from '@storybook/react/types-6-0'

import TitleTicker from './TitleTicker'

const Component: Meta = {
  title: 'Components/Navigation/TitleTicker',
  component: TitleTicker,
}

export default Component

const Template: Story = args => <TitleTicker {...args} />

export const example = Template.bind({})
