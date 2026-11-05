import React, { useMemo } from 'react';
import * as THREE from 'three';

export const StudioEnvironment: React.FC = () => {
  // Stars for the distant observatory window sky
  const [starPositions, starColors] = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#4d83ff'),
      new THREE.Color('#245bff'),
      new THREE.Color('#fbbf24'),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 120 + 15;
      positions[i3 + 1] = Math.random() * 50 + 1;
      positions[i3 + 2] = -Math.random() * 70 - 10;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    return [positions, colors];
  }, []);

  return (
    <group>
      {/* 1. ATMOSPHERIC LIGHTING (Rich cinematic developer studio lighting) */}
      <ambientLight intensity={0.65} color="#101722" />

      {/* Main Studio Key Light */}
      <directionalLight
        position={[6, 10, 8]}
        intensity={1.8}
        color="#e0f2fe"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Warm Sunset Twilight Rim Light from Observatory Window */}
      <directionalLight
        position={[22, 9, -20]}
        intensity={2.8}
        color="#fb923c"
      />

      {/* Cyber Violet Fill Light */}
      <directionalLight
        position={[-12, 6, -10]}
        intensity={1.1}
        color="#4d83ff"
      />

      {/* Cyan Workstation Ambient Glow */}
      <pointLight position={[2.2, 2.2, 0.5]} color="#245bff" intensity={1.8} distance={6} />
      {/* Subtle Violet Backlight for Studio Depth */}
      <pointLight position={[-2, 1.8, -4]} color="#245bff" intensity={1.2} distance={8} />

      {/* 2. CONTINUOUS ARCHITECTURAL STUDIO FLOOR */}
      <mesh position={[0, -0.02, -25]} receiveShadow>
        <planeGeometry args={[32, 80]} />
        <meshStandardMaterial
          color="#070b19"
          roughness={0.22}
          metalness={0.6}
        />
      </mesh>

      {/* Architectural Floor Grid Accent Lines */}
      <gridHelper
        args={[80, 40, '#245bff', '#1e293b']}
        position={[0, 0.001, -25]}
        rotation={[0, 0, 0]}
      />

      {/* Floor Guidance LED Conduits (Smooth, refined linear embedded lighting) */}
      <mesh position={[4.6, 0.005, -25]}>
        <planeGeometry args={[0.08, 80]} />
        <meshBasicMaterial color="#245bff" transparent opacity={0.65} />
      </mesh>
      <mesh position={[-4.6, 0.005, -25]}>
        <planeGeometry args={[0.08, 80]} />
        <meshBasicMaterial color="#4d83ff" transparent opacity={0.45} />
      </mesh>

      {/* 3. REAR ARCHITECTURAL STUDIO WALL & WINDOW OVERVIEW */}
      <group position={[0, 0, -60]}>
        {/* Rear Wall */}
        <mesh position={[0, 7, 0]}>
          <planeGeometry args={[32, 16]} />
          <meshStandardMaterial color="#0b1126" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Large Central Launch Portal */}
        <mesh position={[0, 6, 0.05]}>
          <planeGeometry args={[16, 9]} />
          <meshBasicMaterial color="#060a1c" />
        </mesh>
        {/* Portal Neon Frame */}
        <mesh position={[0, 10.55, 0.08]}>
          <boxGeometry args={[16.2, 0.12, 0.08]} />
          <meshBasicMaterial color="#245bff" />
        </mesh>
      </group>

      {/* 4. OBSERVATORY WINDOW WALL (RIGHT SIDE) */}
      <group position={[15, 0, -25]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Observatory Columns */}
        {[-24, -16, -8, 0, 8, 16, 24].map((z, idx) => (
          <group key={idx} position={[z, 0, 0]}>
            <mesh position={[0, 5, 0]} castShadow>
              <boxGeometry args={[0.6, 10, 0.6]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Column Accent Light */}
            <mesh position={[0, 5, 0.31]}>
              <boxGeometry args={[0.08, 9.2, 0.02]} />
              <meshBasicMaterial color="#4d83ff" transparent opacity={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. DISTANT CYBER METROPOLIS & HORIZON (Visible through observatory glass) */}
      <group position={[38, 0, -35]}>
        {[
          { x: 0, z: -10, h: 24, w: 4, col: '#0d1527' },
          { x: 7, z: -4, h: 30, w: 3.5, col: '#111c38' },
          { x: -5, z: 2, h: 20, w: 3, col: '#0f172a' },
          { x: 12, z: -16, h: 34, w: 4.5, col: '#0b1329' },
          { x: -10, z: -8, h: 26, w: 3.8, col: '#0d1730' },
        ].map((b, idx) => (
          <group key={idx} position={[b.x, b.h / 2, b.z]}>
            <mesh>
              <boxGeometry args={[b.w, b.h, b.w]} />
              <meshStandardMaterial color={b.col} roughness={0.7} metalness={0.5} />
            </mesh>
            {/* Spire tip light */}
            <mesh position={[0, b.h / 2 + 0.5, 0]}>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshBasicMaterial color="#245bff" />
            </mesh>
          </group>
        ))}

        {/* Distant Twilight Clouds matching reference image sunset colors */}
        <mesh position={[10, 16, -20]}>
          <sphereGeometry args={[40, 16, 16]} />
          <meshBasicMaterial color="#fb7185" transparent opacity={0.09} side={THREE.BackSide} />
        </mesh>
        <mesh position={[-10, 22, -15]}>
          <sphereGeometry args={[50, 16, 16]} />
          <meshBasicMaterial color="#4d83ff" transparent opacity={0.08} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* 6. STAR PARTICLES IN SKY */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.14} vertexColors transparent opacity={0.85} sizeAttenuation />
      </points>

      {/* ZONE 2: AI COMPANION CALIBRATION PEDESTAL (z: -7) */}
      <group position={[2.2, 0, -7]}>
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[1.2, 1.3, 0.2, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.18, 32]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
        <pointLight position={[0, 0.5, 0]} color="#8b5cf6" intensity={1.5} distance={4} />
      </group>

      {/* ZONE 3: SKILL ASSESSMENT DIAGNOSTIC TOTEMS (z: -15) */}
      <group position={[0, 0, -15]}>
        {[-2.4, 0, 2.4].map((x, i) => {
          const colors = ['#245bff', '#4d83ff', '#8b5cf6'];
          return (
            <group key={i} position={[x, 0, 0]}>
              <mesh position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[0.9, 1.2, 0.6]} />
                <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0, 1.25, 0.05]} rotation={[-0.4, 0, 0]} castShadow>
                <boxGeometry args={[0.85, 0.5, 0.06]} />
                <meshStandardMaterial color="#050816" metalness={0.8} />
              </mesh>
              <mesh position={[0, 1.26, 0.08]} rotation={[-0.4, 0, 0]}>
                <planeGeometry args={[0.78, 0.42]} />
                <meshBasicMaterial color={colors[i]} />
              </mesh>
              <pointLight position={[0, 1.3, 0.2]} color={colors[i]} intensity={0.9} distance={2.5} />
            </group>
          );
        })}
      </group>

      {/* ZONE 4: ADAPTIVE ROADMAP PEDESTALS (z: -23) */}
      <group position={[0, 0, -23]}>
        {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((x, i) => (
          <group key={i} position={[x, 0, (i % 2) * 0.8]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.3, 0.9, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.05, 0]}>
              <octahedronGeometry args={[0.18, 0]} />
              <meshBasicMaterial color={i < 2 ? '#34d399' : i < 4 ? '#245bff' : '#8b5cf6'} />
            </mesh>
            <pointLight
              position={[0, 1.05, 0]}
              color={i < 2 ? '#34d399' : '#245bff'}
              intensity={0.8}
              distance={1.5}
            />
          </group>
        ))}
      </group>

      {/* ZONE 5: CODING ARENA WORKSTATION (z: -31) */}
      <group position={[1.5, 0, -31]}>
        <mesh position={[0, 0.74, 0]} castShadow>
          <boxGeometry args={[2.2, 0.06, 0.9]} />
          <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.95, 0.36, 0]}>
          <boxGeometry args={[0.06, 0.72, 0.7]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        <mesh position={[0.95, 0.36, 0]}>
          <boxGeometry args={[0.06, 0.72, 0.7]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        <mesh position={[-0.4, 1.15, -0.1]} castShadow>
          <boxGeometry args={[0.8, 0.55, 0.04]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0.45, 1.15, -0.1]} castShadow>
          <boxGeometry args={[0.8, 0.55, 0.04]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
        <pointLight position={[0, 1.2, 0.2]} color="#245bff" intensity={1.5} distance={3} />
      </group>

      {/* ZONE 6: PROJECT WORKSHOP SERVER RACKS (z: -39) */}
      <group position={[-2.2, 0, -39]}>
        {[-1.2, 0, 1.2].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 1.4, 0]} castShadow>
              <boxGeometry args={[0.9, 2.8, 0.8]} />
              <meshStandardMaterial color="#090d1c" metalness={0.8} roughness={0.3} />
            </mesh>
            {[0.6, 1.0, 1.4, 1.8, 2.2].map((y, yi) => (
              <mesh key={yi} position={[0, y, 0.41]}>
                <planeGeometry args={[0.75, 0.03]} />
                <meshBasicMaterial color={yi % 2 === 0 ? '#245bff' : '#10b981'} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ZONE 7: INTERVIEW SUITE (z: -47) */}
      <group position={[1.8, 0, -47]}>
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <cylinderGeometry args={[2.0, 2.1, 0.16, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.6, -1.2]} castShadow>
          <boxGeometry args={[2.8, 2.6, 0.08]} />
          <meshStandardMaterial color="#080e22" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.6, -1.15]}>
          <planeGeometry args={[2.2, 1.4]} />
          <meshBasicMaterial color="#245bff" />
        </mesh>
        <pointLight position={[0, 1.6, -0.6]} color="#245bff" intensity={1.8} distance={3.5} />
      </group>

      {/* ZONE 8: CAREER LAUNCH OBSERVATION TERRACE (z: -55) */}
      <group position={[0, 0, -55]}>
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <boxGeometry args={[18, 0.4, 10]} />
          <meshStandardMaterial color="#0c1224" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.9, -4.8]}>
          <boxGeometry args={[18, 1.0, 0.06]} />
          <meshStandardMaterial color="#4d83ff" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        <mesh position={[0, 10, -3.5]}>
          <cylinderGeometry args={[0.08, 0.25, 20, 16]} />
          <meshBasicMaterial color="#245bff" transparent opacity={0.4} />
        </mesh>
        <pointLight position={[0, 2, -3.5]} color="#245bff" intensity={3} distance={10} />
      </group>
    </group>
  );
};
