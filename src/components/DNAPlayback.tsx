import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { DNAHelixModel } from './DNAHelixModel' // adjust the path to your file
import { OrbitControls } from '@react-three/drei'
import { Euler } from 'three'

export default function DNAPlayback() {
    return (
        <Canvas
            camera={{ position: [0, 0, 20], fov: 50 }}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
            }}
            gl={{ alpha: true }}
        >
            <color attach="background" args={['transparent']} />
            <ambientLight intensity={1} />
            <Suspense fallback={null}>
                <DNAHelixModel />
            </Suspense>
        </Canvas>

    )
}
