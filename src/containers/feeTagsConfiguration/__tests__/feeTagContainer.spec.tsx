import React from 'react'
import { ModalProvider } from 'react-modal-hook'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import FeeTag, { messages } from '../feeTagContainer'

describe("FeeTag container's component feeTagContainer", () => {
  test('Verify fee tag', () => {
    render(
      <ModalProvider>
        <FeeTag />
      </ModalProvider>,
    )
    expect(screen.getByText('Fee Tag Configuration')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent(messages.addNewFeeTag)
  })
})
