import { FC, ReactNode } from 'react'
import { ResponsiveImage } from 'types/images'
import { TenantConfig } from '@common/endpoints/typings.gen'
import BaseLayout from '../BaseLayout'
import styles from './SplashScreen.module.scss'

export type SplashScreenProps = {
  children: ReactNode
  footer?: ReactNode
  serverSideProps?: TenantConfig
}

const jpgImage = require('./assets/img.jpg?{sizes:[1200,1600,1920]}') as ResponsiveImage
const webpImage = require("./assets/img.jpg?{sizes:[1200,1600,1920], format: 'webp'}") as ResponsiveImage

const SplashScreen: FC<SplashScreenProps> = ({ children, footer, serverSideProps }) => (
  <BaseLayout
    pageKey="Login"
    skipNavigation
    footer={footer}
    aside={
      <aside className={styles.aside}>
        <picture>
          <source srcSet={webpImage.srcSet} type="image/webp" />
          <source srcSet={jpgImage.srcSet} />
          <img src={jpgImage.src} alt="" />
        </picture>
      </aside>
    }
  >
    <div>
      {serverSideProps ? (
        <a href="/">
          <img className={styles.logo} alt="logo" src={serverSideProps?.configuration?.applicationLogo?.logoPath} />
        </a>
      ) : (
        'loading...'
      )}
      {children}
    </div>
  </BaseLayout>
)

export default SplashScreen
