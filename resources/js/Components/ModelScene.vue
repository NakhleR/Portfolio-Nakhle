<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useEntryAsset } from "../composables/useEntryLoader";
const { entry: entryLoad, complete } = useEntryAsset();
const props = defineProps<{ model: "dna" | "thinker"; background?: boolean }>();
const host = ref<HTMLDivElement | null>(null);
const failed = ref(false);
let alive = true;
let dispose = () => {};
let visibility: IntersectionObserver | undefined;

onMounted(() => {
    if (!host.value) return;
    if (entryLoad.value) {
        void initialize();
        return;
    }
    let started = false;
    visibility = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting || started) return;
            started = true;
            void initialize();
        },
        { rootMargin: "120px" },
    );
    visibility.observe(host.value);
});

async function initialize() {
    try {
        const [
            THREE,
            { GLTFLoader },
            { DRACOLoader },
            { OrbitControls },
            { createAsciiScene },
        ] = await Promise.all([
            import("three"),
            import("three/addons/loaders/GLTFLoader.js"),
            import("three/addons/loaders/DRACOLoader.js"),
            import("three/addons/controls/OrbitControls.js"),
            import("../graphics/asciiScene"),
        ]);
        if (!alive || !host.value) return;
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
        });
        renderer.setPixelRatio(1);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
        camera.position.z = props.model === "dna" ? 20 : 8;
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const key = new THREE.DirectionalLight(0xffffff, 2.5);
        key.position.set(5, 10, 7);
        const fill = new THREE.DirectionalLight(0xffffff, 1);
        fill.position.set(-4, 5, -3);
        scene.add(key, fill);
        const effect = createAsciiScene(renderer, host.value);
        effect.updateColor();
        const controls = new OrbitControls(camera, effect.domElement);
        if (props.background) effect.domElement.style.touchAction = "pan-y";
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.minPolarAngle = Math.PI / 2;
        controls.maxPolarAngle = Math.PI / 2;
        controls.autoRotate = false;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)");
        let mixer: InstanceType<typeof THREE.AnimationMixer> | undefined;
        let visible = false,
            hasSize = false,
            frame = 0,
            last = 0;
        const draco = new DRACOLoader().setDecoderPath("/draco/");
        const loader = new GLTFLoader().setDRACOLoader(draco);
        function disposeObject(object: InstanceType<typeof THREE.Object3D>) {
            object.traverse((child) => {
                if (!(child instanceof THREE.Mesh)) return;
                child.geometry.dispose();
                for (const material of Array.isArray(child.material)
                    ? child.material
                    : [child.material])
                    material.dispose();
            });
        }
        function draw(now: number) {
            frame = 0;
            if (
                !alive ||
                !visible ||
                !hasSize ||
                document.hidden ||
                entryLoad.value
            )
                return;
            if (!mixer || now - last >= 33 || reduced.matches) {
                const delta = Math.min((now - last) / 1000, 0.05);
                last = now;
                if (!reduced.matches) {
                    controls.update(delta);
                    mixer?.update(delta);
                }
                effect.render(scene, camera);
            }
            if (!reduced.matches && mixer) schedule();
        }
        function schedule() {
            if (
                !frame &&
                alive &&
                visible &&
                !document.hidden &&
                !entryLoad.value
            )
                frame = requestAnimationFrame(draw);
        }
        function resize() {
            if (!host.value) return;
            const { width, height } = host.value.getBoundingClientRect();
            hasSize = width > 0 && height > 0;
            if (!hasSize) return;
            camera.aspect = width / height;
            if (props.background) {
                // Shift the subject, not the canvas: its full section stays drawable.
                const subjectWidth = height * 1.5;
                const sideRoom = Math.max(0, (width - subjectWidth) / 2);
                const offset =
                    width >= 1024 ? -Math.min(width * 0.22, sideRoom) : 0;
                camera.zoom = Math.min(1, width / subjectWidth);
                camera.setViewOffset(width, height, offset, 0, width, height);
            }
            camera.updateProjectionMatrix();
            controls.update();
            effect.setSize(width, height);
            schedule();
        }
        const sizeObserver = new ResizeObserver(resize);
        sizeObserver.observe(host.value);
        const renderObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) schedule();
            else {
                cancelAnimationFrame(frame);
                frame = 0;
            }
        });
        renderObserver.observe(host.value);
        document.addEventListener("visibilitychange", schedule);
        reduced.addEventListener("change", schedule);
        controls.addEventListener("change", schedule);
        const stopEntryWatch = watch(entryLoad, schedule);
        const themeObserver = new MutationObserver(() => {
            effect.updateColor();
            schedule();
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        resize();
        dispose = () => {
            cancelAnimationFrame(frame);
            sizeObserver.disconnect();
            renderObserver.disconnect();
            stopEntryWatch();
            themeObserver.disconnect();
            document.removeEventListener("visibilitychange", schedule);
            reduced.removeEventListener("change", schedule);
            controls.dispose();
            draco.dispose();
            mixer?.stopAllAction();
            disposeObject(scene);
            renderer.dispose();
            effect.dispose();
        };
        loader.load(
            props.model === "dna" ? "/DNA.glb" : "/thinker.glb",
            (gltf) => {
                if (!alive) {
                    disposeObject(gltf.scene);
                    return;
                }
                const object = gltf.scene;
                object.scale.setScalar(props.model === "dna" ? 4 : 2.5);
                if (props.model === "dna") object.rotation.z = Math.PI / 3;
                else object.position.y = -2;
                object.traverse((child) => {
                    if (
                        props.model === "thinker" &&
                        child instanceof THREE.Mesh
                    ) {
                        for (const material of Array.isArray(child.material)
                            ? child.material
                            : [child.material])
                            material.dispose();
                        // Match the helix's glTF default surface so both models
                        // feed the same tonal range into the ASCII character ramp.
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0xffffff,
                            metalness: 1,
                            roughness: 1,
                        });
                    }
                });
                scene.add(object);
                if (gltf.animations.length) {
                    mixer = new THREE.AnimationMixer(object);
                    mixer.clipAction(gltf.animations[0]).play();
                }
                resize();
                effect.render(scene, camera);
                complete();
            },
            undefined,
            () => {
                if (alive) failed.value = true;
                complete();
            },
        );
    } catch {
        if (alive) failed.value = true;
        complete();
    }
}
onBeforeUnmount(() => {
    alive = false;
    visibility?.disconnect();
    dispose();
});
</script>
<template>
    <div
        ref="host"
        class="model-scene"
        :aria-label="
            model === 'dna'
                ? 'Interactive DNA helix — drag left or right'
                : 'The Thinker sculpture — drag left or right'
        "
        role="img"
    >
        <p v-if="failed" class="model-fallback">
            The 3D preview is unavailable on this device.
        </p>
    </div>
</template>
