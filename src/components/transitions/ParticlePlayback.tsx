import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const PARTICLE_COUNT = 150000
const FRAME_COUNT = 250

function ParticlePoints() {
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const [frames, setFrames] = useState<Float32Array[]>([])
    const [frameIndex, setFrameIndex] = useState(0)
    const geometryRef = useRef<THREE.BufferGeometry>(null)

    // Load all JSON frames
    useEffect(() => {
        const loadFrames = async () => {
            const loaded: Float32Array[] = []
            for (let i = 1; i <= FRAME_COUNT; i++) {
                const frameNumber = i.toString().padStart(4, '0')
                const res = await fetch(`/frames/frame_${frameNumber}.json`)
                const json = await res.json()
                const flat = new Float32Array(json.flat())
                loaded.push(flat)
            }
            setFrames(loaded)
        }
        loadFrames()
    }, [])

    // Animate frames
    useFrame(({ clock }) => {
        if (!materialRef.current || frames.length === 0) return
        const current = Math.floor(clock.elapsedTime * 24) % frames.length
        if (current !== frameIndex) {
            setFrameIndex(current)
            const frameData = frames[current]
            geometryRef.current?.attributes.position.copyArray(frameData)
            if (geometryRef.current) {
                geometryRef.current.attributes.position.needsUpdate = true
            }

        }
    })

    // Build particle geometry
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3 + 0] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
    }

    return (
        <points>
            <bufferGeometry ref={geometryRef}>
                <bufferAttribute
                    attach="attributes-position"
                    array={positions}
                    count={PARTICLE_COUNT}
                    itemSize={3}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertex}
                fragmentShader={fragment}
                transparent
            />
        </points>
    )
}

const vertex = `
  varying float vAlpha;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 2.0;
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = 1.0 - smoothstep(0.0, 100.0, length(mvPosition.xyz));
  }
`

const fragment = `
  precision highp float;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    gl_FragColor = vec4(1.0, 0.5, 1.0, vAlpha);
  }
`

export default function ParticlePlayback() {
    return (
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
            <ambientLight intensity={1} />
            <ParticlePoints />
        </Canvas>
    )
}
