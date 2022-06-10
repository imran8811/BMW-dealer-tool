import { FC, ReactNode } from 'react'
import { Menubar, MenubarProps } from 'primereact/menubar'
import cls from 'classnames'

import { MenuItem } from 'primereact/components/menuitem/MenuItem'
import Link from 'next/link'
import { useKnowledgeBaseUrl } from '@common/utilities/useUser'
import { ServerSideData } from '@common/utilities/pageProps'
import { TenantConfig } from '@common/endpoints/typings.gen'

import styles from './Navigation.module.scss'
import TitleTicker from './components/TitleTicker'

type CustomMenuItem = Omit<MenuItem, 'label'> & {
  label: ReactNode // because PrimeReact is lying to us - it doesn't have to be a string
  items?: MenuItem['items'] & { className?: string }
}

export type NavigationItem = {
  label?: ReactNode
  isSeparator?: boolean
  url?: string
  command?: MenuItem['command']
  isActive?: boolean
  badgeCount?: number
  revokeFeatureAccess?: boolean
  items?: (MenuItem & { isActive?: boolean; revokeFeatureAccess?: boolean })[]
}

export type NavigationProps = Omit<MenubarProps, 'model'> & {
  username?: string
  items?: NavigationItem[]
  onLogout?: MenuItem['command']
  withTicker?: boolean
  logoUrl?: string
  // additional items in user's dropdown menu
  userItems?: MenuItem[]
  serverSideProps?: ServerSideData
}

const navigationItemsToModel = (items: NavigationItem[]): CustomMenuItem[] =>
  items.map(({ label, isSeparator, isActive, badgeCount, items: submenu, revokeFeatureAccess, ...args }) => ({
    label:
      badgeCount !== undefined ? (
        <>
          {label} <span className={styles.badge}>{badgeCount}</span>
        </>
      ) : (
        label
      ),
    separator: isSeparator,
    className: isActive
      ? cls(styles.active, revokeFeatureAccess && 'd-none')
      : cls(revokeFeatureAccess ? 'd-none' : ''),
    items:
      submenu &&
      submenu.map(({ ...item }) => ({
        ...item,
        className: item.isActive
          ? cls(styles.active, item.revokeFeatureAccess && 'd-none')
          : cls(item.revokeFeatureAccess ? 'd-none' : ''),
      })),
    ...args,
  }))

const Navigation: FC<NavigationProps> = ({
  username,
  serverSideProps,
  items,
  onLogout,
  withTicker,
  logoUrl,
  userItems = [],
}) => {
  const documentationUrl = useKnowledgeBaseUrl()
  const userMenu: NavigationItem = {
    label: username,
    items: [
      {
        label: 'Logout',
        command: onLogout,
      },
      ...userItems,
    ],
  }

  if (documentationUrl)
    userMenu.items?.push({
      label: 'Knowledge Anywhere',
      command: () => window?.open(documentationUrl, '_blank'),
    })

  const model: CustomMenuItem[] = items ? navigationItemsToModel(username ? [...items, userMenu] : items) : []
  const tenantConfig = serverSideProps?.tenantConfig as TenantConfig
  const {
    configuration: {
      applicationLogo: { logoPath },
    },
  } = tenantConfig
  return (
    <div className={styles.navigationWrapper}>
      {withTicker === false ? null : <TitleTicker config={tenantConfig} />}
      <div className={cls(styles.navigationContainer, 'container')}>
        <Menubar
          className={cls(styles.navigation, username && styles.withUsername)}
          model={model as MenuItem[]}
          start={() => (
            <Link href={logoUrl || '/'}>
              <a>
                <img className={styles.logo} alt="logo" src={logoPath} />
              </a>
            </Link>
          )}
        />
      </div>
    </div>
  )
}

export default Navigation
