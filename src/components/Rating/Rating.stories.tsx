import { Story, Meta } from '@storybook/react/types-6-0'

import Rating, { RatingProps } from './Rating'

const Component: Meta = {
  title: 'Components/Rating',
  component: Rating,
}

export default Component

const Template: Story<RatingProps> = args => <Rating {...args} />

export const example = Template.bind({})

example.args = {}
