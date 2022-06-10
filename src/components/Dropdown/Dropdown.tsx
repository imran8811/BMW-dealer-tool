import { FC } from 'react'
import { Dropdown as PrimeDropdown, DropdownProps as PrimeDropdownProps } from 'primereact/dropdown'
import cls from 'classnames'

import styles from './Dropdown.module.scss'

export type DropdownProps = PrimeDropdownProps & {
  small?: boolean
}

/**
 * See also: `<Select />` to use in forms
 *
 * Documentation: https://primefaces.org/primereact/showcase/#/dropdown
 */
const Dropdown: FC<DropdownProps> = ({ className, small, ...props }) => (
  <PrimeDropdown {...props} className={cls(styles.dropdown, small && styles.small, className)} />
)

export default Dropdown
