import { useState, useEffect, useRef, useCallback } from 'react'
import { FiGrid, FiSquare, FiChevronLeft, FiChevronRight, FiSettings, FiLayers, FiZoomIn, FiZoomOut, FiRotateCw, FiEye, FiMaximize2, FiMove, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import './AdvancedMRIViewer.css'
import { MedicalImageLoader } from '../utils/medicalImageLoader'
import { Niivue } from '@niivue/niivue'
import SegmentationToolbar from './SegmentationToolbar'
import { MaskOverlay } from './MaskOverlay'
import { maskManager } from '../utils/MaskManager'
import { useMRI } from "../Context/MRIcontext"

// Import stores
import { useVolumeStore } from '../store/useVolumeStore'
import { useStructureStore } from '../store/useStructureStore'
import { usePlacementStore } from '../store/usePlacementStore'
import { useMaskStore } from '../store/useMaskStore'
import { useViewerStore } from '../store/useViewerStore'

type ViewType = 'axial' | 'coronal' | 'sagittal'

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

function AdvancedMRIViewer() {
  // ========================
  // GET STATE FROM STORES
  // ========================
  const volumeData = useVolumeStore((state) => state.volumeData)
  const structures = useStructureStore((state) => state.structures)
  const { addCoordinate } = useStructureStore()
  
  const {
    active: placementActive,
    structureId: placementStructureId,
    color: placementColor,
    isEditing: isEditingCoordinate,
    currentCoordinate: placementCurrentCoordinate,
    completePlacement,
    cancelPlacement
  } = usePlacementStore()
  
  const {
    activeStructureId,
    maskVisibility,
    tool,
    brushSize,
    setTool,
    setBrushSize,
    setActiveStructure
  } = useMaskStore()
  
  const {
    viewMode,
    currentSlices,
    viewStates,
    settings,
    showSettings,
    jumpToCoord,
    setViewMode,
    setCurrentSlice,
    updateViewState,
    resetViewState,
    updateSetting,
    toggleSettings
  } = useViewerStore()

  // ========================
  // LOCAL STATE (viewer-specific)
  // ========================
  const [viewOrientation, setViewOrientation] = useState<ViewType>("axial")
  const [allSlices, setAllSlices] = useState<{
    axial: any[]
    coronal: any[]
    sagittal: any[]
  }>({
    axial: [],
    coronal: [],
    sagittal: []
  })
  const [loading, setLoading] = useState(false)
  
  const [isPanning, setIsPanning] = useState<Record<ViewType, boolean>>({
    axial: false,
    coronal: false,
    sagittal: false
  })
  
  const [panStart, setPanStart] = useState<Record<ViewType, { x: number; y: number } | null>>({
    axial: null,
    coronal: null,
    sagittal: null
  })

  const [previewCoordinate, setPreviewCoordinate] = useState<{
    x: number
    y: number
    z: number
    orientation: ViewType
  } | null>(null)

  const [crosshairPos, setCrosshairPos] = useState<Record<ViewType, CrosshairPosition>>({
    axial: { x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 },
    coronal: { x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 },
    sagittal: { x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 }
  })

  const [voxelCoords, setVoxelCoords] = useState<VoxelCoordinates>({
    x: 0,
    y: 0,
    z: 0
  })

  const [hoverCrosshair, setHoverCrosshair] = useState<Record<ViewType, { x: number; y: number } | null>>({
    axial: null,
    coronal: null,
    sagittal: null
  })

  const [isDrawing, setIsDrawing] = useState(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const [, forceUpdate] = useState({})

  const containerRef = useRef<HTMLDivElement>(null)
  const niivueRef = useRef<Niivue | null>(null)
  const canvas3DRef = useRef<HTMLCanvasElement>(null)
  const { setCurrentSliceURL } = useMRI()

  // ========================
  // EFFECTS
  // ========================

  // Jump to coordinate
  useEffect(() => {
    if (jumpToCoord && volumeData) {
      console.log('🚀 Jumping to coordinate:', jumpToCoord)
      
      setCurrentSlice('axial', jumpToCoord.z)
      setCurrentSlice('coronal', jumpToCoord.y)
      setCurrentSlice('sagittal', jumpToCoord.x)
      
      const axialSlice = allSlices.axial[jumpToCoord.z]
      const coronalSlice = allSlices.coronal[jumpToCoord.y]
      const sagittalSlice = allSlices.sagittal[jumpToCoord.x]
      
      if (axialSlice) {
        const normalizedX = jumpToCoord.x / volumeData.dims[0]
        const normalizedY = jumpToCoord.y / volumeData.dims[1]
        
        setCrosshairPos(prev => ({
          ...prev,
          axial: {
            x: normalizedX,
            y: normalizedY,
            pixelX: jumpToCoord.x,
            pixelY: jumpToCoord.y
          }
        }))
      }
      
      if (coronalSlice) {
        const normalizedX = jumpToCoord.x / volumeData.dims[0]
        const normalizedZ = (volumeData.dims[2] - 1 - jumpToCoord.z) / volumeData.dims[2]
        
        setCrosshairPos(prev => ({
          ...prev,
          coronal: {
            x: normalizedX,
            y: normalizedZ,
            pixelX: jumpToCoord.x,
            pixelY: volumeData.dims[2] - 1 - jumpToCoord.z
          }
        }))
      }
      
      if (sagittalSlice) {
        const normalizedY = jumpToCoord.y / volumeData.dims[1]
        const normalizedZ = (volumeData.dims[2] - 1 - jumpToCoord.z) / volumeData.dims[2]
        
        setCrosshairPos(prev => ({
          ...prev,
          sagittal: {
            x: normalizedY,
            y: normalizedZ,
            pixelX: jumpToCoord.y,
            pixelY: volumeData.dims[2] - 1 - jumpToCoord.z
          }
        }))
      }
      
      setVoxelCoords({
        x: jumpToCoord.x,
        y: jumpToCoord.y,
        z: jumpToCoord.z
      })
    }
  }, [jumpToCoord, volumeData, allSlices, setCurrentSlice])

  // Activate mask editing
  useEffect(() => {
    if (activeStructureId && volumeData) {
      console.log('🎨 Activating mask editing for structure:', activeStructureId)
      if (!maskManager.getMask(activeStructureId)) {
        maskManager.createMask(activeStructureId, volumeData.dims)
      }
      setTool('draw')
    }
  }, [activeStructureId, volumeData, setTool])

  // Handle mask updates
  useEffect(() => {
    const handleUpdate = () => {
      forceUpdate({})
    }
    maskManager.on('maskUpdated', handleUpdate)
    return () => {
      maskManager.off('maskUpdated', handleUpdate)
    }
  }, [])

  // Handle placement mode
  useEffect(() => {
    if (placementActive) {
      if (isEditingCoordinate && placementCurrentCoordinate) {
        console.log('✏️ Edit mode activated')
        setPreviewCoordinate({
          x: placementCurrentCoordinate.x,
          y: placementCurrentCoordinate.y,
          z: placementCurrentCoordinate.z,
          orientation: 'axial'
        })
      } else {
        console.log('🎯 Placement mode activated')
      }
    } else {
      setPreviewCoordinate(null)
      setHoverCrosshair({
        axial: null,
        coronal: null,
        sagittal: null
      })
    }
  }, [placementActive, isEditingCoordinate, placementCurrentCoordinate])

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

  // Extract slices when volume loads
  useEffect(() => {
    if (!volumeData) return

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

        const midAxial = Math.floor(axialSlices.length / 2)
        const midCoronal = Math.floor(coronalSlices.length / 2)
        const midSagittal = Math.floor(sagittalSlices.length / 2)

        setCurrentSlice('axial', midAxial)
        setCurrentSlice('coronal', midCoronal)
        setCurrentSlice('sagittal', midSagittal)

        if (volumeData.dims) {
          setVoxelCoords({
            x: Math.floor(volumeData.dims[0] / 2),
            y: Math.floor(volumeData.dims[1] / 2),
            z: Math.floor(volumeData.dims[2] / 2)
          })
        }

        console.log('✅ All slices extracted')
      } catch (error) {
        console.error('❌ Error extracting slices:', error)
      } finally {
        setLoading(false)
      }
    }

    extractAllSlices()
  }, [volumeData, setCurrentSlice])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!volumeData) return

      if (activeStructureId) {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case 'z':
              e.preventDefault()
              handleUndo()
              break
            case 'y':
              e.preventDefault()
              handleRedo()
              break
          }
        } else {
          switch (e.key.toLowerCase()) {
            case 'd':
              setTool('draw')
              break
            case 'e':
              setTool('erase')
              break
            case 'enter':
            case 'escape':
              handleStopEditing()
              break
          }
        }
        return
      }

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
          if (!placementActive) updateSetting('crosshair', !settings.crosshair)
          break
        case 'r':
        case 'R':
          if (!placementActive) {
            resetViewState('axial')
            resetViewState('coronal')
            resetViewState('sagittal')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [volumeData, placementActive, previewCoordinate, activeStructureId, settings.crosshair, setTool, setViewMode, updateSetting, resetViewState])

  // ========================
  // HANDLERS
  // ========================

  const handleSliceChange = useCallback((orientation: ViewType, direction: 'prev' | 'next') => {
    const slices = allSlices[orientation]
    if (slices.length === 0) return

    const current = currentSlices[orientation]
    let newSlice = current

    if (direction === 'next') {
      newSlice = current < slices.length - 1 ? current + 1 : current
    } else {
      newSlice = current > 0 ? current - 1 : current
    }

    if (newSlice !== current) {
      setCurrentSlice(orientation, newSlice)

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
    }
  }, [allSlices, currentSlices, volumeData, setCurrentSlice])

  const handleZoom = (orientation: ViewType, delta: number) => {
    const current = viewStates[orientation]
    const newScale = Math.max(0.5, Math.min(10, current.scale + delta))
    updateViewState(orientation, { scale: newScale })
  }

  const handleResetView = (orientation: ViewType) => {
    resetViewState(orientation)
  }

  const handlePanDirection = (orientation: ViewType, direction: 'up' | 'down' | 'left' | 'right') => {
    const panAmount = 50
    const current = viewStates[orientation]
    updateViewState(orientation, {
      offsetX: current.offsetX + (direction === 'left' ? panAmount : direction === 'right' ? -panAmount : 0),
      offsetY: current.offsetY + (direction === 'up' ? panAmount : direction === 'down' ? -panAmount : 0)
    })
  }

  const drawAtPoint = (pixelX: number, pixelY: number, orientation: ViewType, currentSlice: number) => {
    if (!activeStructureId || !volumeData) return
  
    const value = tool === 'draw' ? 255 : 0
    
    let voxelX = 0, voxelY = 0, voxelZ = 0
  
    switch (orientation) {
      case 'axial':
        voxelX = pixelX
        voxelY = pixelY
        voxelZ = currentSlice
        break
      case 'coronal':
        voxelX = pixelX
        voxelY = currentSlice
        voxelZ = volumeData.dims[2] - 1 - pixelY
        break
      case 'sagittal':
        voxelX = currentSlice
        voxelY = pixelX
        voxelZ = volumeData.dims[2] - 1 - pixelY
        break
    }
    
    maskManager.updateMaskVoxel(activeStructureId, voxelX, voxelY, voxelZ, value, brushSize)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, orientation: ViewType) => {
    const target = e.target as HTMLElement
    if (target.closest('.slice-controls') || 
        target.closest('.zoom-controls') || 
        target.closest('.dimension-info') || 
        target.closest('.pixel-coords-info') ||
        target.closest('.placement-overlay') ||
        target.closest('.preview-controls-bottom') ||
        target.closest('.pan-control')) {
      return
    }
  
    if (activeStructureId && !placementActive) {
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return
      
      const imgRect = imgElement.getBoundingClientRect()
      const x = e.clientX - imgRect.left
      const y = e.clientY - imgRect.top
      
      if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
        const slices = allSlices[orientation]
        const currentSlice = currentSlices[orientation]
        const slice = slices[currentSlice]
        
        const pixelX = Math.floor((x / imgRect.width) * slice.width)
        const pixelY = Math.floor((y / imgRect.height) * slice.height)
        
        maskManager.setCurrentSlice(activeStructureId, currentSlice)
        
        if (!maskManager.canUndo(activeStructureId, currentSlice)) {
          maskManager.saveHistory(activeStructureId, currentSlice)
        }
        
        setIsDrawing(true)
        lastPosRef.current = { x: pixelX, y: pixelY }
        
        drawAtPoint(pixelX, pixelY, orientation, currentSlice)
        
        e.preventDefault()
        return
      }
    }
    
    if (e.button === 0) {
      e.preventDefault()
      
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return
      const imgRect = imgElement.getBoundingClientRect()
      
      const clickX = e.clientX - imgRect.left
      const clickY = e.clientY - imgRect.top

      if (clickX < 0 || clickX > imgRect.width || clickY < 0 || clickY > imgRect.height) {
        return
      }
      
      const normalizedX = clickX / imgRect.width
      const normalizedY = clickY / imgRect.height

      const clampedX = Math.max(0, Math.min(1, normalizedX))
      const clampedY = Math.max(0, Math.min(1, normalizedY))

      const slices = allSlices[orientation]
      const currentSlice = currentSlices[orientation]
      if (!slices[currentSlice]) return

      const slice = slices[currentSlice]
      const pixelX = Math.floor(clampedX * slice.width)
      const pixelY = Math.floor(clampedY * slice.height)

      if (placementActive) {
        if (!volumeData) return

        let voxelX = 0, voxelY = 0, voxelZ = 0

        switch (orientation) {
          case 'axial':
            voxelX = pixelX
            voxelY = pixelY
            voxelZ = currentSlices.axial
            break
          case 'coronal':
            voxelX = pixelX
            voxelZ = volumeData.dims[2] - 1 - pixelY
            voxelY = currentSlices.coronal
            break
          case 'sagittal':
            voxelY = pixelX
            voxelZ = volumeData.dims[2] - 1 - pixelY
            voxelX = currentSlices.sagittal
            break
        }
        
        setPreviewCoordinate({
          x: voxelX,
          y: voxelY,
          z: voxelZ,
          orientation
        })

        const currentScale = viewStates[orientation].scale
        if (currentScale < 2.5) {
          const targetZoom = 2.5
          updateViewState(orientation, {
            scale: targetZoom,
            offsetX: (0.5 - clampedX) * imgRect.width * (targetZoom - 1),
            offsetY: (0.5 - clampedY) * imgRect.height * (targetZoom - 1)
          })
        }

        setCrosshairPos(prev => ({
          ...prev,
          [orientation]: { x: clampedX, y: clampedY, pixelX, pixelY }
        }))

        setHoverCrosshair(prev => ({
          ...prev,
          [orientation]: null
        }))

        return
      }

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

      setCrosshairPos(prev => ({
        ...prev,
        [orientation]: { x: clampedX, y: clampedY, pixelX, pixelY }
      }))
    }

    if (e.button === 2 && viewStates[orientation].scale > 1) {
      e.preventDefault()
      setIsPanning(prev => ({ ...prev, [orientation]: true }))
      setPanStart(prev => ({ ...prev, [orientation]: { x: e.clientX, y: e.clientY } }))
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, orientation: ViewType) => {
    if (activeStructureId && isDrawing && !placementActive) {
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return
      
      const imgRect = imgElement.getBoundingClientRect()
      const x = e.clientX - imgRect.left
      const y = e.clientY - imgRect.top
      
      if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
        const slices = allSlices[orientation]
        const currentSlice = currentSlices[orientation]
        const slice = slices[currentSlice]
        
        const pixelX = Math.floor((x / imgRect.width) * slice.width)
        const pixelY = Math.floor((y / imgRect.height) * slice.height)
        
        if (lastPosRef.current) {
          const dx = pixelX - lastPosRef.current.x
          const dy = pixelY - lastPosRef.current.y
          const steps = Math.max(Math.abs(dx), Math.abs(dy), 1)

          for (let i = 0; i <= steps; i++) {
            const t = i / steps
            const interpX = Math.round(lastPosRef.current.x + dx * t)
            const interpY = Math.round(lastPosRef.current.y + dy * t)
            drawAtPoint(interpX, interpY, orientation, currentSlice)
          }
        }
        
        lastPosRef.current = { x: pixelX, y: pixelY }
        e.preventDefault()
        return
      }
    }

    if (isPanning[orientation] && panStart[orientation]) {
      e.preventDefault()
      const deltaX = e.clientX - panStart[orientation]!.x
      const deltaY = e.clientY - panStart[orientation]!.y

      const current = viewStates[orientation]
      updateViewState(orientation, {
        offsetX: current.offsetX + deltaX,
        offsetY: current.offsetY + deltaY
      })

      setPanStart(prev => ({
        ...prev,
        [orientation]: { x: e.clientX, y: e.clientY }
      }))

      return
    }

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
    if (activeStructureId && isDrawing) {
      const currentSlice = currentSlices[orientation]
      maskManager.setCurrentSlice(activeStructureId, currentSlice)
      maskManager.saveHistory(activeStructureId, currentSlice)
      setIsDrawing(false)
      lastPosRef.current = null
      return
    }
  
    if (isPanning[orientation]) {
      setIsPanning(prev => ({ ...prev, [orientation]: false }))
      setPanStart(prev => ({ ...prev, [orientation]: null }))
    }
  }

  const handleMouseLeave = (orientation: ViewType) => {
    if (activeStructureId && isDrawing) {
      maskManager.saveHistory(activeStructureId)
      setIsDrawing(false)
      lastPosRef.current = null
    }

    if (isPanning[orientation]) {
      setIsPanning(prev => ({ ...prev, [orientation]: false }))
      setPanStart(prev => ({ ...prev, [orientation]: null }))
    }

    if (placementActive && !previewCoordinate) {
      setHoverCrosshair(prev => ({
        ...prev,
        [orientation]: null
      }))
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>, orientation: ViewType) => {
    if (activeStructureId) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        handleZoom(orientation, delta)
      }
      return
    }
  
    const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
    
    if (!imgElement) return
    
    const imgRect = imgElement.getBoundingClientRect()
    const mouseX = e.clientX
    const mouseY = e.clientY
    
    const isOverImage = (
      mouseX >= imgRect.left &&
      mouseX <= imgRect.right &&
      mouseY >= imgRect.top &&
      mouseY <= imgRect.bottom
    )
    
    if (!isOverImage) {
      return
    }
    
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      e.stopPropagation()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      handleZoom(orientation, delta)
      return
    }
    
    if (!placementActive) {
      e.preventDefault()
      e.stopPropagation()
      const delta = e.deltaY > 0 ? 1 : -1
      const slices = allSlices[orientation]
      const current = currentSlices[orientation]
      const newSlice = current + delta
      
      if (newSlice >= 0 && newSlice < slices.length) {
        handleSliceChange(orientation, delta > 0 ? 'next' : 'prev')
      }
    }
  }

  const handleCancelCoordinate = () => {
    console.log('❌ Cancelled')
    setPreviewCoordinate(null)
    completePlacement()
    
    Object.keys(viewStates).forEach((key) => {
      const orientation = key as ViewType
      if (viewStates[orientation].scale === 2.5) {
        resetViewState(orientation)
      }
    })
  }

  const handleSaveCoordinate = () => {
    if (!previewCoordinate || !placementStructureId) return

    console.log('💾 Saving coordinate:', previewCoordinate)

    addCoordinate(placementStructureId, {
      x: previewCoordinate.x,
      y: previewCoordinate.y,
      z: previewCoordinate.z
    })

    setPreviewCoordinate(null)
    completePlacement()

    Object.keys(viewStates).forEach((key) => {
      const orientation = key as ViewType
      if (viewStates[orientation].scale === 2.5) {
        resetViewState(orientation)
      }
    })
  }

  const handleUndo = () => {
    if (activeStructureId) {
      const currentSlice = currentSlices.axial
      maskManager.setCurrentSlice(activeStructureId, currentSlice)
      maskManager.undo(activeStructureId, currentSlice)
    }
  }

  const handleRedo = () => {
    if (activeStructureId) {
      const currentSlice = currentSlices.axial
      maskManager.setCurrentSlice(activeStructureId, currentSlice)
      maskManager.redo(activeStructureId, currentSlice)
    }
  }

  const canUndo = () => {
    if (!activeStructureId) return false
    const currentSlice = currentSlices.axial
    return maskManager.canUndo(activeStructureId, currentSlice)
  }
  
  const canRedo = () => {
    if (!activeStructureId) return false
    const currentSlice = currentSlices.axial
    return maskManager.canRedo(activeStructureId, currentSlice)
  }

  const handleStopEditing = useCallback(() => {
    console.log('✅ Stop editing')
    setActiveStructure(null)
  }, [setActiveStructure])

  // ========================
  // RENDER SLICE VIEW
  // ========================

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
    
    setCurrentSliceURL(canvas.toDataURL("image/png"))
    
    const viewState = viewStates[orientation]
    const crosshair = crosshairPos[orientation]
    const hover = hoverCrosshair[orientation]
    const actualWidth = slice.actualWidth || slice.width
    const actualHeight = slice.actualHeight || slice.height
    const crosshairColor = placementActive && placementColor ? placementColor : '#7ddb94'

    let cursorStyle = 'default'
    if (activeStructureId && !placementActive) {
      cursorStyle = 'crosshair'
    } else if (placementActive && !previewCoordinate) {
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
        style={{ cursor: cursorStyle }}
      >
        {placementActive && !previewCoordinate && (
          <div className="placement-overlay">
            <div className="placement-message">
              {isEditingCoordinate
                ? '✏️ Edit Mode: Click new position'
                : 'Click to select point'}
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
                {isEditingCoordinate ? 'Edit Point:' : 'Preview:'}
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
                {isEditingCoordinate ? 'Update' : 'Save'}
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
      
        <div className="slice-viewer-wrapper" style={{ overflow: 'hidden' }}>
          {viewState.scale > 1 && (
            <>
              <button 
                className="pan-control pan-left"
                onClick={(e) => { 
                  e.stopPropagation()
                  e.preventDefault()
                  handlePanDirection(orientation, 'left')
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <FiChevronLeft size={20} />
              </button>
              <button 
                className="pan-control pan-right"
                onClick={(e) => { 
                  e.stopPropagation()
                  e.preventDefault()
                  handlePanDirection(orientation, 'right')
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <FiChevronRight size={20} />
              </button>
              <button 
                className="pan-control pan-up"
                onClick={(e) => { 
                  e.stopPropagation()
                  e.preventDefault()
                  handlePanDirection(orientation, 'up')
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <FiChevronUp size={20} />
              </button>
              <button 
                className="pan-control pan-down"
                onClick={(e) => { 
                  e.stopPropagation()
                  e.preventDefault()
                  handlePanDirection(orientation, 'down')
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <FiChevronDown size={20} />
              </button>
            </>
          )}
  
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

              {Object.entries(maskVisibility).map(([structureIdStr, visible]) => {
                if (!visible) return null
                
                const structureId = parseInt(structureIdStr)
                const maskSlice = maskManager.getMaskSlice(structureId, orientation, currentSlice)
                if (!maskSlice) return null
                
                const structure = structures.find(s => s.id === structureId)
                const structureColor = structure?.color || '#7ddb94'
                
                return (
                  <MaskOverlay
                    key={`mask-${structureId}-${orientation}`}
                    maskData={maskSlice}
                    width={actualWidth}
                    height={actualHeight}
                    color={structureColor}
                    opacity={0.5}
                    scale={viewState.scale}
                    offsetX={viewState.offsetX}
                    offsetY={viewState.offsetY}
                  />
                )
              })}

              {settings.crosshair && (
                <div className="crosshair-overlay">
                  {hover ? (
                    <>
                      <div 
                        style={{
                          position: 'absolute',
                          left: `${hover.x * actualWidth}px`,
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
                          left: 0,
                          right: 0,
                          top: `${hover.y * actualHeight}px`,
                          height: '0.5px',
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

        <div className="zoom-controls">
          <button
            className="zoom-btn"
            onClick={(e) => { e.stopPropagation(); handleZoom(orientation, 0.2); }}
          >
            <FiZoomIn size={14} />
          </button>
          <span className="zoom-level">{Math.round(viewState.scale * 100)}%</span>
          <button
            className="zoom-btn"
            onClick={(e) => { e.stopPropagation(); handleZoom(orientation, -0.2); }}
          >
            <FiZoomOut size={14} />
          </button>
          <button
            className="zoom-btn"
            onClick={(e) => { e.stopPropagation(); handleResetView(orientation); }}
          >
            <FiRotateCw size={14} />
          </button>
        </div>

        <div className="dimension-info">
          {actualWidth}×{actualHeight}
        </div>

        <div className="pixel-coords-info">
          ({crosshair.pixelX}, {crosshair.pixelY})
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
          <h3>Axial Slices</h3>
          <span>Showing {totalItems} of {axialSlices.length}</span>
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
                onClick={() => setCurrentSlice('axial', sliceIndex)}
              >
                {slice?.canvas && (
                  <img
                    src={slice.canvas.toDataURL()}
                    alt={`Axial ${sliceIndex + 1}`}
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

  // ========================
  // MAIN RENDER
  // ========================

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
            <p>Loading...</p>
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
            <p style={{ color: '#ff6b6b' }}>⚠️ No MRI data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="advanced-mri-viewer">
      <div className="viewer-topbar">
        <div className="topbar-left">
          <span className="viewer-title">MRI Viewer</span>
          <span className="volume-dims">
            {volumeData.dims[0]}×{volumeData.dims[1]}×{volumeData.dims[2]}
          </span>
          <span className="voxel-coords">
            ({voxelCoords.x}, {voxelCoords.y}, {voxelCoords.z})
          </span>
        </div>

        <div className="topbar-center">
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'single' ? 'active' : ''}`}
              onClick={() => setViewMode('single')}
            >
              <FiSquare size={14} />
            </button>
            <button
              className={`view-btn ${viewMode === 'quad' ? 'active' : ''}`}
              onClick={() => setViewMode('quad')}
            >
              <FiGrid size={14} />
            </button>
            <button
              className={`view-btn ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
            >
              <FiLayers size={14} />
            </button>
            <button
              className={`view-btn ${viewMode === 'mosaic' ? 'active' : ''}`}
              onClick={() => setViewMode('mosaic')}
            >
              <FiEye size={14} />
            </button>
          </div>
        </div>

        <div className="topbar-right">
          <button
            className={`settings-btn ${showSettings ? 'active' : ''}`}
            onClick={toggleSettings}
          >
            <FiSettings size={16} />
          </button>
        </div>
      </div>

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
              onChange={(e) => updateSetting('brightness', parseFloat(e.target.value))}
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
              onChange={(e) => updateSetting('contrast', parseFloat(e.target.value))}
            />
            <span>{Math.round(settings.contrast * 100)}%</span>
          </div>
          <div className="settings-row">
            <label>Crosshair:</label>
            <input
              type="checkbox"
              checked={settings.crosshair}
              onChange={(e) => updateSetting('crosshair', e.target.checked)}
            />
          </div>
        </div>
      )}

      <div className="viewer-content" ref={containerRef}>
        {viewMode === 'single' && (
          <div className="single-view">
            {renderSliceView(viewOrientation)}
          </div>
        )}

        {viewMode === 'quad' && (
          <div className="quad-view-columns">
            <div className="quad-column" onClick={() => setViewOrientation("axial")}>
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Axial</span>
                  <FiMove size={12} />
                </div>
                {renderSliceView('axial')}
              </div>
            </div>

            <div className="quad-column" onClick={() => setViewOrientation("coronal")}>
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Coronal</span>
                  <FiMove size={12} />
                </div>
                {renderSliceView('coronal')}
              </div>
            </div>

            <div className="quad-column" onClick={() => setViewOrientation("sagittal")}>
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Sagittal</span>
                  <FiMove size={12} />
                </div>
                {renderSliceView('sagittal')}
              </div>
            </div>

            <div className="quad-column">
              <div className="quad-panel">
                <div className="panel-header">
                  <span>3D</span>
                  <FiMaximize2 size={12} />
                </div>
                <div className="threed-container">
                  <canvas ref={canvas3DRef} className="niivue-canvas" />
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === '3d' && (
          <div className="threed-view">
            <canvas ref={canvas3DRef} className="niivue-canvas" />
          </div>
        )}

        {viewMode === 'mosaic' && renderMosaicView()}
      </div>

      <div className="shortcuts-info">
        {placementActive && previewCoordinate
          ? `✏️ Mode: Enter=Save | ESC=Cancel`
          : placementActive 
          ? `🎯 Click to select point | ESC=Cancel`
          : activeStructureId
          ? '✏️ Editing: D=Draw | E=Erase | Ctrl+Z=Undo | Ctrl+Y=Redo | Enter=Complete'
          : 'Click: Crosshair | Right-Drag: Pan | Wheel: Navigate | Ctrl+Wheel: Zoom'
        }
      </div>

      {activeStructureId && (
        <SegmentationToolbar
          structureColor={structures.find(s => s.id === activeStructureId)?.color || '#7ddb94'}
          structureName={structures.find(s => s.id === activeStructureId)?.title || 'Structure'}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          tool={tool}
          onToolChange={setTool}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onComplete={handleStopEditing}
          onNext={() => handleSliceChange('axial', 'next')}
          onPrevious={() => handleSliceChange('axial', 'prev')}
          canUndo={canUndo()}
          canRedo={canRedo()}
          currentSlice={currentSlices.axial}
          totalSlices={allSlices.axial.length}
        />
      )}
    </div>
  )
}

export default AdvancedMRIViewer