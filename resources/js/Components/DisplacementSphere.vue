<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
const host = ref<HTMLCanvasElement | null>(null);
let stop = () => {};
onMounted(async () => {
    const T = await import("three");
    if (!host.value) return;
    let renderer: InstanceType<typeof T.WebGLRenderer>;
    try {
        renderer = new T.WebGLRenderer({
            canvas: host.value,
            alpha: true,
            antialias: false,
        });
    } catch {
        return;
    }
    const scene = new T.Scene(),
        camera = new T.PerspectiveCamera(
            54,
            innerWidth / innerHeight,
            0.1,
            100,
        );
    camera.position.z = 52;
    const geometry = new T.SphereGeometry(32, 96, 96),
        material = new T.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: false,
        });
    const time = { value: 0 };
    material.onBeforeCompile = (shader) => {
        shader.uniforms.time = time;
        shader.vertexShader = shader.vertexShader
            .replace(
                "#include <common>",
                "#include <common>\nuniform float time;",
            )
            .replace(
                "#include <begin_vertex>",
                "vec3 transformed = vec3(position); float wave=sin(position.x*.19+time)*sin(position.y*.17-time)*sin(position.z*.21+time*.7); transformed += normal*(wave*2.8);",
            );
    };
    const sphere = new T.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.set(22, 16, 0);
    const direct = new T.DirectionalLight(0xffffff, 1.8);
    direct.position.set(100, 100, 200);
    scene.add(direct);
    const ambient = new T.AmbientLight(0xffffff, 2.7);
    scene.add(ambient);
    function theme() {
        ambient.intensity = document.documentElement.classList.contains("dark")
            ? 0.4
            : 2.7;
    }
    const observer = new MutationObserver(theme);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
    });
    theme();
    function resize() {
        renderer.setSize(innerWidth, innerHeight * 1.3);
        camera.aspect = innerWidth / (innerHeight * 1.3);
        camera.updateProjectionMatrix();
        sphere.position.x = innerWidth < 768 ? 14 : 22;
    }
    resize();
    addEventListener("resize", resize);
    let x = 0,
        y = 0,
        frame = 0,
        last = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function mouse(e: MouseEvent) {
        x = e.clientY / innerHeight / 2;
        y = e.clientX / innerWidth / 2;
    }
    if (!reduced) addEventListener("mousemove", mouse);
    function draw(now: number) {
        frame = requestAnimationFrame(draw);
        if (document.hidden || now - last < 33) return;
        last = now;
        if (!reduced) {
            time.value = now * 0.0002;
            sphere.rotation.z += 0.001;
            sphere.rotation.x += (x - sphere.rotation.x) * 0.035;
            sphere.rotation.y += (y - sphere.rotation.y) * 0.035;
        }
        renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(draw);
    stop = () => {
        cancelAnimationFrame(frame);
        removeEventListener("resize", resize);
        removeEventListener("mousemove", mouse);
        observer.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
});
onBeforeUnmount(() => stop());
</script>
<template>
    <canvas
        ref="host"
        class="absolute inset-0 w-full opacity-25 pointer-events-none"
        aria-hidden="true"
    />
</template>
