import { Line, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Pentagon({ radius = 2.3, color = '#00f5ff', fill = false }) {
  const points = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 5; i += 1) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      arr.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    arr.push(arr[0]);
    return arr;
  }, [radius]);

  if (fill) {
    const shape = useMemo(() => {
      const s = new THREE.Shape();
      s.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i += 1) {
        s.lineTo(points[i].x, points[i].y);
      }
      s.closePath();
      return s;
    }, [points]);

    return (
      <mesh>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    );
  }

  return <Line points={points} color={color} lineWidth={1.3} transparent opacity={0.8} />;
}

function RadarCore() {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.45;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Pentagon radius={2.4} color="#00f5ff" />
      <Pentagon radius={1.8} color="#39ff14" />
      <Pentagon radius={1.2} color="#ffb700" />
      <Pentagon radius={0.9} color="#00f5ff" fill />
      <mesh>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial emissive="#00f5ff" color="#00f5ff" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

export default function SecurityRadar() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 2]} color="#00f5ff" intensity={1.2} />
      <RadarCore />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}
