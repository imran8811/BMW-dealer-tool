import React from 'react'
import '../src/common/styles/global.scss'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    // https://storybook.js.org/docs/react/writing-stories/naming-components-and-hierarchy#sorting-stories
    storySort: {
      method: 'alphabetical',
      order: ['Basic', 'Controls', 'Components', 'Layouts'],
    },
  },
}

export const decorators = [Story => React.createElement(Story)]
