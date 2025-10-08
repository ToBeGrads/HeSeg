// src/components/SidebarItem.tsx
import { FiEdit3, FiStar, FiGrid, FiEye, FiEyeOff, FiEdit2, FiTrash2 } from 'react-icons/fi'
import './SidebarItem.css'
import { useState } from 'react'
import Axios from "../utils/Axios"
import { useMRI } from "../Context/MRIcontext"
import { maskManager } from "../utils/MaskManager"

interface Coordinate {
  x: number
  y: number
  z: number
  hasSegmentation?: boolean // ADD THIS
}

interface SidebarItemProps {
  title: string
  color: string
  coordinates: Coordinate[]
  onAdd: () => void
  onToggleMask?: () => void
  onStartEditing?: () => void
  maskVisible?: boolean
  isEditing?: boolean
  structureId: number
  onCoordinatesChange?: (coords: Coordinate[]) => void // ADD THIS
  onCoordinateClick?: (coord: Coordinate) => void // ADD THIS
}

function SidebarItem({ 
  title, 
  color, 
  coordinates, 
  onAdd,
  onToggleMask,
  onStartEditing,
  maskVisible = false,
  isEditing = false,
  structureId,
  onCoordinatesChange,
  onCoordinateClick
}: SidebarItemProps) {
  const { currentSliceURL, setSelectedCoordinates, volumeData } = useMRI()
  setSelectedCoordinates(coordinates)
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null)
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }
  
  const handleGeminiAction = () => {
    console.log(`Gemini action for ${title}`)
  }
  
  const handleEditCoordinate = (index: number) => {
    console.log(`Edit coordinate ${index} from ${title}`)
  }
  
  const handleCoordinateClick = (coord: Coordinate) => {
    console.log('📍 Jumping to coordinate:', coord)
    if (onCoordinateClick) {
      onCoordinateClick(coord)
    }
  }
  
  const handleDeleteCoordinate = (index: number) => {
    setDeleteConfirmIndex(index)
  }

  const confirmDelete = (index: number) => {
    console.log(`🗑️ Deleting coordinate ${index}`)
    const newCoordinates = coordinates.filter((_, i) => i !== index)
    if (onCoordinatesChange) {
      onCoordinatesChange(newCoordinates)
    }
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
      
      if (!currentSliceURL) {
        console.error('❌ No slice URL')
        setIsGenerating(false)
        setLoadingIndex(null)
        return
      }

      console.log(`📍 Coordinate: x=${coord.x}, y=${coord.y}, z=${coord.z}`)
      
      const response = await Axios.post("/segment", {
        coords: coord,
        file: currentSliceURL,
      })
      
      if (response.data?.success && response.data.mask) {
        console.log("✅ Received mask from backend")
        console.log("📏 Mask shape:", response.data.mask_shape)
        
        const existingMask = maskManager.getMask(structureId)
        if (!existingMask) {
          console.error("❌ No mask for structure", structureId)
          setIsGenerating(false)
          setLoadingIndex(null)
          return
        }

        console.log("📦 Volume dimensions:", existingMask.dims)
        
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
          
          maskManager.setCurrentSlice(structureId, sliceIndex)
          if (!maskManager.canUndo(structureId, sliceIndex)) {
            maskManager.saveHistory(structureId, sliceIndex)
          }
          
          let pixelsAdded = 0
          
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
          
          maskManager.saveHistory(structureId, sliceIndex)
          maskManager.setVisibility(structureId, true)
          onToggleMask?.()
          
          // Mark coordinate as having segmentation
          const updatedCoordinates = [...coordinates]
          updatedCoordinates[index] = { ...coord, hasSegmentation: true }
          if (onCoordinatesChange) {
            onCoordinatesChange(updatedCoordinates)
          }
          
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
      console.error('❌ Error:', error.message)
      setIsGenerating(false)
      setLoadingIndex(null)
    }
  }

  return (
    <div className="sidebar-item-container">
      <div className="sidebar-item">
        <div className="sidebar-item-color" style={{ backgroundColor: color }}></div>
        <span className="sidebar-item-title" onClick={toggleExpanded}>
          {title}
        </span>
        
        <button 
          className={`sidebar-item-btn ${maskVisible ? 'active-mask' : ''}`}
          onClick={onToggleMask}
          title={maskVisible ? 'Hide mask' : 'Show mask'}
          style={maskVisible ? {
            backgroundColor: `${color}33`,
            color: color
          } : {}}
        >
          {maskVisible ? <FiEye /> : <FiEyeOff />}
        </button>
        
        <button 
          className={`sidebar-item-btn ${isEditing ? 'active-editing' : ''}`}
          onClick={onStartEditing}
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
        
        <button className="sidebar-item-btn" onClick={onAdd}>
          +
        </button>
      </div>
      
      {isExpanded && (
        <div className="coordinates-list">
          <div className="coordinates-header">
            <span>Coordinates</span>
            <button className="gen-btn" onClick={handleGeminiAction}>
              <FiGrid size={16} />
            </button>
          </div>
          
          {coordinates.length > 0 ? (
            [...coordinates].reverse().map((coord, reverseIndex) => {
              const index = coordinates.length - 1 - reverseIndex
              return (
                <div 
                  key={index} 
                  className={`coordinate-item ${coord.hasSegmentation ? 'has-segmentation' : ''}`}
                  onClick={() => handleCoordinateClick(coord)}
                >
                  <div className="coord-info">
                    <span className="coord-label">P{index + 1}:</span>
                    <span className="coord-values">
                      X:{coord.x} Y:{coord.y} Z:{coord.z}
                    </span>
                  </div>
                  <div className="coord-actions">
      
                    
                    {/* Show spinner while generating, hide button after */}
                    {isGenerating && loadingIndex === index ? (
                      <button 
                      className="coord-action-btn"
                      disabled
                      
                    >
                      <div className="coord-loading-spinner" />
                    </button>
                    ) : !coord.hasSegmentation ? (
                      <button 
                        className="coord-action-btn generate-btn" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGenerateCoordinate(index)
                        }}
                        disabled={isGenerating}
                        title="Generate segmentation"
                      >
                        <FiStar/>
                      </button>
                    ) : null}
                    
                    {/* Delete button with confirmation */}
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="coord-action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCoordinate(index)
                        }}
                        title="Delete coordinate"
                      >
                        <FiTrash2/>
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
            <div className="no-coordinates">No coordinates</div>
          )}
        </div>
      )}
    </div>
  )
}

export default SidebarItem