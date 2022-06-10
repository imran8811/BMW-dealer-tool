import React from 'react'
import { ModalProvider } from 'react-modal-hook'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useOptions } from '@common/endpoints/useFeeTags'
import '@testing-library/jest-dom/extend-expect'
import { renderHook } from '@testing-library/react-hooks'

import FeeTagForm, { messages } from '../../components/FeeTagForm'
import MOCKED_DATA from '../fixtures.json'

jest.mock('@common/endpoints/useFeeTags', () => ({
  __esModule: true,
  default: () => ({ ...MOCKED_DATA.feeTags }),
  useOptions: () => ({
    states: MOCKED_DATA.options.states,
    financialProducts: MOCKED_DATA.options.financialProducts,
    statesMap: new Map([]),
    financialProductsMap: new Map([]),
  }),
  useMutationFeeTag: () => ({
    mutate: () => ({ ...MOCKED_DATA.feeTag }),
  }),
}))

jest.mock('@common/endpoints/useReferenceData', () => ({
  __esModule: true,
  default: () => ({ data: MOCKED_DATA.referenceData }),
}))

jest.mock('@common/endpoints/fees', () => ({
  __esModule: true,
  useCharges: () => ({
    data: MOCKED_DATA.charges,
    options: MOCKED_DATA.charges.map(item => ({ label: item.chargeDisplayName, value: item.chargeCode })),
  }),
}))

describe("FeeTag container's component FeeTagForm", () => {
  const handleFormClose = jest.fn()
  test('Verify fee tag form labels', () => {
    render(
      <ModalProvider>
        <FeeTagForm
          statesMap={new Map([])}
          states={[]}
          financialProducts={[]}
          feeTagData={MOCKED_DATA.feeTag}
          handleFormClose={handleFormClose}
        />
      </ModalProvider>,
    )
    expect(screen.getByText(messages.input.chargeCode)).toBeInTheDocument()
    expect(screen.getByText(messages.input.productCode)).toBeInTheDocument()
    expect(screen.getByText(messages.input.stateCode)).toBeInTheDocument()
    expect(screen.getByText(messages.input.tagName)).toBeInTheDocument()
  })

  test('Verify fee tag input values in case of create', () => {
    render(
      <ModalProvider>
        <FeeTagForm
          statesMap={new Map([])}
          states={[]}
          financialProducts={[]}
          feeTagData={null}
          handleFormClose={handleFormClose}
        />
      </ModalProvider>,
    )
    expect(screen.getByLabelText(messages.input.chargeCode)).toHaveValue('')
    expect(screen.getByLabelText(messages.input.productCode)).toHaveValue('')
    expect(screen.getByLabelText(messages.input.stateCode)).toHaveValue('')
    expect(screen.getByLabelText(messages.input.tagName)).toHaveValue('')
    userEvent.type(screen.getByLabelText(messages.input.tagName), 'abc')
    expect(screen.getByTestId('tagName')).toHaveValue('abc')
  })

  test('Verify fee tag input values in case of update', () => {
    render(
      <ModalProvider>
        <FeeTagForm
          statesMap={new Map([])}
          states={[]}
          financialProducts={[]}
          feeTagData={MOCKED_DATA.feeTag}
          handleFormClose={handleFormClose}
        />
      </ModalProvider>,
    )
    expect(screen.getByDisplayValue(MOCKED_DATA.feeTag.tagName)).toBeInTheDocument()
  })

  test('Verify fee tag cancel btn', () => {
    render(
      <ModalProvider>
        <FeeTagForm
          statesMap={new Map([])}
          states={[]}
          financialProducts={[]}
          feeTagData={MOCKED_DATA.feeTag}
          handleFormClose={handleFormClose}
        />
      </ModalProvider>,
    )
    const cancelBtn = screen.getByTestId('cancelBtn')
    fireEvent.click(cancelBtn)
    expect(handleFormClose).toBeCalled()
  })

  test('verifying states and financialProducts data', () => {
    const {
      result: {
        current: { states, statesMap, financialProducts },
      },
    } = renderHook(() => useOptions())
    expect(states.length).toBe(2)
    expect(financialProducts.length).toBe(2)
    const { getByTestId, getByText } = render(
      <ModalProvider>
        <FeeTagForm
          statesMap={statesMap}
          states={states}
          financialProducts={financialProducts}
          feeTagData={MOCKED_DATA.feeTag}
          handleFormClose={handleFormClose}
        />
      </ModalProvider>,
    )
    userEvent.selectOptions(getByTestId('stateCode'), states[0].value)
    expect((getByText(states[0].label) as HTMLOptionElement).selected).toBeTruthy()
    expect((getByText(states[1].label) as HTMLOptionElement).selected).toBeFalsy()

    userEvent.selectOptions(getByTestId('productCode'), financialProducts[0].value)
    expect((getByText(financialProducts[0].label) as HTMLOptionElement).selected).toBeTruthy()
    expect((getByText(financialProducts[1].label) as HTMLOptionElement).selected).toBeFalsy()
  })
})
