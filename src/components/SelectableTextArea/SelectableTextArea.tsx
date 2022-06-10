import { FC, useState } from 'react'
import { InputTextarea } from 'primereact/inputtextarea'
import { AutoComplete } from 'primereact/autocomplete'
import Field, { FieldProps } from '@components/Field'
import { AutocompleteProps } from '@react-google-maps/api'
import { SelectOption } from '@common/utilities/selectOptions'
import cls from 'classnames'
import styles from './SelectableTextArea.module.scss'

export type InputProps = Omit<FieldProps, 'children'>
export type SelectableTextAreaType = Omit<AutocompleteProps, 'children'> &
  InputProps & {
    options: SelectOption[]
    value: string
    name: string
    label: string
    onTextChange: (e: string) => unknown
    onSelect: (e: SelectOption) => unknown
  }

const SelectableTextArea: FC<SelectableTextAreaType> = ({
  label,
  name,
  value,
  options,
  onTextChange,
  onSelect,
  error,
  ...props
}) => {
  const [filteredResults, setFilteredResults] = useState<SelectOption[]>([])
  const searchMethod = (query: string): void => {
    let filtered = []
    filtered = !query?.trim().length
      ? [...options]
      : (filtered = options.filter(({ label: val }) => val?.startsWith(query.toLowerCase())))
    setFilteredResults(filtered)
  }
  return (
    <Field
      name={name}
      label={label}
      error={error}
      className={cls(styles['ac-text-area-wrap'], error && 'border-danger')}
    >
      <div>
        <div className={styles['ac-textarea']}>
          <InputTextarea
            onChange={e => {
              const { value: textValue } = e.currentTarget
              searchMethod(textValue)
              onTextChange(textValue)
            }}
            rows={3}
            value={value}
            autoResize
          />{' '}
        </div>
        <div className={styles['ac-dropdown-wrap']}>
          <AutoComplete
            dropdown
            field="label"
            panelStyle={{ right: 0 }}
            value={value}
            suggestions={filteredResults}
            completeMethod={({ query }) => searchMethod(query)}
            onSelect={e => {
              onSelect(e.value)
            }}
            {...props}
          />
        </div>
      </div>
    </Field>
  )
}

export default SelectableTextArea
