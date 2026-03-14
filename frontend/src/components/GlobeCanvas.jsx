import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Float, ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function GlobeCore({ points = [], variable = 'temperature' }) {
  const meshRef = useRef()
  const atmosphereRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Create a Gaussian radial gradient texture for the 'liquid' effect
  const heatmapTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])

  const pointGeometry = useMemo(() => {
    const positions = []
    const colors = []
    const sizes = []
    
    const displayPoints = (Array.isArray(points) ? points : []).slice(0, 2000) 
    
    displayPoints.forEach((pt) => {
      if (typeof pt.lat !== 'number' || typeof pt.lon !== 'number') return

      const phi = (90 - pt.lat) * (Math.PI / 180)
      const theta = (pt.lon + 180) * (Math.PI / 180)
      const r = 2.05 // Slightly above surface
      
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.cos(phi)
      const z = r * Math.sin(phi) * Math.sin(theta)
      
      positions.push(x, y, z)
      
      const intensity = typeof pt.intensity === 'number' ? pt.intensity : 0
      let color
      // ClickTale style heat scale: Blue -> Cyan -> Green -> Yellow -> Red
      if (intensity > 2.0) {
        color = new THREE.Color('#ef4444') // Red
      } else if (intensity > 1.2) {
        color = new THREE.Color('#eab308') // Amber/Yellow
      } else if (intensity > 0.5) {
        color = new THREE.Color('#10b981') // Green/Emerald
      } else if (intensity > 0) {
        color = new THREE.Color('#06b6d4') // Cyan
      } else {
        color = new THREE.Color('#3b82f6') // Blue
      }
      colors.push(color.r, color.g, color.b)
      sizes.push(hovered ? 0.25 : 0.18)
    })
    
    return { 
      positions: new Float32Array(positions), 
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes)
    }
  }, [points, variable, hovered])

  useFrame((state, delta) => {
    const speed = hovered ? delta * 0.15 : delta * 0.05
    if (meshRef.current) meshRef.current.rotation.y += speed
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += delta * 0.03
  })

  return (
    <group 
      scale={1.35} 
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }} 
      onPointerOut={() => setHovered(false)}
    >
      {/* 1) Dark Core Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="#020617" 
          roughness={0.2} 
          metalness={1} 
          emissive="#06b6d4" 
          emissiveIntensity={hovered ? 0.15 : 0.05}
        />
      </mesh>

      {/* 2) Land Trace Wireframe */}
      <mesh>
        <sphereGeometry args={[2.01, 50, 50]} />
        <meshBasicMaterial 
          color="#06b6d4" 
          wireframe 
          transparent 
          opacity={0.05} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* 3) LIQUID HEATMAP LAYER */}
      <points>
        <bufferGeometry>
          {pointGeometry.positions.length > 0 && (
            <>
              <bufferAttribute
                attach="attributes-position"
                count={pointGeometry.positions.length / 3}
                array={pointGeometry.positions}
                itemSize={3}
              />
              <bufferAttribute
                attach="attributes-color"
                count={pointGeometry.colors.length / 3}
                array={pointGeometry.colors}
                itemSize={3}
              />
            </>
          )}
        </bufferGeometry>
        <pointsMaterial 
          size={0.4} 
          map={heatmapTexture}
          vertexColors={true} 
          transparent 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          sizeAttenuation={true}
          opacity={0.8}
        />
      </points>

      {/* 4) Outer Glow / Atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

export default function GlobeCanvas({ points = [], variable = 'temperature' }) {
  const mappedPoints = useMemo(() => {
    if (!points || !Array.isArray(points) || points.length === 0) {
        return Array.from({ length: 40 }).map((_, i) => ({
            lat: Math.sin(i * 0.4) * 70,
            lon: i * 15,
            intensity: Math.abs(Math.cos(i)) * 2.5
        }))
    }
    return points
  }, [points])

  return (
    <div className="w-full h-full">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6.2]} fov={40} />
        
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#10b981" />
        
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
          <GlobeCore points={mappedPoints} variable={variable} />
        </Float>

        <ContactShadows opacity={0.4} scale={12} blur={2.5} far={4} color="#000000" />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
