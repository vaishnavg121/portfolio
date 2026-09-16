"use client";

import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Sparks } from './Sparks';

const VelociraptorModel = () => {
  const { scene } = useGLTF('/assets/robotics/velociraptor/velociraptor.glb');
  const group = useRef<THREE.Group>(null);
  const strikeBlockRef = useRef<THREE.Mesh>(null);
  
  useMemo(() => {
    // Center the model
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Normalize scale so it fits nicely
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetDim = 55; // Much smaller to prevent extreme cropping (55-70% width)
    const scale = targetDim / maxDim;
    
    scene.position.x = -center.x;
    scene.position.y = -center.y;
    scene.position.z = -center.z;
    
    group.current?.scale.set(scale, scale, scale);
    
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.3,
      metalness: 0.8,
    });
    
    const weaponMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.9,
    });
    
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
         const mesh = child as THREE.Mesh;
         if (mesh.name === 'mesh_Component874-Mesh' || mesh.name === 'mesh_645') {
            mesh.material = weaponMat;
         } else {
            mesh.material = metalMat;
         }
      }
    });
  }, [scene]);

  const weaponRef = useRef<THREE.Object3D | null>(null);
  const spinVelocity = useRef(0);
  const [impactActive, setImpactActive] = useState(false);
  
  useEffect(() => {
     weaponRef.current = scene.getObjectByName('mesh_Component874-Mesh') || null;
  }, [scene]);

  // Listen to scroll events to drive animation
  useEffect(() => {
    let lastProg = 0;
    const handleScroll = (e: CustomEvent<number>) => {
       const prog = e.detail;
       if (!group.current) return;
       
       let targetRotY = 0;
       let targetRotX = Math.PI / 8;
       let targetScale = 1.0;
       let blockX = 100; // hidden far right
       
       if (prog < 0.10) {
           targetRotY = -Math.PI / 4;
           targetScale = 0.8;
           spinVelocity.current = 0;
           setImpactActive(false);
       } else if (prog < 0.30) {
           targetRotY = -Math.PI / 6;
           targetScale = 1.0;
           spinVelocity.current = (prog - 0.1) * 2; // Spool up
           setImpactActive(false);
       } else if (prog < 0.50) {
           targetRotY = 0;
           targetScale = 1.2;
           targetRotX = Math.PI / 12;
           spinVelocity.current = 1.0; // Max spin
           setImpactActive(false);
           blockX = 35; // moving into position
       } else if (prog < 0.65) {
           targetRotY = Math.PI / 4;
           targetScale = 1.1;
           spinVelocity.current = 0; // Freeze
           blockX = 30; // contacted
           // Trigger impact if we just crossed 0.49
           if (lastProg < 0.50) {
               setImpactActive(true);
               // Camera impulse
               gsap.fromTo(group.current.position, 
                  { x: -5, y: -2 }, 
                  { x: 0, y: 0, duration: 0.15, ease: "bounce.out", overwrite: "auto" }
               );
               if (strikeBlockRef.current) {
                  gsap.fromTo(strikeBlockRef.current.position,
                      { x: 35 },
                      { x: 30, duration: 0.15, ease: "bounce.out", overwrite: "auto" }
                  );
               }
           }
       } else if (prog < 0.80) {
           targetRotY = Math.PI;
           targetScale = 0.9;
           spinVelocity.current = 0;
       } else {
           targetRotY = Math.PI * 1.25;
           targetScale = 0.8;
           spinVelocity.current = 0;
       }
       
       gsap.to(group.current.rotation, { y: targetRotY, x: targetRotX, duration: 0.5, ease: "power2.out", overwrite: "auto" });
       gsap.to(group.current.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.5, ease: "power2.out", overwrite: "auto" });
       if (strikeBlockRef.current) {
           gsap.to(strikeBlockRef.current.position, { x: blockX, duration: 0.5, ease: "power2.out", overwrite: "auto" });
       }
       
       lastProg = prog;
    };
    
    window.addEventListener('robotics-scroll', handleScroll as EventListener);
    return () => window.removeEventListener('robotics-scroll', handleScroll as EventListener);
  }, []);

  useFrame((state, delta) => {
      if (weaponRef.current && spinVelocity.current > 0) {
          weaponRef.current.rotation.y += spinVelocity.current;
      }
  });

  return (
    <group ref={group} rotation={[Math.PI / 8, -Math.PI / 4, 0]}>
      <primitive object={scene} />
      <mesh ref={strikeBlockRef} position={[100, -10, 20]} rotation={[0, 0, Math.PI/8]}>
         <boxGeometry args={[10, 40, 40]} />
         <meshStandardMaterial color="#080808" roughness={0.7} metalness={0.5} />
      </mesh>
      <Sparks active={impactActive} />
    </group>
  );
};

export const VelociraptorScene = () => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 150], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={['#030303']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 100, 50]} intensity={1.5} color="#f5ede3" />
      <directionalLight position={[-100, -50, -50]} intensity={2.0} color="#cc3333" />
      <VelociraptorModel />
    </Canvas>
  );
};
