import { Story, Meta } from '@storybook/react/types-6-0'

import Icon, { IconProps } from './Icon'
import * as icons from './assets'

const Component: Meta = {
  title: 'Basic/Icon',
  component: Icon,
}

export default Component

const Template: Story<IconProps> = args => <Icon {...args} />

export const example = Template.bind({})

example.args = {
  name: 'arrow',
}

const Showcase: Story = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', color: '#6d6d78' }}>
    {Object.keys(icons).map(name => (
      <div style={{ padding: '0.5rem' }} key={name}>
        <div style={{ textAlign: 'center' }}>
          <Icon name={name as IconProps['name']} />
        </div>
        {name}
      </div>
    ))}
  </div>
)

export const showcase = Showcase.bind({})
showcase.parameters = {
  docs: {
    storyDescription: 'List of all icons added to `src/components/Icon/assets/index.ts`',
  },
}
