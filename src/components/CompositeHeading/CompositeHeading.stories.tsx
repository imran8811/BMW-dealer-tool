import { Story, Meta } from '@storybook/react/types-6-0'

import SectionHeading from '@components/SectionHeading'
import Button from '@components/Button'
import CompositeHeading, { CompositeHeadingProps } from './CompositeHeading'

const Component: Meta = {
  title: 'Components/CompositeHeading',
  component: CompositeHeading,
}

export default Component

const Template: Story<CompositeHeadingProps> = args => <CompositeHeading {...args} />

export const example = Template.bind({})

example.args = {
  children: (
    <>
      <SectionHeading icon="calendar">Some heading</SectionHeading>
      <Button>Button</Button>
    </>
  ),
}
