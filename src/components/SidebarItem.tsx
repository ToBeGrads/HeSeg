// src/components/SidebarItem.tsx
import { FiStar, FiEye, FiEyeOff, FiEdit2, FiTrash2 } from 'react-icons/fi'
import './SidebarItem.css'
import { useState } from 'react'
import { useMRI } from "../Context/MRIcontext"
import { maskManager } from "../utils/MaskManager"
import { useViewerStore } from '../store/useViewerStore'
import { useStructureStore } from '../store/useStructureStore'
import { useMaskStore } from '../store/useMaskStore'
import { segment } from '../utils/functionalities'
import {useTranslation} from '../hooks/useTranslation'


interface SidebarItemProps {
  structureId: number
  onAddCoordinate: () => void
  ratingMode?: boolean
  titre : string
}

function SidebarItem({ structureId, onAddCoordinate, ratingMode, titre }: SidebarItemProps) {
  // ========================
  // GET STATE FROM STORES
  // ========================
  const { jumpToCoordinate, setSingleViewOrientation, setViewMode, updateViewState } = useViewerStore()

  const {t} = useTranslation()

  // Get structure data
  // console.log("srtc id",structureId )
  
  const structure = useStructureStore((state) =>
    state.mystructures.find(s => s.id === structureId)
  )
  // console.log("from side ba item", structure)
  const { updateCoordinates } = useStructureStore()

  // Get mask state
  const maskVisibility = useMaskStore((state) => state.maskVisibility)
  const activeStructureId = useMaskStore((state) => state.activeStructureId)
  const { toggleMaskVisibility, setActiveStructure } = useMaskStore()
  const maskOpacity = useMaskStore((state) => state.maskOpacity[structureId] ?? 0.5)
  const setMaskOpacity = useMaskStore((state) => state.setMaskOpacity)
  const { currentSliceURL } = useMRI()
  



  // ========================
  // LOCAL STATE
  // ========================
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null)
  const [segmentedExpanded, setSegmentedExpanded] = useState(false)


  // ========================
  // GUARDS
  // ========================
  if (!structure) {
    console.error(`Structure ${structureId} not found`)
    return null
  }

  const { title, color, coordinates } = structure
  const maskVisible = maskVisibility[structureId] || false
  const isEditing = activeStructureId === structureId

  // ========================
  // HANDLERS
  // ========================
  const getOrientationLabel = (orientation?: string) => {
    switch (orientation) {
      case 'axial': return 'Ax'
      case 'coronal': return 'Co'
      case 'sagittal': return 'Sa'
      default: return '—'
    }
  }
  
  const getOrientationColor = (orientation?: string) => {
    switch (orientation) {
      case 'axial': return '#7ddb94'
      case 'coronal': return '#64b5f6'
      case 'sagittal': return '#ffb74d'
      default: return '#888'
    }
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }


  const handleToggleMask = () => {
    // console.log(`Toggle mask for structure ${structureId}`)
    toggleMaskVisibility(structureId)
    maskManager.toggleVisibility(structureId)
  }

  const handleStartEditing = () => {
    if (isEditing) return
    // console.log(`Start editing structure ${structureId}`)
    setActiveStructure(structureId)

    // Auto-enable mask visibility
    if (!maskVisibility[structureId]) {
      toggleMaskVisibility(structureId)
      maskManager.setVisibility(structureId, true)
    }
  }

  const handleCoordinateClick = (coord: { x: number; y: number; z: number; orientation?: string }) => {
    jumpToCoordinate(coord)
    if (coord.orientation) {
      setSingleViewOrientation(coord.orientation as 'axial' | 'coronal' | 'sagittal')
      setViewMode('single')

      updateViewState(coord.orientation as 'axial' | 'coronal' | 'sagittal', { scale: 4 })
    }
  }

  const handleDeleteCoordinate = (index: number) => {
    setDeleteConfirmIndex(index)
  }

  const confirmDelete = (index: number) => {
    // console.log(`Deleting coordinate ${index} from structure ${structureId}`)
    // here delete from the backend using update coordinates
    const newCoordinates = coordinates.filter((_, i) => i !== index)
    updateCoordinates(structureId, newCoordinates)
    setDeleteConfirmIndex(null)
  }

  const cancelDelete = () => {
    setDeleteConfirmIndex(null)
  }

  const handleGenerateCoordinate = async (index: number) => {
    setIsGenerating(true)
    setLoadingIndex(index)
  
    try {
      console.log(`Generating mask for coordinate ${index}`)
      const coord = coordinates[index]
      const orientation = coord.orientation || 'axial' // Get the orientation!
      
      console.log('Jumping to coordinate before generating:', coord)
      console.log('Orientation:', orientation)
      jumpToCoordinate(coord)
  
      if (!currentSliceURL) {
        console.error('No slice URL available')
        setIsGenerating(false)
        setLoadingIndex(null)
        return
      }
  
      // Calculate the correct 2D pixel coordinates for SAM based on orientation
      let samCoords = { x: coord.x, y: coord.y, z: coord.z }
      
      // Get volume dimensions from maskManager
      const existingMask = await maskManager.getMask(structureId)
      if (!existingMask || !existingMask.dims) {
        console.error("No mask exists for structure", structureId)
        setIsGenerating(false)
        setLoadingIndex(null)
        return
      }
      
      const [dimX, dimY, dimZ] = existingMask.dims
      
      // Convert 3D voxel coords to 2D pixel coords for SAM
      switch (orientation) {
        case 'axial':
          // pixelX = voxelX, pixelY = voxelY
          samCoords = { x: coord.x, y: coord.y, z: coord.z }
          break
        case 'coronal':
          // pixelX = voxelX, pixelY = dimZ - 1 - voxelZ (Z is flipped)
          samCoords = { x: coord.x, y: dimZ - 1 - coord.z, z: coord.y }
          break
        case 'sagittal':
          // pixelX = voxelY, pixelY = dimZ - 1 - voxelZ (Z is flipped)
          samCoords = { x: coord.y, y: dimZ - 1 - coord.z, z: coord.x }
          break
      }
      
      console.log(`SAM Coordinates: x=${samCoords.x}, y=${samCoords.y}`)
      
      const response = await segment(samCoords, currentSliceURL)
      console.log("the response from segment", response!.data)
  
      if (response!.status == 200 && response!.data.mask) {
        console.log("Received mask from backend")
        console.log("Mask shape:", response!.data.mask_shape)
  
        console.log("Volume dimensions:", existingMask.dims)
  
        // Decode base64 mask
        const maskBase64 = response!.data.mask.split(',')[1]
        const binaryString = atob(maskBase64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
  
        const blob = new Blob([bytes], { type: 'image/png' })
        const img = new Image()
        img.src = URL.createObjectURL(blob)
  
        img.onload = () => {
          console.log(`Loaded mask image: ${img.width}x${img.height}`)
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
  
          if (!ctx) {
            console.error('No canvas context')
            setIsGenerating(false)
            setLoadingIndex(null)
            return
          }
  
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, img.width, img.height)
  
          // Get the correct slice index based on orientation
          let sliceIndex: number
          switch (orientation) {
            case 'axial':
              sliceIndex = coord.z
              break
            case 'coronal':
              sliceIndex = coord.y
              break
            case 'sagittal':
              sliceIndex = coord.x
              break
            default:
              sliceIndex = coord.z
          }
  
          console.log(`Mapping ${img.width}x${img.height} mask to volume slice ${sliceIndex} (${orientation})`)
  
          // Save history before modifying
          maskManager.setCurrentSlice(structureId, sliceIndex)
          if (!maskManager.canUndo(structureId, sliceIndex)) {
            maskManager.saveHistory(structureId, sliceIndex)
          }
  
          let pixelsAdded = 0
          const patient_id = localStorage.getItem('selected_patient')!
  
          // Map mask pixels to volume based on orientation
          for (let maskY = 0; maskY < img.height; maskY++) {
            for (let maskX = 0; maskX < img.width; maskX++) {
              const idx = (maskY * img.width + maskX) * 4
              const pixelValue = imageData.data[idx]
  
              if (pixelValue > 128) {
                let voxelX: number, voxelY: number, voxelZ: number
  
                switch (orientation) {
                  case 'axial':
                    // maskX → voxelX, maskY → voxelY, sliceIndex → voxelZ
                    voxelX = maskX
                    voxelY = maskY
                    voxelZ = sliceIndex
                    break
                  case 'coronal':
                    // maskX → voxelX, maskY → voxelZ (flipped), sliceIndex → voxelY
                    voxelX = maskX
                    voxelY = sliceIndex
                    voxelZ = dimZ - 1 - maskY  // Flip Z back
                    break
                  case 'sagittal':
                    // maskX → voxelY, maskY → voxelZ (flipped), sliceIndex → voxelX
                    voxelX = sliceIndex
                    voxelY = maskX
                    voxelZ = dimZ - 1 - maskY  // Flip Z back
                    break
                  default:
                    voxelX = maskX
                    voxelY = maskY
                    voxelZ = sliceIndex
                }
  
                // Bounds check
                if (voxelX >= 0 && voxelX < dimX &&
                    voxelY >= 0 && voxelY < dimY &&
                    voxelZ >= 0 && voxelZ < dimZ) {
                  maskManager.updateMaskVoxel(structureId, patient_id, voxelX, voxelY, voxelZ, 255, 1)
                  pixelsAdded++
                }
              }
            }
          }
  
          console.log(`Added ${pixelsAdded} pixels to mask`)
  
          // Save history after modification
          maskManager.saveHistory(structureId, sliceIndex)
  
          // Make mask visible if not already
          if (!maskVisible) {
            maskManager.setVisibility(structureId, true)
            toggleMaskVisibility(structureId)
          }
  
          // Mark coordinate as having segmentation
          const updatedCoordinates = [...coordinates]
          updatedCoordinates[index] = { ...coord, hasSegmentation: true }
          updateCoordinates(structureId, updatedCoordinates)
  
          URL.revokeObjectURL(img.src)
          setIsGenerating(false)
          setLoadingIndex(null)
        }
  
        img.onerror = () => {
          console.error('Failed to load mask image')
          URL.revokeObjectURL(img.src)
          setIsGenerating(false)
          setLoadingIndex(null)
        }
  
      } else {
        console.error('No mask in response')
        setIsGenerating(false)
        setLoadingIndex(null)
      }
    } catch (error: any) {
      console.error('Generation error:', error.message)
      setIsGenerating(false)
      setLoadingIndex(null)
    }
  }

  // ========================
  // RENDER
  // ========================

  return (
    <div className="sidebar-item-container">
      <div className="sidebar-item" title={titre}>
        <div className="sidebar-item-color" style={{ backgroundColor: color }}></div>
        <span className="sidebar-item-title" onClick={toggleExpanded}>
          {title}
        </span>

        {/* Toggle Mask Visibility */}
        <button
          className={`sidebar-item-btn ${maskVisible ? 'active-mask' : ''}`}
          onClick={handleToggleMask}
          title={maskVisible ? t.sidebar.hideMask : t.sidebar.showMask}
          style={maskVisible ? {
            backgroundColor: `${color}33`,
            color: color
          } : {}}
        >
          {maskVisible ? <FiEye /> : <FiEyeOff />}
        </button>

        {/* Start Editing */}
        {!ratingMode && (
          <button
            className={`sidebar-item-btn ${isEditing ? 'active-editing' : ''}`}
            onClick={handleStartEditing}
            disabled={isEditing}
            title={isEditing ? t.sidebar.editing : t.sidebar.editMask}
            style={isEditing ? {
              backgroundColor: `${color}55`,
              color: color,
              cursor: 'not-allowed'
            } : {}}
          >
            <FiEdit2 />
          </button>
        )}
        {/* Opacity Slider */}
        <div className="opacity-control">
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.01}
            value={maskOpacity}
            onChange={(e) => {
              setMaskOpacity(structureId, Number(e.target.value));
              const value = parseFloat(e.target.value);
              e.target.style.background = `linear-gradient(90deg, #7ddb94 ${value * 100}%, #ccc ${value * 100}%)`;
            }}
            style={{
              background: `linear-gradient(90deg, #7ddb94 ${maskOpacity * 100}%, #ccc ${maskOpacity * 100}%)`,
            }}
            title={`${t.sidebar.opacity}: ${Math.round(maskOpacity * 100)}%`} // Tooltip for better UX
          />
        </div>
      </div>

      {isExpanded && !ratingMode && (
        <div className="coordinates-list">
          {/* Unsegmented Coordinates Section */}
          <div className="coordinates-section">
            <div className="coordinates-header">
              <span>{t.sidebar.active} ({coordinates.filter(c => !c.hasSegmentation).length})</span>
              {/* Add Coordinate */}
              <button
                className="sidebar-item-btn add-cor"
                onClick={onAddCoordinate}
                title={t.sidebar.addNew + " " + t.sidebar.coordinate}
              >
                +
              </button>
            </div>

            {coordinates.filter(c => !c.hasSegmentation).length > 0 ? (
              [...coordinates].reverse().map((coord, reverseIndex) => {
                if (coord.hasSegmentation) return null

                const index = coordinates.length - 1 - reverseIndex
                return (
                  <div
                    key={index}
                    className="coordinate-item"
                    onClick={() => handleCoordinateClick(coord)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="coord-info">
                    <span className="coord-label">
                          P{index + 1}
                          <span 
                            className="orientation-badge"
                            style={{ 
                              backgroundColor: getOrientationColor(coord.orientation),
                              color: '#1a1a1a'
                            }}
                            title={coord.orientation || 'Unknown'}
                          >
                            {getOrientationLabel(coord.orientation)}
                          </span>
                        </span>
                      <span className="coord-values">
                        X:{coord.x} Y:{coord.y} Z:{coord.z}
                      </span>
                    </div>
                    <div className="coord-actions">
                      {isGenerating && loadingIndex === index ? (
                        <button
                          className="coord-action-btn"
                          disabled
                          title={t.sidebar.generating}
                        >
                          <div className="coord-loading-spinner" />
                        </button>
                      ) : (
                        <button
                          className="coord-action-btn generate-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateCoordinate(index)
                          }}
                          disabled={isGenerating}
                          title={t.sidebar.generate}
                        >
                          <FiStar />
                        </button>
                      )}

                      <div style={{ position: 'relative' }}>
                        <button
                          className="coord-action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCoordinate(index)
                          }}
                          title={t.sidebar.delete}
                        >
                          <FiTrash2 />
                        </button>

                        {deleteConfirmIndex === index && (
                          <div className="delete-confirmation">
                            <p>Delete this point?</p>
                            <div className="delete-actions">
                              <button
                                className="delete-yes"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  confirmDelete(index)
                                }}
                              >
                                {t.sidebar.yes}
                              </button>
                              <button
                                className="delete-no"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  cancelDelete()
                                }}
                              >
                                {t.sidebar.no}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="no-coordinates">{t.sidebar.noActivePoint}</div>
            )}
          </div>

          {/* Segmented Coordinates Section - Collapsible */}
          {coordinates.filter(c => c.hasSegmentation).length > 0 && (
            <div className="coordinates-section segmented-section">
              <div
                className="coordinates-header collapsible"
                onClick={() => setSegmentedExpanded(!segmentedExpanded)}
                style={{ cursor: 'pointer' }}
              >
                <span>
                  {t.sidebar.segmented} ({coordinates.filter(c => c.hasSegmentation).length})
                  {segmentedExpanded ? ' ▼' : ' ▶'}
                </span>
              </div>

              {segmentedExpanded && (
                <div className="segmented-list">
                  {[...coordinates].reverse().map((coord, reverseIndex) => {
                    if (!coord.hasSegmentation) return null

                    const index = coordinates.length - 1 - reverseIndex
                    return (
                      <div
                        key={index}
                        className="coordinate-item segmented-item"
                        onClick={() => handleCoordinateClick(coord)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="coord-info">
                        <span className="coord-label">
  P{index + 1}
  <span 
    className="orientation-badge"
    style={{ 
      backgroundColor: getOrientationColor(coord.orientation),
      color: '#1a1a1a'
    }}
    title={coord.orientation || 'Unknown'}
  >
    {getOrientationLabel(coord.orientation)}
  </span>
</span>
                          <span className="coord-values">
                            X:{coord.x} Y:{coord.y} Z:{coord.z}
                          </span>
                        </div>
                        <div className="coord-actions">
                          <div style={{ position: 'relative' }}>
                            <button
                              className="coord-action-btn delete-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteCoordinate(index)
                              }}
                              title="Delete coordinate"
                            >
                              <FiTrash2 />
                            </button>

                            {deleteConfirmIndex === index && (
                              <div className="delete-confirmation">
                                <p>Delete this point?</p>
                                <div className="delete-actions">
                                  <button
                                    className="delete-yes"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      confirmDelete(index)
                                    }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    className="delete-no"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      cancelDelete()
                                    }}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SidebarItem