import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { PerspectiveCamera } from '@react-three/drei';

const COLOR_PRIMARY = "#00ffc4";
const COLOR_SECONDARY = "#4fff4b";
const BG_COLOR = "#121215";

// Detailed CPU Shader for the Single Core
const coreVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const coreFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorBase;
  uniform vec3 uColorEmissive;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // 1. Brushed Metal Texture
    float grain = random(vUv * 150.0 + uTime * 0.01) * 0.04;
    
    // 2. High-Detail Core Layout
    // Perimeter pins
    float border = 0.06;
    float pins = step(1.0 - border, vUv.x) + step(vUv.x, border) + 
                 step(1.0 - border, vUv.y) + step(vUv.y, border);
    
    // Internal circuitry
    vec2 grid = fract(vUv * 20.0);
    float circuits = step(0.95, grid.x) + step(0.95, grid.y);
    
    // Central "Die" (Processor heart)
    float dieSize = 0.4;
    float dieMask = step(0.5 - dieSize/2.0, vUv.x) * step(vUv.x, 0.5 + dieSize/2.0) *
                    step(0.5 - dieSize/2.0, vUv.y) * step(vUv.y, 0.5 + dieSize/2.0);
    
    // Pulse animation
    float pulse = 0.8 + 0.2 * sin(uTime * 2.0);

    float edgeMask = clamp(pins + circuits * 0.3 + dieMask, 0.0, 1.0);
    
    vec3 metal = uColorBase + (pow(1.0 - dot(normal, viewDir), 4.0) * 0.2) + grain;
    vec3 finalColor = mix(metal, uColorEmissive * pulse, edgeMask);
    
    gl_FragColor = vec4(finalColor + uColorEmissive * edgeMask * pulse * 2.5, 1.0);
  }
`;

const cableVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const cableFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  varying vec2 vUv;

  void main() {
    float flow = fract(vUv.z * 1.5 - uTime * 0.6);
    float flowPattern = step(0.9, flow);
    
    // Brand Gradient along the cable depth
    vec3 baseColor = mix(uColorPrimary, uColorSecondary, vUv.z);
    
    float alpha = 0.05 + flowPattern * 0.4;
    gl_FragColor = vec4(mix(baseColor * 0.1, baseColor, flowPattern), alpha);
  }
`;

const CoreCPU = () => {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state: any) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.3;
            meshRef.current.rotation.x = Math.cos(time * 0.2) * 0.2;
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        }
    });

    return (
        <mesh ref={meshRef} position={[15, 0, 0]} scale={[8, 8, 8]}>
            <boxGeometry args={[1, 1, 1]} />
            <shaderMaterial
                vertexShader={coreVertexShader}
                fragmentShader={coreFragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uColorBase: { value: new THREE.Color("#050505") },
                    uColorEmissive: { value: new THREE.Color(COLOR_PRIMARY) }
                }}
            />
        </mesh>
    );
};

const CoreCables = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const CABLE_COUNT = 40;

    const data = useMemo(() => {
        return Array.from({ length: CABLE_COUNT }, (_, i) => {
            const angle = (i / CABLE_COUNT) * Math.PI * 2;
            const length = 40 + Math.random() * 40;
            return { angle, length, speed: 0.1 + Math.random() * 0.2 };
        });
    }, []);

    React.useLayoutEffect(() => {
        const dummy = new THREE.Object3D();
        data.forEach((d, i) => {
            // Emerging from specific faces for a structured "bus-line" look
            const faceIndex = i % 4; // Top, Bottom, Back, Front
            const spreadY = (Math.random() - 0.5) * 6;
            const spreadZ = (Math.random() - 0.5) * 6;

            dummy.position.set(15, spreadY, spreadZ);

            let rotX = 0;
            let rotY = d.angle;

            if (faceIndex === 0) rotX = Math.PI * 0.5; // Upward cables
            if (faceIndex === 1) rotX = -Math.PI * 0.5; // Downward cables

            dummy.rotation.set(rotX, rotY, 0);
            dummy.scale.set(0.06, 0.06, d.length);
            dummy.translateZ(d.length / 2 + 4.5);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [data]);

    useFrame((state: any) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[null as any, null as any, CABLE_COUNT]}>
            <boxGeometry args={[1, 1, 1]} />
            <shaderMaterial
                vertexShader={cableVertexShader}
                fragmentShader={cableFragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uColorPrimary: { value: new THREE.Color(COLOR_PRIMARY) },
                    uColorSecondary: { value: new THREE.Color(COLOR_SECONDARY) }
                }}
                transparent={true}
                depthWrite={false}
            />
        </instancedMesh>
    );
};

const GridBackground = () => {
    return (
        <mesh position={[0, 0, -30]}>
            <planeGeometry args={[300, 300]} />
            <shaderMaterial
                vertexShader={`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
                fragmentShader={`
                    uniform vec3 uColor;
                    varying vec2 vUv;
                    void main() {
                        vec2 grid = fract(vUv * 80.0);
                        float line = step(0.98, grid.x) + step(0.98, grid.y);
                        float alpha = line * (1.0 - length(vUv - 0.5) * 2.0) * 0.1;
                        gl_FragColor = vec4(uColor, alpha);
                    }
                `}
                uniforms={{ uColor: { value: new THREE.Color(COLOR_PRIMARY) } }}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
};

const SceneContent = () => {
    const { mouse } = useThree();
    const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

    useFrame(() => {
        if (cameraRef.current) {
            cameraRef.current.position.x += (mouse.x * 2 - cameraRef.current.position.x) * 0.05;
            cameraRef.current.position.y += (mouse.y * 2 - cameraRef.current.position.y) * 0.05;
            cameraRef.current.lookAt(0, 0, 0);
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 0, 60]} fov={40} />
            <color attach="background" args={[BG_COLOR]} />
            <fogExp2 attach="fog" args={[BG_COLOR, 0.015]} />

            <ambientLight intensity={0.4} />
            <pointLight position={[30, 20, 20]} intensity={2.0} color={COLOR_PRIMARY} />
            <pointLight position={[-20, -10, -10]} intensity={1.0} color="#ffffff" />

            <GridBackground />
            <CoreCPU />
            <CoreCables />

            <EffectComposer>
                <Bloom luminanceThreshold={0.2} intensity={1.5} radius={0.4} />
                <Vignette offset={0.5} darkness={0.8} />
            </EffectComposer>
        </>
    );
};

export const CPUCityScene = () => (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1, pointerEvents: 'none' }}>
        <Canvas gl={{ alpha: true }}>
            <SceneContent />
        </Canvas>
    </div>
);
