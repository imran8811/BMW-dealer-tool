import { FC } from 'react'
import Icon from '@components/Icon'
import useStipulations, { DealerStipulation } from '@common/endpoints/useStipulations'
import ProgressSpinner from '@components/ProgressSpinner'
import { OrderState } from '@common/endpoints/typings.gen'

const messages = {
  stipsHeading: 'The credit application has resulted in some stips.',
  watchmsg: 'Please watch closely for updates on the checkout progress.',
  [OrderState.Confirmed]: 'The customer has started a credit application.',
  [OrderState.WaitingForCreditDecision]: 'The customer has submitted a credit application.',
  [OrderState.Rejected]: "The customer's credit application has been declined.",
  [OrderState.Approved]: "The customer's credit application has been approved.",
  /** TODO: Message Needs to be confirmed from business team */
  [OrderState.CreditError]: 'Credit Error',
  [OrderState.CreditStipulated]: 'Credit application has been conditionally approved with some stips.',
  [OrderState.WaitingForContractDecision]: 'Preparing documents for the customer to sign.',
  [OrderState.ContractApproved]: 'The customer is in the process of reviewing and signing contract documents.',
  [OrderState.DocumentsSigned]: 'The customer is in the process of payment.',
  [OrderState.PaymentFailed]: "The customer's payment attempt was unsuccessful.",
  [OrderState.PaymentPerformed]: "Congrats! The customer's payment was successful.",
}

interface Props {
  orderId: number
  orderState: keyof typeof OrderState
}

const CreditApplication: FC<Props> = ({ orderId, orderState }) => {
  const { isLoading, data } = useStipulations(orderId)
  if (isLoading)
    return (
      <div className="py-5 text-center">
        <ProgressSpinner />
      </div>
    )
  return (
    <div className="text-center">
      <div className="text-primary pb-1">
        <Icon name="sendApplication" size={120} />
      </div>

      {data?.dealerStipulations && data?.dealerStipulations?.length > 0 ? (
        <h3 className="mt-5">{messages.stipsHeading}</h3>
      ) : (
        <>
          <h3 className="mt-5">{messages[orderState as keyof typeof messages]}</h3>
          <p className="text-muted">{messages.watchmsg}</p>
        </>
      )}
      {data?.dealerStipulations.map((stip: DealerStipulation, index: number) => {
        const count = index + 1
        return (
          <p className="text-muted" key={stip.Description}>
            {`${count}. ${stip.Description}`}
          </p>
        )
      })}
    </div>
  )
}

export default CreditApplication
