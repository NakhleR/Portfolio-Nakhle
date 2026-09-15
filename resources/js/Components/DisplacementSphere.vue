<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useEntryAsset } from "../composables/useEntryLoader";
import vertexShader from "../graphics/displacement-sphere-vertex.glsl?raw";
import fragmentShader from "../graphics/displacement-sphere-fragment.glsl?raw";

const host = ref<HTMLCanvasElement | null>(null);
const visible = ref(false);
let stop = () => {};
const { entry, complete } = useEntryAsset();

onMounted(async () => {
    try {
        const T = await import("three");
        const canvas = host.value;
        if (!canvas) return;

        let renderer: InstanceType<typeof T.WebGLRenderer>;
        try {
            renderer = new T.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: false,
                powerPreference: "high-performance",
            });
        } catch {
            return;
        }
        renderer.setPixelRatio(1);
        renderer.outputColorSpace = T.LinearSRGBColorSpace;

        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(54, 1, 0.1, 100);
        camera.position.z = 52;
        const geometry = new T.SphereGeometry(32, 128, 128);
        const material = new T.MeshPhongMaterial();
        const time = { value: 0 };
        // Preserve the original site's turbulence, displacement and Phong shading.
        material.onBeforeCompile = (shader) => {
            shader.uniforms.time = time;
            shader.vertexShader = vertexShader;
            shader.fragmentShader = fragmentShader;
        };
        const sphere = new T.Mesh(geometry, material);
        scene.add(sphere);
        const direct = new T.DirectionalLight(0xffffff, 1.8);
        direct.position.set(100, 100, 200);
        const ambient = new T.AmbientLight(0xffffff, 2.7);
        scene.add(direct, ambient);

        const reduced = matchMedia("(prefers-reduced-motion: reduce)");
        let inViewport = true;
        let frame = 0;
        let last = 0;
        const start = performance.now();
        const rotation = { x: 0, y: 0, velocityX: 0, velocityY: 0 };
        const target = { x: 0, y: 0 };
        let lastMouse = 0;

        function render() {
            renderer.render(scene, camera);
        }
        function animate(now: number) {
            frame = 0;
            if (
                document.hidden ||
                !inViewport ||
                reduced.matches ||
                entry.value
            )
                return;
            // Keep UI scrolling at display refresh rate without redrawing this
            // expensive decorative turbulence shader on every display frame.
            if (now - last < 1000 / 30 - 1) {
                frame = requestAnimationFrame(animate);
                return;
            }
            let remaining = Math.min((now - last) / 1000, 0.1);
            const delta = remaining;
            last = now;
            // The original pointer spring: stiffness 30, damping 20, mass 2.
            while (remaining > 0) {
                const step = Math.min(remaining, 1 / 120);
                rotation.velocityX +=
                    (((target.x - rotation.x) * 30 - rotation.velocityX * 20) /
                        2) *
                    step;
                rotation.velocityY +=
                    (((target.y - rotation.y) * 30 - rotation.velocityY * 20) /
                        2) *
                    step;
                rotation.x += rotation.velocityX * step;
                rotation.y += rotation.velocityY * step;
                remaining -= step;
            }
            time.value = (now - start) * 0.00005;
            sphere.rotation.set(
                rotation.x,
                rotation.y,
                sphere.rotation.z + delta * 0.06,
            );
            render();
            frame = requestAnimationFrame(animate);
        }
        function updateAnimation() {
            cancelAnimationFrame(frame);
            frame = 0;
            render();
            if (
                !reduced.matches &&
                inViewport &&
                !document.hidden &&
                !entry.value
            ) {
                last = performance.now();
                frame = requestAnimationFrame(animate);
            }
        }
        function theme() {
            const dark = document.documentElement.classList.contains("dark");
            direct.intensity = dark ? 2.0 : 1.8;
            ambient.intensity = dark ? 0.4 : 2.7;
            render();
        }
        function resize() {
            const width = innerWidth;
            const height = innerHeight * 1.3;
            const scale = Math.min(
                1,
                1600 / width,
                Math.sqrt(1_200_000 / (width * height)),
            );
            renderer.setSize(
                Math.round(width * scale),
                Math.round(height * scale),
                false,
            );
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            sphere.position.set(
                width <= 600 ? 14 : width <= 1080 ? 18 : 22,
                width <= 600 ? 10 : width <= 1080 ? 14 : 16,
                0,
            );
            render();
        }
        function mouse(event: MouseEvent) {
            if (
                reduced.matches ||
                !inViewport ||
                event.timeStamp - lastMouse < 100
            )
                return;
            lastMouse = event.timeStamp;
            target.x = event.clientY / innerHeight / 2;
            target.y = event.clientX / innerWidth / 2;
        }
        const themeObserver = new MutationObserver(theme);
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        const viewportObserver = new IntersectionObserver(([entry]) => {
            inViewport = entry.isIntersecting;
            updateAnimation();
        });
        resize();
        theme();
        viewportObserver.observe(canvas);
        addEventListener("resize", resize);
        addEventListener("mousemove", mouse, { passive: true });
        document.addEventListener("visibilitychange", updateAnimation);
        reduced.addEventListener("change", updateAnimation);
        const stopEntryWatch = watch(entry, updateAnimation);
        visible.value = true;
        updateAnimation();

        stop = () => {
            cancelAnimationFrame(frame);
            removeEventListener("resize", resize);
            removeEventListener("mousemove", mouse);
            document.removeEventListener("visibilitychange", updateAnimation);
            reduced.removeEventListener("change", updateAnimation);
            stopEntryWatch();
            themeObserver.disconnect();
            viewportObserver.disconnect();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    } catch {
        stop();
    } finally {
        complete();
    }
});
onBeforeUnmount(() => stop());
</script>
<template>
    <canvas
        ref="host"
        class="displacement-sphere"
        :data-visible="visible"
        aria-hidden="true"
    />
</template>
<style scoped>
.displacement-sphere {
    position: absolute;
    width: 100vw;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 3s cubic-bezier(0.43, 0.13, 0.23, 0.96);
}
.displacement-sphere[data-visible="true"] {
    opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
    .displacement-sphere {
        transition: none;
    }
}
</style>
