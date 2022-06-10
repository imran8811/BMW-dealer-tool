import useSWR from 'swr'
import query from '@common/utilities/query'
import { useNumberFormatter } from '@components/NumberDisplay'
import { Lookups, ReferenceData, ReferenceDataTypes } from './typings.gen'

export type LookupType = keyof typeof ReferenceDataTypes

type SelectOption<T = string> = {
  value: T
  label: string
}

const findByType = (data: ReferenceData[], type: LookupType): ReferenceData['lookups'] => {
  if (!data || data.length === 0) {
    return []
  }

  return data.find(({ typeCode }: ReferenceData) => typeCode === type)?.lookups || []
}

function useReferenceData(type: LookupType): { data?: ReferenceData['lookups']; error?: Error; isLoading: boolean }
function useReferenceData(types: LookupType[]): { data?: ReferenceData['lookups'][]; error?: Error; isLoading: boolean }

function useReferenceData(
  types: LookupType | LookupType[],
): { data?: ReferenceData['lookups'] | ReferenceData['lookups'][]; error?: Error; isLoading: boolean } {
  const { error, data: response } = useSWR<ReferenceData[], Error>(
    `/credit-application-management/reference-data/get-lookups?${query({ types })}`,
    undefined,
    { revalidateOnFocus: false },
  )

  const data =
    (response &&
      response.length > 0 &&
      (Array.isArray(types) ? types.map(type => findByType(response, type)) : response[0].lookups)) ||
    undefined

  return {
    data,
    error,
    isLoading: !error && !response,
  }
}

export const referenceDataToOptions = (data?: Lookups[]): SelectOption[] =>
  (data || []).map(({ code, name }: { code: string; name: string }) => ({
    value: code,
    label: name,
  }))

export const additionalInfoOptions = (data?: Lookups[]): SelectOption<number | string>[] =>
  (data || []).map(({ code, additionalInfo }: { code: string; additionalInfo?: { value?: number } }) => ({
    value: additionalInfo?.value || code,
    label: additionalInfo?.value !== undefined ? useNumberFormatter(additionalInfo?.value) : '',
  }))

export const timeZoneOptions = (data?: Lookups[]): SelectOption[] =>
  (data || []).map(({ name, displayName }: { name: string; displayName?: string }) => ({
    value: name || displayName || '',
    label: displayName || name,
  }))

export default useReferenceData
