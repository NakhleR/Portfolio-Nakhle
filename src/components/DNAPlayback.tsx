import { Canvas } from '@react-three/fiber'
import { DNAHelixModel } from './DNAHelixModel'
import { AsciiEffectOverlay } from './AsciiEffect'

export default function DNAPlayback() {
    return (
        <Canvas
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
            }}
            camera={{ position: [0, 0, 20], fov: 50 }}
            gl={{ alpha: true }}
        >
            <directionalLight position={[0, 10, 10]} intensity={2} />
            <DNAHelixModel />
            <AsciiEffectOverlay />
        </Canvas>
    )
}
