import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function GraphMesh({ phase = 'idle' }) {
  const groupRef = useRef();
  const pointsRef = useRef();

  const { pointPositions, linePositions } = useMemo(() => {
    const nodes = [];
    const pointArray = [];

    for (let i = 0; i < 90; i += 1) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 11,
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 8
      );
      nodes.push(v);
      pointArray.push(v.x, v.y, v.z);
    }

    const lineArray = [];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        if (nodes[i].distanceTo(nodes[j]) < 2.4 && Math.random() > 0.65) {
          lineArray.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }

    return {
      pointPositions: new Float32Array(pointArray),
      linePositions: new Float32Array(lineArray),
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.08;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;

    if (pointsRef.current) {
      const material = pointsRef.current.material;
      if (phase === 'sweep') {
        material.color.set('#ff2d55');
      } else if (phase === 'complete') {
        material.color.set('#39ff14');
      } else {
        material.color.set('#00f5ff');
      }
      material.opacity = 0.65 + Math.sin(state.clock.elapsedTime * 2) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={pointPositions.length / 3} array={pointPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.08} transparent opacity={0.7} color="#00f5ff" />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#00f5ff" transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}

export default function NetworkGraph({ phase = 'idle' }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 3, 4]} intensity={1.1} color="#00f5ff" />
      <GraphMesh phase={phase} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.25} />
    </>
  );
}
