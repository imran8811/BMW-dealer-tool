import { Story, Meta } from '@storybook/react/types-6-0'

import Navigation, { NavigationProps } from './Navigation'

const Component: Meta = {
  title: 'Components/Navigation',
  component: Navigation,
  argTypes: {
    withTicker: {
      defaultValue: true,
      description: 'Show additional info on top (default: `true`)',
    },
  },
}

export default Component

const Template: Story<NavigationProps> = args => (
  <div style={{ minHeight: '400px', background: '#f1f1f1' }}>
    <Navigation {...args} />
  </div>
)

export const navigation = Template.bind({})

navigation.args = {
  username: 'Slava Kornilov',
  withTicker: true,
  items: [
    {
      label: 'Orders',
      badgeCount: 34,
    },
    {
      label: 'Inventory Management',
    },
    {
      label: 'User Management',
      isActive: true,
    },
    {
      label: 'F&I Products',
    },
  ],
}
