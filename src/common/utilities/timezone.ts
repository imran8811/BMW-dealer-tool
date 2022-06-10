import useDealershipConfiguration from '@common/endpoints/useDealershipConfiguration'

enum TimeZoneCodes {
  Eastern = 'US/Eastern',
  Central = 'US/Central',
  Mountain = 'US/Mountain',
  Pacific = 'US/Pacific',
  Hawaii = 'US/Hawaii',
  Alaska = 'US/Alaska',
  Atlantic = 'US/Eastern',
  Samoa = 'US/Samoa',
  Chamorro = 'Pacific/Guam',
}
/**
 * Custom function that return abreviated timezone code after searching from `TimeZoneCodes`
 *
 * `TimeZoneCodes` is hardcoded enum made to resolve `invalid timezone bug` in `dayjs` dependency
 */
export const validateTimeZone = (timezone: string | undefined): string | undefined => {
  if (timezone && Object.keys(TimeZoneCodes).includes(timezone))
    return TimeZoneCodes[timezone as keyof typeof TimeZoneCodes]
  return timezone
}
/**
 * A React hook which returns current timezone information.
 *
 * In storybook it will always return null. In dealer tool it will be
 * based on current dealership information.
 */
const useTimezone: () => string | null =
  process.env.STORYBOOK_STORYBOOK != null
    ? () => null
    : () => {
        const { data } = useDealershipConfiguration()

        return data?.dealerTimezone ?? null
      }

// eslint-disable-next-line import/prefer-default-export
export { useTimezone }
