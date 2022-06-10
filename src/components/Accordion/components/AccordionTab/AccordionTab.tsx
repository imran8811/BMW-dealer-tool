import { FC, ReactNode } from 'react'
import { AccordionTab as PrimeAccordionTab, AccordionTabProps as PrimeAccordionTabProps } from 'primereact/accordion'

export type AccordionTabProps = PrimeAccordionTabProps & {
  children: ReactNode
}

const AccordionTab: FC<AccordionTabProps> = ({ children, ...props }: AccordionTabProps) => (
  <PrimeAccordionTab {...props}>{children}</PrimeAccordionTab>
)
export default AccordionTab
