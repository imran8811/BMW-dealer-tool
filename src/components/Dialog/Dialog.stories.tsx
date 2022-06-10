import { Story, Meta } from '@storybook/react/types-6-0'
import { useState } from 'react'

import Dialog, { DialogProps } from './Dialog'

const Component: Meta = {
  title: 'Basic/Dialog',
  component: Dialog,
}

export default Component

const Template: Story<DialogProps> = () => {
  const [showDialog, setShowDialog] = useState(false)
  return (
    <>
      <button onClick={() => setShowDialog(true)}>Show dialog</button>
      <p>
        Use <code>useModal()</code> from <code>react-modal-hook</code> to manage modal&apos;s state.
      </p>
      <Dialog visible={showDialog} onHide={() => setShowDialog(false)}>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
      </Dialog>
    </>
  )
}

export const example = Template.bind({})

example.args = {
  focusOnShow: false,
}
