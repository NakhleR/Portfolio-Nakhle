import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

interface BirdFlockingProps {
  width?: number;
  height?: number;
  birdCount?: number;
  duration?: number;
}

const BirdsTransition: React.FC<BirdFlockingProps> = ({
  width = 32,
  height = 32,
  birdCount = 1024,
  duration = 4500
}) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(true);
  const prevLocation = useRef(location);
  const animationCompleteRef = useRef(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isTransitioning) {
      document.body.style.overflow = 'hidden';
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        document.body.style.overflow = '';
        animationCompleteRef.current = true;
        prevLocation.current = location;
      }, duration);
    }

    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [isTransitioning, location, duration]);

  useEffect(() => {
    if (animationCompleteRef.current && location !== prevLocation.current) {
      setIsTransitioning(true);
    }
  }, [location]);

  useEffect(() => {
    if (!isTransitioning || !mountRef.current) return;

    const BOUNDS = 800;
    const BOUNDS_HALF = BOUNDS / 2;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 100, 1000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 350;

    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    class BirdGeometry extends THREE.BufferGeometry {
      constructor() {
        super();
        const trianglesPerBird = 3;
        const triangles = birdCount * trianglesPerBird;
        const points = triangles * 3;

        const vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
        const birdColors = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
        const references = new THREE.BufferAttribute(new Float32Array(points * 2), 2);
        const birdVertex = new THREE.BufferAttribute(new Float32Array(points), 1);

        this.setAttribute('position', vertices);
        this.setAttribute('birdColor', birdColors);
        this.setAttribute('reference', references);
        this.setAttribute('birdVertex', birdVertex);

        let v = 0;
        const verts_push = (...args: number[]) => {
          args.forEach(arg => {
            vertices.array[v++] = arg;
          });
        };

        const wingsSpan = 20;

        for (let f = 0; f < birdCount; f++) {
          verts_push(0, 0, -20, 0, 4, -20, 0, 0, 30); // Body
          verts_push(0, 0, -15, -wingsSpan, 0, 0, 0, 0, 15); // Left Wing
          verts_push(0, 0, 15, wingsSpan, 0, 0, 0, 0, -15); // Right Wing
        }

        for (let i = 0; i < points; i++) {
          const birdIndex = Math.floor(i / 9);
          const x = (birdIndex % width) / width;
          const y = Math.floor(birdIndex / width) / width;

          const c = new THREE.Color(0x666666 + Math.floor(i / 9) / birdCount * 0x666666);

          birdColors.setXYZ(i, c.r, c.g, c.b);
          references.setXY(i, x, y);
          birdVertex.setX(i, i % 9);
        }

        this.scale(0.2, 0.2, 0.2);
      }
    }

    const fragmentShaderPosition = `
      uniform float time;
      uniform float delta;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 tmpPos = texture2D(texturePosition, uv);
        vec3 pos = tmpPos.xyz;
        vec3 velocity = texture2D(textureVelocity, uv).xyz;
        float phase = tmpPos.w;
        phase = mod(phase + delta + length(velocity.xz) * delta * 3. + max(velocity.y, 0.0) * delta * 6., 62.83);
        gl_FragColor = vec4(pos + velocity * delta * 15., phase);
      }
    `;

    const fragmentShaderVelocity = `
      uniform float time;
      uniform float delta;
      uniform float separationDistance;
      uniform float alignmentDistance;
      uniform float cohesionDistance;
      uniform float freedomFactor;
      uniform vec3 predator;
      const float PI = 3.141592653589793;
      const float PI_2 = PI * 2.0;
      const float UPPER_BOUNDS = 1000.1;
      float zoneRadius = 40.0;
      float separationThresh = 0.45;
      float alignmentThresh = 0.65;
      float zoneRadiusSquared = 1600.0;

      void main() {
        zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
        separationThresh = separationDistance / zoneRadius;
        alignmentThresh = (separationDistance + alignmentDistance) / zoneRadius;
        zoneRadiusSquared = zoneRadius * zoneRadius;

        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 selfPosition = texture2D(texturePosition, uv).xyz;
        vec3 selfVelocity = texture2D(textureVelocity, uv).xyz;
        vec3 velocity = selfVelocity;
        float limit = 9.0;

        vec3 dir = predator * UPPER_BOUNDS - selfPosition;
        dir.z = 0.;
        float dist = length(dir);
        if (dist < 150.0) {
          float f = (dist * dist / 22500. - 1.0) * delta * 100.0;
          velocity += normalize(dir) * f;
          limit += 5.0;
        }

        dir = selfPosition;
        dir.y *= 2.5;
        velocity -= normalize(dir) * delta * 5.0;

        for (float y = 0.0; y < resolution.y; y++) {
          for (float x = 0.0; x < resolution.x; x++) {
            vec2 ref = vec2(x + 0.5, y + 0.5) / resolution.xy;
            vec3 pos = texture2D(texturePosition, ref).xyz;
            vec3 vel = texture2D(textureVelocity, ref).xyz;

            vec3 diff = pos - selfPosition;
            float d = length(diff);
            if (d < 0.0001 || d * d > zoneRadiusSquared) continue;

            float percent = d * d / zoneRadiusSquared;
            float f;
            if (percent < separationThresh) {
              f = (separationThresh / percent - 1.0) * delta;
              velocity -= normalize(diff) * f;
            } else if (percent < alignmentThresh) {
              float adjusted = (percent - separationThresh) / (alignmentThresh - separationThresh);
              f = (0.5 - cos(adjusted * PI_2) * 0.5 + 0.5) * delta;
              velocity += normalize(vel) * f;
            } else {
              float adjusted = (percent - alignmentThresh) / (1.0 - alignmentThresh);
              f = (0.5 - cos(adjusted * PI_2) * -0.5 + 0.5) * delta;
              velocity += normalize(diff) * f;
            }
          }
        }

        if (length(velocity) > limit) {
          velocity = normalize(velocity) * limit;
        }

        gl_FragColor = vec4(velocity, 1.0);
      }
    `;

    const vertexShader = `
      attribute vec2 reference;
      attribute float birdVertex;
      attribute vec3 birdColor;

      uniform sampler2D texturePosition;
      uniform sampler2D textureVelocity;

      varying vec4 vColor;
      varying float z;
      uniform float time;

      void main() {
        vec4 tmpPos = texture2D(texturePosition, reference);
        vec3 pos = tmpPos.xyz;
        vec3 velocity = normalize(texture2D(textureVelocity, reference).xyz);

        vec3 newPosition = position;
        if (birdVertex == 4.0 || birdVertex == 7.0) {
          newPosition.y = sin(tmpPos.w) * 5.;
        }

        newPosition = mat3(modelMatrix) * newPosition;

        float xz = length(velocity.xz);
        float x = sqrt(1. - velocity.y * velocity.y);
        float cosry = velocity.x / xz;
        float sinry = velocity.z / xz;
        float cosrz = x;
        float sinrz = velocity.y;

        mat3 maty = mat3(cosry, 0, -sinry, 0, 1, 0, sinry, 0, cosry);
        mat3 matz = mat3(cosrz, sinrz, 0, -sinrz, cosrz, 0, 0, 0, 1);

        newPosition = maty * matz * newPosition;
        newPosition += pos;

        z = newPosition.z;
        vColor = vec4(birdColor, 1.0);
        gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec4 vColor;
      varying float z;
      void main() {
        float z2 = 0.2 + (1000. - z) / 1000. * vColor.x;
        gl_FragColor = vec4(z2, z2, z2, 1.);
      }
    `;

    const gpuCompute = new GPUComputationRenderer(width, height, renderer);
    const dtPosition = gpuCompute.createTexture();
    const dtVelocity = gpuCompute.createTexture();

    const fillTexture = (texture: THREE.DataTexture, scale = 1) => {
      const data = texture.image.data;
      for (let i = 0; i < data.byteLength; i += 4) {
        data[i] = (Math.random() - 0.5) * BOUNDS * scale;
        data[i + 1] = (Math.random() - 0.5) * BOUNDS * scale;
        data[i + 2] = (Math.random() - 0.5) * BOUNDS * scale;
        data[i + 3] = 1;
      }
    };

    fillTexture(dtPosition);
    fillTexture(dtVelocity, 0.1);

    const velocityVariable = gpuCompute.addVariable('textureVelocity', fragmentShaderVelocity, dtVelocity);
    const positionVariable = gpuCompute.addVariable('texturePosition', fragmentShaderPosition, dtPosition);

    gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);

    velocityVariable.material.uniforms['time'] = { value: 1.0 };
    velocityVariable.material.uniforms['delta'] = { value: 0.0 };
    velocityVariable.material.uniforms['separationDistance'] = { value: 50.0 };
    velocityVariable.material.uniforms['alignmentDistance'] = { value: 100.0 };
    velocityVariable.material.uniforms['cohesionDistance'] = { value: 800.0 };
    velocityVariable.material.uniforms['freedomFactor'] = { value: 0.1 };
    velocityVariable.material.uniforms['predator'] = { value: new THREE.Vector3() };

    positionVariable.material.uniforms['time'] = { value: 0.0 };
    positionVariable.material.uniforms['delta'] = { value: 0.0 };

    const error = gpuCompute.init();
    if (error) console.error(error);

    const uniforms = {
      color: { value: new THREE.Color(0xff2200) },
      texturePosition: { value: null },
      textureVelocity: { value: null },
      time: { value: 1.0 },
      delta: { value: 0.0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide
    });

    const birdMesh = new THREE.Mesh(new BirdGeometry(), material);
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();
    scene.add(birdMesh);

    let last = performance.now();

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      let delta = (now - last) / 1000;
      if (delta > 1) delta = 1;
      last = now;

      positionVariable.material.uniforms['time'].value = now;
      positionVariable.material.uniforms['delta'].value = delta;
      velocityVariable.material.uniforms['time'].value = now;
      velocityVariable.material.uniforms['delta'].value = delta;

      gpuCompute.compute();

      uniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
      uniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget(velocityVariable).texture;
      uniforms.time.value = now;
      uniforms.delta.value = delta;

      renderer.render(scene, camera);
    };

    animate();

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      material.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [isTransitioning, width, height, birdCount]);

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 z-50 bg-white ${isTransitioning ? 'block' : 'hidden'}`}
      style={{ pointerEvents: isTransitioning ? 'auto' : 'none' }}
    />
  );
};

export default BirdsTransition;
