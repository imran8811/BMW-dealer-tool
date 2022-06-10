import { Story, Meta } from '@storybook/react/types-6-0'
import AutoComplete, { AutoCompleteType } from './autocomplete'

const Component: Meta = {
  title: 'Controls/AutoComplete',
  component: AutoComplete,
}

export default Component

const mock = ['New York', 'Rome', 'London', 'Istanbul', 'Paris']

const Template: Story<AutoCompleteType> = arg => {
  return <AutoComplete {...arg} />
}

export const example = Template.bind({})

example.args = {
  suggestions: mock,
}
