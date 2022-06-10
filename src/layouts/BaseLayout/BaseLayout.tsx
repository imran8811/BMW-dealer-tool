import { FC, ReactNode, useEffect } from 'react'
import Navigation from '@components/Navigation'
import TitleTicker from '@components/Navigation/components/TitleTicker'
import { AppPage, usePermissions } from '@common/utilities/credentialsStore'
import { useRouter } from 'next/router'
import routes from '@common/routes'
import { ServerSideData } from '@common/utilities/pageProps'
import { TenantConfig } from '@common/endpoints/typings.gen'
import styles from './BaseLayout.module.scss'

export type BaseLayoutProps = {
  children: ReactNode
  footer?: ReactNode
  aside?: ReactNode
  skipNavigation?: boolean
  pageKey: keyof typeof AppPage
  serverSideProps?: ServerSideData
}

const BaseLayout: FC<BaseLayoutProps> = ({ children, pageKey, footer, aside, skipNavigation, serverSideProps }) => {
  const router = useRouter()
  const isPermitted = usePermissions(pageKey)
  useEffect(() => {
    if (!isPermitted && router) {
      void router.push(routes.notFound)
    }
    if (typeof isPermitted === 'string' && router && !['Login', 'forgotPass', 'NotFound'].includes(pageKey)) {
      window.sessionStorage.setItem('PRE_LOGIN_URL', window.location.pathname)
      void router.push(routes.login)
    }
  }, [isPermitted, pageKey, router])
  return (
    <section className={styles.wrapper}>
      {!skipNavigation && <Navigation serverSideProps={serverSideProps} />}
      <div className={styles.contentWrapper}>
        <main className={styles.main}>
          {isPermitted && <div className={styles.mainContainer}>{children}</div>}
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </main>
        {aside}
      </div>
      {skipNavigation && <TitleTicker config={serverSideProps?.tenantConfig as TenantConfig} />}
    </section>
  )
}
export default BaseLayout
