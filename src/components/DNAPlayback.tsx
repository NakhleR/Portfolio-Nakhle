import { Canvas, useFrame } from '@react-three/fiber'
import { DNAHelixModel } from './DNAHelixModel'
import { AsciiEffectOverlay } from './AsciiEffect'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useState, useEffect } from 'react'

const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background/30 z-10">
        <div className="flex flex-col items-center gap-2">
            <div className="spinner-border h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                </span>
            </div>
            <div className="text-foreground text-sm">Loading DNA model</div>
        </div>
    </div>
);

const LoadingFallback = () => {
    const [rotation, setRotation] = useState(0);

    useFrame(() => {
        setRotation(prev => prev + 0.01);
    });

    return null;
};

export default function DNAPlayback() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[400px]">
            {isLoading && <LoadingSpinner />}

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
                <Suspense fallback={<LoadingFallback />}>
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
        </div>
    )
}
