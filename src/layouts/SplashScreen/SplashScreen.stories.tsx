import { Story, Meta } from '@storybook/react/types-6-0'

import SplashScreen, { SplashScreenProps } from './SplashScreen'

const Component: Meta = {
  title: 'Layouts/SplashScreen',
  component: SplashScreen,
}

export default Component

const Template: Story<SplashScreenProps> = args => <SplashScreen {...args} />

export const example = Template.bind({})

example.args = {
  children: '[main]',
}
