"use client";

import { Canvas } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  OrbitControls,
} from "@react-three/drei";

function CoreSphere() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh>
        <icosahedronGeometry args={[1.6, 4]} />
        <MeshDistortMaterial
          color="#D4AF37"
          distort={0.35}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function Ring({ scale }: { scale: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} scale={scale}>
      <torusGeometry args={[2.2, 0.03, 16, 100]} />
      <meshStandardMaterial color="#D4AF37" />
    </mesh>
  );
}

export default function BusinessGrowthEngine() {
  return (
    <div className="w-full h-[500px] lg:h-[650px]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
        />

        <CoreSphere />

        <Ring scale={1} />
        <Ring scale={1.3} />
        <Ring scale={1.6} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}
