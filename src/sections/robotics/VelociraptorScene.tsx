"use client";
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Sparks } from './Sparks';
import { velociraptorAssets } from '../../data/velociraptorAssets';

const VelociraptorModel = () => {
  const { scene } = useGLTF(velociraptorAssets.model.velociraptor);
  const group = useRef<THREE.Group>(null);
  const strikeBlockRef = useRef<THREE.Mesh>(null);
  
  const materials = useMemo(() => {
    return {
      metal: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.8, transparent: true }),
      weapon: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.9, transparent: true }),
      wireframe: new THREE.MeshBasicMaterial({ color: 0xcc3333, wireframe: true, transparent: true, opacity: 0 }),
    };
  }, []);

  useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetDim = 55; // Fit 55%
    const scale = targetDim / maxDim;
    
    group.current?.scale.setScalar(scale);
    
    // Create a clone for wireframe
    const wireframeScene = scene.clone();
    wireframeScene.name = 'WireframeOverlay';
    
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
         const mesh = child as THREE.Mesh;
         if (mesh.name === 'mesh_Component874-Mesh' || mesh.name === 'mesh_645') {
            mesh.material = materials.weapon;
         } else {
            mesh.material = materials.metal;
         }
      }
    });

    wireframeScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
         const mesh = child as THREE.Mesh;
         mesh.material = materials.wireframe;
      }
    });
    
    scene.add(wireframeScene);
  }, [scene, materials]);

  const weaponRef = useRef<THREE.Object3D | null>(null);
  const spinVelocity = useRef(0);
  const [impactActive, setImpactActive] = useState(false);
  
  useEffect(() => {
     weaponRef.current = scene.getObjectByName('mesh_Component874-Mesh') || null;
  }, [scene]);

  useEffect(() => {
    let lastProg = 0;
    const handleScroll = (e: CustomEvent<number>) => {
       const prog = e.detail; // 0.0 to 1.0 over Act I & II
       if (!group.current) return;
       
       let targetRotY = 0;
       let targetRotX = Math.PI / 8;
       let targetScale = 1.0;
       let blockX = 100; // hidden far right
       
       // Act I boundaries mapped to progress
       // Act I is roughly 0.0 to 0.4
       // Act II is roughly 0.4 to 1.0
       
       if (prog < 0.05) {
           targetRotY = -Math.PI / 4;
           targetScale = 0.8;
           spinVelocity.current = 0;
           setImpactActive(false);
       } else if (prog < 0.15) {
           targetRotY = -Math.PI / 6;
           targetScale = 1.0;
           spinVelocity.current = (prog - 0.05) * 4; // Spool up
           setImpactActive(false);
       } else if (prog < 0.22) {
           targetRotY = 0;
           targetScale = 1.2;
           targetRotX = Math.PI / 12;
           spinVelocity.current = 2.0; // Max spin
           setImpactActive(false);
           blockX = 35; // moving into position
       } else if (prog < 0.3) {
           // Impact frame
           targetRotY = Math.PI / 4;
           targetScale = 1.1;
           spinVelocity.current = 0; // Freeze
           blockX = 30; // contacted
           if (lastProg < 0.22) {
               setImpactActive(true);
               gsap.fromTo(group.current.position, { x: -5, y: -2 }, { x: 0, y: 0, duration: 0.15, ease: "bounce.out", overwrite: "auto" });
               if (strikeBlockRef.current) gsap.fromTo(strikeBlockRef.current.position, { x: 35 }, { x: 30, duration: 0.15, ease: "bounce.out", overwrite: "auto" });
           }
       } else if (prog < 0.5) {
           // Act II: Transformation (Wireframe fade in, Overview)
           targetRotY = Math.PI / 2; // Side view
           targetRotX = Math.PI / 4; // High angle
           targetScale = 0.8;
           spinVelocity.current = 0;
       } else if (prog < 0.7) {
           // Act II: Weapon & Powertrain
           targetRotY = Math.PI; // Rear/internal view
           targetRotX = Math.PI / 8;
           targetScale = 1.1;
           spinVelocity.current = 0;
       } else {
           // Act II: FEA
           targetRotY = Math.PI * 1.5; // Opposite side
           targetRotX = Math.PI / 12;
           targetScale = 0.9;
           spinVelocity.current = 0;
       }
       
       // Material Crossfade (0.3 to 0.4)
       const fadeProg = Math.max(0, Math.min(1, (prog - 0.3) * 10));
       gsap.to(materials.metal, { opacity: 1 - fadeProg * 0.8, duration: 0.5 });
       gsap.to(materials.weapon, { opacity: 1 - fadeProg * 0.5, duration: 0.5 });
       gsap.to(materials.wireframe, { opacity: fadeProg * 0.4, duration: 0.5 });
       
       gsap.to(group.current.rotation, { y: targetRotY, x: targetRotX, duration: 0.8, ease: "power2.out", overwrite: "auto" });
       gsap.to(group.current.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.8, ease: "power2.out", overwrite: "auto" });
       if (strikeBlockRef.current) gsap.to(strikeBlockRef.current.position, { x: blockX, duration: 0.5, ease: "power2.out", overwrite: "auto" });
       
       lastProg = prog;
    };
    
    window.addEventListener('robotics-master-scroll', handleScroll as EventListener);
    return () => window.removeEventListener('robotics-master-scroll', handleScroll as EventListener);
  }, [materials]);

  useFrame((state, delta) => {
      if (weaponRef.current && spinVelocity.current > 0) {
          weaponRef.current.rotation.y += spinVelocity.current;
      }
  });

  return (
    <group ref={group} rotation={[Math.PI / 8, -Math.PI / 4, 0]}>
      <group position={[-1.78, 67.2, -18.5]}> {/* Approximate inverted center derived from earlier bounds */}
        <primitive object={scene} />
        <mesh ref={strikeBlockRef} position={[32.43, -135.89, 37]}>
           <boxGeometry args={[10, 40, 40]} />
           <meshStandardMaterial color="#080808" roughness={0.7} metalness={0.5} transparent opacity={0.8} />
        </mesh>
        <Sparks active={impactActive} />
      </group>
    </group>
  );
};

export const VelociraptorScene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 150], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 100, 50]} intensity={1.5} color="#f5ede3" />
      <directionalLight position={[-100, -50, -50]} intensity={2.0} color="#cc3333" />
      <VelociraptorModel />
    </Canvas>
  );
};
