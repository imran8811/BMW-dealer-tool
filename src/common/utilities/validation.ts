import { emailRegex, invalidEmailFormat } from './constants'

export const validateEmail = (message?: string) => (value: string | undefined): true | string => {
  if (value && !emailRegex.exec(value)) {
    return message || invalidEmailFormat
  }

  return true
}

export default {
  validateEmail,
}

export const capitalizeFirstLetter = (str: string): string =>
  str
    .toLowerCase()
    .split(' ')
    .map(e => `${e.charAt(0).toUpperCase()}${e.slice(1)}`)
    .join(' ')
