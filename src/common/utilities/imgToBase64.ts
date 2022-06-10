/**
 * Convert image from URL into Base64 string
 */
const convertImgToBase64 = (url: string, mimeType = 'image/png'): Promise<string | undefined> =>
  new Promise(resolve => {
    let canvas: HTMLCanvasElement | null = document.createElement('canvas')
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const img = new Image()
    img.addEventListener('load', () => {
      if (canvas === null) return resolve(undefined)

      canvas.height = img.height
      canvas.width = img.width
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL(mimeType || 'image/png')
      canvas = null
      resolve(dataURL)
    })

    img.addEventListener('error', () => {
      resolve(undefined)
    })

    img.crossOrigin = 'Anonymous'
    img.src = url
  })

export default convertImgToBase64
