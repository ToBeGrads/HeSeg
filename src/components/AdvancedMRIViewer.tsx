import { useState, useEffect, useRef, useCallback } from 'react'
import { FiGrid, FiSquare, FiChevronLeft, FiChevronRight, FiSettings, FiLayers, FiZoomIn, FiZoomOut, FiRotateCw, FiEye, FiMaximize2, FiMove } from 'react-icons/fi'
import './AdvancedMRIViewer.css'
import { MedicalImageLoader, type VolumeData } from '../utils/medicalImageLoader'
import { Niivue } from '@niivue/niivue'

type ViewType = 'axial' | 'coronal' | 'sagittal'
type ViewMode = 'single' | 'quad' | '3d' | 'mosaic'

interface AdvancedMRIViewerProps {
  volumeData: VolumeData | null
  placementMode: {
    active: boolean
    structureId: number | null
    color: string | null
  }
  onPlacementComplete: () => void
}

interface ViewSettings {
  brightness: number
  contrast: number
  opacity: number
  crosshair: boolean
}

interface ViewState {
  scale: number
  offsetX: number
  offsetY: number
  isDragging: boolean
  dragStart: { x: number, y: number } | null
}

interface CrosshairPosition {
  x: number
  y: number
  pixelX: number
  pixelY: number
}

interface VoxelCoordinates {
  x: number
  y: number
  z: number
}

function AdvancedMRIViewer({ volumeData, placementMode, onPlacementComplete }: AdvancedMRIViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('quad')
  const [currentSlices, setCurrentSlices] = useState({
    axial: 0,
    coronal: 0,
    sagittal: 0
  })
  const [allSlices, setAllSlices] = useState<{
    axial: any[],
    coronal: any[],
    sagittal: any[]
  }>({
    axial: [],
    coronal: [],
    sagittal: []
  })
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<ViewSettings>({
    brightness: 0.5,
    contrast: 0.5,
    opacity: 1.0,
    crosshair: true
  })
  
  // Individual view states for each orientation
  const [viewStates, setViewStates] = useState<Record<ViewType, ViewState>>({
    axial: { scale: 1, offsetX: 0, offsetY: 0, isDragging: false, dragStart: null },
    coronal: { scale: 1, offsetX: 0, offsetY: 0, isDragging: false, dragStart: null },
    sagittal: { scale: 1, offsetX: 0, offsetY: 0, isDragging: false, dragStart: null }
  })
  
  const [crosshairPos, setCrosshairPos] = useState<Record<ViewType, CrosshairPosition>>({
    axial: { x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 },
    coronal: { x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 },
    sagittal: { x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 }
  })

  const [voxelCoords, setVoxelCoords] = useState<VoxelCoordinates>({ x: 0, y: 0, z: 0 })
  
  // Placement mode state
  const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null)
  const [placementActive, setPlacementActive] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const niivueRef = useRef<Niivue | null>(null)
  const canvas3DRef = useRef<HTMLCanvasElement>(null)

  // Update placement state when mode changes
  useEffect(() => {
    setPlacementActive(placementMode.active)
    if (!placementMode.active) {
      setCursorPos(null)
    } else {
      console.log('🎯 Placement mode activated with color:', placementMode.color)
    }
  }, [placementMode.active, placementMode.color])

  // Initialize NiiVue for 3D panel
  useEffect(() => {
    if (canvas3DRef.current && volumeData && (viewMode === 'quad' || viewMode === '3d')) {
      const initializeNiiVue = async () => {
        try {
          if (niivueRef.current) {
            niivueRef.current.updateGLVolume()
            return
          }

          console.log('🎨 Initializing NiiVue for 3D view...')
          const nv = new Niivue({
            logging: false,
            dragAndDropEnabled: true,
            backColor: [0.1, 0.1, 0.1, 1],
            crosshairColor: [0, 1, 0, 1],
            show3Dcrosshair: settings.crosshair,
            textHeight: 0.02,
            isRadiologicalConvention: false
          })
          
          await nv.attachToCanvas(canvas3DRef.current!)
          
          if (volumeData.nvImage) {
            await nv.addVolume(volumeData.nvImage)
            nv.setSliceType(nv.sliceTypeRender)
            nv.setOpacity(0, settings.opacity)
            nv.setScale(1.0)
            niivueRef.current = nv
            console.log('✅ NiiVue initialized successfully')
          }
        } catch (error) {
          console.error('❌ Error initializing NiiVue:', error)
        }
      }
      
      initializeNiiVue()
    }

    return () => {
      if (niivueRef.current && viewMode !== 'quad' && viewMode !== '3d') {
        niivueRef.current = null
      }
    }
  }, [viewMode, volumeData, settings.crosshair, settings.opacity])

  // Extract all slices when volume data changes
  useEffect(() => {
    if (!volumeData) {
      console.log('⚠️ No volume data available')
      return
    }

    const extractAllSlices = async () => {
      setLoading(true)
      try {
        console.log('📸 Starting slice extraction...')
        console.log('📐 Volume dimensions:', volumeData.dims)
        
        const axialSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, 'axial')
        const coronalSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, 'coronal')
        const sagittalSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, 'sagittal')

        const processSlices = (slices: any[]) => {
          return slices.map((data) => {
            const imageData = MedicalImageLoader.convertToImageData(data)
            const canvas = MedicalImageLoader.createCanvas(imageData)
            return {
              ...data,
              imageData,
              canvas,
              actualWidth: data.width,
              actualHeight: data.height
            }
          })
        }

        const processedAxial = processSlices(axialSlices)
        const processedCoronal = processSlices(coronalSlices)
        const processedSagittal = processSlices(sagittalSlices)

        setAllSlices({
          axial: processedAxial,
          coronal: processedCoronal,
          sagittal: processedSagittal
        })

        // Set initial slice positions to middle
        const midAxial = Math.floor(axialSlices.length / 2)
        const midCoronal = Math.floor(coronalSlices.length / 2)
        const midSagittal = Math.floor(sagittalSlices.length / 2)

        setCurrentSlices({
          axial: midAxial,
          coronal: midCoronal,
          sagittal: midSagittal
        })

        // Initialize voxel coordinates
        if (volumeData.dims) {
          setVoxelCoords({
            x: Math.floor(volumeData.dims[0] / 2),
            y: Math.floor(volumeData.dims[1] / 2),
            z: Math.floor(volumeData.dims[2] / 2)
          })
        }
        
        console.log('🎉 All slices extracted and processed successfully')
      } catch (error) {
        console.error('❌ Error extracting slices:', error)
      } finally {
        setLoading(false)
      }
    }

    extractAllSlices()
  }, [volumeData])

  const handleSliceChange = useCallback((orientation: ViewType, direction: 'prev' | 'next') => {
    const slices = allSlices[orientation]
    if (slices.length === 0) return

    setCurrentSlices(prev => {
      const current = prev[orientation]
      let newSlice = current

      if (direction === 'next') {
        newSlice = current < slices.length - 1 ? current + 1 : current
      } else {
        newSlice = current > 0 ? current - 1 : current
      }

      // Update voxel coordinates based on orientation
      if (volumeData) {
        setVoxelCoords(prevCoords => {
          const newCoords = { ...prevCoords }
          switch (orientation) {
            case 'axial':
              newCoords.z = newSlice
              break
            case 'coronal':
              newCoords.y = newSlice
              break
            case 'sagittal':
              newCoords.x = newSlice
              break
          }
          return newCoords
        })
      }

      return { ...prev, [orientation]: newSlice }
    })
  }, [allSlices, volumeData])

  const handleZoom = (orientation: ViewType, delta: number) => {
    setViewStates(prev => {
      const current = prev[orientation]
      const newScale = Math.max(0.5, Math.min(10, current.scale + delta))
      return {
        ...prev,
        [orientation]: { ...current, scale: newScale }
      }
    })
  }

  const handleResetView = (orientation: ViewType) => {
    setViewStates(prev => ({
      ...prev,
      [orientation]: { scale: 1, offsetX: 0, offsetY: 0, isDragging: false, dragStart: null }
    }))
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, orientation: ViewType) => {
    if (e.button === 0) { // Left click
      e.preventDefault()
      
      // Get the image element to find its actual position and size
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return

      const imgRect = imgElement.getBoundingClientRect()
      
      // Calculate click position relative to the actual image
      const clickX = e.clientX - imgRect.left
      const clickY = e.clientY - imgRect.top
      
      // Convert to normalized coordinates (0-1)
      const normalizedX = clickX / imgRect.width
      const normalizedY = clickY / imgRect.height
      
      // Clamp to valid range
      const clampedX = Math.max(0, Math.min(1, normalizedX))
      const clampedY = Math.max(0, Math.min(1, normalizedY))
      
      // Calculate pixel coordinates
      const slice = allSlices[orientation][currentSlices[orientation]]
      const pixelX = Math.floor(clampedX * slice.actualWidth)
      const pixelY = Math.floor(clampedY * slice.actualHeight)
      
      // Check if in placement mode
      if (placementActive && placementMode.structureId) {
        // Calculate voxel coordinates based on orientation
        let voxelX = 0, voxelY = 0, voxelZ = 0
        
        switch (orientation) {
          case 'axial':
            voxelX = pixelX
            voxelY = pixelY
            voxelZ = currentSlices.axial
            break
          case 'coronal':
            voxelX = pixelX
            voxelZ = volumeData!.dims[2] - 1 - pixelY
            voxelY = currentSlices.coronal
            break
          case 'sagittal':
            voxelY = pixelX
            voxelZ = volumeData!.dims[2] - 1 - pixelY
            voxelX = currentSlices.sagittal
            break
        }

        // Add coordinate to structure
        console.log(`✅ Placing coordinate at: (${voxelX}, ${voxelY}, ${voxelZ})`)
        console.log(`📍 Structure ID: ${placementMode.structureId}, Color: ${placementMode.color}`)
        
        // Call the global function to add coordinate
        if ((window as any).addCoordinateToStructure) {
          (window as any).addCoordinateToStructure(placementMode.structureId, {
            x: voxelX,
            y: voxelY,
            z: voxelZ
          })
        }

        // Complete placement
        onPlacementComplete()
        setCursorPos(null)
        return
      }
      
      // Normal crosshair mode
      setCrosshairPos(prev => ({
        ...prev,
        [orientation]: { 
          x: clampedX, 
          y: clampedY,
          pixelX,
          pixelY
        }
      }))

      // Update voxel coordinates
      if (volumeData) {
        setVoxelCoords(prevCoords => {
          const newCoords = { ...prevCoords }
          switch (orientation) {
            case 'axial':
              newCoords.x = pixelX
              newCoords.y = pixelY
              newCoords.z = currentSlices.axial
              break
            case 'coronal':
              newCoords.x = pixelX
              newCoords.z = volumeData.dims[2] - 1 - pixelY
              newCoords.y = currentSlices.coronal
              break
            case 'sagittal':
              newCoords.y = pixelX
              newCoords.z = volumeData.dims[2] - 1 - pixelY
              newCoords.x = currentSlices.sagittal
              break
          }
          return newCoords
        })
      }
    } else if (e.button === 2) { // Right click - start panning
      e.preventDefault()
      if (!placementActive) {
        setViewStates(prev => ({
          ...prev,
          [orientation]: {
            ...prev[orientation],
            isDragging: true,
            dragStart: { x: e.clientX, y: e.clientY }
          }
        }))
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, orientation: ViewType) => {
    const viewState = viewStates[orientation]
    
    // Handle panning
    if (viewState.isDragging && viewState.dragStart) {
      const deltaX = e.clientX - viewState.dragStart.x
      const deltaY = e.clientY - viewState.dragStart.y
      
      setViewStates(prev => ({
        ...prev,
        [orientation]: {
          ...prev[orientation],
          offsetX: prev[orientation].offsetX + deltaX,
          offsetY: prev[orientation].offsetY + deltaY,
          dragStart: { x: e.clientX, y: e.clientY }
        }
      }))
    }

    // Handle placement mode cursor tracking
    if (placementActive) {
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return

      const imgRect = imgElement.getBoundingClientRect()
      const x = e.clientX - imgRect.left
      const y = e.clientY - imgRect.top

      // Only update if within image bounds
      if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
        setCursorPos({ x: x / imgRect.width, y: y / imgRect.height })
      } else {
        setCursorPos(null)
      }
    }
  }

  const handleMouseUp = (orientation: ViewType) => {
    setViewStates(prev => ({
      ...prev,
      [orientation]: {
        ...prev[orientation],
        isDragging: false,
        dragStart: null
      }
    }))
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>, orientation: ViewType) => {
    e.preventDefault()
    
    // Check if Ctrl/Cmd is pressed for zoom
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      handleZoom(orientation, delta)
    } else {
      // Navigate slices with mouse wheel
      const direction = e.deltaY > 0 ? 'next' : 'prev'
      handleSliceChange(orientation, direction)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!volumeData) return

      // Don't handle shortcuts in placement mode (except ESC)
      if (placementActive && e.key !== 'Escape') return

      switch (e.key) {
        case 'Escape':
          if (placementActive) {
            console.log('❌ Placement cancelled')
            onPlacementComplete()
            setCursorPos(null)
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          handleSliceChange('axial', 'next')
          break
        case 'ArrowDown':
          e.preventDefault()
          handleSliceChange('axial', 'prev')
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleSliceChange('coronal', 'prev')
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSliceChange('coronal', 'next')
          break
        case '1':
          setViewMode('single')
          break
        case '4':
          setViewMode('quad')
          break
        case '3':
          setViewMode('3d')
          break
        case 'm':
        case 'M':
          setViewMode('mosaic')
          break
        case 'c':
        case 'C':
          setSettings(prev => ({ ...prev, crosshair: !prev.crosshair }))
          break
        case 'r':
        case 'R':
          handleResetView('axial')
          handleResetView('coronal')
          handleResetView('sagittal')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleSliceChange, volumeData, placementActive, onPlacementComplete])

  const handleSettingChange = (key: keyof ViewSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const renderSliceView = (orientation: ViewType) => {
    const slices = allSlices[orientation]
    const currentSlice = currentSlices[orientation]
    
    if (slices.length === 0 || !slices[currentSlice]?.canvas) {
      return (
        <div className="slice-placeholder">
          <div className="loading-spinner"></div>
          <span>Loading {orientation}</span>
        </div>
      )
    }

    const slice = slices[currentSlice]
    const canvas = slice.canvas
    const dataUrl = canvas.toDataURL()
    const viewState = viewStates[orientation]
    const crosshair = crosshairPos[orientation]

    const actualWidth = slice.actualWidth || slice.width
    const actualHeight = slice.actualHeight || slice.height

    // Determine cursor style and color
    const cursorStyle = placementActive ? 'crosshair' : (viewState.isDragging ? 'grabbing' : (viewState.scale > 1 ? 'grab' : 'crosshair'))
    const crosshairColor = placementActive && placementMode.color ? placementMode.color : '#7ddb94'

    return (
      <div 
        className="slice-viewer-container"
        onMouseDown={(e) => handleMouseDown(e, orientation)}
        onMouseMove={(e) => handleMouseMove(e, orientation)}
        onMouseUp={() => handleMouseUp(orientation)}
        onMouseLeave={() => {
          handleMouseUp(orientation)
          if (placementActive) setCursorPos(null)
        }}
        onWheel={(e) => handleWheel(e, orientation)}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          cursor: cursorStyle
        }}
      >
        {placementActive && (
          <div className="placement-overlay">
            <div className="placement-message">
              🎯 Click to place coordinate (ESC to cancel)
            </div>
          </div>
        )}
        
        <div className="slice-viewer-wrapper">
          <div 
            className="slice-image-holder"
            style={{
              transform: `scale(${viewState.scale}) translate(${viewState.offsetX / viewState.scale}px, ${viewState.offsetY / viewState.scale}px)`,
              transformOrigin: 'center center',
              position: 'relative',
              display: 'inline-block'
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={dataUrl} 
                alt={`${orientation} slice ${currentSlice + 1}`}
                className="slice-image"
                style={{
                  filter: `brightness(${settings.brightness * 2}) contrast(${settings.contrast * 2})`,
                  opacity: settings.opacity,
                  width: `${actualWidth}px`,
                  height: `${actualHeight}px`,
                  imageRendering: 'pixelated',
                  display: 'block'
                }}
                draggable={false}
              />
              
              {/* Show crosshair (normal mode) or placement cursor (placement mode) */}
              {settings.crosshair && (
                <div 
                  className="crosshair-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${actualWidth}px`,
                    height: `${actualHeight}px`,
                    pointerEvents: 'none'
                  }}
                >
                  {placementActive && cursorPos ? (
                    // Placement mode cursor
                    <>
                      <div 
                        className="crosshair-horizontal placement-cursor" 
                        style={{ 
                          top: `${cursorPos.y * actualHeight}px`,
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: '2px',
                          backgroundColor: crosshairColor,
                          boxShadow: `0 0 8px ${crosshairColor}`,
                          transform: 'translateY(-1px)',
                          opacity: 0.9
                        }}
                      />
                      <div 
                        className="crosshair-vertical placement-cursor" 
                        style={{ 
                          left: `${cursorPos.x * actualWidth}px`,
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          width: '2px',
                          backgroundColor: crosshairColor,
                          boxShadow: `0 0 8px ${crosshairColor}`,
                          transform: 'translateX(-1px)',
                          opacity: 0.9
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: `${cursorPos.x * actualWidth}px`,
                          top: `${cursorPos.y * actualHeight}px`,
                          width: '10px',
                          height: '10px',
                          backgroundColor: crosshairColor,
                          borderRadius: '50%',
                          transform: 'translate(-50%, -50%)',
                          boxShadow: `0 0 10px ${crosshairColor}`,
                          border: '2px solid rgba(255, 255, 255, 0.9)',
                          animation: 'pulseDot 1.5s ease-in-out infinite'
                        }}
                      />
                    </>
                  ) : (
                    // Normal crosshair
                    <>
                      <div 
                        className="crosshair-horizontal" 
                        style={{ 
                          top: `${crosshair.y * actualHeight}px`,
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: '1px',
                          backgroundColor: crosshairColor,
                          boxShadow: `0 0 4px ${crosshairColor}`,
                          transform: 'translateY(-0.5px)'
                        }}
                      />
                      <div 
                        className="crosshair-vertical" 
                        style={{ 
                          left: `${crosshair.x * actualWidth}px`,
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          width: '1px',
                          backgroundColor: crosshairColor,
                          boxShadow: `0 0 4px ${crosshairColor}`,
                          transform: 'translateX(-0.5px)'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: `${crosshair.x * actualWidth}px`,
                          top: `${crosshair.y * actualHeight}px`,
                          width: '5px',
                          height: '5px',
                          backgroundColor: crosshairColor,
                          borderRadius: '50%',
                          transform: 'translate(-50%, -50%)',
                          boxShadow: `0 0 6px ${crosshairColor}`,
                          border: '1px solid rgba(255, 255, 255, 0.8)'
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Slice Navigation Controls */}
        <div className="slice-controls">
          <button 
            className="slice-nav-btn"
            onClick={(e) => { e.stopPropagation(); handleSliceChange(orientation, 'prev'); }}
            disabled={currentSlice === 0}
          >
            <FiChevronLeft size={14} />
          </button>
          <span className="slice-counter">
            {currentSlice + 1}/{slices.length}
          </span>
          <button 
            className="slice-nav-btn"
            onClick={(e) => { e.stopPropagation(); handleSliceChange(orientation, 'next'); }}
            disabled={currentSlice === slices.length - 1}
          >
            <FiChevronRight size={14} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button 
            className="zoom-btn"
            onClick={(e) => { e.stopPropagation(); handleZoom(orientation, 0.2); }}
            title="Zoom In"
          >
            <FiZoomIn size={14} />
          </button>
          <span className="zoom-level">{Math.round(viewState.scale * 100)}%</span>
          <button 
            className="zoom-btn"
            onClick={(e) => { e.stopPropagation(); handleZoom(orientation, -0.2); }}
            title="Zoom Out"
          >
            <FiZoomOut size={14} />
          </button>
          <button 
            className="zoom-btn"
            onClick={(e) => { e.stopPropagation(); handleResetView(orientation); }}
            title="Reset View"
          >
            <FiRotateCw size={14} />
          </button>
        </div>

        {/* Dimension Info */}
        <div className="dimension-info">
          {actualWidth}×{actualHeight}px
        </div>

        {/* Pixel Coordinates Display */}
        <div className="pixel-coords-info">
          Pixel: ({crosshair.pixelX}, {crosshair.pixelY})
        </div>
      </div>
    )
  }

  const renderMosaicView = () => {
    const axialSlices = allSlices.axial
    const itemsPerRow = 6
    const totalItems = Math.min(30, axialSlices.length)
    const startIndex = Math.max(0, currentSlices.axial - Math.floor(totalItems / 2))
    
    return (
      <div className="mosaic-view">
        <div className="mosaic-header">
          <h3>Axial Slices Overview</h3>
          <span>Showing {totalItems} of {axialSlices.length} slices</span>
        </div>
        <div className="mosaic-grid">
          {Array.from({ length: totalItems }, (_, i) => {
            const sliceIndex = startIndex + i
            if (sliceIndex >= axialSlices.length) return null
            
            const slice = axialSlices[sliceIndex]
            const isActive = sliceIndex === currentSlices.axial
            
            return (
              <div 
                key={sliceIndex} 
                className={`mosaic-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentSlices(prev => ({ ...prev, axial: sliceIndex }))}
              >
                {slice?.canvas && (
                  <img 
                    src={slice.canvas.toDataURL()} 
                    alt={`Axial slice ${sliceIndex + 1}`}
                    className="mosaic-image"
                  />
                )}
                <div className="mosaic-label">{sliceIndex + 1}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="advanced-mri-viewer">
        <div className="viewer-topbar">
          <div className="topbar-left">
            <span className="viewer-title">MRI Viewer</span>
          </div>
        </div>
        <div className="viewer-content">
          <div className="loading-viewer">
            <div className="loading-spinner large"></div>
            <p>Loading MRI viewer...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!volumeData) {
    return (
      <div className="advanced-mri-viewer">
        <div className="viewer-topbar">
          <div className="topbar-left">
            <span className="viewer-title">MRI Viewer</span>
          </div>
        </div>
        <div className="viewer-content">
          <div className="loading-viewer">
            <p style={{ color: '#ff6b6b' }}>⚠️ No MRI data loaded</p>
            <p style={{ color: '#999', fontSize: '0.8rem' }}>
              Please ensure brain.nii.gz is in the public folder
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="advanced-mri-viewer">
      {/* Compact Topbar */}
      <div className="viewer-topbar">
        <div className="topbar-left">
          <span className="viewer-title">MRI Viewer</span>
          {volumeData && (
            <>
              <span className="volume-dims">
                {volumeData.dims[0]}×{volumeData.dims[1]}×{volumeData.dims[2]}
              </span>
              <span className="voxel-coords">
                Voxel: ({voxelCoords.x}, {voxelCoords.y}, {voxelCoords.z})
              </span>
            </>
          )}
        </div>
        
        <div className="topbar-center">
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'single' ? 'active' : ''}`}
              onClick={() => setViewMode('single')}
              title="Single view (1)"
            >
              <FiSquare size={14} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'quad' ? 'active' : ''}`}
              onClick={() => setViewMode('quad')}
              title="4-Panel view (4)"
            >
              <FiGrid size={14} />
            </button>
            <button 
              className={`view-btn ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
              title="3D view (3)"
            >
              <FiLayers size={14} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'mosaic' ? 'active' : ''}`}
              onClick={() => setViewMode('mosaic')}
              title="Mosaic view (M)"
            >
              <FiEye size={14} />
            </button>
          </div>
        </div>
        
        <div className="topbar-right">
          <button 
            className={`settings-btn ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <FiSettings size={16} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-row">
            <label>Brightness:</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.brightness}
              onChange={(e) => handleSettingChange('brightness', parseFloat(e.target.value))}
            />
            <span>{Math.round(settings.brightness * 100)}%</span>
          </div>
          <div className="settings-row">
            <label>Contrast:</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.contrast}
              onChange={(e) => handleSettingChange('contrast', parseFloat(e.target.value))}
            />
            <span>{Math.round(settings.contrast * 100)}%</span>
          </div>
          <div className="settings-row">
            <label>Crosshair (C):</label>
            <input 
              type="checkbox" 
              checked={settings.crosshair}
              onChange={(e) => handleSettingChange('crosshair', e.target.checked)}
            />
          </div>
        </div>
      )}

      {/* Viewer Content */}
      <div className="viewer-content" ref={containerRef}>
        {viewMode === 'single' && (
          <div className="single-view">
            {renderSliceView('axial')}
          </div>
        )}

        {viewMode === 'quad' && (
          <div className="quad-view-columns">
            {/* Column 1: Axial */}
            <div className="quad-column">
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Axial View</span>
                  <FiMove size={12} style={{ opacity: 0.6 }} />
                </div>
                {renderSliceView('axial')}
              </div>
            </div>
            
            {/* Column 2: Coronal */}
            <div className="quad-column">
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Coronal View</span>
                  <FiMove size={12} style={{ opacity: 0.6 }} />
                </div>
                {renderSliceView('coronal')}
              </div>
            </div>
            
            {/* Column 3: Sagittal */}
            <div className="quad-column">
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Sagittal View</span>
                  <FiMove size={12} style={{ opacity: 0.6 }} />
                </div>
                {renderSliceView('sagittal')}
              </div>
            </div>
            
            {/* Column 4: 3D View */}
            <div className="quad-column">
              <div className="quad-panel">
                <div className="panel-header">
                  <span>3D Render</span>
                  <FiMaximize2 size={12} style={{ opacity: 0.6 }} />
                </div>
                <div className="threed-container">
                  <canvas 
                    ref={canvas3DRef}
                    className="niivue-canvas"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === '3d' && (
          <div className="threed-view">
            <canvas 
              ref={canvas3DRef}
              className="niivue-canvas"
            />
          </div>
        )}

        {viewMode === 'mosaic' && renderMosaicView()}
      </div>

      {/* Shortcuts info */}
      <div className="shortcuts-info">
        {placementActive 
          ? '🎯 Placement Mode: Click to place | ESC to cancel'
          : 'Left Click: Crosshair | Right Click: Pan | Wheel: Slices | Ctrl+Wheel: Zoom | R: Reset | 1,4,3,M: Views'
        }
      </div>
    </div>
  )
}

export default AdvancedMRIViewer