import type { DetailedHTMLProps, HTMLAttributes } from 'react'
export interface ModeloEl extends HTMLElement {
  canActivateAR: boolean; activateAR(): Promise<void>; loaded: boolean
  getDimensions(): { x: number; y: number; z: number }
}
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<ModeloEl>, ModeloEl> & Record<string, unknown>
    }
  }
}
