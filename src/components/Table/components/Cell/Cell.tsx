import { FC, ReactNode, DetailedHTMLProps, HTMLAttributes } from 'react'
import cls from 'classnames'
import Icon from '@components/Icon'
import styles from './Cell.module.scss'

export type CellProps = {
  content?: string | number | ReactNode
  muted?: boolean
  className?: string
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const Cell: FC<CellProps> = ({ className, muted, children, content, ...props }) => {
  return (
    <div {...props} className={cls(styles.cell, className, muted && styles.muted)}>
      {content || children}
    </div>
  )
}

interface IImageCellData extends CellProps {
  imageUrl?: string
  imageAlt?: string
}

export const ImageCell: FC<IImageCellData> = ({ imageUrl, imageAlt, ...props }) => {
  if (!imageUrl) return null
  return (
    <Cell {...props}>
      <img src={imageUrl} alt={imageAlt || ''} className="img-fluid" />
    </Cell>
  )
}

interface IListCell extends CellProps {
  data?: Array<number | string>
}

export const ListCell: FC<IListCell> = ({ data, ...props }) => {
  if (!data) return null
  return (
    <Cell {...props}>
      {/* https://github.com/microsoft/TypeScript/issues/36390 */}
      {(data as any[]).map((line, index) => {
        return <p className={cls(styles.text, index !== 0 && styles.muted)}>{line}</p>
      })}
    </Cell>
  )
}

interface IStatusCell extends CellProps {
  status?: string
  message?: string
}

export const StatusCell: FC<IStatusCell> = ({ status, message, ...props }) => {
  if (!status) return null

  return (
    <Cell {...props} className={cls(styles.statusCell)}>
      {status === 'scheduled' && (
        <div className={styles['icon-wrapper']}>
          <Icon name="schedule" />
        </div>
      )}
      <p className={styles.text}>{message}</p>
    </Cell>
  )
}

export default Cell
