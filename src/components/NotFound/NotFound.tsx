import { FC } from 'react'
import styles from './NotFound.module.scss'

import ErrorCode from './404.svg'

const messages = {
  notFound: 'Page Not Found',
}

const NotFound: FC = () => (
  <div className={styles.element}>
    <div className={styles.heading}>
      <ErrorCode />
    </div>
    <p className={styles.subtitle}>{messages.notFound}</p>
  </div>
)

export default NotFound
