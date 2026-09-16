"use client";
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SparkCount = 100;

export const Sparks = ({ active }: { active: boolean }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const velocities = useMemo(() => new Float32Array(SparkCount * 3), []);
  const lifespans = useMemo(() => new Float32Array(SparkCount), []);
  
  useEffect(() => {
     if (active) {
         // Reset sparks
         for (let i = 0; i < SparkCount; i++) {
            // originate at contact point roughly right side of weapon
            dummy.position.set(40, -10, 0); 
            
            // spray right and slightly up
            velocities[i*3] = 2 + Math.random() * 4;
            velocities[i*3+1] = -1 + Math.random() * 3;
            velocities[i*3+2] = (Math.random() - 0.5) * 3;
            
            // random lifespan
            lifespans[i] = 1.0;
            
            // random scale
            const s = Math.random() * 0.5 + 0.5;
            dummy.scale.set(s * 4, s * 0.5, s * 0.5); // long streaks
            
            dummy.updateMatrix();
            meshRef.current?.setMatrixAt(i, dummy.matrix);
            meshRef.current?.setColorAt(i, new THREE.Color('#f5ede3'));
         }
         if (meshRef.current) {
             meshRef.current.instanceMatrix.needsUpdate = true;
             if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
         }
     }
  }, [active, dummy, velocities, lifespans]);
  
  useFrame((state, delta) => {
      if (!active || !meshRef.current) return;
      
      let alive = false;
      for (let i = 0; i < SparkCount; i++) {
          if (lifespans[i] > 0) {
              lifespans[i] -= delta * 2.0; // decay
              
              meshRef.current.getMatrixAt(i, dummy.matrix);
              dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
              
              dummy.position.x += velocities[i*3] * delta * 50;
              dummy.position.y += velocities[i*3+1] * delta * 50;
              dummy.position.z += velocities[i*3+2] * delta * 50;
              
              // Gravity
              velocities[i*3+1] -= 2.0 * delta;
              
              dummy.scale.x = lifespans[i] * 4; // streak shrinks as it dies
              
              dummy.updateMatrix();
              meshRef.current.setMatrixAt(i, dummy.matrix);
              
              // Fade color to crimson
              const color = new THREE.Color('#f5ede3').lerp(new THREE.Color('#cc3333'), 1.0 - lifespans[i]);
              meshRef.current.setColorAt(i, color);
              
              alive = true;
          } else {
              // Hide dead sparks
              dummy.scale.set(0,0,0);
              dummy.updateMatrix();
              meshRef.current.setMatrixAt(i, dummy.matrix);
          }
      }
      
      if (alive) {
          meshRef.current.instanceMatrix.needsUpdate = true;
          if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
      }
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SparkCount]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};

