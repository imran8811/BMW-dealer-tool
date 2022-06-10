import { FC } from 'react'
import cls from 'classnames'
import Divider from '@components/Divider/Divider'
import Button from '@components/Button'
import { CustomerDetails, OrderDetails, OrderState, HandOverMode } from '@common/endpoints/typings.gen'
import { selectFullName } from '@common/selectors/customer'
import { useConfirmDelivery } from '@common/endpoints/orderTransitions'
import Address from '@components/Address'
import styles from './PaymentInformation.module.scss'

export interface PaymentInformationProps {
  customer: CustomerDetails
  order: OrderDetails
}

const messages = {
  payment: 'Payment Successful!',
  dms: 'Mark this vehicle as sold in your DMS.',
  arrangementsDelivery: 'Set the vehicle aside. Stand by while arrangements are being made for delivery.',
  arrangementsPickup: 'Set the vehicle aside. Stand by while arrangements are being made for pickup.',
  paymentSuccessful: 'Payment is successful.',
  verifyCustomerDelivery: ' When you deliver the vehicle to the customer, verify their:',
  verifyCustomerPickup: ' When customer picks up the vehicle, verify their:',
  name: 'Full Name',
  currentAddress: 'Current Address',
  licenseNo: 'License No.',
  confirmButtonDelivery: 'Confirm Delivery',
  confirmButtonPickup: 'Confirm Pickup',
}

const PaymentInformation: FC<PaymentInformationProps> = ({ customer, order }) => {
  const confirmDelivery = useConfirmDelivery()
  const canConfirmDelivery = order.state === OrderState.AppointmentScheduled
  const orderId = order._id

  return (
    <div className="col mt-2">
      <div className="row p-md-5 pt-5 bg-white rounded ">
        <div className={cls('col-lg-6 pb-3', styles['border-right-lg'])}>
          <div className="text-center">
            <h1>{messages.payment}</h1>
            <div>
              <div className="text-primary font-weight-bold">{messages.dms}</div>
              {/* <div>
                {order.vehicleHandOverMode === HandOverMode.Delivery
                  ? messages.arrangementsDelivery
                  : messages.arrangementsPickup}
              </div>
              <div>{messages.paymentSuccessful}</div> */}
              <div className="mt-md-5 mb-4">
                {order.vehicleHandOverMode === HandOverMode.Delivery
                  ? messages.verifyCustomerDelivery
                  : messages.verifyCustomerPickup}
              </div>
            </div>
          </div>
          <div className="col mx-xxl-3 px-xxl-5">
            <div className="row">
              <div className="col-5 px-0 px-md-2 py-2 text-muted">{messages.name}</div>
              <div className="col-7  px-0 px-md-2 py-2 text-primary font-weight-bold">{selectFullName(customer)}</div>
              <Divider />
              <div className="col-5  px-0 px-md-2 py-2 text-muted">{messages.currentAddress}</div>
              <div className="col-7  px-0 px-md-2 py-2">
                <Address {...customer.parkingAddress} />
              </div>
              <Divider />
              <div className="col-5  px-0 px-md-2 py-2 text-muted">{messages.licenseNo}</div>
              <div className="col-7  px-0 px-md-2 py-2 ">{customer.drivingLicenseDetails.licenseNo}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 py-3 d-flex justify-content-center">
          <div className="d-block">
            <img
              src={customer?.drivingLicenseDetails?.licenseDocs?.licenseDocsFrontUrl}
              alt="Driver's license"
              className={cls('img-fluid', styles.license)}
            />
            <div className="py-3 text-center">
              <Button
                type="button"
                center
                disabled={!canConfirmDelivery}
                onClick={() => confirmDelivery.mutate({ orderId })}
                loading={confirmDelivery.status === 'running' && 'Confirming'}
                className={`${!canConfirmDelivery ? styles.btnMuted : ''} utm-orders-confirm-delivery-btn`}
              >
                {order.vehicleHandOverMode === HandOverMode.Delivery
                  ? messages.confirmButtonDelivery
                  : messages.confirmButtonPickup}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default PaymentInformation
