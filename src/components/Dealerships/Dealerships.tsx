import React, { FC } from 'react'
import cls from 'classnames'
import Dropdown, { DropdownProps } from '@components/Dropdown'
import styles from './Dealerships.module.scss'

export type DealershipsProps = DropdownProps

const Dealerships: FC<DealershipsProps> = ({ className, ...props }) => (
  <div className={styles.dropdownWrapper}>
    <Dropdown className={cls(styles.dealership, className)} {...props} />
  </div>
)

export default Dealerships
