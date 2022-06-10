import { FC, ReactNode, useState } from 'react'
import cls from 'classnames'
import { TabView as PrimeTabView, TabViewProps as PrimeTabViewProps } from 'primereact/tabview'
import styles from './DuoTabView.module.scss'

export type TabViewProps = PrimeTabViewProps & {
  children: ReactNode
  className?: string
  onChangeTab?: (e: { originalEvent: Event; index: number }) => unknown
}

const TabView: FC<TabViewProps> = ({ children, className, onChangeTab, ...props }) => {
  const [selectedTab, setSelectedTab] = useState(0)
  return (
    <PrimeTabView
      activeIndex={selectedTab}
      onTabChange={e => {
        if (e.index !== selectedTab) {
          setSelectedTab(e.index)
          onChangeTab?.(e)
        }
      }}
      className={cls(className, styles.wrapper)}
      {...props}
    >
      {children}
    </PrimeTabView>
  )
}
export default TabView
