import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { gsap } from "gsap";
import { createStudioObject, type StudioObjectKind } from "./studioObjects";

export function startStudioScene(
    host: HTMLElement,
    kind: StudioObjectKind,
    onFailure: () => void,
) {
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !matchMedia("(max-width: 767px)").matches,
        powerPreference: "low-power",
    });
    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            matchMedia("(max-width: 767px)").matches ? 1 : 1.5,
        ),
    );
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentTarget = pmrem.fromScene(environment, 0.04, 0.1, 100);
    scene.environment = environmentTarget.texture;
    scene.environmentIntensity = 0.85;
    environment.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x71813b, 2));
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(-3, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe4c1, 2);
    rim.position.set(5, 2, -3);
    scene.add(rim);

    const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 40);
    camera.position.set(3.3, 2.5, 8);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.minPolarAngle = controls.maxPolarAngle = controls.getPolarAngle();
    controls.rotateSpeed = 0.55;
    renderer.domElement.style.touchAction = "pan-y";

    const display = new THREE.Group();
    scene.add(display);
    let object = createStudioObject(kind);
    display.add(object.root);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let paused = false;
    let visible = false;
    let alive = true;
    let frame = 0;
    let last = 0;
    let time = 0;
    let entrance: gsap.core.Tween | undefined;
    const pose = { reveal: 1 };

    function schedule() {
        if (alive && visible && !document.hidden && !frame)
            frame = requestAnimationFrame(draw);
    }
    function draw(now: number) {
        frame = 0;
        if (!alive || !visible || document.hidden) return;
        const moving = !paused && !reduced.matches;
        if (now - last >= 1000 / 30 || !moving) {
            const delta = Math.min((now - last) / 1000, 0.05);
            last = now;
            if (moving) time += delta;
            object.animate(time);
            display.position.y =
                (moving ? Math.sin(time * 0.7) * 0.065 : 0) -
                (1 - pose.reveal) * 0.35;
            display.rotation.y = (1 - pose.reveal) * -0.3;
            display.scale.setScalar(0.92 + pose.reveal * 0.08);
            renderer.render(scene, camera);
        }
        if (moving) schedule();
    }
    function resize() {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        const aspect = width / height;
        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                matchMedia("(max-width: 767px)").matches ? 1 : 1.5,
                Math.sqrt(1_200_000 / (width * height)),
            ),
        );
        const halfHeight = Math.max(2.65, 2.8 / aspect);
        camera.left = -halfHeight * aspect;
        camera.right = halfHeight * aspect;
        camera.top = halfHeight;
        camera.bottom = -halfHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        schedule();
    }
    function updatePlayback() {
        if (document.hidden || !visible || paused || reduced.matches) {
            entrance?.pause();
            cancelAnimationFrame(frame);
            frame = 0;
        } else entrance?.resume();
        if (reduced.matches || paused) {
            entrance?.kill();
            pose.reveal = 1;
        }
        last = performance.now();
        schedule();
    }
    function contextLost(event: Event) {
        event.preventDefault();
        dispose();
        onFailure();
    }
    const sizes = new ResizeObserver(resize);
    sizes.observe(host);
    const visibility = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        updatePlayback();
    });
    visibility.observe(host);
    controls.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", updatePlayback);
    reduced.addEventListener("change", updatePlayback);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    resize();
    renderer.render(scene, camera);

    function dispose() {
        if (!alive) return;
        alive = false;
        entrance?.kill();
        cancelAnimationFrame(frame);
        sizes.disconnect();
        visibility.disconnect();
        document.removeEventListener("visibilitychange", updatePlayback);
        reduced.removeEventListener("change", updatePlayback);
        controls.removeEventListener("change", schedule);
        renderer.domElement.removeEventListener(
            "webglcontextlost",
            contextLost,
        );
        controls.dispose();
        object.dispose();
        environmentTarget.dispose();
        renderer.dispose();
        renderer.domElement.remove();
    }
    return {
        select(next: StudioObjectKind) {
            if (!alive) return;
            entrance?.kill();
            display.remove(object.root);
            object.dispose();
            object = createStudioObject(next);
            display.add(object.root);
            time = 0;
            controls.reset();
            pose.reveal = reduced.matches || paused ? 1 : 0;
            if (!reduced.matches && !paused)
                entrance = gsap.to(pose, {
                    reveal: 1,
                    duration: 0.65,
                    ease: "power3.out",
                    onUpdate: schedule,
                });
            schedule();
        },
        setPaused(value: boolean) {
            paused = value;
            updatePlayback();
        },
        dispose,
    };
}
