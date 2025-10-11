// src/components/Viewer/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'
import { useVolumeStore } from '../../../store/useVolumeStore'
import { usePlacementStore } from '../../../store/usePlacementStore'
import { useMaskStore } from '../../../store/useMaskStore'
import { useViewerStore } from '../../../store/useViewerStore'

interface UseKeyboardShortcutsProps {
  previewCoordinate: any
  onSliceChange: (orientation: any, direction: 'prev' | 'next') => void
  onSaveCoordinate: () => void
  onCancelCoordinate: () => void
  onStopEditing: () => void
  onUndo: () => void
  onRedo: () => void
}

export function useKeyboardShortcuts({
  previewCoordinate,
  onSliceChange,
  onSaveCoordinate,
  onCancelCoordinate,
  onStopEditing,
  onUndo,
  onRedo
}: UseKeyboardShortcutsProps) {
  // ✨ Get state directly from stores
  const volumeData = useVolumeStore((state) => state.volumeData)
  const { active: placementActive } = usePlacementStore()
  const { activeStructureId, setTool } = useMaskStore()
  const { setViewMode, settings, updateSetting, resetViewState } = useViewerStore()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!volumeData) return

      // Mask editing shortcuts
      if (activeStructureId) {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case 'z':
              e.preventDefault()
              onUndo()
              break
            case 'y':
              e.preventDefault()
              onRedo()
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
              onStopEditing()
              break
          }
        }
        return
      }

      // Placement mode shortcuts
      switch (e.key) {
        case 'Escape':
          if (placementActive || previewCoordinate) {
            onCancelCoordinate()
          }
          break
        case 'Enter':
          if (previewCoordinate) {
            onSaveCoordinate()
          }
          break
        case 'ArrowUp':
          if (!placementActive && !previewCoordinate) {
            e.preventDefault()
            onSliceChange('axial', 'next')
          }
          break
        case 'ArrowDown':
          if (!placementActive && !previewCoordinate) {
            e.preventDefault()
            onSliceChange('axial', 'prev')
          }
          break
        case 'ArrowLeft':
          if (!placementActive && !previewCoordinate) {
            e.preventDefault()
            onSliceChange('coronal', 'prev')
          }
          break
        case 'ArrowRight':
          if (!placementActive && !previewCoordinate) {
            e.preventDefault()
            onSliceChange('coronal', 'next')
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
  }, [
    volumeData,
    placementActive,
    previewCoordinate,
    activeStructureId,
    settings.crosshair,
    onSliceChange,
    setViewMode,
    updateSetting,
    resetViewState,
    onUndo,
    onRedo,
    setTool,
    onSaveCoordinate,
    onCancelCoordinate,
    onStopEditing
  ])
}