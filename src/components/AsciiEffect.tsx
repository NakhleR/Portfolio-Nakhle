// AsciiEffectOverlay.tsx
import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
import { useTheme } from '@/components/ThemeProvider'

export function AsciiEffectOverlay() {
    const { scene, camera, gl, size } = useThree()
    const effectRef = useRef<AsciiEffect>()
    const { theme } = useTheme()

    const getResolvedTheme = (): 'light' | 'dark' => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return theme
    }

    useEffect(() => {
        const effect = new AsciiEffect(gl, ' .:-+*=%@#', {
            invert: false,
        })
        effect.setSize(size.width, size.height)

        effect.domElement.style.position = 'absolute'
        effect.domElement.style.top = '0'
        effect.domElement.style.left = '0'
        effect.domElement.style.color = getResolvedTheme() === 'dark' ? 'white' : 'black'
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

    useEffect(() => {
        const isDark = getResolvedTheme() === 'dark'
        if (effectRef.current) {
            effectRef.current.domElement.style.color = isDark ? 'white' : 'black'
        }
    }, [theme])

    useFrame(() => {
        effectRef.current?.render(scene, camera)
    }, 1) // priority 1 so it renders after updates

    return null
}
