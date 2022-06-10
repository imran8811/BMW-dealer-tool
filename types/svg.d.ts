type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>

declare module '*.svg' {
  const ReactComponent: SvgrComponent

  export default ReactComponent
}
