import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { DNAHelixModel } from './DNAHelixModel'
import { AsciiEffectOverlay } from './AsciiEffect'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'

// Loading spinner with appropriate theming
const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background/30 z-10">
        <div className="flex flex-col items-center gap-2">
            <div className="spinner-border h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                </span>
            </div>
            <div className="text-foreground text-sm">Loading...</div>
        </div>
    </div>
);

const LoadingFallback = () => null;

// Component to monitor canvas and verify content is actually rendered
const CanvasMonitor = ({ onLoaded, onBlankCanvas }) => {
    const { gl, scene } = useThree();
    const checkAttempts = useRef(0);
    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        // Mark first render complete
        setIsFirstRender(false);
    }, []);

    useFrame(() => {
        if (isFirstRender) return; // Skip first frame

        checkAttempts.current += 1;

        // Check if anything is actually visible in the scene
        if (checkAttempts.current === 10) { // Check after 10 frames
            if (scene.children.length > 1) {
                // Scene has content, signal loaded
                onLoaded();
            } else {
                // Scene is empty or just has a camera, signal blank canvas
                onBlankCanvas();
            }
        }
    });

    return null;
};

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
    const [hasError, setHasError] = useState(false);
    const loadTimeout = useRef(null);
    const canvasRef = useRef(null);

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

    // Handler for blank canvas detection
    const handleBlankCanvas = () => {
        console.warn("Blank canvas detected - attempting recovery");
        setHasError(true);

        // Try to recover by forcing a remount of the canvas
        setTimeout(() => {
            setHasError(false);
            setIsLoading(true);

            // Give it a moment and then try again
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }, 500);
    };

    // Force remount of canvas if error is detected
    const canvasKey = `dna-canvas-${hasError ? 'recovery' : 'normal'}`;

    return (
        <div className="relative w-full h-full min-h-[400px]" ref={canvasRef}>
            {isLoading && <LoadingSpinner />}

            {!hasError && (
                <Canvas
                    key={canvasKey}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        cursor: "pointer",
                    }}
                    camera={{ position: [0, 0, 20], fov: 50 }}
                    gl={{
                        alpha: true,
                        antialias: true,
                        powerPreference: 'high-performance'
                    }}
                    onCreated={({ gl }) => {
                        // Add listeners for context lost/restored events
                        gl.domElement.addEventListener('webglcontextlost', (e) => {
                            console.warn('WebGL context lost - will attempt recovery');
                            e.preventDefault();
                            setHasError(true);
                        });

                        gl.domElement.addEventListener('webglcontextrestored', () => {
                            console.log('WebGL context restored');
                            setHasError(false);
                        });
                    }}
                >
                    <directionalLight position={[0, 10, 10]} intensity={2} />
                    <Suspense fallback={<LoadingFallback />}>
                        <DNAHelixModel />
                        <ModelLoader onLoaded={handleModelLoaded} />
                        <CanvasMonitor
                            onLoaded={handleModelLoaded}
                            onBlankCanvas={handleBlankCanvas}
                        />
                    </Suspense>
                    <AsciiEffectOverlay />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 2}
                        maxPolarAngle={Math.PI / 2}
                    />
                </Canvas>
            )}

            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                    <div className="text-center p-4">
                        <div className="text-sm text-foreground">Reloading visualization...</div>
                    </div>
                </div>
            )}
        </div>
    )
}
