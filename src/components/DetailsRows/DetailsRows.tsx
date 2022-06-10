import { FC, ReactElement, ReactNode } from 'react'
import cls from 'classnames'
import styles from './DetailsRows.module.scss'

export type DetailsRowProps = {
  label: ReactNode
  children: ReactNode
  alignValueOnTop?: boolean
}

export const DetailsRow: FC<DetailsRowProps> = ({ label, children, alignValueOnTop }) => (
  <>
    <div className={styles.detailsRowLabel}>{label}</div>
    <div className={cls(styles.detailsRowValue, !alignValueOnTop && styles.justifyEnd)}>
      <div>{children}</div>
    </div>
  </>
)

export type DetailsProps = {
  children: ReactElement<typeof DetailsRow> | (ReactElement<typeof DetailsRow> | null)[]
}

const Details: FC<DetailsProps> = ({ children }) => <div className={styles.details}>{children}</div>

export default Details
