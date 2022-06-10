// FIXME: refactor - List

import React, { FC, ReactNode, useState } from 'react'
import cls from 'classnames'
import Accordion from '../Accordion'
import AccordionTab from '../Accordion/components/AccordionTab'
import styles from './FeaturesList.module.scss'

export type FeaturesListProps = {
  title: string | ReactNode
  children: string | number | ReactNode
  value?: string | number | ReactNode
}

const FeaturesList: FC<FeaturesListProps> = ({ title, children, value }) => {
  const [activeIndex, setTabIndex] = useState(0)

  return (
    <Accordion activeIndex={activeIndex} onTabChange={e => setTabIndex(e.index)} className={styles.featuresList}>
      {value ? (
        <AccordionTab
          headerTemplate={() => {
            return (
              <p className="mb-1">
                <span className="text-dark">{title}</span>

                <span className={cls('text-dark d-flex justify-content-between', styles.headerPrice)}>
                  {' '}
                  <span>$</span>
                  {value}
                </span>
              </p>
            )
          }}
        >
          <ul className={styles.content}>{children}</ul>
        </AccordionTab>
      ) : (
        <AccordionTab header={title}>
          <ul className={styles.content}>{children}</ul>
        </AccordionTab>
      )}
    </Accordion>
  )
}

export default FeaturesList
