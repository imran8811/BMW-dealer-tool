import { TabMenu } from 'primereact/tabmenu'
import { useState, Children, useMemo, FC, useRef, useCallback, useEffect } from 'react'
import cls from 'classnames'
import { MenuItem } from 'primereact/components/menuitem/MenuItem'
import Icon from '@components/Icon'
import styles from './TabView.module.scss'

type MenuItemKey = MenuItem & { key: string }

const TabMenuWithHeader: FC<{
  items: MenuItemKey[]
  onTabChange?: (e: { originalEvent: Event; value: unknown }) => void
  errorTab?: string[]
  overrideClass?: string
  scrollBtnClass?: string
  customId?: string
}> = ({ items, children, onTabChange, errorTab, overrideClass, scrollBtnClass, customId }) => {
  const menuRef = useRef<TabMenu & { nav: HTMLElement }>(null)
  const [selected, setSelected] = useState<MenuItemKey>()
  const [isOverflow, setOverflow] = useState<boolean>(false)

  const menuItems = useMemo(() => {
    const options = items.map(item => {
      const errors = errorTab?.map(e => e.toLowerCase())
      return {
        ...item,
        className: errors?.includes(item?.key?.toLowerCase()) ? 'tab-error' : '',
      }
    })
    return options
  }, [errorTab, items])

  const searchPosition = (search: string) => {
    if (typeof search === 'undefined') return 0
    return items.findIndex(f => f.key === search)
  }

  const isOverflown = useCallback(() => {
    const element = menuRef?.current?.nav
    if (!element) return false
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
  }, [menuRef])

  useEffect(() => {
    if (menuRef.current) {
      const data = isOverflown()
      setOverflow(data)
    }
  }, [menuRef, isOverflown, menuItems])

  if (!menuItems) return <></>

  return (
    <>
      <TabMenu
        className={cls(styles['tab-menu-header-wrap'], isOverflow ? styles.overflow : '', overrideClass || '')}
        id={customId || 'tab-menu-toscroll'}
        ref={menuRef}
        model={menuItems}
        activeItem={selected}
        onTabChange={e => {
          setSelected(e.value)
          onTabChange?.(e.value)
        }}
      />
      <div className={cls(styles['scroll-btn'], isOverflow ? '' : 'd-none', scrollBtnClass || '')}>
        <button
          className={styles.previous}
          type="button"
          onClick={() => {
            document
              ?.querySelector(`#${customId || 'tab-menu-toscroll'}`)
              ?.scrollBy?.({ left: -150, behavior: 'smooth' })
          }}
        >
          <Icon name="smallChevronRight" size={28} />
        </button>
        <button
          type="button"
          className={styles.next}
          onClick={() => {
            document
              ?.querySelector(`#${customId || 'tab-menu-toscroll'}`)
              ?.scrollBy?.({ left: 150, behavior: 'smooth' })
          }}
        >
          <Icon name="smallChevronRight" size={28} />
        </button>
      </div>
      <div className={cls(styles['tab-menu-content-wrap'], 'pt-3')}>
        {Children.toArray(children).map((child, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={cls(
              styles['tab-menu-content'],
              searchPosition(selected?.key as string) === index ? styles.active : '',
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </>
  )
}

export default TabMenuWithHeader
