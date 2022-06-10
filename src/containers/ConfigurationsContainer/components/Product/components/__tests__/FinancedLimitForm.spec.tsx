import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import { ModalProvider } from 'react-modal-hook'
import FinancedLimitByModelForm, { financedMessages } from '..'
import MOCKED_DATA from './fixtures.json'

describe('Testing Finnace limit by model popup', () => {
  test('testing Buttons text & Buttons Functionality', async () => {
    const view = render(
      <ModalProvider>
        <FinancedLimitByModelForm
          dealerCode=""
          specificMinimumFinances={[]}
          compatibleModels={MOCKED_DATA.compatibleModels}
          onHide={() => {}}
        />
      </ModalProvider>,
    )
    const heading = await view.findByText(financedMessages.heading)
    // Testing Heading
    expect(heading).toBeVisible()

    const financedContent = await view.findByTestId('min-financed-amount-wrap')
    const fromElements = financedContent.firstChild
    // Testing that the form is empty
    expect(fromElements?.childNodes.length).toBe(5)
    const addMore = await view.findByTestId('add-more-btn')
    const addMoreBtn = addMore.firstChild

    fireEvent.click(addMoreBtn as Element)

    // Testing the form is populated with one row of input elements after addmore btn is clicked
    expect(fromElements?.childNodes.length).toBe(8)
    const actionBtns = await view.findByTestId('finance-gp-btns')
    const saveBtn = actionBtns.lastChild
    const cancelBtn = actionBtns.firstChild

    expect(saveBtn).toHaveTextContent(financedMessages.button.save)
    expect(cancelBtn).toHaveTextContent(financedMessages.button.cancel)
    fireEvent.click(saveBtn as Element)

    const errorText1 = await view.findByText('Minimum Financed Amount is Required')
    const errorText2 = await view.findByText('Model is Required')

    expect(errorText1).toBeInTheDocument()
    expect(errorText2).toBeInTheDocument()
  })
})
