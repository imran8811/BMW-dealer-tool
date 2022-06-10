import { FC } from 'react'
import cls from 'classnames'
import styles from '../inventory.module.scss'

export interface IHeader {
  heading: string
  subheading?: string
  imageUrl: string
}

export interface IHeaderProps {
  header: IHeader
}

const Header: FC<IHeaderProps> = ({ header }) => {
  return (
    <div className="row">
      <div className="col-8 d-flex align-items-center p-0 pl-5 ">
        <span>
          <h1 className={cls(styles.title, header.subheading ? 'pb-0 pb-sm-2' : 'pb-3')}>{header.heading}</h1>
          {header.subheading ? <p className={cls('text-muted', styles.subHeading)}>{header.subheading}</p> : null}
        </span>
      </div>
      <div className="col-4 px-0">
        <div className={styles.auto_img_wrapper}>
          <img src={header.imageUrl} className="img-fluid" alt="header" />
        </div>
      </div>
    </div>
  )
}

export default Header
