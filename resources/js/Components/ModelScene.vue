<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
const props = defineProps<{ model: "dna" | "thinker" }>();
const host = ref<HTMLDivElement | null>(null);
const failed = ref(false);
let dispose = () => {};
onMounted(async () => {
    const THREE = await import("three");
    const [
        { GLTFLoader },
        { DRACOLoader },
        { OrbitControls },
        { AsciiEffect },
    ] = await Promise.all([
        import("three/addons/loaders/GLTFLoader.js"),
        import("three/addons/loaders/DRACOLoader.js"),
        import("three/addons/controls/OrbitControls.js"),
        import("three/addons/effects/AsciiEffect.js"),
    ]);
    if (!host.value) return;
    let renderer: InstanceType<typeof THREE.WebGLRenderer>;
    try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
        failed.value = true;
        return;
    }
    const scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, props.model === "dna" ? 20 : 8);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(5, 10, 7);
    scene.add(light);
    const fill = new THREE.DirectionalLight(0xffffff, 1);
    fill.position.set(-4, 5, -3);
    scene.add(fill);
    const effect = new AsciiEffect(renderer, " .:-+*=%@#", {
        invert: false,
        resolution: 0.22,
    });
    effect.domElement.style.backgroundColor = "transparent";
    effect.domElement.style.color = "inherit";
    effect.domElement.setAttribute("aria-hidden", "true");
    host.value.appendChild(effect.domElement);
    const controls = new OrbitControls(camera, effect.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = props.model === "dna";
    controls.autoRotateSpeed = 0.8;
    let mixer: InstanceType<typeof THREE.AnimationMixer> | undefined;
    let alive = true,
        visible = true,
        frame = 0;
    let hasSize = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loader = new GLTFLoader(),
        draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    loader.setDRACOLoader(draco);
    loader.load(
        props.model === "dna" ? "/DNA.glb" : "/thinker.glb",
        (gltf) => {
            if (!alive) return;
            const object = gltf.scene;
            if (props.model === "dna") {
                object.scale.setScalar(4);
                object.rotation.z = Math.PI / 3;
            } else {
                object.scale.setScalar(2.5);
                object.position.y = -2;
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh)
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0xffffff,
                            shininess: 60,
                        });
                });
            }
            scene.add(object);
            if (gltf.animations.length) {
                mixer = new THREE.AnimationMixer(object);
                mixer.clipAction(gltf.animations[0]).play();
            }
            if (hasSize) effect.render(scene, camera);
        },
        undefined,
        () => {
            failed.value = true;
        },
    );
    function resize() {
        if (!host.value) return;
        const { width, height } = host.value.getBoundingClientRect();
        hasSize = width > 0 && height > 0;
        if (!hasSize) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        effect.setSize(width, height);
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host.value);
    resize();
    const observer = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
    });
    observer.observe(host.value);
    const timer = new THREE.Clock();
    let last = 0;
    function render(time: number) {
        frame = requestAnimationFrame(render);
        if (!alive || !visible || !hasSize || document.hidden || time - last < 50) return;
        last = time;
        const delta = Math.min(timer.getDelta(), 0.1);
        if (!reduced) {
            controls.update();
            mixer?.update(delta);
        }
        effect.render(scene, camera);
    }
    frame = requestAnimationFrame(render);
    dispose = () => {
        alive = false;
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        observer.disconnect();
        controls.dispose();
        draco.dispose();
        renderer.dispose();
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                for (const material of Array.isArray(child.material)
                    ? child.material
                    : [child.material])
                    material.dispose();
            }
        });
        effect.domElement.remove();
    };
});
onBeforeUnmount(() => dispose());
</script>
<template>
    <div
        ref="host"
        class="model-scene"
        :aria-label="
            model === 'dna' ? 'Animated DNA helix' : 'The Thinker sculpture'
        "
        role="img"
    >
        <p v-if="failed" class="text-muted-foreground text-sm">
            3D preview is unavailable on this device.
        </p>
    </div>
</template>
