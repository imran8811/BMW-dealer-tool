import { FC } from 'react'

import { DealershipGeneralConfig, ScheduledOptions, TenantConfig } from '@common/endpoints/typings.gen'
import useDealershipConfiguration from '@common/endpoints/useDealershipConfiguration'
import usePaymentConfiguration, { useTradeInConfiguration } from '@common/endpoints/useMandatoryCheck'
import ProgressSpinner from '@components/ProgressSpinner'
import useReferenceData from '@common/endpoints/useReferenceData'
import { useIndividualizedAgreement } from '@common/endpoints/useIndividualizedAgreement'
import FeesConfiguration from '@containers/FeesConfiguration'
import useMenuLinks, { useSocialMedia } from '@common/endpoints/useMenuItems'
import General from './components/General'
import Payment from './components/Payment'
import TradeIn from './components/Tradin'
import SocialMedia from './components/SocialMedia'
import MenuLinks from './components/MenuLinks'
import IndividualizedAgreements from './components/IndividualizedAgreement/IndividualizedAgreement'

export type ConfigurationContainerProps = {
  dealerCode: string
  tenantConfig: TenantConfig
}

const ConfigurationContainer: FC<ConfigurationContainerProps> = ({ dealerCode, tenantConfig }) => {
  const { data: dealerConfig, isLoading: isGeneralConfigLoading } = useDealershipConfiguration(dealerCode)
  const { data: paymentConfig, isLoading: isPaymentConfigLoading } = usePaymentConfiguration(dealerCode)
  const { data: TradeInConfig, isLoading: isTradeInConfigLoading } = useTradeInConfiguration(dealerCode)
  const { data: referenceData, isLoading: isReferenceDataLoading } = useReferenceData([
    'USAState',
    'FinancialProduct',
    'TimeZone',
    'DefaultFinanceTerms',
    'DefaultLeaseTerms',
    'DefaultMileage',
    'CompatibleModels',
  ])
  const { data: socialMediaData, isLoading: isSocialMediaLoading } = useSocialMedia(dealerCode)
  const { data: menuLinksData, isLoading: isMenuLinksLoading } = useMenuLinks(dealerCode)

  const { data: agreementsData, isLoading: isLoadingAgreements } = useIndividualizedAgreement(dealerCode)

  const generalConfigValues: Partial<DealershipGeneralConfig> = {
    defaultDownPayment: tenantConfig?.configuration?.defaultDealerConfig?.defaultDownPaymentPercentage,
    minimumFinancedAmount: tenantConfig?.configuration?.defaultDealerConfig?.defaultMinimumFinancedAmount,
    scheduledOptions: tenantConfig?.configuration?.defaultDealerConfig?.defaultVehicleHandOverMode as
      | ScheduledOptions
      | undefined,
    ...dealerConfig,
  }

  const loader = (
    <div className="bg-white py-5 rounded text-center mb-2">
      <ProgressSpinner />
    </div>
  )

  return (
    // key -- refresh config forms when context changed
    <div key={dealerCode}>
      {isGeneralConfigLoading || isReferenceDataLoading
        ? loader
        : dealerConfig && (
            <General initialValues={generalConfigValues} referenceData={referenceData || []} dealerCode={dealerCode} />
          )}
      {isPaymentConfigLoading ? loader : <Payment initialValues={paymentConfig} dealerCode={dealerCode} />}
      {isTradeInConfigLoading
        ? loader
        : TradeInConfig && <TradeIn initialValues={TradeInConfig} dealerCode={dealerCode} />}
      <FeesConfiguration dealerCode={dealerCode} />
      {isLoadingAgreements ? (
        loader
      ) : (
        <IndividualizedAgreements dealerCode={dealerCode} agreements={agreementsData?.individualizedAgreement || []} />
      )}
      {isMenuLinksLoading ? loader : <MenuLinks initialValues={menuLinksData} dealerCode={dealerCode} />}
      {isSocialMediaLoading ? loader : <SocialMedia initialValues={socialMediaData} dealerCode={dealerCode} />}
    </div>
  )
}

export default ConfigurationContainer
