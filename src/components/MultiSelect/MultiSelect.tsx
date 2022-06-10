import { FC, useMemo } from 'react'
import cls from 'classnames'
import { MultiSelect as PrimeMultiSelect, MultiSelectProps as PrimeMultiSelectProps } from 'primereact/multiselect'
import { SelectOption } from '@common/utilities/selectOptions'
import Field, { FieldProps } from '../Field'

import styles from './MultiSelect.module.scss'

export type MultiSelectProps = Omit<PrimeMultiSelectProps, 'value' | 'options'> & {
  name: string
  header?: boolean
  small?: boolean
  multiClass?: string
  showSelectAll?: boolean
  preventdefaultOnLabelClick?: boolean
  value?: unknown
  options?: SelectOption[]
} & Omit<FieldProps, 'children'>

/**
 * Documentation: https://primefaces.org/primereact/showcase/#/multiselect
 */
const MultiSelect: FC<MultiSelectProps> = ({
  preventdefaultOnLabelClick,
  showSelectAll,
  multiClass,
  className,
  small,
  header,
  value,
  ...props
}) => {
  const { options } = props
  const computedValues = useMemo(() => {
    const optionCodes = options?.map(e => e.value)
    const values = (value as string[])?.filter?.(f => optionCodes?.includes(f))
    return values
  }, [options, value])

  return (
    <Field
      className={cls(
        styles.multiselect,
        small && styles.small,
        header !== true && styles.noHeader,
        className,
        multiClass && multiClass,
        showSelectAll && styles.selectAll,
      )}
      small={small}
      preventdefaultOnLabelClick={preventdefaultOnLabelClick}
      {...props}
    >
      <PrimeMultiSelect
        // TODO: item template with options - add space between elements
        // selectedItemTemplate={item => {...}}
        value={computedValues}
      />
    </Field>
  )
}

export default MultiSelect
