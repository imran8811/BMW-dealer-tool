import useFeatureFlag, { FeatureFlags, FeatureFlagsList } from '@common/utilities/useFeatureFlag'
import ProgressSpinner from '@components/ProgressSpinner'
import { Children, cloneElement, FC, isValidElement, ReactNode } from 'react'

type FeatureFlagProps = {
  flag: keyof typeof FeatureFlagsList
  value?: FeatureFlags[keyof typeof FeatureFlagsList]
  featureFlags: (k: keyof typeof FeatureFlagsList) => FeatureFlags[typeof k]
  children: ReactNode
}
type FeatureFlagParentProps = {
  flag: keyof typeof FeatureFlagsList
  value?: FeatureFlags[keyof typeof FeatureFlagsList]
}

const FeatureFlag: FC<FeatureFlagParentProps> = ({ children, flag, value }) => {
  const { featureFlags, isLoading } = useFeatureFlag()
  if (isLoading)
    return (
      <div className="py-5 text-center">
        <ProgressSpinner />
      </div>
    )
  return (
    <>
      {Children.map(children, child => {
        if (isValidElement(child)) {
          return cloneElement(child, { featureFlags, flag, value })
        }
        return child
      })}
    </>
  )
}

export const On: FC = props => {
  const { children, flag, value, featureFlags } = props as FeatureFlagProps

  if (featureFlags(flag) === true) return <>{children}</>
  if (value && featureFlags(flag) === value) return <>{children}</>
  return <></>
}

export const Off: FC = props => {
  const { children, flag, value, featureFlags } = props as FeatureFlagProps

  if (featureFlags(flag) === false) return <>{children}</>
  if (value && featureFlags(flag) !== value) return <>{children}</>
  return <></>
}

export default FeatureFlag
