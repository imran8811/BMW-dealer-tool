import { Story, Meta } from '@storybook/react/types-6-0'

import FeaturesList, { FeaturesListProps } from './FeaturesList'

const Component: Meta = {
  title: 'Components/FeaturesList',
  component: FeaturesList,
}

export default Component

const Template: Story<FeaturesListProps> = args => <FeaturesList {...args} />

export const example = Template.bind({})

example.args = {
  title: 'FeaturesList',
  children: () => <span>test</span>,
}
