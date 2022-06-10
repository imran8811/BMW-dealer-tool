import { FC, useEffect, useMemo } from 'react'
import useDealerships from '@common/endpoints/useDealerships'
import Dealerships from '@components/Dealerships'
import { useDealershipContext } from '@common/utilities/dealershipContext'
import useUser, { useIsSuperUser } from '@common/utilities/useUser'
import { isLoggedIn } from '@common/utilities/credentialsStore'

const DealershipsList: FC = () => {
  const { pageData } = useDealerships({ pageSize: -1 })
  const { getCurrentDealershipCode, setCurrentDealershipCode } = useDealershipContext()
  const currentDealershipCode = getCurrentDealershipCode()
  const dealers = useMemo(
    () =>
      pageData
        .map(({ name, dealerCode }) => ({ label: name, value: `${dealerCode}` }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [pageData],
  )
  useEffect(() => {
    if (
      (currentDealershipCode === '0' || currentDealershipCode === undefined) &&
      dealers &&
      dealers.length > 0 &&
      isLoggedIn()
    ) {
      setCurrentDealershipCode(dealers[0].value)
    }
  }, [currentDealershipCode, setCurrentDealershipCode, dealers])

  return (
    <Dealerships
      name="dealer"
      options={dealers}
      value={currentDealershipCode}
      onChange={(e: { value: string }) => {
        setCurrentDealershipCode(e?.value)
      }}
    />
  )
}

const DealershipSwitch: FC = () => {
  const { dealershipName } = useUser() || {}
  const isSuperUser = useIsSuperUser()
  return useMemo(
    () => <>{isSuperUser ? <DealershipsList /> : <span className="text-muted">{dealershipName}</span>}</>,
    [isSuperUser, dealershipName],
  )
}

export default DealershipSwitch
