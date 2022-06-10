import { Story, Meta } from '@storybook/react/types-6-0'
import { useState } from 'react'

import ConfirmationDialog, { ConfirmationDialogProps } from './ConfirmationDialog'

const Component: Meta = {
  title: 'Components/ConfirmationDialog',
  component: ConfirmationDialog,
}

export default Component

const Template: Story<ConfirmationDialogProps> = () => {
  const [showDialog, setShowDialog] = useState(false)
  return (
    <>
      <button onClick={() => setShowDialog(true)}>Show dialog</button>
      <ConfirmationDialog
        visible={showDialog}
        onClose={() => setShowDialog(false)}
        title="This is title"
        message="This is message"
        acceptBtnText="Yes"
        onAccept={() => setShowDialog(false)}
        rejectBtnText="No"
        onReject={() => setShowDialog(false)}
      />
    </>
  )
}

export const example = Template.bind({})

example.args = {}
