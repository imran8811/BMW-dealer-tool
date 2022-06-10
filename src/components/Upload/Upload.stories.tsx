import { Story, Meta } from '@storybook/react/types-6-0'

import Upload, { UploadProps } from './Upload'

const Component: Meta = {
  title: 'Controls/Upload',
  component: Upload,
}

export default Component

const Template: Story<UploadProps> = args => <Upload {...args} />

export const example = Template.bind({})

example.args = {}
