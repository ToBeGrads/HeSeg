// src/hooks/useMaskEditing.ts
import { useState, useCallback, useRef } from 'react'
import { maskManager } from '../utils/MaskManager'

export interface MaskEditingState {
  activeStructureId: number | null
  tool: 'draw' | 'erase'
  brushSize: number
  isDrawing: boolean
}

export function useMaskEditing(volumeDims: [number, number, number] | null) {
  const [activeStructureId, setActiveStructureId] = useState<number | null>(null)
  const [tool, setTool] = useState<'draw' | 'erase'>('draw')
  const [brushSize, setBrushSize] = useState<number>(5)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  const startEditing = useCallback((structureId: number) => {
    setActiveStructureId(structureId)
    setTool('draw')
    console.log(`✏️ Started editing structure ${structureId}`)
  }, [])

  const stopEditing = useCallback(() => {
    if (activeStructureId) {
      console.log(`✅ Stopped editing structure ${activeStructureId}`)
    }
    setActiveStructureId(null)
    setIsDrawing(false)
    lastPosRef.current = null
  }, [activeStructureId])

  const handleMouseDown = useCallback((pixelX: number, pixelY: number) => {
    setIsDrawing(true)
    lastPosRef.current = { x: pixelX, y: pixelY }
  }, [])

  const handleMouseMove = useCallback((
    pixelX: number,
    pixelY: number,
    orientation: 'axial' | 'coronal' | 'sagittal',
    currentSlice: number
  ) => {
    if (!isDrawing || !activeStructureId || !volumeDims) return

    const value = tool === 'draw' ? 255 : 0

    // Convert pixel coords to voxel coords based on orientation
    let voxelX = 0, voxelY = 0, voxelZ = 0

    switch (orientation) {
      case 'axial':
        voxelX = pixelX
        voxelY = pixelY
        voxelZ = currentSlice
        break
      case 'coronal':
        voxelX = pixelX
        voxelZ = volumeDims[2] - 1 - pixelY
        voxelY = currentSlice
        break
      case 'sagittal':
        voxelY = pixelX
        voxelZ = volumeDims[2] - 1 - pixelY
        voxelX = currentSlice
        break
    }

    // Draw with interpolation for smooth lines
    if (lastPosRef.current) {
      const dx = pixelX - lastPosRef.current.x
      const dy = pixelY - lastPosRef.current.y
      const steps = Math.max(Math.abs(dx), Math.abs(dy), 1)

      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const interpX = Math.round(lastPosRef.current.x + dx * t)
        const interpY = Math.round(lastPosRef.current.y + dy * t)

        let interpVoxelX = 0, interpVoxelY = 0, interpVoxelZ = 0

        switch (orientation) {
          case 'axial':
            interpVoxelX = interpX
            interpVoxelY = interpY
            interpVoxelZ = currentSlice
            break
          case 'coronal':
            interpVoxelX = interpX
            interpVoxelZ = volumeDims[2] - 1 - interpY
            interpVoxelY = currentSlice
            break
          case 'sagittal':
            interpVoxelY = interpX
            interpVoxelZ = volumeDims[2] - 1 - interpY
            interpVoxelX = currentSlice
            break
        }

        maskManager.updateMaskVoxel(
          activeStructureId,
          interpVoxelX,
          interpVoxelY,
          interpVoxelZ,
          value,
          brushSize
        )
      }
    } else {
      maskManager.updateMaskVoxel(
        activeStructureId,
        voxelX,
        voxelY,
        voxelZ,
        value,
        brushSize
      )
    }

    lastPosRef.current = { x: pixelX, y: pixelY }
  }, [isDrawing, activeStructureId, tool, brushSize, volumeDims])

  const handleMouseUp = useCallback(() => {
    if (isDrawing && activeStructureId) {
      maskManager.saveHistory(activeStructureId)
    }
    setIsDrawing(false)
    lastPosRef.current = null
  }, [isDrawing, activeStructureId])

  const handleUndo = useCallback(() => {
    if (activeStructureId) {
      maskManager.undo(activeStructureId)
    }
  }, [activeStructureId])

  const handleRedo = useCallback(() => {
    if (activeStructureId) {
      maskManager.redo(activeStructureId)
    }
  }, [activeStructureId])

  const canUndo = useCallback(() => {
    return activeStructureId ? maskManager.canUndo(activeStructureId) : false
  }, [activeStructureId])

  const canRedo = useCallback(() => {
    return activeStructureId ? maskManager.canRedo(activeStructureId) : false
  }, [activeStructureId])

  return {
    activeStructureId,
    tool,
    brushSize,
    isDrawing,
    startEditing,
    stopEditing,
    setTool,
    setBrushSize,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo
  }
}