// src/components/Viewer/SliceView.tsx
import { useState, useRef, useEffect, useReducer } from 'react'
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiRotateCw, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import { MaskOverlay } from '../MaskOverlay'
import { maskManager } from '../../utils/MaskManager'
import { PlacementOverlay } from './PlacementOverlay'
import { PreviewControls } from './PreviewControls'
import { useMRI } from '../../Context/MRIcontext'
import type { ViewMode } from '../../types'

// Import stores
import { useVolumeStore } from '../../store/useVolumeStore'
import { useStructureStore } from '../../store/useStructureStore'
import { usePlacementStore } from '../../store/usePlacementStore'
import { useMaskStore } from '../../store/useMaskStore'
import { useViewerStore } from '../../store/useViewerStore'

import { useTranslation } from '../../hooks/useTranslation'

type Orientation = 'axial' | 'coronal' | 'sagittal'

interface SliceViewProps {
  // patient_id : string
  orientation: Orientation
  slices: any[]
  onVoxelCoordsChange?: (coords: { x: number; y: number; z: number }) => void
  onPreviewCoordinateChange?: (coord: any) => void
  previewCoordinate?: any
  viewOnly?: boolean
  ratingMode?: boolean
  viewMode?: ViewMode
}

export function SliceView({
  orientation,
  slices,
  onVoxelCoordsChange,
  onPreviewCoordinateChange,
  previewCoordinate: externalPreviewCoord,
  viewOnly = false,
  ratingMode = false,
  viewMode = 'quad'
}: SliceViewProps) {
  // ========================
  // STORES
  // ========================
  const { t } = useTranslation();
  const volumeData = useVolumeStore((state) => state.volumeData)
  const structures = useStructureStore((state) => state.mystructures)
  const { addCoordinate } = useStructureStore()
  const [showOrientationDropdown, setShowOrientationDropdown] = useState(false)


  const {
    active: placementActive,
    structureId: placementStructureId,
    color: placementColor,
    // isEditing: isEditingCoordinate,
    completePlacement
  } = usePlacementStore()

  const {
  activeStructureId,
  maskVisibility,
  tool,
  brushSize,
  rulers,
  activeRuler,
  rulerDragging,
  startNewRuler,
  setActiveRulerEnd,
  deleteRuler,
  updateRulerPoint,
  setRulerDragging,
} = useMaskStore()

  const {
    currentSlices,
    viewStates,
    settings,
    jumpToCoord,
    setCurrentSlice,
    updateViewState,
    resetViewState,
    setSingleViewOrientation
    
  } = useViewerStore()

  const { setCurrentSliceURL } = useMRI()

  // ========================
  // LOCAL STATE
  // ========================
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)
  const [crosshairPos, setCrosshairPos] = useState({ x: 0.5, y: 0.5, pixelX: 0, pixelY: 0 })
  const [hoverCrosshair, setHoverCrosshair] = useState<{ x: number; y: number } | null>(null)
  const [rulerHoverPoint, setRulerHoverPoint] = useState<{ x: number, y: number } | null>(null)

  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const hasHistorySaved = useRef(false)

  // ========================
  // DERIVED STATE
  // ========================
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  // Listen for mask updates and force re-render
  const currentSlice = currentSlices[orientation]
  const viewState = viewStates[orientation]
  const slice = slices[currentSlice]

  const maskOpacities = useMaskStore((state) => state.maskOpacity);

  // ========================
  // EFFECTS
  // ========================
  useEffect(() => {
    if (!slice?.canvas) return
    const dataUrl = slice.canvas.toDataURL("image/png")
    setCurrentSliceURL(dataUrl)
  }, [slice, setCurrentSliceURL])

  useEffect(() => {
    // console.log('Setting up maskUpdated listener in SliceView')

    const handleMaskUpdate = () => {
      // console.log('SliceView received maskUpdated for structure', structureId)
      forceUpdate()
    }

    maskManager.on('maskUpdated', handleMaskUpdate)
    // console.log('Listener registered')

    return () => {
      // console.log('Cleaning up listener')
      maskManager.off('maskUpdated', handleMaskUpdate)
    }
  }, [orientation])

  // Handle jump to coordinate - only update crosshair when on correct slice
  useEffect(() => {
    if (!jumpToCoord || !volumeData || !slice) {
      return
    }

    // Check if we're on the correct slice for this orientation
    let isCorrectSlice = false
    switch (orientation) {
      case 'axial':
        isCorrectSlice = currentSlice === jumpToCoord.z
        break
      case 'coronal':
        isCorrectSlice = currentSlice === jumpToCoord.y
        break
      case 'sagittal':
        isCorrectSlice = currentSlice === jumpToCoord.x
        break
    }

    // Only update crosshair if we're on the correct slice
    if (!isCorrectSlice) {
      // console.log(`${orientation}: Waiting for correct slice. Current: ${currentSlice}, Target:`, 
      //   orientation === 'axial' ? jumpToCoord.z : 
      //   orientation === 'coronal' ? jumpToCoord.y : jumpToCoord.x)
      return
    }

    // console.log(`${orientation}: Processing jump to`, jumpToCoord)

    let normalizedX = 0.5
    let normalizedY = 0.5
    let pixelX = 0
    let pixelY = 0

    switch (orientation) {
      case 'axial':
        normalizedX = jumpToCoord.x / volumeData.dims[0]
        normalizedY = jumpToCoord.y / volumeData.dims[1]
        pixelX = jumpToCoord.x
        pixelY = jumpToCoord.y
        break

      case 'coronal':
        normalizedX = jumpToCoord.x / volumeData.dims[0]
        normalizedY = (volumeData.dims[2] - 1 - jumpToCoord.z) / volumeData.dims[2]
        pixelX = jumpToCoord.x
        pixelY = volumeData.dims[2] - 1 - jumpToCoord.z
        break

      case 'sagittal':
        normalizedX = jumpToCoord.y / volumeData.dims[1]
        normalizedY = (volumeData.dims[2] - 1 - jumpToCoord.z) / volumeData.dims[2]
        pixelX = jumpToCoord.y
        pixelY = volumeData.dims[2] - 1 - jumpToCoord.z
        break
    }

    normalizedX = Math.max(0, Math.min(1, normalizedX))
    normalizedY = Math.max(0, Math.min(1, normalizedY))

    // console.log(`${orientation}: Setting crosshair at pixel (${pixelX}, ${pixelY})`)

    setCrosshairPos({
      x: normalizedX,
      y: normalizedY,
      pixelX,
      pixelY
    })
  }, [jumpToCoord, volumeData, orientation, slice, currentSlice])

  // ========================
  // EARLY RETURN AFTER HOOKS
  // ========================
  if (!slice || !slice.canvas) {
    return (
      <div className="slice-placeholder">
        <div className="loading-spinner"></div>
        <span>Loading {orientation}</span>
      </div>
    )
  }

  const dataUrl = slice.canvas.toDataURL()
  const actualWidth = slice.actualWidth || slice.width
  const actualHeight = slice.actualHeight || slice.height
  const crosshairColor = placementActive && placementColor ? placementColor : '#7ddb94'

  // ========================
  // HELPER FUNCTIONS
  // ========================

  // In SliceView.tsx - Fix the drawAtPoint function

  // In SliceView.tsx - Update drawAtPoint to pass orientation

const drawAtPoint = (pixelX: number, pixelY: number) => {
  if (!activeStructureId || !volumeData) return
  
  const value = tool === 'draw' ? 255 : 0
  let voxelX = 0, voxelY = 0, voxelZ = 0

  const currentSliceIndex = currentSlices[orientation]

  switch (orientation) {
    case 'axial':
      // Axial: X and Y visible, Z is slice
      voxelX = pixelX
      voxelY = pixelY
      voxelZ = currentSliceIndex
      break
    case 'coronal':
      // Coronal: X and Z visible (Z flipped), Y is slice
      voxelX = pixelX
      voxelY = currentSliceIndex
      voxelZ = volumeData.dims[2] - 1 - pixelY
      break
    case 'sagittal':
      // Sagittal: Y and Z visible (Z flipped), X is slice
      voxelX = currentSliceIndex
      voxelY = pixelX
      voxelZ = volumeData.dims[2] - 1 - pixelY
      break
  }

  const patient_id = localStorage.getItem("selected_patient")!
  
  // Pass orientation so brush expands in correct 2D plane
  maskManager.updateMaskVoxel(
    activeStructureId, 
    patient_id, 
    voxelX, 
    voxelY, 
    voxelZ, 
    value, 
    brushSize,
    orientation  // <-- ADD THIS
  )
}

  const handleSliceChange = (direction: 'prev' | 'next') => {
    const current = currentSlices[orientation]
    let newSlice = current

    if (direction === 'next') {
      newSlice = current < slices.length - 1 ? current + 1 : current
    } else {
      newSlice = current > 0 ? current - 1 : current
    }

    if (newSlice !== current) {
      setCurrentSlice(orientation, newSlice)
    }
  }

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(30, viewState.scale + delta))
    updateViewState(orientation, { scale: newScale })
  }

  const handleResetView = () => {
    resetViewState(orientation)
  }

  const handlePanDirection = (direction: 'up' | 'down' | 'left' | 'right') => {
    const panAmount = 50
    updateViewState(orientation, {
      offsetX: viewState.offsetX + (direction === 'left' ? panAmount : direction === 'right' ? -panAmount : 0),
      offsetY: viewState.offsetY + (direction === 'up' ? panAmount : direction === 'down' ? -panAmount : 0)
    })
  }

  const handleSaveCoordinate = async () => {
    if (!externalPreviewCoord || !placementStructureId) return
    // here we upload the coordinates to the backend 
    console.log("Storing the new coordinates in the database ...", externalPreviewCoord)
    const modality = localStorage.getItem("modality")!
    const coordinateWithOrientation = {
      ...externalPreviewCoord,
      orientation: orientation  // Add current orientation
    }
    addCoordinate(placementStructureId, coordinateWithOrientation, modality)

    onPreviewCoordinateChange?.(null)
    completePlacement()

    if (viewState.scale === 2.5) {
      resetViewState(orientation)
    }
  }

  const handleCancelCoordinate = () => {
    if (!externalPreviewCoord || !placementStructureId) return

    onPreviewCoordinateChange?.(null)
    completePlacement()

    if (viewState.scale === 2.5) {
      resetViewState(orientation)
    }
  }
  // Add these helper functions after handleSliceChange and before handleZoom

  const calculateDistance = (
    start: { x: number, y: number, z: number },
    end: { x: number, y: number, z: number }
  ): number => {
    if (!volumeData?.pixDims) return 0
    
    const dx = (end.x - start.x) * volumeData.pixDims[0]
    const dy = (end.y - start.y) * volumeData.pixDims[1]
    const dz = (end.z - start.z) * volumeData.pixDims[2]
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
const voxelToSliceCoords = (voxel: { x: number, y: number, z: number }) => {
  if (!slice || !volumeData) return null

  let pixelX = 0, pixelY = 0
  
  switch (orientation) {
    case 'axial':
      if (voxel.z !== currentSlice) return null
      pixelX = voxel.x
      pixelY = voxel.y
      break
    case 'coronal':
      if (voxel.y !== currentSlice) return null
      pixelX = voxel.x
      pixelY = volumeData.dims[2] - 1 - voxel.z
      break
    case 'sagittal':
      if (voxel.x !== currentSlice) return null
      pixelX = voxel.y
      pixelY = volumeData.dims[2] - 1 - voxel.z
      break
  }

  return {
    x: pixelX / slice.width,
    y: pixelY / slice.height
  }
}



  // ========================
  // MOUSE HANDLERS
  // ========================
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewOnly || ratingMode) return
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

  // RULER TOOL HANDLING - UPDATED FOR MULTIPLE RULERS
// RULER TOOL HANDLING - FIXED
if (tool === 'ruler' && e.button === 0) {
  const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
  if (!imgElement) return

  const imgRect = imgElement.getBoundingClientRect()
  const x = e.clientX - imgRect.left
  const y = e.clientY - imgRect.top

  if (x < 0 || x > imgRect.width || y < 0 || y > imgRect.height) return

  const normalizedX = x / imgRect.width
  const normalizedY = y / imgRect.height
  const pixelX = Math.floor(normalizedX * slice.width)
  const pixelY = Math.floor(normalizedY * slice.height)

  // Convert to voxel
  let voxelX = 0, voxelY = 0, voxelZ = 0
  if (!volumeData) return

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

  // Check if clicking on existing ruler points to drag them
  for (const ruler of rulers) {
    if (ruler.orientation !== orientation) continue

    const startCoords = voxelToSliceCoords(ruler.start)
    const endCoords = voxelToSliceCoords(ruler.end)
    
    if (startCoords && endCoords) {
      const startX = startCoords.x * actualWidth
      const startY = startCoords.y * actualHeight
      const endX = endCoords.x * actualWidth
      const endY = endCoords.y * actualHeight
      
      const clickX = normalizedX * actualWidth
      const clickY = normalizedY * actualHeight
      
      // Check if clicking near start point (within 15px)
      const distToStart = Math.sqrt((clickX - startX) ** 2 + (clickY - startY) ** 2)
      if (distToStart < 1) {
        setRulerDragging(ruler.id, 'start')
        e.preventDefault()
        return
      }
      
      // Check if clicking near end point (within 15px)
      const distToEnd = Math.sqrt((clickX - endX) ** 2 + (clickY - endY) ** 2)
      if (distToEnd < 1) {
        setRulerDragging(ruler.id, 'end')
        e.preventDefault()
        return
      }
    }
  }

  // Not clicking on existing points, so create new ruler or set end point
  if (!activeRuler) {
    // Start new ruler - set first point
    startNewRuler({ x: voxelX, y: voxelY, z: voxelZ })
    console.log('✅ Ruler start point set:', { x: voxelX, y: voxelY, z: voxelZ })
  } else if (activeRuler.start && !activeRuler.end) {
    // Complete the active ruler - set second point
    setActiveRulerEnd({ x: voxelX, y: voxelY, z: voxelZ }, orientation)
    console.log('✅ Ruler completed:', { x: voxelX, y: voxelY, z: voxelZ })
  }
  
  e.preventDefault()
  return
}

    // Mask editing
    if (activeStructureId && !placementActive) {
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return

      const imgRect = imgElement.getBoundingClientRect()
      const x = e.clientX - imgRect.left
      const y = e.clientY - imgRect.top

      if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
        const pixelX = Math.floor((x / imgRect.width) * slice.width)
        const pixelY = Math.floor((y / imgRect.height) * slice.height)

        maskManager.setCurrentSlice(activeStructureId, currentSlice, orientation)

        if (!maskManager.canUndo(activeStructureId, currentSlice, orientation)) {
          maskManager.saveHistory(activeStructureId, currentSlice, orientation)
          hasHistorySaved.current = true
        }

        setIsDrawing(true)
        lastPosRef.current = { x: pixelX, y: pixelY }

        drawAtPoint(pixelX, pixelY)

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
            voxelY = currentSlices.coronal
            voxelZ = volumeData.dims[2] - 1 - pixelY
            break
          case 'sagittal':
            voxelX = currentSlices.sagittal
            voxelY = pixelX
            voxelZ = volumeData.dims[2] - 1 - pixelY
            break
        }
      
        onPreviewCoordinateChange?.({
          x: voxelX,
          y: voxelY,
          z: voxelZ,
          orientation,
          // Add pixel coordinates for SAM
          pixelX,
          pixelY,
          sliceIndex: currentSlices[orientation]
        })
        

        if (viewState.scale < 2.5) {
          const targetZoom = 2.5
          updateViewState(orientation, {
            scale: targetZoom,
            offsetX: (0.5 - clampedX) * imgRect.width * (targetZoom - 1),
            offsetY: (0.5 - clampedY) * imgRect.height * (targetZoom - 1)
          })
        }

        setCrosshairPos({ x: clampedX, y: clampedY, pixelX, pixelY })
        setHoverCrosshair(null)

        return
      }

      if (volumeData && onVoxelCoordsChange) {
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

        onVoxelCoordsChange({ x: voxelX, y: voxelY, z: voxelZ })
      }

      setCrosshairPos({ x: clampedX, y: clampedY, pixelX, pixelY })
    }

    if (e.button === 2 && viewState.scale > 1) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewOnly || ratingMode) return
  
    const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
    if (!imgElement) return
  
    const imgRect = imgElement.getBoundingClientRect()
    const x = e.clientX - imgRect.left
    const y = e.clientY - imgRect.top
  
    // Check if mouse is within bounds
    if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
      const normalizedX = x / imgRect.width
      const normalizedY = y / imgRect.height
      
      if (!externalPreviewCoord || !placementActive) {
        setHoverCrosshair({ x: normalizedX, y: normalizedY })
      }
  
      // RULER MODE: Always update hover point when in ruler mode
      // RULER MODE: Always update hover point when in ruler mode
if (tool === 'ruler') {
  setRulerHoverPoint({ x: normalizedX, y: normalizedY })
  
  // If dragging a ruler point, update its position
  if (rulerDragging && volumeData) {
    const pixelX = Math.floor(normalizedX * slice.width)
    const pixelY = Math.floor(normalizedY * slice.height)
    
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
    
    // Update the ruler point being dragged
    updateRulerPoint(rulerDragging.rulerId, rulerDragging.point, { x: voxelX, y: voxelY, z: voxelZ })
    return
  }
}
    } else {
      setHoverCrosshair(null)
      setRulerHoverPoint(null)
    }
  
    // If dragging ruler point, don't do other actions
    if (tool === 'ruler' && rulerDragging) {
      return
    }
  
    // Mask editing - existing code
    if (activeStructureId && isDrawing && !placementActive) {
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return
      const imgRect = imgElement.getBoundingClientRect()
      const x = e.clientX - imgRect.left
      const y = e.clientY - imgRect.top
  
      if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
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
            drawAtPoint(interpX, interpY)
          }
        }
  
        lastPosRef.current = { x: pixelX, y: pixelY }
      }
    }
  
    // Panning - existing code
    if (isPanning && panStart && viewState.scale > 1) {
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y
  
      updateViewState(orientation, {
        offsetX: viewState.offsetX + deltaX,
        offsetY: viewState.offsetY + deltaY
      })
  
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  
    // Update crosshair for placement mode
    if (placementActive && !externalPreviewCoord) {
      const imgElement = e.currentTarget.querySelector('.slice-image') as HTMLImageElement
      if (!imgElement) return
      const imgRect = imgElement.getBoundingClientRect()
      const x = e.clientX - imgRect.left
      const y = e.clientY - imgRect.top
  
      if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
        const normalizedX = x / imgRect.width
        const normalizedY = y / imgRect.height
        setHoverCrosshair({ x: normalizedX, y: normalizedY })
      } else {
        setHoverCrosshair(null)
      }
    }
  }

  const handleMouseUp = () => {
    // Stop ruler dragging
  if (tool === 'ruler' && rulerDragging) {
    setRulerDragging(null,null)
    return
  }
    if (activeStructureId && isDrawing) {
      maskManager.setCurrentSlice(activeStructureId, currentSlice,orientation)
      maskManager.saveHistory(activeStructureId, currentSlice, orientation)
      useMaskStore.setState((s) => ({ ...s }))
      setIsDrawing(false)
      lastPosRef.current = null
      hasHistorySaved.current = false
      return
    }

    if (isPanning) {
      setIsPanning(false)
      setPanStart(null)
    }
  }

  const handleMouseLeave = () => {
    if (activeStructureId && isDrawing) {
      maskManager.saveHistory(activeStructureId)
      setIsDrawing(false)
      lastPosRef.current = null
    }

    if (isPanning) {
      setIsPanning(false)
      setPanStart(null)
    }

    if (placementActive && !externalPreviewCoord) {
      setHoverCrosshair(null)
      setRulerHoverPoint(null)
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (activeStructureId) {
      if (e.ctrlKey || e.metaKey) {
        // Don't call preventDefault - just handle zoom
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        handleZoom(delta)
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

    if (!isOverImage) return

    if (e.ctrlKey || e.metaKey) {
      // Don't call preventDefault - just handle zoom
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      handleZoom(delta)
      return
    }

    if (!placementActive) {
      // Don't call preventDefault - just handle slice change
      const direction = e.deltaY > 0 ? 'next' : 'prev'
      handleSliceChange(direction)
    }
  }

  // ========================
  // CURSOR STYLE
  // ========================
  let cursorStyle = 'default'
  if (ratingMode) {
    cursorStyle = 'default'
  } else if (activeStructureId && !placementActive) {
    cursorStyle = 'crosshair'
  } else if (placementActive && !externalPreviewCoord) {
    cursorStyle = 'crosshair'
  } else if (isPanning) {
    cursorStyle = 'grabbing'
  } else if (viewState.scale > 1) {
    cursorStyle = 'grab'
  }

  // ========================
  // RENDER
  // ========================


  return (
    <div
      className="slice-viewer-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      style={{ cursor: viewOnly ? 'default' : cursorStyle }}
    >
      {/* Placement Overlay - Hide in view-only and rating mode */}
      {!viewOnly && !ratingMode && placementActive && !externalPreviewCoord && <PlacementOverlay />}

      {/* Preview Controls - Hide in view-only and rating mode */}
      {!viewOnly && !ratingMode && externalPreviewCoord && placementActive && (
        <PreviewControls
          coordinate={externalPreviewCoord}
          onSave={handleSaveCoordinate}
          onCancel={handleCancelCoordinate}
        />
      )}

      <div className="slice-viewer-wrapper" style={{ overflow: 'hidden' }}>
        {/* Pan Controls - Hide in view-only and rating mode */}
        {!viewOnly && !ratingMode && viewState.scale > 2 && (
          <>
            <button className="pan-control pan-left"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handlePanDirection('left')
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
                handlePanDirection('right')
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
                handlePanDirection('up')
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
                handlePanDirection('down')
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

                display: 'block',
                pointerEvents: 'auto'
              }}
              draggable={false}
            />

            {/* Mask Overlays */}
            {Object.entries(maskVisibility).map(([structureIdStr, visible]) => {
              if (!visible) return null

              const structureId = parseInt(structureIdStr)
              const maskOpacity = maskOpacities[structureId] ?? 0.5;
              const maskSlice = maskManager.getMaskSlice(structureId, orientation, currentSlice)
              if (!maskSlice) return null

              const structure = structures.find(s => s.id === structureId)
              const structureColor = structure?.color || '#7ddb94'
              // console.log("logging the mask slice", maskSlice)

              return (
                <MaskOverlay
                  key={`mask-${structureId}-${orientation}`}
                  maskData={maskSlice}
                  width={actualWidth}
                  height={actualHeight}
                  color={structureColor}
                  opacity={maskOpacity}
                  offsetX={viewState.offsetX}
                  offsetY={viewState.offsetY}
                />
              )
            })}

            {/* Crosshairs */}
            {settings.crosshair && (
              <div className="crosshair-overlay">
                {hoverCrosshair ? (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        left: `${hoverCrosshair.x * actualWidth}px`,
                        top: 0,
                        bottom: 0,
                        width: '0.25px',
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
                        top: `${hoverCrosshair.y * actualHeight}px`,
                        height: '0.25px',
                        backgroundColor: crosshairColor,
                        boxShadow: `0 0 3px ${crosshairColor}`,
                        opacity: 0.9
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `${hoverCrosshair.x * actualWidth}px`,
                        top: `${hoverCrosshair.y * actualHeight}px`,
                        width: '1px',
                        height: '1px',
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
                        top: `${crosshairPos.y * actualHeight}px`,
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '0.25px',
                        backgroundColor: externalPreviewCoord ? crosshairColor : '#7ddb94',
                        boxShadow: externalPreviewCoord ? `0 0 3px ${crosshairColor}` : '0 0 2px #7ddb94',
                        opacity: 0.8
                      }}
                    />
                    <div
                      className="crosshair-vertical"
                      style={{
                        left: `${crosshairPos.x * actualWidth}px`,
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        width: '0.25px',
                        backgroundColor: externalPreviewCoord ? crosshairColor : '#7ddb94',
                        boxShadow: externalPreviewCoord ? `0 0 3px ${crosshairColor}` : '0 0 2px #7ddb94',
                        opacity: 0.8
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `${crosshairPos.x * actualWidth}px`,
                        top: `${crosshairPos.y * actualHeight}px`,
                        width: '1px',
                        height: '1px',
                        backgroundColor: externalPreviewCoord ? crosshairColor : '#7ddb94',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: externalPreviewCoord ? `0 0 4px ${crosshairColor}` : '0 0 3px #7ddb94',
                        border: '0.5px solid rgba(255, 255, 255, 0.9)',
                        opacity: 0.9
                      }}
                    />
                  </>
                )}
              </div>
            )}
            {settings.crosshair == false && (
              <div className="crosshair-overlay">
                {hoverCrosshair ? (
                  <>
                    
                    
                    <div
                      style={{
                        position: 'absolute',
                        left: `${hoverCrosshair.x * actualWidth}px`,
                        top: `${hoverCrosshair.y * actualHeight}px`,
                        width: '1px',
                        height: '1px',
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
                      style={{
                        position: 'absolute',
                        left: `${crosshairPos.x * actualWidth}px`,
                        top: `${crosshairPos.y * actualHeight}px`,
                        width: '1px',
                        height: '1px',
                        backgroundColor: externalPreviewCoord ? crosshairColor : '#7ddb94',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: externalPreviewCoord ? `0 0 4px ${crosshairColor}` : '0 0 3px #7ddb94',
                        border: '0.5px solid rgba(255, 255, 255, 0.9)',
                        opacity: 0.9
                      }}
                    />
                  </>
                )}
              </div>
            )}
            {/* Multiple Rulers Overlay - Render both active and completed */}
{tool === 'ruler' && (
  <div 
    className="ruler-overlay"
    style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: `${actualWidth}px`,
      height: `${actualHeight}px`,
      zIndex: 15,
      pointerEvents: 'none',
      
    }}
  >
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto'
      }}
    >
      {/* RENDER ALL COMPLETED RULERS for this orientation */}
      {rulers.filter(r => r.orientation === orientation).map(ruler => {
        const startCoords = voxelToSliceCoords(ruler.start)
        const endCoords = voxelToSliceCoords(ruler.end)
        
        if (!startCoords || !endCoords) return null

        const startX = startCoords.x * actualWidth
        const startY = startCoords.y * actualHeight
        const endX = endCoords.x * actualWidth
        const endY = endCoords.y * actualHeight

        const distance = calculateDistance(ruler.start, ruler.end)

        return (
          <g key={ruler.id}>
            {/* Line */}
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#7ddb94"
              strokeWidth="0.2"
              strokeLinecap="round"
            />
            
            {/* Start point */}
            <circle 
              cx={startX} 
              cy={startY} 
              r="0.5" 
              fill="#7ddb94" 
              stroke="white" 
              strokeWidth="0.5"
              style={{ cursor: 'move', pointerEvents: 'none' }}
            />
            
            {/* End point */}
            <circle 
              cx={endX} 
              cy={endY} 
              r="0.5" 
              fill="#7ddb94" 
              stroke="white" 
              strokeWidth="0.5"
              style={{ cursor: 'move', pointerEvents: 'none' }}
            />

            {/* Delete button */}
            <g 
              style={{ pointerEvents: 'auto' }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                deleteRuler(ruler.id)
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              <circle
                cx={(startX + endX) / 2}
                cy={(startY + endY) / 2}
                r="1.4"
                fill="transparent"
                style={{ cursor: 'pointer' }}
              />
              <text
                x={(startX + endX) / 2}
                y={(startY + endY) / 2 + 0.8}
                textAnchor="middle"
                fill="white"
                fontSize="2.3"
                fontWeight="bold"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                ×
              </text>
            </g>

            {/* Distance label */}
            <text
              x={(startX + endX) / 2}
              y={Math.min(startY, endY) + 10}
              textAnchor="middle"
              fill="#7ddb94"
              fontSize="2"
              fontWeight="bold"
              fontFamily="'Courier New', monospace"
              style={{ pointerEvents: 'none' }}
            >
              {distance.toFixed(2)} mm
            </text>
          </g>
        )
      })}

      {/* RENDER ACTIVE RULER being drawn */}
      {activeRuler && activeRuler.start && (() => {
        const startCoords = voxelToSliceCoords(activeRuler.start)
        const endCoords = rulerHoverPoint

        if (!startCoords || !endCoords) return null

        const startX = startCoords.x * actualWidth
        const startY = startCoords.y * actualHeight
        const endX = endCoords.x * actualWidth
        const endY = endCoords.y * actualHeight

        // Calculate live distance
        const pixelX = Math.floor(rulerHoverPoint.x * slice.width)
        const pixelY = Math.floor(rulerHoverPoint.y * slice.height)
        
        let hoverVoxelX = 0, hoverVoxelY = 0, hoverVoxelZ = 0
        
        switch (orientation) {
          case 'axial':
            hoverVoxelX = pixelX
            hoverVoxelY = pixelY
            hoverVoxelZ = currentSlices.axial
            break
          case 'coronal':
            hoverVoxelX = pixelX
            hoverVoxelZ = volumeData!.dims[2] - 1 - pixelY
            hoverVoxelY = currentSlices.coronal
            break
          case 'sagittal':
            hoverVoxelY = pixelX
            hoverVoxelZ = volumeData!.dims[2] - 1 - pixelY
            hoverVoxelX = currentSlices.sagittal
            break
        }
        
        const distance = calculateDistance(
          activeRuler.start, 
          { x: hoverVoxelX, y: hoverVoxelY, z: hoverVoxelZ }
        )

        return (
          <g key="active-ruler">
            {/* Dashed line for active ruler */}
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#7ddb94"
              strokeWidth="0.2"
              strokeDasharray="8,4"
              strokeLinecap="round"
            />
            
            {/* Start point */}
            <circle 
              cx={startX} 
              cy={startY} 
              r="0.5" 
              fill="#7ddb94" 
              stroke="white" 
              strokeWidth="0.5"
            />
            
            {/* Hover endpoint */}
            <circle 
              cx={endX} 
              cy={endY} 
              r="0.5" 
              fill="#7ddb94" 
              stroke="white" 
              strokeWidth="0.5" 
              opacity="0.6"
            />

            {/* Live distance */}
            <text
              x={(startX + endX) / 2}
              y={Math.min(startY, endY) + 10}
              textAnchor="middle"
              fill="#7ddb94"
              fontSize="2"
              fontWeight="bold"
              fontFamily="'Courier New', monospace"
              style={{ pointerEvents: 'none' }}
            >
              {distance.toFixed(2)} mm ⋯
            </text>
          </g>
        )
      })()}
    </svg>
  </div>
)}


          </div>
        </div>
      </div>

      {/* Slice Navigation Controls */}
      <div className="slice-controls">
        <button
          className="slice-nav-btn"
          onClick={(e) => { e.stopPropagation(); handleSliceChange('prev'); }}
          disabled={currentSlice === 0 || placementActive}
        >
          <FiChevronLeft size={14} />
        </button>
        <span className="slice-counter">
          {currentSlice + 1}/{slices.length}
        </span>
        <button
          className="slice-nav-btn"
          onClick={(e) => { e.stopPropagation(); handleSliceChange('next'); }}
          disabled={currentSlice === slices.length - 1 || placementActive}
        >
          <FiChevronRight size={14} />
        </button>
      </div>
      {/* Add after zoom-controls div, before the closing </div> of slice-viewer-container */}

{/* Orientation Selector - Only in Single View */}
{viewMode === 'single' && (
  <div className="orientation-selector-container">
    <button 
      className="orientation-selector-btn"
      onClick={(e) => {
        e.stopPropagation()
        setShowOrientationDropdown(!showOrientationDropdown)
      }}
    >
      <span>{orientation.charAt(0).toUpperCase() + orientation.slice(1)}</span>
      <FiChevronDown 
        size={12} 
        style={{ 
          transform: showOrientationDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }} 
      />
    </button>
    
    {showOrientationDropdown && (
      <div className="orientation-dropdown">
        <button 
          className={`orientation-option ${orientation === 'axial' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            setSingleViewOrientation('axial')
            setShowOrientationDropdown(false)
          }}
        >
          {t.advancedMRI?.axial || 'Axial'}
        </button>
        <button 
          className={`orientation-option ${orientation === 'coronal' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            setSingleViewOrientation('coronal')
            setShowOrientationDropdown(false)
          }}
        >
          {t.advancedMRI?.coronal || 'Coronal'}
        </button>
        <button 
          className={`orientation-option ${orientation === 'sagittal' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            setSingleViewOrientation('sagittal')
            setShowOrientationDropdown(false)
          }}
        >
          {t.advancedMRI?.sagittal || 'Sagittal'}
        </button>
      </div>
    )}
  </div>
)}

      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button
          className="zoom-btn"
          onClick={(e) => { e.stopPropagation(); handleZoom(0.2); }}
        >
          <FiZoomIn size={14} />
        </button>
        <span className="zoom-level">{Math.round(viewState.scale * 100)}%</span>
        <button
          className="zoom-btn"
          onClick={(e) => { e.stopPropagation(); handleZoom(-0.2); }}
        >
          <FiZoomOut size={14} />
        </button>
        <button
          className="zoom-btn"
          onClick={(e) => { e.stopPropagation(); handleResetView(); }}
        >
          <FiRotateCw size={14} />
        </button>
      </div>

      {/* Dimension Info */}
      <div className="dimension-info">
        {actualWidth}×{actualHeight}
      </div>

      {/* Pixel Coordinates */}
      <div className="pixel-coords-info">
        ({crosshairPos.pixelX}, {crosshairPos.pixelY})
      </div>
    </div>
  )
}

export default SliceView