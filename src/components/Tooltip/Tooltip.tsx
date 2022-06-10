import { FC, createElement } from 'react'
import { Tooltip } from 'primereact/tooltip'
import cls from 'classnames'

const ToolTip: FC<{
  id: string
  position?: string
  data: string
  className?: string
  onClick?: () => unknown
  mouseTrackLength?: number
  element?: string
}> = ({ children, id, position, data, className, onClick, mouseTrackLength, element }) => {
  const props = {
    [`mouseTrack${position || 'top'}`]: mouseTrackLength || 10,
    showDelay: 500,
    mouseTrack: true,
    position: position || 'top',
  }
  return (
    <>
      <Tooltip target={`.tooltip-${id}`} {...props} />
      {createElement(
        element || 'p',
        {
          className: cls(`tooltip-${id}`, className),
          'data-pr-tooltip': data,
          onClick,
        },
        children,
      )}
    </>
  )
}

export default ToolTip
