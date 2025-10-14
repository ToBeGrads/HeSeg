// src/components/SidebarItem.tsx
import { FiStar, FiGrid, FiEye, FiEyeOff, FiEdit2, FiTrash2 } from 'react-icons/fi'
import './SidebarItem.css'
import { useState } from 'react'
import Axios from "../utils/Axios"
import { useMRI } from "../Context/MRIcontext"
import { maskManager } from "../utils/MaskManager"
import { useViewerStore } from '../store/useViewerStore'
import { useStructureStore } from '../store/useStructureStore'
import { useMaskStore } from '../store/useMaskStore'


interface SidebarItemProps {
  structureId: number
  onAddCoordinate: () => void 
}

function SidebarItem({ structureId, onAddCoordinate }: SidebarItemProps) {
  // ========================
  // GET STATE FROM STORES
  // ========================
  const jumpToCoordinate = useViewerStore((state) => state.jumpToCoordinate)
  
  // Get structure data
  const structure = useStructureStore((state) => 
    state.structures.find(s => s.id === structureId)
  )
  const { updateCoordinates } = useStructureStore()
  
  // Get mask state
  const maskVisibility = useMaskStore((state) => state.maskVisibility)
  const activeStructureId = useMaskStore((state) => state.activeStructureId)
  const { toggleMaskVisibility, setActiveStructure } = useMaskStore()
  
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
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }
  
  const handleGeminiAction = () => {
    console.log(`Gemini action for ${title}`)
  }
  
  const handleToggleMask = () => {
    console.log(`Toggle mask for structure ${structureId}`)
    toggleMaskVisibility(structureId)
    maskManager.toggleVisibility(structureId)
  }

  const handleStartEditing = () => {
    if (isEditing) return
    console.log(`Start editing structure ${structureId}`)
    setActiveStructure(structureId)

    // Auto-enable mask visibility
    if(!maskVisibility[structureId]) {
      toggleMaskVisibility(structureId)
      maskManager.setVisibility(structureId, true)
    }
  }
  
  const handleCoordinateClick = (coord: { x: number; y: number; z: number }) => {
    console.log('📍 Jumping to coordinate:', coord)
    jumpToCoordinate(coord)
  }
  
  const handleDeleteCoordinate = (index: number) => {
    setDeleteConfirmIndex(index)
  }

  const confirmDelete = (index: number) => {
    console.log(`🗑️ Deleting coordinate ${index} from structure ${structureId}`)
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
      console.log(`🔄 Generating mask for coordinate ${index}`)
      
      const coord = coordinates[index]
      console.log('📍 Jumping to coordinate before generating:', coord)
      jumpToCoordinate(coord)
      
      if (!currentSliceURL) {
        console.error('❌ No slice URL available')
        setIsGenerating(false)
        setLoadingIndex(null)
        return
      }

      console.log(`📍 Coordinate: x=${coord.x}, y=${coord.y}, z=${coord.z}`)
      
      const response = await Axios.post("/segment/", {
        coords: coord,
        file: currentSliceURL,
      })
      
      if (response.data?.success && response.data.mask) {
        console.log("✅ Received mask from backend")
        console.log("📏 Mask shape:", response.data.mask_shape)
        
        const existingMask = await maskManager.getMask(structureId)
        console.log("📦 Existing mask:", existingMask)

        if (!existingMask) {
          console.error("❌ No mask exists for structure", structureId)
          setIsGenerating(false)
          setLoadingIndex(null)
          return
        }

        console.log("📦 Volume dimensions:", existingMask.dims)
        
        // Decode base64 mask
        const maskBase64 = response.data.mask.split(',')[1]
        const binaryString = atob(maskBase64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        
        const blob = new Blob([bytes], { type: 'image/png' })
        const img = new Image()
        img.src = URL.createObjectURL(blob)
        
        img.onload = () => {
          console.log(`🖼️ Loaded mask image: ${img.width}x${img.height}`)
          
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            console.error('❌ No canvas context')
            setIsGenerating(false)
            setLoadingIndex(null)
            return
          }

          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, img.width, img.height)
          
          const sliceIndex = coord.z
          const [dimX, dimY, dimZ] = existingMask.dims
          
          console.log(`🔧 Mapping ${img.width}x${img.height} mask to ${dimX}x${dimY} volume slice ${sliceIndex}`)
          
          // Save history before modifying
          maskManager.setCurrentSlice(structureId, sliceIndex)
          if (!maskManager.canUndo(structureId, sliceIndex)) {
            maskManager.saveHistory(structureId, sliceIndex)
          }
          
          let pixelsAdded = 0
          
          // Map mask pixels to volume
          for (let maskY = 0; maskY < img.height; maskY++) {
            for (let maskX = 0; maskX < img.width; maskX++) {
              const idx = (maskY * img.width + maskX) * 4
              const pixelValue = imageData.data[idx]
              
              if (pixelValue > 128) {
                const voxelX = maskX
                const voxelY = maskY
                const voxelZ = sliceIndex
                
                if (voxelX >= 0 && voxelX < dimX && 
                    voxelY >= 0 && voxelY < dimY && 
                    voxelZ >= 0 && voxelZ < dimZ) {
                  
                  maskManager.updateMaskVoxel(structureId, voxelX, voxelY, voxelZ, 255, 1)
                  pixelsAdded++
                }
              }
            }
          }
          
          console.log(`✅ Added ${pixelsAdded} pixels to mask`)
          
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
          console.error('❌ Failed to load mask image')
          URL.revokeObjectURL(img.src)
          setIsGenerating(false)
          setLoadingIndex(null)
        }
        
      } else {
        console.error('❌ No mask in response')
        setIsGenerating(false)
        setLoadingIndex(null)
      }
    } catch (error: any) {
      console.error('❌ Generation error:', error.message)
      setIsGenerating(false)
      setLoadingIndex(null)
    }
  }

  // ========================
  // RENDER
  // ========================

  return (
    <div className="sidebar-item-container">
      <div className="sidebar-item">
        <div className="sidebar-item-color" style={{ backgroundColor: color }}></div>
        <span className="sidebar-item-title" onClick={toggleExpanded}>
          {title}
        </span>
        
        {/* Toggle Mask Visibility */}
        <button 
          className={`sidebar-item-btn ${maskVisible ? 'active-mask' : ''}`}
          onClick={handleToggleMask}
          title={maskVisible ? 'Hide mask' : 'Show mask'}
          style={maskVisible ? {
            backgroundColor: `${color}33`,
            color: color
          } : {}}
        >
          {maskVisible ? <FiEye /> : <FiEyeOff />}
        </button>
        
        {/* Start Editing */}
        <button 
          className={`sidebar-item-btn ${isEditing ? 'active-editing' : ''}`}
          onClick={handleStartEditing}
          disabled={isEditing}
          title={isEditing ? 'Editing...' : 'Edit mask'}
          style={isEditing ? {
            backgroundColor: `${color}55`,
            color: color,
            cursor: 'not-allowed'
          } : {}}
        >
          <FiEdit2 />
        </button>
        
        {/* Add Coordinate */}
        <button 
          className="sidebar-item-btn" 
          onClick={onAddCoordinate}
          title="Add coordinate"
        >
          +
        </button>
      </div>
      
      {isExpanded && (
  <div className="coordinates-list">
    {/* Unsegmented Coordinates Section */}
    <div className="coordinates-section">
      <div className="coordinates-header">
        <span>Active Points ({coordinates.filter(c => !c.hasSegmentation).length})</span>
        <button className="gen-btn" onClick={handleGeminiAction} title="Bulk actions">
          <FiGrid size={16} />
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
                <span className="coord-label">P{index + 1}:</span>
                <span className="coord-values">
                  X:{coord.x} Y:{coord.y} Z:{coord.z}
                </span>
              </div>
              <div className="coord-actions">
                {isGenerating && loadingIndex === index ? (
                  <button 
                    className="coord-action-btn"
                    disabled
                    title="Generating..."
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
                    title="Generate segmentation"
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
        })
      ) : (
        <div className="no-coordinates">No active points</div>
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
            Segmented ({coordinates.filter(c => c.hasSegmentation).length})
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
                    <span className="coord-label">P{index + 1}:</span>
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