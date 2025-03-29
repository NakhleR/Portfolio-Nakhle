import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { Vector3 } from 'three';


interface BirdFlockingProps {
  width?: number;
  height?: number;
  birdCount?: number;
  duration?: number;
  pathType?: 'circle' | 'figure8' | 'spiral' | 'zigzag';
}

const BirdsTransition: React.FC<BirdFlockingProps> = ({
  width = 32,
  height = 32,
  birdCount = 1024,
  duration = 4500,
  pathType = 'figure8'
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

    // Create path points based on selected path type
    const createPathPoints = (type: string, count = 8) => {
      const points: THREE.Vector3[] = [];

      switch (type) {
        case 'circle':
          // Create circular path
          {
            const radius = 400;
            for (let i = 0; i < count; i++) {
              const angle = (i / count) * Math.PI * 2;
              points.push(new Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius / 2, // Flatten the circle a bit
                0
              ));
            }
            break;
          }

        case 'figure8':
          // Create figure-8 path
          for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            points.push(new Vector3(
              Math.sin(t) * 400,
              Math.sin(2 * t) * 200,
              0
            ));
          }
          break;

        case 'spiral':
          // Create spiral path
          for (let i = 0; i < count; i++) {
            const angle = (i / (count - 1)) * Math.PI * 6; // 3 full rotations
            const radius = 100 + (i / (count - 1)) * 400; // Increasing radius
            points.push(new Vector3(
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              (i / (count - 1)) * 200 - 100 // Rise up
            ));
          }
          break;

        case 'zigzag':
          // Create zigzag path
          {
            const width = 600;
            const height = 300;
            const depth = 200;

            for (let i = 0; i < count; i++) {
              points.push(new Vector3(
                ((i % 2) * 2 - 1) * width / 2,
                ((Math.floor(i / 2) / (Math.floor(count / 2) - 1)) * 2 - 1) * height / 2,
                ((i / count) * 2 - 1) * depth / 2
              ));
            }
            break;
          }

        default:
          // Default to circle
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            points.push(new Vector3(
              Math.cos(angle) * 400,
              Math.sin(angle) * 200,
              0
            ));
          }
      }

      return points;
    };

    // Create the path points
    const pathPoints = createPathPoints(pathType, 8);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 100, 1000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 250;

    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Optional: Visualize the path with a line
    // const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    // const pathMaterial = new THREE.LineBasicMaterial({ color: 0x0088ff, transparent: true, opacity: 0.5 });
    // const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    // // scene.add(pathLine);

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

    // First, add precision qualifiers to your shaders
    const fragmentShaderPosition = `
precision highp float;
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

    // Simplify the velocity shader to troubleshoot
    const fragmentShaderVelocity = `
precision highp float;
uniform float time;
uniform float delta;
uniform float separationDistance;
uniform float alignmentDistance;
uniform float cohesionDistance;
uniform vec3 predator;

// Simplify path handling - use just one target point instead of an array
uniform vec3 targetPoint;
uniform float pathForce;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;
const float UPPER_BOUNDS = 1000.1;

void main() {
  float zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
  float separationThresh = separationDistance / zoneRadius;
  float alignmentThresh = (separationDistance + alignmentDistance) / zoneRadius;
  float zoneRadiusSquared = zoneRadius * zoneRadius;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 selfPosition = texture2D(texturePosition, uv).xyz;
  vec3 selfVelocity = texture2D(textureVelocity, uv).xyz;
  vec3 velocity = selfVelocity;
  float limit = 9.0;
  
  // Simplified path following using single target point
  vec3 pathDirection = normalize(targetPoint - selfPosition);
  velocity += pathDirection * delta * pathForce;
  
  // Basic boundary avoidance
  if(abs(selfPosition.x) > 400.0) {
    velocity.x -= sign(selfPosition.x) * delta * 5.0;
  }
  
  if(abs(selfPosition.y) > 400.0) {
    velocity.y -= sign(selfPosition.y) * delta * 5.0;
  }
  
  if(abs(selfPosition.z) > 400.0) {
    velocity.z -= sign(selfPosition.z) * delta * 5.0;
  }

  // Simple flocking behavior
  for (float y = 0.0; y < resolution.y; y++) {
    for (float x = 0.0; x < resolution.x; x++) {
      vec2 ref = vec2(x + 0.5, y + 0.5) / resolution.xy;
      vec3 pos = texture2D(texturePosition, ref).xyz;
      vec3 vel = texture2D(textureVelocity, ref).xyz;

      vec3 diff = pos - selfPosition;
      float d = length(diff);
      if (d < 0.0001 || d * d > zoneRadiusSquared) continue;

      float percent = d * d / zoneRadiusSquared;
      if (percent < separationThresh) {
        // Separation - avoid others
        float f = (separationThresh / percent - 1.0) * delta;
        velocity -= normalize(diff) * f;
      } else if (percent < alignmentThresh) {
        // Alignment - follow same direction
        float f = (0.5 - cos((percent - separationThresh) / (alignmentThresh - separationThresh) * PI_2) * 0.5 + 0.5) * delta;
        velocity += normalize(vel) * f;
      } else {
        // Cohesion - stay close
        float f = (0.5 - cos((percent - alignmentThresh) / (1.0 - alignmentThresh) * PI_2) * -0.5 + 0.5) * delta;
        velocity += normalize(diff) * f;
      }
    }
  }

  // Limit velocity
  if (length(velocity) > limit) {
    velocity = normalize(velocity) * limit;
  }

  gl_FragColor = vec4(velocity, 1.0);
}
`;

    // Add precision qualifier to vertex shader too
    const vertexShader = `
precision highp float;
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
    velocityVariable.material.uniforms['pathPoints'] = { value: pathPoints };
    velocityVariable.material.uniforms['pathPointCount'] = { value: pathPoints.length };
    velocityVariable.material.uniforms['pathForce'] = { value: 100.0 }; // Adjust this to control path following strength

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
    let pathAnimationTime = 0;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      let delta = (now - last) / 1000;
      if (delta > 1) delta = 1;
      last = now;

      // Optional: Animate the path itself
      // pathAnimationTime += delta * 0.2;
      // if (pathType === 'circle' || pathType === 'figure8') {
      //   // Rotate the path visualization
      //   pathLine.rotation.z = pathAnimationTime % (Math.PI * 2);
      // } else if (pathType === 'spiral') {
      //   // Pulse the spiral
      //   pathLine.scale.set(
      //     1.0 + Math.sin(pathAnimationTime) * 0.1,
      //     1.0 + Math.sin(pathAnimationTime) * 0.1,
      //     1.0 + Math.sin(pathAnimationTime) * 0.1
      //   );
      // }

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
