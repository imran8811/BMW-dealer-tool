import { Story, Meta } from '@storybook/react/types-6-0'
import SelectableTextArea, { SelectableTextAreaType } from './SelectableTextArea'

const Component: Meta = {
  title: 'Controls/SelectableTextArea',
  component: SelectableTextArea,
}

export default Component

const Template: Story<SelectableTextAreaType> = arg => {
  return <SelectableTextArea {...arg} />
}

export const example = Template.bind({})

example.args = {}
