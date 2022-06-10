import { FC, ReactNode } from 'react'
import { TabPanel as PrimeTabPanel, TabPanelProps as PrimeTabPanelProps } from 'primereact/tabview'

export type TabPanelProps = PrimeTabPanelProps & {
  children?: ReactNode
}

const TabPanel: FC<TabPanelProps> = ({ children, ...props }) => <PrimeTabPanel {...props}>{children}</PrimeTabPanel>

export default TabPanel
