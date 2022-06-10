import React from 'react'
import { ModalProvider } from 'react-modal-hook'
import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'
import { OrderDetails, OrderState, VehicleDetails, GetPricingDetailsResponse } from '@common/endpoints/typings.gen'

import order from './mockData/OrderAvailable.json'
import pricing from './mockData/pricingResponse.json'
import DealSummary, { messages } from '../DealSummary'

describe("BeginOrderSteps container's component DealSummary", () => {
  const dealSummaryProps: {
    order: OrderDetails
    vehicle: VehicleDetails
    pricing: GetPricingDetailsResponse
    calculatedTradeInBalance: { tradeInBalance: number; previousTradeInBalance: number }
  } = {
    order: (order.order as unknown) as OrderDetails,
    vehicle: (order.vehicle as unknown) as VehicleDetails,
    pricing,
    calculatedTradeInBalance: { tradeInBalance: 0, previousTradeInBalance: 0 },
  }
  test('Verify deal summary', () => {
    render(
      <ModalProvider>
        <DealSummary {...dealSummaryProps} />
      </ModalProvider>,
    )
    const {
      headings: { dealSummary },
      ...rest
    } = messages
    expect(screen.getByText(dealSummary)).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent(rest.buttons[OrderState.Available])
  })

  test('Verify order confirm state', () => {
    render(
      <ModalProvider>
        <DealSummary
          {...dealSummaryProps}
          order={{ ...dealSummaryProps.order, state: OrderState.Delivered } as OrderDetails}
        />
      </ModalProvider>,
    )
    const { buttons } = messages
    expect(screen.getByRole('button')).toHaveTextContent(buttons[OrderState.Delivered])
  })
})
