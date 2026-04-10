/* eslint-disable react/no-unknown-property */
import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

const DualColumnGrid = () => {
  const gridSize = 1500;
  const divisions = 200;
  const gridColor = new THREE.Color('#00ffc4'); // Verde vStreet

  return (
    <group position={[0, -80, 0]}>
      {/* Columna Izquierda - Abre hacia la cámara */}
      <group rotation={[0, Math.PI * 0.75, 0]}>
        <gridHelper
          args={[gridSize, divisions, gridColor, gridColor]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[gridSize / 2, gridSize / 2, 0]}
        />
      </group>

      {/* Columna Derecha - Abre hacia la cámara */}
      <group rotation={[0, Math.PI * 0.25, 0]}>
        <gridHelper
          args={[gridSize, divisions, gridColor, gridColor]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[gridSize / 2, gridSize / 2, 0]}
        />
      </group>

      {/* Línea central de intersección resaltada */}
      <mesh position={[0, gridSize / 2, 0]}>
        <boxGeometry args={[0.08, gridSize, 0.08]} />
        <meshBasicMaterial color="#00ffc4" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

const PerspectiveGrid = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        zIndex: 0
      }}
    >
      <Canvas
        camera={{
          position: [0, 5, 70], // Más cerca para acentuar el ángulo de las líneas
          fov: 85, // FOV mayor para una perspectiva más "V" y dramática
          near: 0.1,
          far: 2000,
        }}
      >
        <fog attach="fog" args={['#000000', 30, 300]} />

        <DualColumnGrid />
      </Canvas>
    </div>
  );
};

export { PerspectiveGrid };
