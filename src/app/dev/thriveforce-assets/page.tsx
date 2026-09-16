"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const views = [
  { id: 'velociraptor-hero-34', type: 'perspective', position: [100, 50, 100], target: [0,0,0], material: 'default' },
  { id: 'velociraptor-hero-opposite', type: 'perspective', position: [-100, 50, -100], target: [0,0,0], material: 'default' },
  { id: 'velociraptor-top', type: 'orthographic', position: [0, 100, 0], target: [0,0,0], material: 'default' },
  { id: 'velociraptor-front', type: 'orthographic', position: [0, 0, 100], target: [0,0,0], material: 'default' },
  { id: 'velociraptor-side', type: 'orthographic', position: [100, 0, 0], target: [0,0,0], material: 'default' },
  { id: 'velociraptor-low-weapon', type: 'perspective', position: [100, 10, 100], target: [0,0,0], material: 'default' },
  { id: 'velociraptor-wireframe', type: 'perspective', position: [100, 50, 100], target: [0,0,0], material: 'wireframe' },
  { id: 'velociraptor-wireframe-top', type: 'orthographic', position: [0, 100, 0], target: [0,0,0], material: 'wireframe' },
  { id: 'velociraptor-silhouette', type: 'perspective', position: [100, 50, 100], target: [0,0,0], material: 'black' },
];

function Model({ viewId }: { viewId: string }) {
  const { scene } = useGLTF('/assets/robotics/velociraptor/model/velociraptor.glb');
  const group = useRef<THREE.Group>(null);
  
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 50 / maxDim; // Normalize
    
    scene.position.copy(center).multiplyScalar(-1);
    if (group.current) {
       group.current.scale.set(scale, scale, scale);
    }

    const view = views.find(v => v.id === viewId);
    
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.8 });
    const weaponMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.9 });
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xf5ede3, wireframe: true, transparent: true, opacity: 0.3 });
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
         const mesh = child as THREE.Mesh;
         if (view?.material === 'wireframe') {
             mesh.material = wireMat;
         } else if (view?.material === 'black') {
             mesh.material = blackMat;
         } else {
             if (mesh.name === 'mesh_Component874-Mesh' || mesh.name === 'mesh_645') {
                 mesh.material = weaponMat;
             } else {
                 mesh.material = metalMat;
             }
         }
      }
    });
  }, [scene, viewId]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

const CaptureCanvas = ({ view, onReady }: { view: any, onReady: (id: string, dataUrl: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // wait a bit for render
    const t = setTimeout(() => {
      if (canvasRef.current) {
        onReady(view.id, canvasRef.current.toDataURL('image/webp', 1.0));
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [view.id, onReady]);

  return (
    <div className="w-[800px] h-[600px] bg-transparent border border-gray-500 relative">
      <div className="absolute top-2 left-2 text-white font-mono z-10 bg-black/50 p-1">{view.id}</div>
      <Canvas gl={{ preserveDrawingBuffer: true, alpha: true }} ref={canvasRef}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 100, 50]} intensity={1.5} color="#f5ede3" />
        <directionalLight position={[-100, -50, -50]} intensity={2.0} color="#cc3333" />
        {view.type === 'perspective' ? (
          <PerspectiveCamera makeDefault position={view.position} fov={45} onUpdate={c => c.lookAt(view.target[0], view.target[1], view.target[2])} />
        ) : (
          <OrthographicCamera makeDefault position={view.position} zoom={10} onUpdate={c => c.lookAt(view.target[0], view.target[1], view.target[2])} />
        )}
        <Model viewId={view.id} />
      </Canvas>
    </div>
  );
};

export default function ThriveForceAssets() {
  const [images, setImages] = useState<Record<string, string>>({});
  
  const handleReady = (id: string, dataUrl: string) => {
    setImages(prev => ({ ...prev, [id]: dataUrl }));
  };
  
  const handleDownload = () => {
    Object.entries(images).forEach(([id, url]) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}.webp`;
      a.click();
    });
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
       <h1 className="text-white text-2xl font-mono mb-4">ThriveForce Asset Generator (Phase B)</h1>
       <div className="mb-8">
         <button onClick={handleDownload} className="bg-white text-black px-4 py-2 font-mono">
           Download All {Object.keys(images).length} / {views.length} Ready
         </button>
       </div>
       <div className="flex flex-wrap gap-4">
         {views.map(v => (
           <CaptureCanvas key={v.id} view={v} onReady={handleReady} />
         ))}
       </div>
    </div>
  );
}
