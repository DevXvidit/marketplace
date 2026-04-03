import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Sparkles, useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

const HERO_MODEL = '/models/hero-jewelry.glb';
const RING_MODEL = '/models/ring.glb';

function useJewelryMaterials() {
  return useMemo(() => {
    const gold = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 1,
      roughness: 0.18,
      envMapIntensity: 2.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });

    const silver = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#C9CED6'),
      metalness: 1,
      roughness: 0.22,
      envMapIntensity: 1.8,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });

    const diamond = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      metalness: 0,
      roughness: 0.02,
      transmission: 1,
      thickness: 1.2,
      ior: 2.4,
      envMapIntensity: 2.8,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
    });

    return { gold, silver, diamond };
  }, []);
}

function applyMaterials(scene, materials) {
  scene.traverse((child) => {
    if (!child.isMesh) return;

    const name = child.name.toLowerCase();
    if (name.includes('diamond') || name.includes('gem') || name.includes('stone')) {
      child.material = materials.diamond;
    } else if (name.includes('silver') || name.includes('platinum')) {
      child.material = materials.silver;
    } else {
      child.material = materials.gold;
    }
    child.castShadow = true;
    child.receiveShadow = true;
  });
}

function JewelryModel({ url, scale = 1, position = [0, 0, 0] }) {
  const group = useRef();
  const { scene } = useGLTF(url);
  const materials = useJewelryMaterials();
  const { mouse } = useThree();

  useEffect(() => {
    applyMaterials(scene, materials);
  }, [scene, materials]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.15 + mouse.x * 0.35;
    group.current.rotation.x = mouse.y * 0.2;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

function FloatingRing({ position, scale, rotationIntensity = 1, floatIntensity = 1, speed = 1 }) {
  return (
    <Float position={position} speed={speed} rotationIntensity={rotationIntensity} floatIntensity={floatIntensity}>
      <JewelryModel url={RING_MODEL} scale={scale} />
    </Float>
  );
}

export function JewelryHeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 40 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      dpr={[1, 2]}
      shadows
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 6, 6]} intensity={2.4} color="#FFF6E3" castShadow />
      <directionalLight position={[-6, 4, -4]} intensity={0.8} color="#D4AF37" />
      <pointLight position={[0, 4, 3]} intensity={1.2} color="#FFE6A3" />
      <pointLight position={[2, -3, 2]} intensity={0.8} color="#E2B03A" />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        
        {/* Subtle background floating jewelry */}
        <FloatingRing position={[-4, 2, -6]} scale={0.3} speed={1.5} rotationIntensity={0.5} floatIntensity={0.5} />
        <FloatingRing position={[4, -1.5, -5]} scale={0.25} speed={1.2} rotationIntensity={0.3} floatIntensity={0.8} />
        <FloatingRing position={[-2.5, -2, -4]} scale={0.2} speed={1} rotationIntensity={0.4} floatIntensity={0.6} />

        {/* Main Hero Model */}
        <JewelryModel url={HERO_MODEL} scale={1.6} />
        <Sparkles count={18} scale={[6, 4, 2]} size={2} color="#FFF6D6" opacity={0.35} speed={0.25} />
      </Suspense>
    </Canvas>
  );
}

export function SingleRingScene({ size = '100%' }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      dpr={[1, 2]}
      style={{ width: size, height: size, background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 5, 4]} intensity={2} color="#FFF9E6" castShadow />
      <pointLight position={[0, 2, 2]} intensity={0.9} color="#D4AF37" />
      <pointLight position={[0, -2, -2]} intensity={0.5} color="#A67C12" />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <JewelryModel url={RING_MODEL} scale={1.2} />
        <Sparkles count={10} scale={[3, 2, 2]} size={1.6} color="#FFF6D6" opacity={0.3} speed={0.2} />
      </Suspense>
    </Canvas>
  );
}
