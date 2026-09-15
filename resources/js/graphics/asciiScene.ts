import * as THREE from "three";

// Match the original luminance-to-character mapping without CPU pixel readback
// or rebuilding an HTML table on every animation frame.
export function createAsciiScene(
    renderer: THREE.WebGLRenderer,
    host: HTMLElement,
) {
    const characters = " .:-+*=%@#";
    const atlas = document.createElement("canvas");
    atlas.width = characters.length * 20;
    atlas.height = 40;
    const context = atlas.getContext("2d")!;
    context.fillStyle = "white";
    context.font = '40px "Courier New", monospace';
    context.textBaseline = "top";
    for (let index = 0; index < characters.length; index++) {
        context.save();
        context.beginPath();
        context.rect(index * 20, 0, 20, 40);
        context.clip();
        context.fillText(characters[index], index * 20, 0);
        context.restore();
    }
    const glyphs = new THREE.CanvasTexture(atlas);
    glyphs.generateMipmaps = false;
    glyphs.minFilter = THREE.LinearFilter;
    const target = new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: true,
    });
    const uniforms = {
        sceneTexture: { value: target.texture },
        glyphTexture: { value: glyphs },
        grid: { value: new THREE.Vector2(1, 1) },
        ink: { value: new THREE.Color() },
    };
    const material = new THREE.ShaderMaterial({
        uniforms,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        vertexShader: `varying vec2 vUv;
            void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: `
            uniform sampler2D sceneTexture;
            uniform sampler2D glyphTexture;
            uniform vec2 grid;
            uniform vec3 ink;
            varying vec2 vUv;
            void main() {
                vec2 cell = floor(vUv * grid);
                vec4 sampleColor = texture2D(sceneTexture, (cell + 0.5) / grid);
                sampleColor.rgb = mix(sampleColor.rgb * 12.92, 1.055 * pow(sampleColor.rgb, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), sampleColor.rgb));
                float brightness = dot(sampleColor.rgb, vec3(0.3, 0.59, 0.11));
                float character = floor((1.0 - brightness) * 9.0 + 0.5);
                vec2 glyphUv = vec2((character + fract(vUv.x * grid.x)) / 10.0, fract(vUv.y * grid.y));
                float alpha = sampleColor.a > 0.0 ? texture2D(glyphTexture, glyphUv).a : 0.0;
                gl_FragColor = vec4(ink, alpha);
                #include <colorspace_fragment>
            }`,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const screen = new THREE.Scene();
    screen.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.Camera();
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    return {
        domElement: canvas,
        setSize(width: number, height: number) {
            // Share a screen-space character size across both model canvases.
            // Applying the column cap per host made the full-width helix coarser.
            const cellWidth = Math.max(
                1 / 0.22,
                document.documentElement.clientWidth / 420,
            );
            const columns = Math.max(1, Math.round(width / cellWidth));
            const rows = Math.max(
                1,
                Math.round((columns * height) / width / 2),
            );
            uniforms.grid.value.set(columns, rows);
            target.setSize(columns, rows);
            const scale = Math.min(
                1,
                2560 / width,
                Math.sqrt(2_000_000 / (width * height)),
            );
            renderer.setSize(
                Math.round(width * scale),
                Math.round(height * scale),
                false,
            );
        },
        updateColor() {
            uniforms.ink.value.setStyle(getComputedStyle(host).color);
        },
        render(scene: THREE.Scene, view: THREE.Camera) {
            renderer.setRenderTarget(target);
            renderer.render(scene, view);
            renderer.setRenderTarget(null);
            renderer.render(screen, camera);
        },
        dispose() {
            target.dispose();
            glyphs.dispose();
            material.dispose();
            geometry.dispose();
            canvas.remove();
        },
    };
}
