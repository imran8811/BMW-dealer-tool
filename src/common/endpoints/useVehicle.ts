import useSWR, { ConfigInterface } from 'swr'

export type PackageCodeOption = {
  code: string
  options: string[]
}

export type Vehicle = {
  dealerCode: string // text
  vin: string // text
  stockNumber?: string // text
  year: number // integer
  make: string // Text
  model: string // Text
  bodyStyle: string // Text
  transmissionType: string // Text
  internetPrice: number // Numeric
  mileage: number // Numeric
  photoUrls: string[] // pipe-delimited list of URLs
  trimDescription: string // text
  msrp: number // number
  doingBusinessAs?: string
  addressTitle?: string
  address?: string
  city?: string
  state?: string
  zip?: number
  phoneNumber?: string
  fax?: string
  email?: string
  contactName?: string
  dealerURL?: string
  Price2?: number
  exteriorColorDescription?: string
  interiorColorDescription?: string
  vehicleComments?: string
  type: number
  bodyType?: string
  transmissionSpeed?: number
  transmissionDescription?: string
  engineCylinders?: number
  doors?: number
  engineDescription?: string
  vehicleClass?: string
  enginePower?: number
  engineConfiguration?: string
  engineDisplacement?: number
  engineInduction?: string
  fuelType?: string
  warranty?: string
  lastModified?: Date
  vehicleURL: string
  exteriorColorManufacturerCode?: string
  interiorColorManufacturerCode?: string
  optionDescription: string[] // pipe-delimited text
  packagesAndOptionDescription: PackageCodeOption[]
  stockPhotos?: string[]
}

const useVehicle = (
  vin: string,
  options?: ConfigInterface<Vehicle, Error>,
): {
  data?: Vehicle
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<Vehicle, Error>(`/get-vehicle/${vin}`, options)

  return {
    data,
    error,
    isLoading: !error && !data,
  }
}

export default useVehicle
