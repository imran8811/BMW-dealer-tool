import { SelectHTMLAttributes, forwardRef } from 'react'
import SelectOptions from '@common/utilities/selectOptions'
import cls from 'classnames'
import Field, { FieldProps } from '../Field'
import styles from './Select.module.scss'

export type SelectProps = Omit<FieldProps, 'children'> &
  Partial<Omit<SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'>> & {
    options: SelectOptions
    placeholder?: true | string
    containerClass?: string
    selectClass?: string
  }

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ selectClass, containerClass, options, placeholder, value, defaultValue, name, ...props }, ref) => (
    <Field
      className={cls([styles.customSelect, selectClass])}
      containerClass={containerClass || ''}
      name={name}
      {...props}
    >
      <select
        ref={ref}
        value={value}
        defaultValue={value === undefined ? defaultValue || (placeholder ? '' : undefined) : undefined}
      >
        {placeholder && (
          <option disabled value="">
            {typeof placeholder === 'string' ? placeholder : null}
          </option>
        )}
        {options.map(option => {
          const value = typeof option === 'string' ? option : option.value
          const label = typeof option === 'string' ? option : option.label || value
          return (
            <option data-testid="select-option" key={value} value={value}>
              {label || value}
            </option>
          )
        })}
      </select>
    </Field>
  ),
)

export default Select
