import dayjs from 'dayjs'
import jwt_decode from 'jwt-decode'

const credentialsKey = 'USER_CREDENTIALS'

export type UserData = {
  userId?: string
  email?: string
  firstName?: string
  lastName?: string
  lastLoginTime?: string
  isDealer?: true
  dealershipId?: string
  dealershipName?: string
  dealerCode?: string
  isNewUser?: boolean
  roleCode?: string
  roleDisplayName?: string
  permissions?: {
    permissionCode: string
  }[]
  iat?: number
  exp?: number
}

export type Credentials = {
  refreshToken?: string
  accessToken?: string
  userData?: UserData
}

/** Enum for Pages in the app mapped with permissions object user data in the token recieved from backend  */
export enum AppPage {
  Login = 'Login',
  ChangePass = 'Login',
  forgotPass = 'Login',
  NotFound = 'Login',
  createPassword = 'Login',
  Dealerships = 'Dealerships',
  UserManagement = 'User Management',
  Configurations = 'Configurations',
  Addon = 'Configurations',
  Orders = 'Orders',
  Product = 'F&I Products',
  Inventory = 'Inventory Management',
  FeeTag = 'FeeTag',
  MasterAddon = 'MasterAddon',
}

export const setCredentials = (credentials: Credentials | undefined): void =>
  localStorage.setItem(credentialsKey, JSON.stringify(credentials))

export const clearCredentials = (): void => localStorage.removeItem(credentialsKey)

export const getCredentials = (): Credentials | undefined => {
  const credentials = typeof window !== 'undefined' && localStorage?.getItem(credentialsKey)
  if (credentials) {
    return JSON.parse(credentials) as Credentials
  }

  return undefined
}

/** User Data Object Present in token */
export const getUser = (): UserData | undefined => {
  try {
    return jwt_decode(getCredentials()?.accessToken as string) || undefined
  } catch {
    return undefined
  }
}

/** Return `True` if local `JWT TOKEN` is not expired */
export const isTokenValid = (): boolean => {
  const exptime = getUser()?.exp
  // current time should be 5 seconds less than the expiration time to renew it
  return !!(exptime && dayjs().isBefore(dayjs(exptime * 1000).subtract(5, 'seconds')))
}

export const getAccessToken = (): string | null => getCredentials()?.accessToken || null

export const isLoggedIn = (): boolean => !!getUser()

/** Check if the user has rights to access this page */
export const usePermissions = (key: keyof typeof AppPage): boolean | string => {
  if (!isLoggedIn()) return 'loggedout'
  const data = getUser()?.permissions?.map(e => e.permissionCode)
  const isPermitted = !!data?.includes(AppPage[key])

  return isPermitted
}

export default {
  setCredentials,
  clearCredentials,
  getCredentials,
  getUser,
  getAccessToken,
}
