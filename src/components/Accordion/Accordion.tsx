import { FC, ReactNode } from 'react'
import { Accordion as PrimeAccordion, AccordionProps as PrimeAccordionProps } from 'primereact/accordion'

export type AccordionProps = PrimeAccordionProps & {
  children: ReactNode
}

const Accordion: FC<AccordionProps> = ({ children, ...props }: AccordionProps) => (
  <PrimeAccordion {...props}>{children}</PrimeAccordion>
)

export default Accordion
