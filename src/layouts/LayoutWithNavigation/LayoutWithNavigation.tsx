import { FC, ReactNode, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import cls from 'classnames'
import { ClassValue } from 'classnames/types'

import routes from '@common/routes'
import { AppPage, usePermissions } from '@common/utilities/credentialsStore'
import useUser, { useIsAdmin, useIsSuperUser } from '@common/utilities/useUser'
import { useOrdersCount } from '@common/endpoints/useOrders'
import Navigation, { NavigationItem } from '@components/Navigation'
import DealershipSwitch from '@containers/DealershipSwitch'
import { useDealershipContext } from '@common/utilities/dealershipContext'
import { useLogoutDealerUser } from '@common/endpoints/useDealershipConfiguration'
import ProgressSpinner from '@components/ProgressSpinner'
import useFeatureFlag from '@common/utilities/useFeatureFlag'
import useAddonFeature, { useFniFeature } from '@common/utilities/tenantFeaturesFlags'
import { ServerSideData } from '@common/utilities/pageProps'
import styles from './LayoutWithNavigation.module.scss'

export type LayoutWithNavigationProps = {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  className?: ClassValue
  withoutDealershipSwitch?: boolean
  noBackground?: boolean
  pagekey: keyof typeof AppPage
  // alternative layout where items are put in center of the page (vertical and horizontal)
  center?: boolean
  serverSideProps?: ServerSideData
}

const messages = {
  unknownUser: 'Unknown user',
}

const useLinks = (): NavigationItem[] => {
  const { getCurrentDealershipCode } = useDealershipContext()
  const { featureFlags } = useFeatureFlag()
  const dealerCode = getCurrentDealershipCode()
  const { isModuleAccessible: isAccessoriesAccessible } = useAddonFeature(dealerCode)
  const { isModuleAccessible: isFniAccessible } = useFniFeature(dealerCode)
  const isAdmin = useIsAdmin()
  const isSuperUser = useIsSuperUser()

  const { total: badgeCount } = useOrdersCount(dealerCode)
  return useMemo(() => {
    const links: NavigationItem[] = [
      { url: routes.workqueue, label: 'Orders', badgeCount },
      { url: routes.inventory, label: 'Inventory Management' },
    ]

    if (isAdmin || isSuperUser) {
      links.push({ url: routes.users, label: 'User Management' })
    }

    if (isSuperUser) {
      links.push({ url: routes.dealership, label: 'Manage Dealerships' })
    }
    const configurationItems = [
      { url: routes.dealerConfigurations, label: 'Dealer Configurations' },
      { url: routes.products, label: 'F&I Products', revokeFeatureAccess: !isFniAccessible },
      {
        url: routes.addonConfigurations,
        label: 'Add-on Configurations',
        revokeFeatureAccess: !isAccessoriesAccessible,
      },
      {
        url: routes.feeTagsConfiguration,
        label: 'Fee Tag Configuration',
        // show only to super user and TODO: feature flag will be removed in future
        revokeFeatureAccess: !isSuperUser || !featureFlags('tempFeeTagUIFlag'),
      },
      {
        url: routes.masterAddons,
        label: 'Master List Accessories',
        revokeFeatureAccess: !isSuperUser || !isAccessoriesAccessible,
      },
    ]
    if (isAdmin || isSuperUser) {
      links.push({
        label: 'Configurations',
        items: configurationItems,
      })
    }

    return links
  }, [badgeCount, isAdmin, isSuperUser, isAccessoriesAccessible, isFniAccessible, featureFlags])
}

const LayoutWithNavigation: FC<LayoutWithNavigationProps> = ({
  children,
  noBackground,
  withoutDealershipSwitch,
  header,
  footer,
  className,
  pagekey,
  center,
  serverSideProps,
}) => {
  const router = useRouter()
  const isPermitted = usePermissions(pagekey)
  useEffect(() => {
    if (!isPermitted && router) {
      void router.push(routes.notFound)
    }
    if (typeof isPermitted === 'string' && router && !['Login', 'forgotPass', 'NotFound'].includes(pagekey)) {
      window.sessionStorage.setItem('PRE_LOGIN_URL', window.location.pathname)
      void router.push(routes.login)
    }
  }, [isPermitted, pagekey, router])
  const links = useLinks()

  useEffect(() => {
    if (router) {
      const prefetch = () => {
        links.forEach(({ url, items, revokeFeatureAccess }) => {
          if (url && !revokeFeatureAccess) {
            void router.prefetch(url)
          }
          if (items) {
            items.forEach(item => {
              if (item.url && !item.revokeFeatureAccess) {
                void router.prefetch(item.url)
              }
            })
          }
        })
      }

      const experimentalWindow = window as Window & {
        requestIdleCallback?: (callback: () => void) => void
      }

      if (experimentalWindow.requestIdleCallback) {
        experimentalWindow.requestIdleCallback(prefetch)
      } else {
        prefetch()
      }
    }
  }, [router, links])

  const userLinks = [
    {
      url: routes.changePassword,
      label: 'Change password',
    },
  ]

  const items = links.map(
    ({ url, items: submenu, ...args }): NavigationItem => ({
      command: () => {
        if (url) {
          void router.push(url)
        }
      },
      isActive: (() => {
        if (router.pathname === url) {
          return true
        }

        if (submenu) {
          return !!submenu.find(({ url: submenuUrl }) => submenuUrl && router.pathname.startsWith(submenuUrl))
        }

        return false
      })(),
      items:
        submenu &&
        submenu.map(({ url: submenuUrl, ...submenuProps }) => {
          return {
            url: submenuUrl,
            isActive: router.pathname === submenuUrl,
            ...submenuProps,
          }
        }),
      ...args,
    }),
  )

  const userItems = userLinks.map(({ url, ...args }) => ({
    command: () => {
      if (url) {
        void router.push(url)
      }
    },
    ...args,
  }))
  const user = useUser()
  const username = user ? `${user?.firstName || ''} ${user?.lastName || ''}` : messages.unknownUser
  const { mutate: onLogoutHandler, status } = useLogoutDealerUser()
  return (
    <div className={cls(styles.wrapper, !noBackground && styles.background, className)}>
      {status === 'running' && (
        <div className={styles.overlay}>
          <ProgressSpinner />
        </div>
      )}
      <Navigation
        onLogout={() => {
          void onLogoutHandler(null)
        }}
        items={items}
        username={username}
        logoUrl={routes.workqueue}
        userItems={userItems}
        serverSideProps={serverSideProps}
      />
      {isPermitted && (
        <>
          {!withoutDealershipSwitch && (
            <div className="container pt-3">
              <DealershipSwitch />
            </div>
          )}
          {header}
          <div className={cls('container', center ? styles.center : styles.wrapper)}>{children}</div>
        </>
      )}
      {footer}
    </div>
  )
}

export default LayoutWithNavigation
