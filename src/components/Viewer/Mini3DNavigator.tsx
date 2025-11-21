// src/components/Viewer/Mini3DNavigator.tsx
import { useEffect, useRef, useState } from 'react'
import { Niivue } from '@niivue/niivue'
import { useVolumeStore } from '../../store/useVolumeStore'
import { useViewerStore } from '../../store/useViewerStore'
import { FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import './Mini3DNavigator.css'

interface Mini3DNavigatorProps {
  visible?: boolean
  onClose?: () => void
}

export function Mini3DNavigator({ visible = true, onClose }: Mini3DNavigatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const niivueRef = useRef<Niivue | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ right: 20, bottom: 20 })
const dragStart = useRef({ x: 0, y: 0, startRight: 0, startBottom: 0 })

  const volumeData = useVolumeStore((state) => state.volumeData)
  const { currentSlices } = useViewerStore()

  // Initialize NiiVue
  useEffect(() => {
    if (!canvasRef.current || !volumeData || niivueRef.current) return

    const initializeNiiVue = async () => {
      try {
        const nv = new Niivue({
          backColor: [0.1, 0.1, 0.1, 1],
          show3Dcrosshair: true,
          crosshairColor: [0, 1, 0, 1],
          textHeight: 0,
          isRadiologicalConvention: false,
          dragMode: 0, // Disable drag
        })

        await nv.attachToCanvas(canvasRef.current!)

        if (volumeData.nvImage) {
          await nv.addVolume(volumeData.nvImage)
          nv.setSliceType(nv.sliceTypeRender)
          nv.setOpacity(0, 0.3) // Make brain semi-transparent
          nv.setScale(1.2)
          
          niivueRef.current = nv
          console.log('✅ Mini 3D Navigator initialized')
        }
      } catch (error) {
        console.error('❌ Error initializing Mini 3D Navigator:', error)
      }
    }

    initializeNiiVue()

    return () => {
      if (niivueRef.current) {
        niivueRef.current = null
      }
    }
  }, [volumeData])

  // Update crosshair position when slices change
  useEffect(() => {
    if (!niivueRef.current || !volumeData) return

    const nv = niivueRef.current
    const dims = volumeData.dims

    // Calculate normalized positions (0-1)
    const fracX = currentSlices.sagittal / (dims[0] - 1)
    const fracY = currentSlices.coronal / (dims[1] - 1)
    const fracZ = currentSlices.axial / (dims[2] - 1)

    // Update crosshair position
    nv.scene.crosshairPos = [fracX, fracY, fracZ]
    nv.drawScene()

    console.log('🎯 Mini 3D Navigator updated:', { fracX, fracY, fracZ })
  }, [currentSlices, volumeData])

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.mini-3d-controls')) return
    setIsDragging(true)
    
    // Store the mouse position and current position
    dragStart.current = { 
      x: e.clientX,
      y: e.clientY,
      startRight: position.right,
      startBottom: position.bottom
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
        // Calculate how much the mouse moved
        const deltaX = e.clientX - dragStart.current.x
        const deltaY = e.clientY - dragStart.current.y
        
        // Update position (moving right = decrease 'right', moving down = decrease 'bottom')
        setPosition({
          right: Math.max(0, Math.min(window.innerWidth - size, dragStart.current.startRight - deltaX)),
          bottom: Math.max(0, Math.min(window.innerHeight - size, dragStart.current.startBottom - deltaY)),
        })
      }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (!visible) return null

  const size = isExpanded ? 400 : 200

  return (
    <div
      className={`mini-3d-navigator ${isDragging ? 'dragging' : ''} ${isExpanded ? 'expanded' : ''}`}
      style={{
        right: `${position.right}px`,
        bottom: `${position.bottom}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="mini-3d-header">
        <span className="mini-3d-title">3D Position</span>
        <div className="mini-3d-controls">
          <button
            className="mini-3d-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
          </button>
          {onClose && (
            <button className="mini-3d-btn" onClick={onClose} title="Close">
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="mini-3d-canvas-wrapper">
        <canvas ref={canvasRef} className="mini-3d-canvas" />
      </div>

      {/* Coordinates Display */}
      <div className="mini-3d-coords">
        <span>X: {currentSlices.sagittal}</span>
        <span>Y: {currentSlices.coronal}</span>
        <span>Z: {currentSlices.axial}</span>
      </div>
    </div>
  )
}