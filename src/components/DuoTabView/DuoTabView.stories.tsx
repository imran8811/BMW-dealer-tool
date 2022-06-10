import { Story, Meta } from '@storybook/react/types-6-0'
import TabPanel from './component/TabPanel'
import TabView, { TabViewProps } from './DuoTabView'

const Component: Meta = {
  title: 'Components/TabView',
  component: TabView,
}

export default Component

const Template: Story<TabViewProps> = () => {
  return (
    <TabView>
      <TabPanel header="Header 1">
        <p>Testing Panel-1 the content</p>
      </TabPanel>
      <TabPanel header="Header 2">
        <p>Testing Panel-2 the content</p>
      </TabPanel>
    </TabView>
  )
}

export const example = Template.bind({})

example.args = {}
