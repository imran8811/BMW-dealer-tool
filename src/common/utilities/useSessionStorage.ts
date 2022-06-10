import { useState } from 'react'

/**
 * @returns [value, setValue, removeValue]
 */
const useSessionStorage = (
  key: string,
  initialValue?: string,
): [string | undefined, (v: string) => void, () => void] => {
  const getInitialValue = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const item = window.sessionStorage.getItem(key)
      return item !== null ? item : initialValue
    }
    return initialValue
  }
  const [storedValue, setStoredValue] = useState<string | undefined>(getInitialValue())

  const setValue = (value: string) => {
    setStoredValue(value)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value)
    }
  }

  const removeValue = () => {
    setStoredValue(undefined)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key)
    }
  }

  return [storedValue || undefined, setValue, removeValue]
}

export default useSessionStorage
