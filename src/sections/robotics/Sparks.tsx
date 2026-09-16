"use client";
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { velociraptorAssets } from '../../data/velociraptorAssets';

const SparkCount = 100;
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export const Sparks = ({ active }: { active: boolean }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    return new Array(SparkCount).fill(0).map(() => ({
      position: new THREE.Vector3(...velociraptorAssets.animation.impactOrigin),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 40 - 20, // push mostly left/forward
        Math.random() * 20 + 10, // up
        (Math.random() - 0.5) * 40
      ),
      life: 0,
      maxLife: Math.random() * 0.5 + 0.2, // very short lived
      alive: false
    }));
  }, []);
  
  useEffect(() => {
    if (active) {
       // Reset particles
       particles.forEach(p => {
          p.position.set(...velociraptorAssets.animation.impactOrigin);
          p.velocity.set(
             (Math.random() - 0.5) * 50 - 30, 
             Math.random() * 30 + 10,
             (Math.random() - 0.5) * 50
          );
          p.life = 0;
          p.alive = true;
       });
    }
  }, [active, particles]);
  
  useFrame((state, delta) => {
     let anyAlive = false;
     
     particles.forEach((p, i) => {
         if (p.alive) {
             p.life += delta;
             if (p.life > p.maxLife) {
                 p.alive = false;
                 // move far away when dead
                 _dummy.position.set(9999, 9999, 9999);
             } else {
                 anyAlive = true;
                 p.velocity.y -= 50 * delta; // gravity
                 p.position.addScaledVector(p.velocity, delta);
                 _dummy.position.copy(p.position);
                 // scale decreases as it dies
                 const s = Math.max(0, 1 - (p.life / p.maxLife));
                 _dummy.scale.set(s, s * 2, s); // stretch along velocity
             }
             
             _dummy.updateMatrix();
             if (meshRef.current) {
                 meshRef.current.setMatrixAt(i, _dummy.matrix);
                 // interpolate color from hot white/yellow to dark red
                 const progress = p.life / p.maxLife;
                 if (progress < 0.2) _color.setHex(0xffffff);
                 else if (progress < 0.5) _color.setHex(0xffcc00);
                 else _color.setHex(0xaa0000);
                 meshRef.current.setColorAt(i, _color);
             }
         }
     });
     
     if (meshRef.current && anyAlive) {
         meshRef.current.instanceMatrix.needsUpdate = true;
         if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
     }
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, SparkCount]} frustumCulled={false}>
       <boxGeometry args={[0.5, 0.5, 0.5]} />
       <meshBasicMaterial color="#ffffff" toneMapped={false} />
    </instancedMesh>
  );
};
