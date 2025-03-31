// AsciiEffectOverlay.tsx
import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'

export function AsciiEffectOverlay() {
    const { scene, camera, gl, size } = useThree()
    const effectRef = useRef<AsciiEffect>()

    useEffect(() => {
        const effect = new AsciiEffect(gl, ' .:-+*=%@#', {
            invert: false,
        })
        effect.setSize(size.width, size.height)

        effect.domElement.style.position = 'absolute'
        effect.domElement.style.top = '0'
        effect.domElement.style.left = '0'
        effect.domElement.style.color = 'white'
        effect.domElement.style.backgroundColor = 'transparent'
        effect.domElement.style.pointerEvents = 'none'

        gl.domElement.style.display = 'none' // hide original canvas
        gl.domElement.parentNode?.appendChild(effect.domElement)

        effectRef.current = effect

        return () => {
            gl.domElement.style.display = ''
            effect.domElement.remove()
        }
    }, [gl, size])

    useFrame(() => {
        effectRef.current?.render(scene, camera)
    }, 1) // priority 1 so it renders after updates

    return null
}
