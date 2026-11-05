import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

export interface CameraWaypoint {
  pos: [number, number, number];
  target: [number, number, number];
}

// 8 Physically Coherent Waypoints through the Technology Studio Facility
export const STAGE_WAYPOINTS: CameraWaypoint[] = [
  // Stage 0: Hero — Workstation on the right, wide open left for HTML headline & CTAs
  { pos: [0, 1.5, 4.8], target: [0.8, 1.2, 0] },
  // Stage 1: AI Career Intelligence — Close-up focus on the floating career core
  { pos: [1.8, 1.35, 1.8], target: [2.5, 1.1, 0.2] },
  // Stage 2: Skill Assessment Hub — Diagnostic consoles
  { pos: [-0.8, 1.8, -11.5], target: [0, 1.1, -15.0] },
  // Stage 3: Adaptive Roadmap Gallery — Milestone progression pedestals
  { pos: [1.2, 2.0, -19.0], target: [0, 1.1, -23.0] },
  // Stage 4: Practice & Coding Arena — Dual-screen algorithmic terminal
  { pos: [-0.5, 1.6, -27.0], target: [1.4, 1.1, -31.0] },
  // Stage 5: Capstone Project Workshop — Server blade racks
  { pos: [1.0, 1.8, -35.0], target: [-1.8, 1.4, -39.0] },
  // Stage 6: Interview Studio — Telepresence evaluation booth
  { pos: [-0.6, 1.7, -43.0], target: [1.6, 1.3, -47.0] },
  // Stage 7: Career Launch Terrace — Panoramic skybridge looking out at metropolis
  { pos: [0, 2.5, -50.0], target: [0, 3.0, -58.0] },
];

interface CameraControllerProps {
  currentStage: number;
  scrollProgress: number; // 0.0 to 1.0 continuous
  isReducedMotion?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  scrollProgress,
  isReducedMotion = false,
}) => {
  const { camera, pointer } = useThree();
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(1.3, 1.1, 0));

  useFrame((_, delta) => {
    if (isReducedMotion) {
      camera.position.set(-0.3, 1.45, 4.5);
      camera.lookAt(1.3, 1.1, 0);
      return;
    }

    // Determine current waypoint segment
    const totalSegments = STAGE_WAYPOINTS.length - 1;
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
    const segmentProgress = clampedProgress * totalSegments;
    const index = Math.floor(segmentProgress);
    const fraction = segmentProgress - index;

    const currentWP = STAGE_WAYPOINTS[Math.min(index, totalSegments)];
    const nextWP = STAGE_WAYPOINTS[Math.min(index + 1, totalSegments)];

    // Interpolate camera position
    const targetX = THREE.MathUtils.lerp(currentWP.pos[0], nextWP.pos[0], fraction);
    const targetY = THREE.MathUtils.lerp(currentWP.pos[1], nextWP.pos[1], fraction);
    const targetZ = THREE.MathUtils.lerp(currentWP.pos[2], nextWP.pos[2], fraction);

    // Subtle pointer parallax (restrained, no motion sickness)
    const parallaxX = pointer.x * 0.18;
    const parallaxY = pointer.y * 0.12;

    const targetPos = new THREE.Vector3(targetX + parallaxX, targetY + parallaxY, targetZ);
    camera.position.lerp(targetPos, Math.min(1, delta * 3.2));

    // Interpolate target lookAt point
    const lookX = THREE.MathUtils.lerp(currentWP.target[0], nextWP.target[0], fraction);
    const lookY = THREE.MathUtils.lerp(currentWP.target[1], nextWP.target[1], fraction);
    const lookZ = THREE.MathUtils.lerp(currentWP.target[2], nextWP.target[2], fraction);

    const targetLookAt = new THREE.Vector3(lookX + parallaxX * 0.08, lookY, lookZ);
    currentLookAt.current.lerp(targetLookAt, Math.min(1, delta * 3.8));

    camera.lookAt(currentLookAt.current);
  });

  return null;
};
