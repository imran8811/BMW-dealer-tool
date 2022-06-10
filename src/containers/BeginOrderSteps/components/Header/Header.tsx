import { FC } from 'react'
import cls from 'classnames'
import Icon from '@components/Icon'
import styles from './Header.module.scss'

export interface IHeader {
  heading: string
  subheading?: string
  imageUrl: string
}

export interface IHeaderProps {
  header: IHeader
  onBack?: () => unknown
  wrapperClass?: string
}

const Header: FC<IHeaderProps> = ({ wrapperClass, header, onBack }) => {
  return (
    <div className={cls(['row align-items-center pb-3', wrapperClass && wrapperClass])}>
      <div className="col-8 p-0">
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>
            <Icon name="arrow" className="text-secondary " />
          </button>
        )}
        <h1 className={cls(styles.title, header.subheading ? 'pb-0 pb-sm-2' : 'mb-0')}>{header.heading}</h1>
        {header.subheading ? <p className={cls('text-muted', 'm-0', styles.subHeading)}>{header.subheading}</p> : null}
      </div>
      <div className={cls('col-4', 'p-0', styles.mbLess20)}>
        <div className={styles.auto_img_wrapper}>
          <img src={header.imageUrl} alt="header car" />
        </div>
      </div>
    </div>
  )
}

export default Header
