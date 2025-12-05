// src/components/Viewer/Structure3DView.tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { maskManager } from '../../utils/MaskManager'
import { useStructureStore } from '../../store/useStructureStore'
import { useVolumeStore } from '../../store/useVolumeStore'
import { useMaskStore } from '../../store/useMaskStore'
import { FiRefreshCw, FiRotateCcw, FiCamera, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import './Structure3DView.css'
import { useTranslation } from '../../hooks/useTranslation'

interface DisplayOptions {
  showAxes: boolean
  showGrid: boolean
  showBoundingBox: boolean
  showDirectionLabels: boolean
  showBrainOutline: boolean
  renderMode: 'surface' | 'cubes' | 'points'
  structureOpacity: number
  wireframe: boolean
}

interface Structure3DViewProps {
  structureId?: number
  showAll?: boolean
  isExpanded?: boolean
  displayOptions?: DisplayOptions
}

const defaultDisplayOptions: DisplayOptions = {
  showAxes: true,
  showGrid: true,
  showBoundingBox: true,
  showDirectionLabels: false,
  showBrainOutline: true,
  renderMode: 'surface',
  structureOpacity: 0.85,
  wireframe: false
}

export function Structure3DView({ 
  structureId, 
  showAll = true, 
  isExpanded: parentExpanded,
  displayOptions = defaultDisplayOptions
}: Structure3DViewProps) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const meshesRef = useRef<Map<number, THREE.Object3D>>(new Map())
  const helpersRef = useRef<THREE.Object3D[]>([])
  const brainMeshRef = useRef<THREE.Mesh | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [brainOpacity, setBrainOpacity] = useState(0.15)
  const [cameraView, setCameraView] = useState<'free' | 'axial' | 'coronal' | 'sagittal'>('free')
  
  const structures = useStructureStore((state) => state.mystructures)
  const volumeData = useVolumeStore((state) => state.volumeData)
  const maskVisibility = useMaskStore((state) => state.maskVisibility)

  // Get real world dimensions
  const getRealDimensions = useCallback(() => {
    if (!volumeData) return { realX: 256, realY: 256, realZ: 256, maxDim: 256, pixDims: [1, 1, 1] as [number, number, number] }
    const [dimX, dimY, dimZ] = volumeData.dims
    const pixDims = volumeData.pixDims || [1, 1, 1]
    const realX = dimX * pixDims[0]
    const realY = dimY * pixDims[1]
    const realZ = dimZ * pixDims[2]
    const maxDim = Math.max(realX, realY, realZ)
    return { realX, realY, realZ, maxDim, pixDims: pixDims as [number, number, number] }
  }, [volumeData])

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    sceneRef.current = scene

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    // Camera - very close near plane for inside viewing
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 10000)
    camera.position.set(300, 200, 300)
    camera.up.set(0, 0, 1) // Z is up
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    rendererRef.current = renderer

    // Controls - NO minimum distance for inside traversal
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.rotateSpeed = 0.8
    controls.zoomSpeed = 2.0 // Faster zoom
    controls.panSpeed = 1.0
    controls.enableZoom = true
    controls.enablePan = true
    controls.enableRotate = true
    controls.minDistance = 0 // Can go inside!
    controls.maxDistance = 5000 // Very far out
    controls.target.set(0, 0, 0)
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8)
    keyLight.position.set(150, 150, 200)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.4)
    fillLight.position.set(-150, -100, 100)
    scene.add(fillLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
    backLight.position.set(0, 0, -200)
    scene.add(backLight)

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      renderer.dispose()
      controls.dispose()
    }
  }, [])

  // Create brain surface mesh
  const createBrainSurface = useCallback(() => {
    if (!volumeData || !sceneRef.current) return

    // Remove existing
    if (brainMeshRef.current) {
      sceneRef.current.remove(brainMeshRef.current)
      brainMeshRef.current.geometry.dispose()
      if (brainMeshRef.current.material instanceof THREE.Material) {
        brainMeshRef.current.material.dispose()
      }
      brainMeshRef.current = null
    }

    if (!displayOptions.showBrainOutline) return

    const [dimX, dimY, dimZ] = volumeData.dims
    const { pixDims } = getRealDimensions()
    const data = volumeData.rawData || volumeData.nvImage?.img

    if (!data) return

    console.log('🧠 Creating brain surface...')
    console.log('   Volume dims:', dimX, dimY, dimZ)
    console.log('   Voxel size:', pixDims)

    const threshold = volumeData.min + (volumeData.max - volumeData.min) * 0.12
    const vertices: number[] = []
    const normals: number[] = []
    const step = 2

    // Real-world offsets for centering
    const offsetX = (dimX * pixDims[0]) / 2
    const offsetY = (dimY * pixDims[1]) / 2
    const offsetZ = (dimZ * pixDims[2]) / 2

    for (let z = step; z < dimZ - step; z += step) {
      for (let y = step; y < dimY - step; y += step) {
        for (let x = step; x < dimX - step; x += step) {
          const idx = z * dimX * dimY + y * dimX + x
          const value = data[idx]

          if (value > threshold) {
            // Check 6-connected neighbors
            const xm = data[z * dimX * dimY + y * dimX + (x - step)] || 0
            const xp = data[z * dimX * dimY + y * dimX + (x + step)] || 0
            const ym = data[z * dimX * dimY + (y - step) * dimX + x] || 0
            const yp = data[z * dimX * dimY + (y + step) * dimX + x] || 0
            const zm = data[(z - step) * dimX * dimY + y * dimX + x] || 0
            const zp = data[(z + step) * dimX * dimY + y * dimX + x] || 0

            // Real-world coordinates
            const wx = x * pixDims[0] - offsetX
            const wy = y * pixDims[1] - offsetY
            const wz = z * pixDims[2] - offsetZ
            const s = step * Math.min(pixDims[0], pixDims[1], pixDims[2])

            // Add faces at boundaries
            if (xm <= threshold) addFace(vertices, normals, wx, wy, wz, s, pixDims, 'x-')
            if (xp <= threshold) addFace(vertices, normals, wx + step * pixDims[0], wy, wz, s, pixDims, 'x+')
            if (ym <= threshold) addFace(vertices, normals, wx, wy, wz, s, pixDims, 'y-')
            if (yp <= threshold) addFace(vertices, normals, wx, wy + step * pixDims[1], wz, s, pixDims, 'y+')
            if (zm <= threshold) addFace(vertices, normals, wx, wy, wz, s, pixDims, 'z-')
            if (zp <= threshold) addFace(vertices, normals, wx, wy, wz + step * pixDims[2], s, pixDims, 'z+')
          }
        }
      }
    }

    if (vertices.length === 0) return

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geometry.computeVertexNormals()

    const material = new THREE.MeshPhongMaterial({
      color: 0xddccbb,
      transparent: true,
      opacity: brainOpacity,
      side: THREE.DoubleSide,
      shininess: 20,
      depthWrite: false
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = 'brain-surface'
    mesh.renderOrder = -1
    sceneRef.current.add(mesh)
    brainMeshRef.current = mesh

    console.log(`✅ Brain surface: ${vertices.length / 3} vertices`)
  }, [volumeData, displayOptions.showBrainOutline, brainOpacity, getRealDimensions])

  // Add face helper with proper dimensions
  const addFace = (
    vertices: number[],
    normals: number[],
    x: number, y: number, z: number,
    size: number,
    pixDims: [number, number, number],
    face: string
  ) => {
    const sx = size
    const sy = size
    const sz = size
    let v0: number[], v1: number[], v2: number[], v3: number[]
    let n: number[]

    switch (face) {
      case 'x-':
        v0 = [x, y, z]; v1 = [x, y + sy, z]; v2 = [x, y + sy, z + sz]; v3 = [x, y, z + sz]
        n = [-1, 0, 0]
        break
      case 'x+':
        v0 = [x, y, z]; v1 = [x, y, z + sz]; v2 = [x, y + sy, z + sz]; v3 = [x, y + sy, z]
        n = [1, 0, 0]
        break
      case 'y-':
        v0 = [x, y, z]; v1 = [x, y, z + sz]; v2 = [x + sx, y, z + sz]; v3 = [x + sx, y, z]
        n = [0, -1, 0]
        break
      case 'y+':
        v0 = [x, y, z]; v1 = [x + sx, y, z]; v2 = [x + sx, y, z + sz]; v3 = [x, y, z + sz]
        n = [0, 1, 0]
        break
      case 'z-':
        v0 = [x, y, z]; v1 = [x + sx, y, z]; v2 = [x + sx, y + sy, z]; v3 = [x, y + sy, z]
        n = [0, 0, -1]
        break
      case 'z+':
      default:
        v0 = [x, y, z]; v1 = [x, y + sy, z]; v2 = [x + sx, y + sy, z]; v3 = [x + sx, y, z]
        n = [0, 0, 1]
        break
    }

    // Two triangles
    vertices.push(...v0, ...v1, ...v2, ...v0, ...v2, ...v3)
    normals.push(...n, ...n, ...n, ...n, ...n, ...n)
  }

  // Update brain opacity
  useEffect(() => {
    if (brainMeshRef.current?.material) {
      (brainMeshRef.current.material as THREE.MeshPhongMaterial).opacity = brainOpacity
    }
  }, [brainOpacity])

  // Update helpers
  const updateHelpers = useCallback(() => {
    if (!sceneRef.current || !volumeData) return

    helpersRef.current.forEach(h => {
      sceneRef.current?.remove(h)
      if (h instanceof THREE.Mesh || h instanceof THREE.Line) {
        h.geometry?.dispose()
        if (h.material instanceof THREE.Material) h.material.dispose()
      }
    })
    helpersRef.current = []

    const { realX, realY, realZ, maxDim } = getRealDimensions()

    if (displayOptions.showAxes) {
      const axes = new THREE.AxesHelper(maxDim * 0.6)
      axes.position.set(-realX / 2, -realY / 2, -realZ / 2)
      sceneRef.current.add(axes)
      helpersRef.current.push(axes)
    }

    if (displayOptions.showGrid) {
      const grid = new THREE.GridHelper(maxDim * 1.2, 20, 0x333333, 0x222222)
      grid.rotation.x = Math.PI / 2
      grid.position.set(0, 0, -realZ / 2 - 2)
      sceneRef.current.add(grid)
      helpersRef.current.push(grid)
    }

    if (displayOptions.showBoundingBox) {
      const boxGeom = new THREE.BoxGeometry(realX, realY, realZ)
      const edges = new THREE.EdgesGeometry(boxGeom)
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x7ddb94, opacity: 0.4, transparent: true }))
      sceneRef.current.add(line)
      helpersRef.current.push(line)
      boxGeom.dispose()
    }
  }, [volumeData, displayOptions, getRealDimensions])

  // Generate CONNECTED surface mesh using proper surface extraction
  const generateSurfaceMesh = useCallback((
    maskData: Uint8Array,
    dims: [number, number, number],
    color: THREE.Color
  ): THREE.Mesh | null => {
    const [dimX, dimY, dimZ] = dims
    const { pixDims } = getRealDimensions()
    
    const vertices: number[] = []
    const normals: number[] = []

    const offsetX = (dimX * pixDims[0]) / 2
    const offsetY = (dimY * pixDims[1]) / 2
    const offsetZ = (dimZ * pixDims[2]) / 2

    // Process all voxels
    for (let z = 0; z < dimZ; z++) {
      for (let y = 0; y < dimY; y++) {
        for (let x = 0; x < dimX; x++) {
          const idx = z * dimX * dimY + y * dimX + x
          
          if (maskData[idx] > 128) {
            const wx = x * pixDims[0] - offsetX
            const wy = y * pixDims[1] - offsetY
            const wz = z * pixDims[2] - offsetZ

            // Check each face - only add if neighbor is empty
            // -X face
            if (x === 0 || maskData[z * dimX * dimY + y * dimX + (x - 1)] <= 128) {
              addSurfaceFace(vertices, normals, wx, wy, wz, pixDims, 'x-')
            }
            // +X face
            if (x === dimX - 1 || maskData[z * dimX * dimY + y * dimX + (x + 1)] <= 128) {
              addSurfaceFace(vertices, normals, wx + pixDims[0], wy, wz, pixDims, 'x+')
            }
            // -Y face
            if (y === 0 || maskData[z * dimX * dimY + (y - 1) * dimX + x] <= 128) {
              addSurfaceFace(vertices, normals, wx, wy, wz, pixDims, 'y-')
            }
            // +Y face
            if (y === dimY - 1 || maskData[z * dimX * dimY + (y + 1) * dimX + x] <= 128) {
              addSurfaceFace(vertices, normals, wx, wy + pixDims[1], wz, pixDims, 'y+')
            }
            // -Z face
            if (z === 0 || maskData[(z - 1) * dimX * dimY + y * dimX + x] <= 128) {
              addSurfaceFace(vertices, normals, wx, wy, wz, pixDims, 'z-')
            }
            // +Z face
            if (z === dimZ - 1 || maskData[(z + 1) * dimX * dimY + y * dimX + x] <= 128) {
              addSurfaceFace(vertices, normals, wx, wy, wz + pixDims[2], pixDims, 'z+')
            }
          }
        }
      }
    }

    if (vertices.length === 0) return null

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geometry.computeVertexNormals()

    const material = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: displayOptions.structureOpacity,
      side: THREE.DoubleSide,
      shininess: 60,
      specular: new THREE.Color(0x333333),
      wireframe: displayOptions.wireframe
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.renderOrder = 1

    return mesh
  }, [getRealDimensions, displayOptions])

  // Add surface face with proper voxel dimensions
  const addSurfaceFace = (
    vertices: number[],
    normals: number[],
    x: number, y: number, z: number,
    pixDims: [number, number, number],
    face: string
  ) => {
    const [px, py, pz] = pixDims
    let v0: number[], v1: number[], v2: number[], v3: number[]
    let n: number[]

    switch (face) {
      case 'x-':
        v0 = [x, y, z]
        v1 = [x, y + py, z]
        v2 = [x, y + py, z + pz]
        v3 = [x, y, z + pz]
        n = [-1, 0, 0]
        break
      case 'x+':
        v0 = [x, y, z]
        v1 = [x, y, z + pz]
        v2 = [x, y + py, z + pz]
        v3 = [x, y + py, z]
        n = [1, 0, 0]
        break
      case 'y-':
        v0 = [x, y, z]
        v1 = [x, y, z + pz]
        v2 = [x + px, y, z + pz]
        v3 = [x + px, y, z]
        n = [0, -1, 0]
        break
      case 'y+':
        v0 = [x, y, z]
        v1 = [x + px, y, z]
        v2 = [x + px, y, z + pz]
        v3 = [x, y, z + pz]
        n = [0, 1, 0]
        break
      case 'z-':
        v0 = [x, y, z]
        v1 = [x + px, y, z]
        v2 = [x + px, y + py, z]
        v3 = [x, y + py, z]
        n = [0, 0, -1]
        break
      case 'z+':
      default:
        v0 = [x, y, z]
        v1 = [x, y + py, z]
        v2 = [x + px, y + py, z]
        v3 = [x + px, y, z]
        n = [0, 0, 1]
        break
    }

    // Two triangles for the quad
    vertices.push(...v0, ...v1, ...v2)
    vertices.push(...v0, ...v2, ...v3)
    normals.push(...n, ...n, ...n)
    normals.push(...n, ...n, ...n)
  }

  // Generate cubes mesh
  const generateCubesMesh = useCallback((
    maskData: Uint8Array,
    dims: [number, number, number],
    color: THREE.Color
  ): THREE.InstancedMesh | null => {
    const [dimX, dimY, dimZ] = dims
    const { pixDims } = getRealDimensions()
    const positions: THREE.Vector3[] = []

    const offsetX = (dimX * pixDims[0]) / 2
    const offsetY = (dimY * pixDims[1]) / 2
    const offsetZ = (dimZ * pixDims[2]) / 2

    for (let z = 0; z < dimZ; z++) {
      for (let y = 0; y < dimY; y++) {
        for (let x = 0; x < dimX; x++) {
          if (maskData[z * dimX * dimY + y * dimX + x] > 128) {
            positions.push(new THREE.Vector3(
              x * pixDims[0] - offsetX + pixDims[0] / 2,
              y * pixDims[1] - offsetY + pixDims[1] / 2,
              z * pixDims[2] - offsetZ + pixDims[2] / 2
            ))
          }
        }
      }
    }

    if (positions.length === 0) return null

    // Limit instances
    const maxInstances = 50000
    const step = positions.length > maxInstances ? Math.ceil(positions.length / maxInstances) : 1
    const filtered = step > 1 ? positions.filter((_, i) => i % step === 0) : positions

    const cubeGeom = new THREE.BoxGeometry(pixDims[0] * 0.95, pixDims[1] * 0.95, pixDims[2] * 0.95)
    const material = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: displayOptions.structureOpacity,
      wireframe: displayOptions.wireframe
    })

    const mesh = new THREE.InstancedMesh(cubeGeom, material, filtered.length)
    const matrix = new THREE.Matrix4()

    filtered.forEach((pos, i) => {
      matrix.setPosition(pos)
      mesh.setMatrixAt(i, matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
    mesh.renderOrder = 1

    return mesh
  }, [getRealDimensions, displayOptions])

  // Generate points mesh
  const generatePointsMesh = useCallback((
    maskData: Uint8Array,
    dims: [number, number, number],
    color: THREE.Color
  ): THREE.Points | null => {
    const [dimX, dimY, dimZ] = dims
    const { pixDims } = getRealDimensions()
    const verts: number[] = []

    const offsetX = (dimX * pixDims[0]) / 2
    const offsetY = (dimY * pixDims[1]) / 2
    const offsetZ = (dimZ * pixDims[2]) / 2

    for (let z = 0; z < dimZ; z++) {
      for (let y = 0; y < dimY; y++) {
        for (let x = 0; x < dimX; x++) {
          if (maskData[z * dimX * dimY + y * dimX + x] > 128) {
            verts.push(
              x * pixDims[0] - offsetX,
              y * pixDims[1] - offsetY,
              z * pixDims[2] - offsetZ
            )
          }
        }
      }
    }

    if (verts.length === 0) return null

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))

    const mat = new THREE.PointsMaterial({
      color: color,
      size: Math.min(...pixDims) * 1.5,
      transparent: true,
      opacity: displayOptions.structureOpacity,
      sizeAttenuation: true
    })

    return new THREE.Points(geom, mat)
  }, [getRealDimensions, displayOptions])

  // Build all meshes
  const buildMeshes = async () => {
    if (!sceneRef.current || !volumeData) return

    setIsLoading(true)

    // Clear existing
    meshesRef.current.forEach(mesh => {
      sceneRef.current?.remove(mesh)
      if (mesh instanceof THREE.Mesh || mesh instanceof THREE.InstancedMesh || mesh instanceof THREE.Points) {
        mesh.geometry?.dispose()
        if (mesh.material instanceof THREE.Material) mesh.material.dispose()
      }
    })
    meshesRef.current.clear()

    updateHelpers()
    createBrainSurface()

    const toRender = showAll ? structures : structures.filter(s => s.id === structureId)

    for (const structure of toRender) {
      if (!maskVisibility[structure.id]) continue

      const mask = await maskManager.getMask(structure.id)
      if (!mask?.data || !mask?.dims) continue

      console.log(`🔨 Building: ${structure.title}`)

      let mesh: THREE.Object3D | null = null
      const color = new THREE.Color(structure.color)

      switch (displayOptions.renderMode) {
        case 'cubes':
          mesh = generateCubesMesh(mask.data, mask.dims as [number, number, number], color)
          break
        case 'points':
          mesh = generatePointsMesh(mask.data, mask.dims as [number, number, number], color)
          break
        default:
          mesh = generateSurfaceMesh(mask.data, mask.dims as [number, number, number], color)
      }

      if (mesh) {
        mesh.name = `structure-${structure.id}`
        sceneRef.current.add(mesh)
        meshesRef.current.set(structure.id, mesh)
        console.log(`✅ Added: ${structure.title}`)
      }
    }

    setIsLoading(false)
  }

  // Camera presets
  const setCameraPreset = (view: 'free' | 'axial' | 'coronal' | 'sagittal') => {
    if (!cameraRef.current || !controlsRef.current) return

    const { maxDim } = getRealDimensions()
    const dist = maxDim * 1.8

    controlsRef.current.target.set(0, 0, 0)

    switch (view) {
      case 'axial':
        cameraRef.current.position.set(0, 0, dist)
        cameraRef.current.up.set(0, 1, 0)
        break
      case 'coronal':
        cameraRef.current.position.set(0, -dist, 0)
        cameraRef.current.up.set(0, 0, 1)
        break
      case 'sagittal':
        cameraRef.current.position.set(dist, 0, 0)
        cameraRef.current.up.set(0, 0, 1)
        break
      default:
        cameraRef.current.position.set(dist * 0.7, dist * 0.5, dist * 0.7)
        cameraRef.current.up.set(0, 0, 1)
    }

    cameraRef.current.lookAt(0, 0, 0)
    controlsRef.current.update()
    setCameraView(view)
  }

  const resetCamera = () => setCameraPreset('free')

  const zoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return
    const dir = new THREE.Vector3()
    cameraRef.current.getWorldDirection(dir)
    cameraRef.current.position.addScaledVector(dir, 50)
    controlsRef.current.update()
  }

  const zoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return
    const dir = new THREE.Vector3()
    cameraRef.current.getWorldDirection(dir)
    cameraRef.current.position.addScaledVector(dir, -50)
    controlsRef.current.update()
  }

  const goInside = () => {
    if (!cameraRef.current || !controlsRef.current) return
    cameraRef.current.position.set(0, 0, 0)
    controlsRef.current.target.set(0, 50, 0)
    controlsRef.current.update()
  }

  const takeScreenshot = () => {
    if (!rendererRef.current) return
    const link = document.createElement('a')
    link.download = `brain-3d-${Date.now()}.png`
    link.href = rendererRef.current.domElement.toDataURL('image/png')
    link.click()
  }

  // Effects
  useEffect(() => {
    buildMeshes()
  }, [structures, maskVisibility, structureId, showAll, displayOptions])

  useEffect(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
    const w = containerRef.current.clientWidth
    const h = containerRef.current.clientHeight
    cameraRef.current.aspect = w / h
    cameraRef.current.updateProjectionMatrix()
    rendererRef.current.setSize(w, h)
  }, [parentExpanded])

  return (
    <div className="structure-3d-view" ref={containerRef}>
      <div className="structure-3d-toolbar">
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={buildMeshes} disabled={isLoading} title={t.reconstruction.rebuild}>
            <FiRefreshCw size={14} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="toolbar-btn" onClick={resetCamera} title={t.reconstruction.resetView}>
            <FiRotateCcw size={14} />
          </button>
          <button className="toolbar-btn" onClick={zoomIn} title={t.reconstruction.ZoomIn}>
            <FiZoomIn size={14} />
          </button>
          <button className="toolbar-btn" onClick={zoomOut} title={t.reconstruction.ZoomOut}>
            <FiZoomOut size={14} />
          </button>
          
          
        </div>

        <div className="toolbar-group camera-presets">
          <button className={`preset-btn ${cameraView === 'free' ? 'active' : ''}`} onClick={() => setCameraPreset('free')}>3D</button>
          <button className={`preset-btn ${cameraView === 'axial' ? 'active' : ''}`} onClick={() => setCameraPreset('axial')}>Axial</button>
          <button className={`preset-btn ${cameraView === 'coronal' ? 'active' : ''}`} onClick={() => setCameraPreset('coronal')}>Coronal</button>
          <button className={`preset-btn ${cameraView === 'sagittal' ? 'active' : ''}`} onClick={() => setCameraPreset('sagittal')}>Sagittal</button>
        </div>

        {displayOptions.showBrainOutline && (
          <div className="brain-opacity-control">
            <span>{t.reconstruction.brain}</span>
            <input type="range" min="0" max="0.5" step="0.02" value={brainOpacity} onChange={(e) => setBrainOpacity(parseFloat(e.target.value))} />
            <span>{Math.round(brainOpacity * 100)}%</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="structure-3d-canvas" />

      {isLoading && (
        <div className="structure-3d-loading">
          <div className="loading-spinner" />
          <span>{t.reconstruction.building3D}</span>
        </div>
      )}

      <div className="structure-3d-legend">
        {structures.filter(s => maskVisibility[s.id]).map(s => (
          <div key={s.id} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: s.color }} />
            <span className="legend-name">{s.title}</span>
          </div>
        ))}
      </div>
      {/*
      <div className="controls-hint">
        <span>🖱️ Drag: rotate • Scroll: zoom (unlimited) • Shift+drag: pan • 🧠: go inside</span>
      </div>
      */}
    </div>
  )
}

export default Structure3DView