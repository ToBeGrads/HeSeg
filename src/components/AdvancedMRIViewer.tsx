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
    isEditing: boolean
    editingCoordinateIndex: number | null
    currentCoordinate: { x: number, y: number, z: number } | null
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
    axial: { scale: 1, offsetX: 0, offsetY: 0 },
    coronal: { scale: 1, offsetX: 0, offsetY: 0 },
    sagittal: { scale: 1, offsetX: 0, offsetY: 0 }
  })
  
  const [crosshairPos, setCrosshairPos] = useState<Record<ViewType, CrosshairPosition>>({
    axial: { x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 },
    coronal: { x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 },
    sagittal: { x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 }
  })

  const [voxelCoords, setVoxelCoords] = useState<VoxelCoordinates>({ x: 0, y: 0, z: 0 })
  
  // Placement mode state
  const [placementActive, setPlacementActive] = useState(false)
  
  // Preview coordinate state
  const [previewCoordinate, setPreviewCoordinate] = useState<{
    x: number
    y: number
    z: number
    orientation: ViewType
  } | null>(null)
  
  // Hover crosshair for placement mode (before clicking)
  const [hoverCrosshair, setHoverCrosshair] = useState<Record<ViewType, { x: number, y: number } | null>>({
    axial: null,
    coronal: null,
    sagittal: null
  })
  
  // Panning state
  const [isPanning, setIsPanning] = useState<Record<ViewType, boolean>>({
    axial: false,
    coronal: false,
    sagittal: false
  })

  const [panStart, setPanStart] = useState<Record<ViewType, { x: number, y: number } | null>>({
    axial: null,
    coronal: null,
    sagittal: null
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const niivueRef = useRef<Niivue | null>(null)
  const canvas3DRef = useRef<HTMLCanvasElement>(null)

  // Update placement state when mode changes
  useEffect(() => {
    setPlacementActive(placementMode.active)
    if (!placementMode.active) {
      setPreviewCoordinate(null)
      setHoverCrosshair({
        axial: null,
        coronal: null,
        sagittal: null
      })
    } else {
      if (placementMode.isEditing && placementMode.currentCoordinate) {
        console.log('✏️ Edit mode activated for coordinate:', placementMode.currentCoordinate)
        // Set the preview coordinate immediately for editing
        setPreviewCoordinate({
          x: placementMode.currentCoordinate.x,
          y: placementMode.currentCoordinate.y,
          z: placementMode.currentCoordinate.z,
          orientation: 'axial' // Default, will be updated based on click
        })
      } else {
        console.log('🎯 Placement mode activated with color:', placementMode.color)
      }
    }
  }, [placementMode.active, placementMode.color, placementMode.isEditing, placementMode.currentCoordinate])

  // Initialize NiiVue for 3D panel
  useEffect(() => {
    if (canvas3DRef.current && volumeData && (viewMode === 'quad' || viewMode === '3d')) {
      const initializeNiiVue = async () => {
        try {
          if (niivueRef.current) {
            niivueRef.current.updateGLVolume()
            return
          }

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
      [orientation]: { scale: 1, offsetX: 0, offsetY: 0 }
    }))
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, orientation: ViewType) => {
    // Check if click is on a control element
    const target = e.target as HTMLElement
    if (target.closest('.slice-controls') || 
        target.closest('.zoom-controls') || 
        target.closest('.dimension-info') || 
        target.closest('.pixel-coords-info') ||
        target.closest('.placement-overlay') ||
        target.closest('.preview-controls-bottom')) {
      return
    }

    if (e.button === 0) { // Left click
      e.preventDefault()
      
      // Get the image element
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return

      const imgRect = imgElement.getBoundingClientRect()
      
      // Check if click is on the image
      const clickX = e.clientX - imgRect.left
      const clickY = e.clientY - imgRect.top
      
      if (clickX < 0 || clickX > imgRect.width || clickY < 0 || clickY > imgRect.height) {
        return
      }
      
      // Convert to normalized coordinates
      const normalizedX = clickX / imgRect.width
      const normalizedY = clickY / imgRect.height
      
      const clampedX = Math.max(0, Math.min(1, normalizedX))
      const clampedY = Math.max(0, Math.min(1, normalizedY))
      
      // Calculate pixel coordinates
      const slice = allSlices[orientation][currentSlices[orientation]]
      const pixelX = Math.floor(clampedX * slice.actualWidth)
      const pixelY = Math.floor(clampedY * slice.actualHeight)
      
      // Update crosshair position
      setCrosshairPos(prev => ({
        ...prev,
        [orientation]: { 
          x: clampedX, 
          y: clampedY,
          pixelX,
          pixelY
        }
      }))
      
      // Check if in placement mode
      if (placementActive && placementMode.structureId) {
        // Calculate voxel coordinates
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

        console.log(`📍 Preview coordinate at: (${voxelX}, ${voxelY}, ${voxelZ})`)
        
        // Set preview coordinate
        setPreviewCoordinate({
          x: voxelX,
          y: voxelY,
          z: voxelZ,
          orientation
        })

        // Only zoom if current zoom is less than 2.5x
        const currentScale = viewStates[orientation].scale
        if (currentScale < 2.5) {
          const targetZoom = 2.5
          setViewStates(prev => ({
            ...prev,
            [orientation]: {
              scale: targetZoom,
              offsetX: (0.5 - clampedX) * imgRect.width * (targetZoom - 1),
              offsetY: (0.5 - clampedY) * imgRect.height * (targetZoom - 1)
            }
          }))
        }
        
        // Clear hover crosshair
        setHoverCrosshair(prev => ({
          ...prev,
          [orientation]: null
        }))
        
        return
      }

      // Normal mode - update voxel coordinates
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
    } else if (e.button === 2) { // Right click - start panning (only when zoomed)
      e.preventDefault()
      const viewState = viewStates[orientation]
      
      // Only allow panning when zoomed in
      if (viewState.scale > 1) {
        setIsPanning(prev => ({ ...prev, [orientation]: true }))
        setPanStart(prev => ({ ...prev, [orientation]: { x: e.clientX, y: e.clientY } }))
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, orientation: ViewType) => {
    // Handle panning when right mouse button is held
    if (isPanning[orientation] && panStart[orientation]) {
      const deltaX = e.clientX - panStart[orientation]!.x
      const deltaY = e.clientY - panStart[orientation]!.y
      
      setViewStates(prev => ({
        ...prev,
        [orientation]: {
          ...prev[orientation],
          offsetX: prev[orientation].offsetX + deltaX,
          offsetY: prev[orientation].offsetY + deltaY
        }
      }))
      
      setPanStart(prev => ({
        ...prev,
        [orientation]: { x: e.clientX, y: e.clientY }
      }))
      
      return
    }
    
    // Only show hover crosshair in placement mode BEFORE clicking
    if (placementActive && !previewCoordinate) {
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return

      const imgRect = imgElement.getBoundingClientRect()
      const x = e.clientX - imgRect.left
      const y = e.clientY - imgRect.top

      if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
        const normalizedX = x / imgRect.width
        const normalizedY = y / imgRect.height
        
        setHoverCrosshair(prev => ({
          ...prev,
          [orientation]: { x: normalizedX, y: normalizedY }
        }))
      } else {
        setHoverCrosshair(prev => ({
          ...prev,
          [orientation]: null
        }))
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>, orientation: ViewType) => {
    // Stop panning
    setIsPanning(prev => ({ ...prev, [orientation]: false }))
    setPanStart(prev => ({ ...prev, [orientation]: null }))
  }

  const handleMouseLeave = (orientation: ViewType) => {
    // Stop panning when mouse leaves
    setIsPanning(prev => ({ ...prev, [orientation]: false }))
    setPanStart(prev => ({ ...prev, [orientation]: null }))
    
    // Clear hover crosshair when mouse leaves
    if (placementActive && !previewCoordinate) {
      setHoverCrosshair(prev => ({
        ...prev,
        [orientation]: null
      }))
    }
  }
  

// Replace handleWheel with this simpler version:
const handleWheel = (e: React.WheelEvent<HTMLDivElement>, orientation: ViewType) => {
  // Check if cursor is actually over the image
  const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
  
  if (!imgElement) return
  
  const imgRect = imgElement.getBoundingClientRect()
  const mouseX = e.clientX
  const mouseY = e.clientY
  
  // Check if mouse is within image bounds
  const isOverImage = (
    mouseX >= imgRect.left &&
    mouseX <= imgRect.right &&
    mouseY >= imgRect.top &&
    mouseY <= imgRect.bottom
  )
  
  if (!isOverImage) {
    return // Don't process wheel events outside the image
  }
  
  // Check if Ctrl or Cmd is pressed for zoom
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    handleZoom(orientation, delta)
    return
  }
  
  // Navigate slices in normal mode (no Ctrl)
  if (!placementActive) {
    e.preventDefault()
    e.stopPropagation()
    const direction = e.deltaY > 0 ? 'next' : 'prev'
    handleSliceChange(orientation, direction)
  }
}

  const handleCancelCoordinate = () => {
    console.log('❌ Coordinate placement cancelled')
    setPreviewCoordinate(null)
    onPlacementComplete()
    
    // Reset zoom only if it was auto-zoomed to 2.5x
    Object.keys(viewStates).forEach((key) => {
      const orientation = key as ViewType
      if (viewStates[orientation].scale === 2.5) {
        handleResetView(orientation)
      }
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!volumeData) return

      switch (e.key) {
        case 'Escape':
          if (placementActive || previewCoordinate) {
            handleCancelCoordinate()
          }
          break
        case 'Enter':
          if (previewCoordinate) {
            handleSaveCoordinate()
          }
          break
        case 'ArrowUp':
          if (!placementActive && !previewCoordinate) {
            e.preventDefault()
            handleSliceChange('axial', 'next')
          }
          break
        case 'ArrowDown':
          if (!placementActive && !previewCoordinate) {
            e.preventDefault()
            handleSliceChange('axial', 'prev')
          }
          break
        case 'ArrowLeft':
          if (!placementActive && !previewCoordinate) {
            e.preventDefault()
            handleSliceChange('coronal', 'prev')
          }
          break
        case 'ArrowRight':
          if (!placementActive && !previewCoordinate) {
            e.preventDefault()
            handleSliceChange('coronal', 'next')
          }
          break
        case '1':
          if (!placementActive) setViewMode('single')
          break
        case '4':
          if (!placementActive) setViewMode('quad')
          break
        case '3':
          if (!placementActive) setViewMode('3d')
          break
        case 'm':
        case 'M':
          if (!placementActive) setViewMode('mosaic')
          break
        case 'c':
        case 'C':
          if (!placementActive) setSettings(prev => ({ ...prev, crosshair: !prev.crosshair }))
          break
        case 'r':
        case 'R':
          if (!placementActive) {
            handleResetView('axial')
            handleResetView('coronal')
            handleResetView('sagittal')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleSliceChange, volumeData, placementActive, previewCoordinate])

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
    const hover = hoverCrosshair[orientation]

    const actualWidth = slice.actualWidth || slice.width
    const actualHeight = slice.actualHeight || slice.height

    const crosshairColor = placementActive && placementMode.color ? placementMode.color : '#7ddb94'

    // Determine cursor based on state
    let cursorStyle = 'default'
    if (placementActive && !previewCoordinate) {
      cursorStyle = 'crosshair'
    } else if (isPanning[orientation]) {
      cursorStyle = 'grabbing'
    } else if (viewState.scale > 1) {
      cursorStyle = 'grab'
    }

    return (
      <div 
        className="slice-viewer-container"
        onMouseDown={(e) => handleMouseDown(e, orientation)}
        onMouseMove={(e) => handleMouseMove(e, orientation)}
        onMouseUp={(e) => handleMouseUp(e, orientation)}
        onMouseLeave={() => handleMouseLeave(orientation)}
        onWheel={(e) => handleWheel(e, orientation)}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          cursor: cursorStyle
        }}
      >
        {placementActive && !previewCoordinate && (
          <div className="placement-overlay">
            <div className="placement-message">
              {placementMode.isEditing 
                ? '✏️ Edit Mode: Click new position for coordinate' 
                : 'Move mouse and click to select point'}
            </div>
            <button 
              className="cancel-placement-btn"
              onClick={(e) => {
                e.stopPropagation()
                handleCancelCoordinate()
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {previewCoordinate && (
          <div className="preview-controls-bottom">
            <div className="preview-info-bar">
              <span className="preview-label">
                {placementMode.isEditing ? 'Edit Point:' : 'Preview Point:'}
              </span>
              <span className="preview-coord-display">
                X: {previewCoordinate.x}, Y: {previewCoordinate.y}, Z: {previewCoordinate.z}
              </span>
            </div>
            <div className="preview-actions-bar">
              <button 
                className="preview-btn save-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSaveCoordinate()
                }}
              >
                {placementMode.isEditing ? 'Update' : 'Save'}
              </button>
              <button 
                className="preview-btn cancel-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancelCoordinate()
                }}
              >
                Cancel
              </button>
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
                  display: 'block',
                  pointerEvents: 'auto'
                }}
                draggable={false}
              />
              
              {/* Crosshair */}
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
                  {/* Show hover crosshair in placement mode BEFORE clicking */}
                  {placementActive && !previewCoordinate && hover ? (
                    <>
                      <div 
                        className="crosshair-horizontal" 
                        style={{ 
                          top: `${hover.y * actualHeight}px`,
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: '0.5px',
                          backgroundColor: crosshairColor,
                          boxShadow: `0 0 3px ${crosshairColor}`,
                          opacity: 0.9
                        }}
                      />
                      <div 
                        className="crosshair-vertical" 
                        style={{ 
                          left: `${hover.x * actualWidth}px`,
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          width: '0.5px',
                          backgroundColor: crosshairColor,
                          boxShadow: `0 0 3px ${crosshairColor}`,
                          opacity: 0.9
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: `${hover.x * actualWidth}px`,
                          top: `${hover.y * actualHeight}px`,
                          width: '2px',
                          height: '2px',
                          backgroundColor: crosshairColor,
                          borderRadius: '50%',
                          transform: 'translate(-50%, -50%)',
                          boxShadow: `0 0 4px ${crosshairColor}`,
                          border: '0.5px solid rgba(255, 255, 255, 0.9)',
                          opacity: 0.95
                        }}
                      />
                    </>
                  ) : (
                    /* Normal crosshair or preview mode */
                    <>
                      <div 
                        className="crosshair-horizontal" 
                        style={{ 
                          top: `${crosshair.y * actualHeight}px`,
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: '0.5px',
                          backgroundColor: previewCoordinate ? crosshairColor : '#7ddb94',
                          boxShadow: previewCoordinate ? `0 0 3px ${crosshairColor}` : '0 0 2px #7ddb94',
                          opacity: 0.8
                        }}
                      />
                      <div 
                        className="crosshair-vertical" 
                        style={{ 
                          left: `${crosshair.x * actualWidth}px`,
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          width: '0.5px',
                          backgroundColor: previewCoordinate ? crosshairColor : '#7ddb94',
                          boxShadow: previewCoordinate ? `0 0 3px ${crosshairColor}` : '0 0 2px #7ddb94',
                          opacity: 0.8
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: `${crosshair.x * actualWidth}px`,
                          top: `${crosshair.y * actualHeight}px`,
                          width: '2px',
                          height: '2px',
                          backgroundColor: previewCoordinate ? crosshairColor : '#7ddb94',
                          borderRadius: '50%',
                          transform: 'translate(-50%, -50%)',
                          boxShadow: previewCoordinate ? `0 0 4px ${crosshairColor}` : '0 0 3px #7ddb94',
                          border: '0.5px solid rgba(255, 255, 255, 0.9)',
                          opacity: 0.9
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
            disabled={currentSlice === 0 || placementActive}
          >
            <FiChevronLeft size={14} />
          </button>
          <span className="slice-counter">
            {currentSlice + 1}/{slices.length}
          </span>
          <button 
            className="slice-nav-btn"
            onClick={(e) => { e.stopPropagation(); handleSliceChange(orientation, 'next'); }}
            disabled={currentSlice === slices.length - 1 || placementActive}
          >
            <FiChevronRight size={14} />
          </button>
        </div>

        {/* Zoom Controls - Allow zoom during preview */}
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
          {actualWidth}×{actualHeight}
        </div>

        {/* Pixel Coordinates Display */}
        <div className="pixel-coords-info">
          ({crosshair.pixelX}, {crosshair.pixelY})
        </div>

        {/* Pan hint when zoomed */}
        {viewState.scale > 1 && !placementActive && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#7ddb94',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            pointerEvents: 'none',
            opacity: isPanning[orientation] ? 0.9 : 0,
            transition: 'opacity 0.2s ease',
            zIndex: 5,
            whiteSpace: 'nowrap'
          }}>
            🖐️ Right-click and drag to pan
          </div>
        )}
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
            <div className="quad-column">
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Axial View</span>
                  <FiMove size={12} style={{ opacity: 0.6 }} />
                </div>
                {renderSliceView('axial')}
              </div>
            </div>
            
            <div className="quad-column">
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Coronal View</span>
                  <FiMove size={12} style={{ opacity: 0.6 }} />
                </div>
                {renderSliceView('coronal')}
              </div>
            </div>
            
            <div className="quad-column">
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Sagittal View</span>
                  <FiMove size={12} style={{ opacity: 0.6 }} />
                </div>
                {renderSliceView('sagittal')}
              </div>
            </div>
            
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
        {placementActive && previewCoordinate
          ? `✏️ ${placementMode.isEditing ? 'Edit' : 'Preview'} Mode: Zoom with Ctrl+Wheel or buttons | Enter=${placementMode.isEditing ? 'Update' : 'Save'} | ESC=Cancel`
          : placementActive 
          ? `🎯 ${placementMode.isEditing ? 'Edit' : 'Placement'} Mode: Move mouse to position | Click to select | ESC=Cancel`
          : 'Left Click: Set Crosshair | Right-Click+Drag: Pan | Wheel: Navigate | Ctrl+Wheel: Zoom | Arrow Keys: Navigate'
        }
      </div>
    </div>
  )
}

export default AdvancedMRIViewer