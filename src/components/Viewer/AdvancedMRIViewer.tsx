// src/components/AdvancedMRIViewer.tsx
import { useState, useRef, useCallback } from 'react'
import './AdvancedMRIViewer.css'
import { FiMove, FiMaximize2 } from 'react-icons/fi'
import SegmentationToolbar from '../SegmentationToolbar'
import { maskManager } from '../../utils/MaskManager'

// Import stores
import { useVolumeStore } from '../../store/useVolumeStore'
import { useStructureStore } from '../../store/useStructureStore'
import { useMaskStore } from '../../store/useMaskStore'
import { useViewerStore } from '../../store/useViewerStore'

// Import components
import { ViewerTopBar } from './ViewerTopBar'
import { ViewerSettingsPanel } from './ViewerSettingsPanel'
import { MosaicView } from './MosaicView'
import { ThreeDView } from './ThreeDView'
import SliceView from './SliceView'
import { Mini3DNavigator } from './Mini3DNavigator'
import type { Orientation } from '../../types'

// Import hooks
import { useSliceExtraction } from './hooks/useSliceExtraction'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

// type ViewType = 'axial' | 'coronal' | 'sagittal'

function AdvancedMRIViewer() {
  // ========================
  // STORES
  // ========================
  const volumeData = useVolumeStore((state) => state.volumeData)
  const structures = useStructureStore((state) => state.mystructures)
  
  // const {
  //   structureId: placementStructureId
  // } = usePlacementStore()
  
  const {
    activeStructureId,
    tool,
    brushSize,
    setBrushSize,
    setTool,
    setActiveStructure
  } = useMaskStore()
  
  const {
    viewMode,
    currentSlices,
    showSettings,
    setCurrentSlice,
  } = useViewerStore()


  // ========================
  // LOCAL STATE
  // ========================
  const [viewOrientation, setViewOrientation] = useState<Orientation>("axial");
  const [voxelCoords, setVoxelCoords] = useState({ x: 0, y: 0, z: 0 })
  const [previewCoordinate, setPreviewCoordinate] = useState<any>(null)
  const [showMini3D, setShowMini3D] = useState(true)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // ========================
  // HOOKS
  // ========================
  const { allSlices, loading } = useSliceExtraction()

  // ========================
  // HANDLERS
  // ========================
  const handleSliceChange = useCallback((orientation: Orientation, direction: 'prev' | 'next') => {
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

  const handleStopEditing = useCallback(() => {
    
    setActiveStructure(null)

  }, [setActiveStructure])

  const handleUndo = () => {
    if (activeStructureId) {
      const currentSlice = currentSlices.axial
      maskManager.setCurrentSlice(activeStructureId, currentSlice)
      maskManager.undo(activeStructureId, currentSlice)
      useMaskStore.setState((s) => ({ ...s }))
    }
  }

  const handleRedo = () => {
    if (activeStructureId) {
      const currentSlice = currentSlices.axial
      maskManager.setCurrentSlice(activeStructureId, currentSlice)
      maskManager.redo(activeStructureId, currentSlice)
      useMaskStore.setState((s) => ({ ...s }))
    }
  }

  const canUndo = () => {
    console.log(viewOrientation)
    if (!activeStructureId) return false
    const currentSlice = currentSlices.axial
    return maskManager.canUndo(activeStructureId, currentSlice)
  }
  
  const canRedo = () => {
    if (!activeStructureId) return false
    const currentSlice = currentSlices.axial
    return maskManager.canRedo(activeStructureId, currentSlice)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    previewCoordinate,
    onSliceChange: handleSliceChange,
    onSaveCoordinate: () => {}, // Handled in SliceView
    onCancelCoordinate: () => setPreviewCoordinate(null),
    onStopEditing: handleStopEditing,
    onUndo: handleUndo,
    onRedo: handleRedo
  })

  // ========================
  // RENDER
  // ========================
  if (loading) {
    return (
      <div className="advanced-mri-viewer">
        <ViewerTopBar voxelCoords={voxelCoords} />
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
        <ViewerTopBar voxelCoords={voxelCoords} />
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
      <ViewerTopBar voxelCoords={voxelCoords} />

      {showSettings && <ViewerSettingsPanel />}

      <div className="viewer-content" ref={containerRef}>
        {viewMode === 'single' && (
          <div className="single-view">
            <SliceView
              // patient_id = {patient_id}
              orientation= "axial"
              slices={allSlices["axial"]}
              onVoxelCoordsChange={setVoxelCoords}
              onPreviewCoordinateChange={setPreviewCoordinate}
              previewCoordinate={previewCoordinate}
              viewMode={viewMode}
            />
          </div>
        )}

        {viewMode === 'quad' && (
          <div className="quad-view-columns">
            <div className="quad-column" onClick={() => setViewOrientation('axial')}>
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Axial</span>
                  <FiMove size={12} />
                </div>
                <SliceView
                  orientation="axial"
                  slices={allSlices.axial}
                  onVoxelCoordsChange={setVoxelCoords}
                  onPreviewCoordinateChange={setPreviewCoordinate}
                  previewCoordinate={previewCoordinate}
                />
              </div>
            </div>

            <div className="quad-column" onClick={() => setViewOrientation("coronal")}>
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Coronal</span>
                  <FiMove size={12} />
                </div>
                <SliceView
                  orientation="coronal"
                  slices={allSlices.coronal}
                  onVoxelCoordsChange={setVoxelCoords}
                  onPreviewCoordinateChange={setPreviewCoordinate}
                  previewCoordinate={previewCoordinate}
                  viewOnly={true}
                />
              </div>
            </div>

            <div className="quad-column" onClick={() => setViewOrientation("sagittal")}>
              <div className="quad-panel">
                <div className="panel-header">
                  <span>Sagittal</span>
                  <FiMove size={12} />
                </div>
                <SliceView
                  orientation="sagittal"
                  slices={allSlices.sagittal}
                  onVoxelCoordsChange={setVoxelCoords}
                  onPreviewCoordinateChange={setPreviewCoordinate}
                  previewCoordinate={previewCoordinate}
                  viewOnly={true}
                />
              </div>
            </div>

            <div className="quad-column">
              <div className="quad-panel">
                <div className="panel-header">
                  <span>3D</span>
                  <FiMaximize2 size={12} />
                </div>
                <ThreeDView />
              </div>
            </div>
          </div>
        )}

        {viewMode === '3d' && <ThreeDView />}

        {viewMode === 'mosaic' && <MosaicView slices={allSlices.axial} />}
      </div>
      {/* Mini 3D Navigator - Show in single view only */}
{viewMode === 'single' && showMini3D && (
  <Mini3DNavigator 
    visible={showMini3D} 
    onClose={() => setShowMini3D(false)} 
  />
)}

{/* Toggle Button - Show when Mini3D is hidden */}
{viewMode === 'single' && !showMini3D && (
  <button 
    className="mini-3d-toggle-btn"
    onClick={() => setShowMini3D(true)}
    title="Show 3D Navigator"
  >
    3D
  </button>
)}

      <div className="shortcuts-info">
        {activeStructureId
          ? 'Editing: D=Draw | E=Erase | Ctrl+Z=Undo | Ctrl+Y=Redo | Enter=Complete'
          : 'Click: Crosshair | Right-Drag: Pan | Wheel: Navigate | Ctrl+Wheel: Zoom'
        }
      </div>

      {activeStructureId && (
        <SegmentationToolbar
          structureColor={structures.find(s => s.id === activeStructureId)?.color || '#7ddb94'}
          structureName={structures.find(s => s.id === activeStructureId)?.title || 'Structure'}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          tool={tool as 'draw' | 'erase'}
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