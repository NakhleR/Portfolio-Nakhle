import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'

const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x222222,
    shininess: 60,
})

export function ThinkerModel() {
    const gltf = useGLTF('/thinker.glb')

    useEffect(() => {
        gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = material
            }
        })
    }, [gltf.scene])

    return (
        <primitive object={gltf.scene} scale={2.5} position={[0, -2, 0]} />
    )
}
