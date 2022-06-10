/* eslint-disable import/prefer-default-export */
/**
 * Predefined media queries. Use together with @react-hook/media-query package.
 */

// needs to be kept in sync with Bootstrap
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
}

type Breakpoint = keyof typeof breakpoints

/**
 * You can use this to generate media queries for bootstrap breakpoints.
 *
 *  const isLarge = useMediaQuery(breakpointUp("lg"))
 */
export function breakpointUp(breakpoint: Breakpoint) {
  return `(min-width: ${breakpoints[breakpoint]}px)`
}
