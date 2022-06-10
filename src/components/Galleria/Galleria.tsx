import { forwardRef } from 'react'
import { Galleria as PrimeGalleria, GalleriaProps as PrimeGalleriaProps } from 'primereact/galleria'
import type { Galleria as PrimeGalleriaType } from 'primereact/galleria'
import cls from 'classnames'
import styles from './Galleria.module.scss'

export type GalleriaType = PrimeGalleriaType
export type GalleriaProps = PrimeGalleriaProps
export type GalleriaMethods = {
  show(): void
  hide(): void
  isAutoPlayActive(): boolean
  startSlideShow(): void
  stopSlideShow(): void
}

const Galleria = forwardRef<GalleriaType, PrimeGalleriaProps>(({ className, ...props }, ref) => (
  <PrimeGalleria ref={ref} className={cls(styles.galleria, className)} {...props} />
))

export default Galleria
