/// <reference types="googlemaps" />
import { FC, useEffect, useState } from 'react'
import getConfig from 'next/config'
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api'
import styles from './AddressMap.module.scss'

const getApiKey = (): string => {
  if (process.env.GOOGLE_MAP_KEY) {
    return process.env.GOOGLE_MAP_KEY
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { publicRuntimeConfig } = getConfig()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return publicRuntimeConfig.googleMapKey as string
}
// console.log(useJsApiLoader(getApiKey()))

export interface AddressMapProps {
  address: string
}

/**
 * Displays a map with automatic address geocoding.
 */
const AddressMap: FC<AddressMapProps> = ({ address }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: getApiKey() })
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  // console log put here intentionally from debugging purpose
  console.log(isLoaded)
  useEffect(() => {
    if (isLoaded) {
      const geo = new window.google.maps.Geocoder()
      // console log put here intentionally from debugging purpose
      console.log(geo)
      geo.geocode({ address }, results => {
        const loc = results?.[0]?.geometry?.location
        setLocation({ lat: loc.lat(), lng: loc.lng() })
      })
    }
  }, [isLoaded, address])

  return (
    <>
      {isLoaded && location != null && (
        <GoogleMap
          center={location}
          zoom={14}
          mapContainerClassName={styles.container}
          options={{ fullscreenControl: false, disableDefaultUI: true }}
        >
          <Marker position={location} />
        </GoogleMap>
      )}
    </>
  )
}

export default AddressMap
