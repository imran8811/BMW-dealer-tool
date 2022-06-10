import React, { FC } from 'react'
import cls from 'classnames'
import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import DealershipSwitch from '@containers/DealershipSwitch'
import ProcessStep from '@containers/BeginOrderSteps/components/ProcessStep'
import { ServerSideData } from '@common/utilities/pageProps'

import styles from './OrderLayout.module.scss'

interface Props {
  activeStep: number
  onBack?: () => unknown
  serverSideProps: ServerSideData
}

const steps = [
  {
    label: 'Begin Order',
    value: 1,
    isCurrent: false,
    isCompleted: false,
  },
  {
    label: 'Set Availability',
    value: 2,
    isCurrent: false,
    isCompleted: false,
  },
  {
    label: 'Credit Application',
    value: 3,
    isCurrent: false,
    isCompleted: false,
  },
]

const OrderLayout: FC<Props> = ({ onBack, activeStep, children, serverSideProps }) => (
  <LayoutWithNavigation
    pagekey="Orders"
    withoutDealershipSwitch
    serverSideProps={serverSideProps}
    header={
      <div className={cls('bg-white w-100 shadow-sm', styles.stepsHeader)}>
        <div className="container">
          <div className="row align-items-center">
            <div
              className="col-xxl-4 col-xl-3 col-lg-6 col-md-4 col-sm-6 text-center text-sm-left"
              style={{ outline: 'none' }}
            >
              <DealershipSwitch />
            </div>
            <ProcessStep onBack={onBack} steps={steps} activeStep={activeStep} />
          </div>
        </div>
      </div>
    }
  >
    <div className="row">{children}</div>
  </LayoutWithNavigation>
)

export default OrderLayout
