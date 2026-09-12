import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
    mergeGeometries,
    toCreasedNormals,
} from "three/addons/utils/BufferGeometryUtils.js";

export type StudioObjectKind = "processor" | "mobile" | "web" | "controller";
export interface StudioObject {
    root: THREE.Group;
    animate: (time: number) => void;
    dispose: () => void;
}

/** Original, procedural hard-surface models. Dimensions are in local model units. */
export function createStudioObject(kind: StudioObjectKind): StudioObject {
    const root = new THREE.Group();
    const materials = {
        shell: new THREE.MeshStandardMaterial({
            color: 0xf4f1e5,
            roughness: 0.32,
            metalness: 0.35,
        }),
        metal: new THREE.MeshStandardMaterial({
            color: 0xb9c0b7,
            roughness: 0.25,
            metalness: 0.9,
        }),
        dark: new THREE.MeshStandardMaterial({
            color: 0x252d29,
            roughness: 0.4,
            metalness: 0.5,
        }),
        rubber: new THREE.MeshStandardMaterial({
            color: 0x111813,
            roughness: 0.8,
        }),
        green: new THREE.MeshStandardMaterial({
            color: 0xc4d650,
            roughness: 0.32,
            metalness: 0.3,
        }),
        copper: new THREE.MeshStandardMaterial({
            color: 0xc77b4e,
            roughness: 0.28,
            metalness: 0.8,
        }),
        light: new THREE.MeshStandardMaterial({
            color: 0xe4ff93,
            emissive: 0xa7ca47,
            emissiveIntensity: 0.7,
            roughness: 0.4,
        }),
    };
    type Finish = keyof typeof materials;
    const textures: THREE.Texture[] = [];
    const labelMaterials: THREE.Material[] = [];
    function box(
        parent: THREE.Group,
        size: number[],
        position: number[],
        finish: Finish,
        radius = 0.06,
    ) {
        const mesh = new THREE.Mesh(
            new RoundedBoxGeometry(
                size[0],
                size[1],
                size[2],
                2,
                Math.min(radius, ...size.map((v) => v / 2)),
            ),
            materials[finish],
        );
        mesh.position.set(position[0], position[1], position[2]);
        parent.add(mesh);
        return mesh;
    }
    function disc(
        parent: THREE.Group,
        radius: number,
        depth: number,
        position: number[],
        finish: Finish,
    ) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, depth, 32),
            materials[finish],
        );
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(position[0], position[1], position[2]);
        parent.add(mesh);
        return mesh;
    }
    function screw(parent: THREE.Group, x: number, y: number, z: number) {
        disc(parent, 0.055, 0.024, [x, y, z], "metal");
        box(parent, [0.057, 0.013, 0.009], [x, y, z + 0.017], "dark", 0.003);
    }
    function label(
        parent: THREE.Group,
        text: string,
        x: number,
        y: number,
        z: number,
        width: number,
        color = "#e4ed87",
    ) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;
        const context = canvas.getContext("2d")!;
        context.fillStyle = color;
        context.font = "500 54px monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, 256, 64);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        textures.push(texture);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
        });
        labelMaterials.push(material);
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, width / 4),
            material,
        );
        mesh.position.set(x, y, z);
        parent.add(mesh);
    }
    let animate: (time: number) => void = () => {};

    if (kind === "processor") {
        root.rotation.set(-0.2, -0.25, -0.18);
        box(root, [3.15, 3.15, 0.16], [0, 0, -0.5], "dark", 0.12);
        box(root, [2.98, 2.98, 0.055], [0, 0, -0.385], "rubber", 0.09);
        // Copper traces and terminal pads are modeled, rather than painted on a texture.
        for (let side = 0; side < 4; side++) {
            const terminals = new THREE.Group();
            terminals.rotation.z = (side * Math.PI) / 2;
            for (let i = 0; i < 9; i++) {
                const x = (i - 4) * 0.24;
                box(
                    terminals,
                    [0.08, 0.28, 0.045],
                    [x, 1.35, -0.33],
                    "copper",
                    0.012,
                );
                box(
                    terminals,
                    [0.025, 0.3, 0.015],
                    [x, 1.09, -0.35],
                    "copper",
                    0.003,
                );
            }
            root.add(terminals);
        }
        for (const x of [-1.36, 1.36])
            for (const y of [-1.36, 1.36]) screw(root, x, y, -0.31);
        const core = new THREE.Group();
        box(core, [2.12, 2.12, 0.22], [0, 0, 0], "metal", 0.1);
        box(core, [1.92, 1.92, 0.13], [0, 0, 0.17], "dark", 0.08);
        box(core, [1.35, 1.35, 0.1], [0, 0, 0.28], "green", 0.045);
        label(core, "NR / NEURAL", 0, 0.05, 0.34, 1.2, "#253025");
        label(core, "01 — COMPUTE", 0, -0.25, 0.34, 1, "#253025");
        const lid = new THREE.Group();
        box(lid, [2.5, 2.5, 0.12], [0, 0, 0], "shell", 0.14);
        box(lid, [1.88, 1.88, 0.08], [0, 0, 0.09], "dark", 0.08);
        for (let i = 0; i < 10; i++)
            box(
                lid,
                [1.58, 0.065, 0.16],
                [0, (i - 4.5) * 0.15, 0.18],
                "metal",
                0.02,
            );
        for (const x of [-1.06, 1.06])
            for (const y of [-1.06, 1.06]) screw(lid, x, y, 0.075);
        box(lid, [0.42, 0.045, 0.02], [0, -1.07, 0.08], "light", 0.01);
        root.add(core, lid);
        animate = (time) => {
            const spread = 0.5 + 0.5 * Math.sin(time * 0.8);
            core.position.set(0, 0, -0.03 + spread * 0.2);
            lid.position.set(
                -0.2 - spread * 0.25,
                0.45 + spread * 0.5,
                0.72 + spread * 0.65,
            );
        };
    } else if (kind === "mobile") {
        root.rotation.set(-0.08, -0.3, -0.14);
        box(root, [1.94, 3.65, 0.28], [0, 0, 0], "metal", 0.22);
        box(root, [1.83, 3.54, 0.16], [0, 0, 0.11], "rubber", 0.21);
        box(root, [1.66, 3.3, 0.035], [0, 0, 0.207], "dark", 0.17);
        box(root, [0.61, 0.14, 0.045], [0, 1.43, 0.24], "rubber", 0.065);
        disc(root, 0.036, 0.01, [0.21, 1.43, 0.269], "metal");
        box(root, [0.55, 0.045, 0.01], [0, -1.49, 0.235], "shell", 0.02);
        box(root, [0.07, 0.42, 0.12], [0.98, 0.64, 0], "shell", 0.03);
        for (const y of [0.75, 0.18])
            box(root, [0.07, 0.35, 0.12], [-0.98, y, 0], "metal", 0.025);
        label(root, "09:41", -0.18, 0.91, 0.235, 1.1, "#f4f1e5");
        const card = new THREE.Group();
        box(card, [1.96, 1.28, 0.12], [0, 0.04, 0], "green", 0.12);
        label(card, "MAKE IT MOVE", 0, 0.38, 0.065, 1.55, "#253025");
        for (let i = 0; i < 7; i++)
            box(
                card,
                [0.12, 0.18 + (i % 4) * 0.12, 0.035],
                [(i - 3) * 0.21, -0.1, 0.08],
                "dark",
                0.03,
            );
        root.add(card);
        for (let i = 0; i < 3; i++) {
            box(
                root,
                [0.39, 0.39, 0.05],
                [(i - 1) * 0.53, -1.03, 0.27],
                "shell",
                0.085,
            );
            disc(
                root,
                0.07,
                0.02,
                [(i - 1) * 0.53, -1.03, 0.305],
                i === 1 ? "copper" : "dark",
            );
        }
        animate = (time) =>
            card.position.set(
                0.2,
                0.03 + Math.sin(time * 1.1) * 0.12,
                0.6 + Math.sin(time * 0.8) * 0.15,
            );
    } else if (kind === "web") {
        root.rotation.set(0.02, -0.24, -0.07);
        box(root, [3.7, 2.65, 0.22], [0, 0.15, -0.2], "metal", 0.14);
        box(root, [3.52, 2.48, 0.07], [0, 0.15, -0.05], "shell", 0.1);
        box(root, [3.28, 1.95, 0.04], [0, -0.02, 0.01], "dark", 0.045);
        for (let i = 0; i < 3; i++)
            disc(
                root,
                0.047,
                0.02,
                [-1.49 + i * 0.17, 1.21, 0.005],
                i === 0 ? "copper" : "dark",
            );
        box(root, [1.58, 0.09, 0.02], [0.22, 1.21, 0.007], "metal", 0.04);
        box(root, [0.38, 0.64, 0.25], [0, -1.45, -0.24], "metal", 0.06);
        box(root, [1.5, 0.12, 0.9], [0, -1.78, -0.1], "shell", 0.055);
        const panel = new THREE.Group();
        box(panel, [1.43, 1.7, 0.14], [0, 0, 0], "green", 0.09);
        label(panel, "</>", 0, 0.23, 0.08, 1.4, "#253025");
        for (let i = 0; i < 3; i++)
            box(
                panel,
                [0.9 - i * 0.18, 0.045, 0.02],
                [-i * 0.09, -0.29 - i * 0.16, 0.08],
                "dark",
                0.015,
            );
        const module = new THREE.Group();
        box(module, [1.75, 1.16, 0.12], [0, 0, 0], "shell", 0.09);
        for (let i = 0; i < 3; i++)
            box(
                module,
                [0.31, 0.27 + i * 0.15, 0.06],
                [-0.47 + i * 0.47, -0.09 + i * 0.075, 0.09],
                i === 2 ? "copper" : "dark",
                0.035,
            );
        label(module, "BUILD / SHIP", 0, 0.37, 0.068, 1.4, "#253025");
        root.add(panel, module);
        animate = (time) => {
            panel.position.set(-0.96, 0.02 + Math.sin(time * 0.9) * 0.09, 0.48);
            module.position.set(
                0.97,
                -0.2 + Math.sin(time * 0.9 + 1.8) * 0.1,
                0.68,
            );
        };
    } else {
        root.rotation.set(-0.12, -0.15, -0.14);
        // Beveled custom silhouette gives the controller integrated, tapered grips.
        const shape = new THREE.Shape();
        shape.moveTo(-1.05, 0.94);
        shape.bezierCurveTo(-1.65, 0.94, -1.77, 0.48, -1.87, -0.2);
        shape.lineTo(-2.04, -1.04);
        shape.bezierCurveTo(-2.17, -1.65, -1.4, -1.83, -1.08, -1.24);
        shape.lineTo(-0.66, -0.6);
        shape.quadraticCurveTo(0, -0.45, 0.66, -0.6);
        shape.lineTo(1.08, -1.24);
        shape.bezierCurveTo(1.4, -1.83, 2.17, -1.65, 2.04, -1.04);
        shape.lineTo(1.87, -0.2);
        shape.bezierCurveTo(1.77, 0.48, 1.65, 0.94, 1.05, 0.94);
        shape.closePath();
        for (const [z, finish] of [
            [-0.2, "dark"],
            [0.04, "shell"],
        ] as const) {
            const geometry = new THREE.ExtrudeGeometry(shape, {
                depth: 0.18,
                bevelEnabled: true,
                bevelSegments: 3,
                steps: 1,
                bevelSize: 0.13,
                bevelThickness: 0.1,
                curveSegments: 16,
            });
            const mesh = new THREE.Mesh(
                toCreasedNormals(geometry, Math.PI / 3),
                materials[finish],
            );
            mesh.position.z = z;
            root.add(mesh);
        }
        box(root, [1.13, 0.63, 0.09], [0, 0.41, 0.37], "dark", 0.1);
        box(root, [0.76, 0.035, 0.02], [0, 0.77, 0.37], "light", 0.01);
        label(root, "PLAY", 0, 0.43, 0.423, 0.78);
        for (const x of [-1.14, 1.14])
            box(root, [0.84, 0.16, 0.4], [x, 1.04, -0.03], "dark", 0.07);
        disc(root, 0.43, 0.06, [-1.18, 0.3, 0.37], "rubber");
        box(root, [0.59, 0.19, 0.13], [-1.18, 0.3, 0.45], "dark", 0.025);
        box(root, [0.19, 0.59, 0.13], [-1.18, 0.3, 0.46], "dark", 0.025);
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2;
            disc(
                root,
                0.155,
                0.15,
                [1.18 + Math.cos(a) * 0.3, 0.3 + Math.sin(a) * 0.3, 0.43],
                i === 1 ? "copper" : "dark",
            );
            disc(
                root,
                0.043,
                0.013,
                [1.18 + Math.cos(a) * 0.3, 0.3 + Math.sin(a) * 0.3, 0.511],
                "green",
            );
        }
        const sticks: THREE.Group[] = [];
        for (const x of [-0.61, 0.61]) {
            disc(root, 0.38, 0.065, [x, -0.49, 0.36], "metal");
            const stick = new THREE.Group();
            disc(stick, 0.17, 0.22, [0, 0, 0.05], "dark");
            disc(stick, 0.29, 0.1, [0, 0, 0.19], "rubber");
            disc(stick, 0.22, 0.015, [0, 0, 0.25], "dark");
            stick.position.set(x, -0.49, 0.42);
            root.add(stick);
            sticks.push(stick);
        }
        animate = (time) =>
            sticks.forEach((stick, i) => {
                stick.rotation.x = Math.sin(time * 1.25 + i * 2) * 0.2;
                stick.rotation.y = Math.cos(time * 1.25 + i * 2) * 0.2;
            });
    }

    // Batch stationary parts by material within each articulated group.
    function batch(group: THREE.Group) {
        const buckets = new Map<THREE.Material, THREE.Mesh[]>();
        for (const child of [...group.children]) {
            if (child instanceof THREE.Group) batch(child);
            else if (
                child instanceof THREE.Mesh &&
                !Array.isArray(child.material) &&
                !child.material.transparent
            ) {
                const meshes = buckets.get(child.material) ?? [];
                meshes.push(child);
                buckets.set(child.material, meshes);
            }
        }
        for (const [material, meshes] of buckets) {
            if (meshes.length < 2) continue;
            const geometries = meshes.map((mesh) => {
                mesh.updateMatrix();
                const geometry = mesh.geometry.index
                    ? mesh.geometry.toNonIndexed()
                    : mesh.geometry.clone();
                geometry.applyMatrix4(mesh.matrix);
                return geometry;
            });
            const merged = mergeGeometries(geometries);
            geometries.forEach((geometry) => geometry.dispose());
            if (!merged) continue;
            meshes.forEach((mesh) => {
                group.remove(mesh);
                mesh.geometry.dispose();
            });
            group.add(new THREE.Mesh(merged, material));
        }
    }
    batch(root);
    animate(0);
    return {
        root,
        animate,
        dispose() {
            root.traverse((child) => {
                if (child instanceof THREE.Mesh) child.geometry.dispose();
            });
            Object.values(materials).forEach((material) => material.dispose());
            labelMaterials.forEach((material) => material.dispose());
            textures.forEach((texture) => texture.dispose());
        },
    };
}
