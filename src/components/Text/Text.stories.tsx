import { Story, Meta } from '@storybook/react/types-6-0'

import Text, { TextProps } from './Text'

const Component: Meta = {
  title: 'Basic/Text',
  component: Text,
}

export default Component

const Template: Story<TextProps> = args => <Text {...args} />

export const example = Template.bind({})

example.args = {
  source:
    '**Select your vehicle.** Customize your pricing. ' +
    'Choose from _Lease_, _Finance_, or _Cash_. Sign your paperwork online.' +
    '\n\n' +
    'Your MINI, your way, your life.',
}

example.parameters = {
  docs: {
    storyDescription:
      'Formatting with `react-markdown`. [See more examples](https://rexxars.github.io/react-markdown/)',
  },
}
