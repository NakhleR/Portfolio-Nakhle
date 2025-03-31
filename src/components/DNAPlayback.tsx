import { Canvas } from '@react-three/fiber'
import { DNAHelixModel } from './DNAHelixModel'
import { AsciiEffectOverlay } from './AsciiEffect'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

export default function DNAPlayback() {
    return (
        <Canvas
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
                cursor: "pointer",
            }}
            camera={{ position: [0, 0, 20], fov: 50 }}
            gl={{ alpha: true }}
        >
            <directionalLight position={[0, 10, 10]} intensity={2} />
            <Suspense fallback={null}>
                <DNAHelixModel />
            </Suspense>
            <AsciiEffectOverlay />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
            />
        </Canvas>
    )
}
