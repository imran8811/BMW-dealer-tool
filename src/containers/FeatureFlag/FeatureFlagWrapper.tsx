import { withLDProvider } from 'launchdarkly-react-client-sdk'
import { FC } from 'react'
import getConfig from 'next/config'

type LaunchDarklyEnvVars = {
  launchDarklySdkKey: string
  launchDarklyEmail: string
  launchDarklyName: string
  launchDarklyClientId: string
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { publicRuntimeConfig } = getConfig()
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const {
  launchDarklySdkKey,
  launchDarklyEmail,
  launchDarklyName,
  launchDarklyClientId,
}: LaunchDarklyEnvVars = publicRuntimeConfig

const LaunchDarklyFeatureFlag: FC = ({ children }) => {
  return <>{children}</>
}

export default withLDProvider({
  clientSideID: launchDarklyClientId,
  user: {
    key: launchDarklySdkKey,
    name: launchDarklyName,
    email: launchDarklyEmail,
  },
  options: {
    bootstrap: 'localStorage',
  },
})(LaunchDarklyFeatureFlag)
