---
to: src/components/<%=name%>/<%=name%>.stories.tsx
---
import { Story, Meta } from '@storybook/react/types-6-0'

import <%=name%>, { <%=name%>Props } from './<%=name%>'

const Component: Meta = {
  title: 'Components/<%=name%>',
  component: <%=name%>,
}

export default Component

const Template: Story<<%=name%>Props> = args => <<%=name%> {...args} />

export const example = Template.bind({})

example.args = {}
