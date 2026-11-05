import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { StudioEnvironment } from './StudioEnvironment';
import { CareerArtifact } from './CareerArtifact';
import { CameraController } from './CameraController';

interface Scene3DProps {
  scrollProgress: number;
  currentStage: number;
  onRobotClick?: () => void;
  isReducedMotion?: boolean;
}

export const Scene3D: React.FC<Scene3DProps> = ({
  scrollProgress,
  currentStage,
  isReducedMotion = false,
}) => (
  <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#080B10]">
    <Canvas
      shadows
      camera={{ position: [0, 1.5, 4.8], fov: 46, near: 0.1, far: 180 }}
      gl={{ powerPreference: 'high-performance', antialias: true, alpha: false }}
      dpr={[1, 1.75]}
    >
      <Suspense fallback={null}>
        <StudioEnvironment />
        <CameraController currentStage={currentStage} scrollProgress={scrollProgress} isReducedMotion={isReducedMotion} />
        <CareerArtifact />
      </Suspense>
    </Canvas>
  </div>
);
