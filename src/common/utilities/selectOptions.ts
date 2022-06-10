export type SelectOption = {
  value: string | number
  label?: string
}

type SelectOptions = Array<SelectOption | string>

export default SelectOptions
