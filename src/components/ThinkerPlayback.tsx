import { Canvas } from '@react-three/fiber'
import { ThinkerModel } from './ThinkerModel'
import { AsciiEffectOverlay } from './AsciiEffect'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'

export default function ThinkerPlayback() {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const loadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        loadTimeout.current = setTimeout(() => {
            setIsLoading(false)
        }, 6000)

        return () => {
            if (loadTimeout.current) clearTimeout(loadTimeout.current)
        }
    }, [])

    const handleLoaded = () => {
        setIsLoading(false)
        if (loadTimeout.current) clearTimeout(loadTimeout.current)
    }

    const canvasKey = `thinker-canvas-${hasError ? 'recovery' : 'normal'}`

    return (
        <div className="relative w-full h-full min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent" />
                </div>
            )}

            {!hasError && (
                <Canvas
                    key={canvasKey}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                    }}
                    camera={{ position: [0, 0, 8], fov: 45 }}
                    gl={{
                        alpha: true,
                        antialias: true,
                        powerPreference: 'high-performance',
                    }}
                    onCreated={({ gl }) => {
                        gl.domElement.addEventListener('webglcontextlost', (e) => {
                            e.preventDefault()
                            setHasError(true)
                        })
                        gl.domElement.addEventListener('webglcontextrestored', () => {
                            setHasError(false)
                        })
                    }}
                >
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[5, 10, 7]} intensity={2.5} />
                    <directionalLight position={[-4, 5, -3]} intensity={1} />
                    <spotLight position={[0, 12, 4]} intensity={2} angle={0.5} penumbra={0.5} />
                    <Suspense
                        fallback={null}
                    >
                        <ThinkerModel />
                        <LoadNotifier onLoaded={handleLoaded} />
                    </Suspense>
                    <AsciiEffectOverlay resolution={0.3} />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 2}
                        maxPolarAngle={Math.PI / 2}
                    />
                </Canvas>
            )}
        </div>
    )
}

function LoadNotifier({ onLoaded }: { onLoaded: () => void }) {
    useEffect(() => {
        const t = setTimeout(onLoaded, 500)
        return () => clearTimeout(t)
    }, [onLoaded])
    return null
}
