declare module 'three/examples/jsm/effects/AsciiEffect' {
    import { WebGLRenderer, Scene, Camera } from 'three'

    export class AsciiEffect {
        constructor(renderer: WebGLRenderer, chars?: string, options?: {
            invert?: boolean
            resolution?: number
        })

        domElement: HTMLDivElement
        setSize(width: number, height: number): void
        render(scene: Scene, camera: Camera): void
    }
}
