/**
 * Useful helper when testing time based stuff in code.
 *
 * @param timeout how long to wait, in seconds
 */
export default function sleep(timeout: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}
