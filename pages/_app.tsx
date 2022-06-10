import React, { ReactElement } from 'react'
import App, { AppContext, AppProps } from 'next/app'
import Head from 'next/head'
import { SWRConfig } from 'swr'
import '@common/styles/global.scss'
import { fetcher } from '@common/utilities/http-api'
import { ModalProvider } from 'react-modal-hook'
import { DealershipProvider } from '@common/utilities/dealershipContext'
import ErrorBoundary from '@common/utilities/ErrorBoundary'
import { FeatureFlagWrap } from '@containers/FeatureFlag'
import getConfig from 'next/config'
import StoreProvider from '@common/store/storeContext'

const { publicRuntimeConfig } = getConfig() as { publicRuntimeConfig: { tenantId: string } }
const TENANT_ID = publicRuntimeConfig.tenantId === 'fair' ? 'mini' : publicRuntimeConfig.tenantId

const messages = {
  title: `Dealer tool – ${TENANT_ID.toUpperCase()}`,
}

const CustomApp = ({ Component, pageProps }: AppProps): ReactElement => (
  <>
    <StoreProvider>
      <FeatureFlagWrap>
        <Head>
          <title>{messages.title}</title>
          <link rel="manifest" href="/site.webmanifest" crossOrigin="use-credentials" />
        </Head>
        <ErrorBoundary>
          <DealershipProvider>
            <SWRConfig
              value={{
                fetcher,
                errorRetryCount: 3,
              }}
            >
              <ModalProvider>
                <div className={publicRuntimeConfig.tenantId}>
                  <Component {...pageProps} />
                </div>
              </ModalProvider>
            </SWRConfig>
          </DealershipProvider>
        </ErrorBoundary>
      </FeatureFlagWrap>
    </StoreProvider>
  </>
)

// FIXME: We need to disable Static Site Optimization in order to use runtime configuration.
// Adding getInitialProps() to app disables ASO globally.
CustomApp.getInitialProps = async (appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext)

  return { ...appProps }
}

export default CustomApp
