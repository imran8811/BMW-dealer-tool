import { FC, useState } from 'react'
import { AutoComplete, AutoCompleteProps } from 'primereact/autocomplete'
import Field, { FieldProps } from '@components/Field'
import cls from 'classnames'
import { SelectOption } from '@common/utilities/selectOptions'
import styles from './autocomplete.module.scss'

export type InputProps = Omit<FieldProps, 'children'>
export type AutoCompleteType = AutoCompleteProps &
  InputProps & {
    options: SelectOption[]
    value: string
    name: string
    label: string
  }
const AutoCompleteModule: FC<AutoCompleteType> = ({ label, name, value, options, ...props }) => {
  const [filteredResults, setFilteredResults] = useState<SelectOption[]>([])
  const searchMethod = (query: string): void => {
    let filtered = []
    filtered = !query?.trim().length
      ? [...options]
      : (filtered = options.filter(({ label: val }) => val?.toLowerCase().startsWith(query.toLowerCase())))
    setFilteredResults(filtered)
  }
  return (
    <Field name={name} className={cls([styles['input-box']])} label={label} {...props}>
      <AutoComplete
        dropdown
        field="label"
        inputStyle={{ width: '85%' }}
        panelClassName={styles.panelclass}
        value={value as string}
        suggestions={filteredResults}
        completeMethod={({ query }) => searchMethod(query)}
        {...props}
      />
    </Field>
  )
}

export default AutoCompleteModule
