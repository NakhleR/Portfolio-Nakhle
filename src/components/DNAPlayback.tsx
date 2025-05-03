import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { DNAHelixModel } from './DNAHelixModel'
import { AsciiEffectOverlay } from './AsciiEffect'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'

// Clean loading spinner for production
const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background/30 z-10">
        <div className="flex flex-col items-center gap-2">
            <div className="spinner-border h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                </span>
            </div>
        </div>
    </div>
);


const LoadingFallback = () => null;


const ModelLoader = ({ onLoaded }) => {
    useEffect(() => {

        const timer = setTimeout(() => {
            onLoaded();
        }, 500);

        return () => clearTimeout(timer);
    }, [onLoaded]);

    return null;
};

export default function DNAPlayback() {
    const [isLoading, setIsLoading] = useState(true);
    const loadTimeout = useRef(null);

    // Ensure we clean up the timeout on unmount
    useEffect(() => {
        // Failsafe timeout in case something goes wrong with loading
        loadTimeout.current = setTimeout(() => {
            setIsLoading(false);
        }, 6000); // 6 seconds max loading time

        return () => {
            if (loadTimeout.current) {
                clearTimeout(loadTimeout.current);
            }
        };
    }, []);

    // Handler for when the model signals it's loaded
    const handleModelLoaded = () => {
        setIsLoading(false);
        if (loadTimeout.current) {
            clearTimeout(loadTimeout.current);
        }
    };

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
                    <ModelLoader onLoaded={handleModelLoaded} />
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
