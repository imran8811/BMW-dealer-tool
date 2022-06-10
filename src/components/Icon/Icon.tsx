import cls from 'classnames'
import * as icons from './assets'
import styles from './Icon.module.scss'

export type Icons = typeof icons
export type IconName = keyof Icons

export interface IconProps {
  name: IconName
  size?: number
  className?: string
  onClick?: () => void
}

const Icon: React.FC<IconProps> = ({ name, size, className, onClick, ...props }) => {
  const Component = icons[name]
  const sizeProps: { width?: string; height?: string } = {}
  if (size) {
    sizeProps.width = `${size / 16}rem`
    sizeProps.height = `${size / 16}rem`
  }

  return (
    <Component className={cls([styles.icon, className && className])} onClick={onClick} {...sizeProps} {...props} />
  )
}

export default Icon
