export type ResponsiveImage = {
  src: string,
  srcSet: string,
  placeholder: string,
  images: {
    path: string,
    width: number,
    height: number
  }[],
  width: number,
  height: number
}

declare module '*.jpg' {
  const content: ResponsiveImage
  export default content
}

declare module '*.jpeg' {
  const content: ResponsiveImage
  export default content
}

declare module '*.png' {
  const content: ResponsiveImage
  export default content
}

declare module '*.gif' {
  const content: ResponsiveImage
  export default content
}

declare module '*.webp' {
  const content: ResponsiveImage
  export default content
}
