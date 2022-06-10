import { FC, useRef } from 'react'
import Galleria, { GalleriaType, GalleriaProps } from '@components/Galleria'
import styles from './FullscreenGallery.module.scss'

type FullscreenGalleryProps = GalleriaProps

const FullscreenGallery: FC<FullscreenGalleryProps> = ({ children, ...props }) => {
  const ref = useRef<GalleriaType>(null)
  const show = () => {
    if (ref && ref.current) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      ref.current.show()
    }
  }

  return (
    <>
      <Galleria
        ref={ref}
        circular
        fullScreen
        showItemNavigators
        showThumbnails={false}
        item={(item: string) => <img src={item} alt="" />}
        {...props}
      />
      <a href="#" style={{ minWidth: '120px', display: 'block' }} onClick={show} className={styles.galleryLink}>
        {children}
      </a>
    </>
  )
}

export default FullscreenGallery
