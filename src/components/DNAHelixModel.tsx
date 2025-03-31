import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect } from 'react'

export function DNAHelixModel() {
    const gltf = useGLTF('/DNA.glb')
    const { actions, names } = useAnimations(gltf.animations, gltf.scene)

    useEffect(() => {
        // Automatically play the first animation
        if (names.length > 0 && actions[names[0]]) {
            actions[names[0]]!.play()
        }
    }, [actions, names])

    return (
        <primitive object={gltf.scene} scale={4} rotation={[0, 0, Math.PI / 3]} />
    )
}
