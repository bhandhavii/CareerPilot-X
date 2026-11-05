import React, { useRef } from 'react';
import * as THREE from 'three';
import { Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const Orbit: React.FC<{ radius: number; rotation: [number, number, number]; color: string; speed: number }> = ({ radius, rotation, color, speed }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return (
    <group ref={ref} rotation={rotation}>
      <mesh>
        <torusGeometry args={[radius, 0.012, 10, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.72} />
      </mesh>
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
};

const DataPanel: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; title: string; value: string; accent: string }> = ({ position, rotation = [0, 0, 0], title, value, accent }) => (
  <group position={position} rotation={rotation}>
    <mesh>
      <boxGeometry args={[1.02, 0.55, 0.035]} />
      <meshPhysicalMaterial color="#101722" metalness={0.55} roughness={0.22} clearcoat={0.8} transparent opacity={0.94} />
    </mesh>
    <mesh position={[-0.43, 0.18, 0.022]}>
      <planeGeometry args={[0.035, 0.16]} />
      <meshBasicMaterial color={accent} />
    </mesh>
    <Text position={[-0.32, 0.13, 0.03]} fontSize={0.075} color="#a8b0bc" anchorX="left" anchorY="middle">{title}</Text>
    <Text position={[-0.32, -0.08, 0.03]} fontSize={0.15} color="#f5f7fa" anchorX="left" anchorY="middle" fontWeight={700}>{value}</Text>
    <mesh position={[0.27, -0.17, 0.025]}>
      <boxGeometry args={[0.34, 0.018, 0.008]} />
      <meshBasicMaterial color="#273244" />
    </mesh>
    <mesh position={[0.12, -0.17, 0.032]}>
      <boxGeometry args={[0.2, 0.018, 0.01]} />
      <meshBasicMaterial color={accent} />
    </mesh>
  </group>
);

export const CareerArtifact: React.FC = () => {
  const core = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (core.current) {
      core.current.rotation.y = t * 0.18;
      core.current.rotation.x = Math.sin(t * 0.28) * 0.08;
      core.current.position.y = 1.12 + Math.sin(t * 0.8) * 0.09;
    }
    if (halo.current) halo.current.rotation.z = t * 0.12;
  });

  return (
    <group position={[2.25, 0.1, 0.05]}>
      {/* Sculptural orbital career intelligence centerpiece */}
      <Float speed={1.15} rotationIntensity={0.08} floatIntensity={0.18}>
        <group ref={core} position={[0, 1.12, 0]}>
          <mesh>
            <icosahedronGeometry args={[0.72, 2]} />
            <meshPhysicalMaterial color="#245bff" metalness={0.68} roughness={0.13} transmission={0.22} thickness={1.1} clearcoat={1} emissive="#1239b9" emissiveIntensity={0.42} />
          </mesh>
          <mesh scale={0.72}>
            <icosahedronGeometry args={[0.72, 1]} />
            <meshBasicMaterial color="#b7ff32" wireframe transparent opacity={0.38} />
          </mesh>
          <mesh ref={halo} rotation={[0.7, 0.35, 0]}>
            <torusGeometry args={[0.96, 0.012, 10, 160]} />
            <meshBasicMaterial color="#b7ff32" transparent opacity={0.8} />
          </mesh>
          <Orbit radius={1.2} rotation={[1.08, 0.3, 0.35]} color="#4d83ff" speed={0.28} />
          <Orbit radius={1.42} rotation={[0.35, 1.1, 0.1]} color="#b7ff32" speed={-0.18} />
          <pointLight color="#245bff" intensity={2.8} distance={5} />
          <pointLight position={[0.5, 0.3, 0.4]} color="#b7ff32" intensity={1.2} distance={3} />
        </group>
      </Float>

      {/* Floating career intelligence cards */}
      <Float speed={1.4} rotationIntensity={0.04} floatIntensity={0.14}>
        <DataPanel position={[-1.55, 1.8, 0.05]} rotation={[0.04, 0.22, 0]} title="SKILL DISCOVERY" value="Start with assessment" accent="#b7ff32" />
      </Float>
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.18}>
        <DataPanel position={[1.05, 2.0, -0.15]} rotation={[0.02, -0.28, 0]} title="ROADMAP" value="Built around you" accent="#4d83ff" />
      </Float>
      <Float speed={1.1} rotationIntensity={0.04} floatIntensity={0.12}>
        <DataPanel position={[1.35, 0.1, 0.35]} rotation={[0, -0.18, 0]} title="INTERVIEW" value="Ready to practice" accent="#b7ff32" />
      </Float>

      {/* Holographic base and concentric energy rings */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.65, 96]} />
        <meshBasicMaterial color="#245bff" transparent opacity={0.08} />
      </mesh>
      {[1.15, 1.42, 1.68].map((r, i) => (
        <mesh key={r} position={[0, 0.08 + i * 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.008, 96]} />
          <meshBasicMaterial color={i === 1 ? '#b7ff32' : '#245bff'} transparent opacity={0.42 - i * 0.08} />
        </mesh>
      ))}
      <pointLight position={[0, 0.25, 0]} color="#245bff" intensity={1.4} distance={4} />
    </group>
  );
};
