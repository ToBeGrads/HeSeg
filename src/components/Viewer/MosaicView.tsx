// src/components/Viewer/MosaicView.tsx
import { useRef, useEffect, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { useViewerStore } from '../../store/useViewerStore'
import { useStructureStore } from '../../store/useStructureStore'
import { useMaskStore } from '../../store/useMaskStore'
import { maskManager } from '../../utils/MaskManager'
import { useTranslation } from '../../hooks/useTranslation'

type Orientation = 'axial' | 'coronal' | 'sagittal'

interface MosaicViewProps {
  slices: {
    axial: any[]
    coronal: any[]
    sagittal: any[]
  }
}

export function MosaicView({ slices }: MosaicViewProps) {
  const { t } = useTranslation()
  const { currentSlices, setCurrentSlice } = useViewerStore()
  const structures = useStructureStore((state) => state.mystructures)
  const { maskVisibility } = useMaskStore()
  
  const [orientation, setOrientation] = useState<Orientation>('axial')
  const [showDropdown, setShowDropdown] = useState(false)
  
  const currentSliceData = slices[orientation] || []
  const currentSlice = currentSlices[orientation]
  const totalItems = Math.min(30, currentSliceData.length)
  const startIndex = Math.max(0, currentSlice - Math.floor(totalItems / 2))
  
  const handleSliceClick = (index: number) => {
    setCurrentSlice(orientation, index)
  }
  
  const handleOrientationChange = (newOrientation: Orientation) => {
    setOrientation(newOrientation)
    setShowDropdown(false)
  }

  const getOrientationLabel = (ori: Orientation) => {
    switch (ori) {
      case 'axial': return t.advancedMRI?.axial || 'Axial'
      case 'coronal': return t.advancedMRI?.coronal || 'Coronal'
      case 'sagittal': return t.advancedMRI?.sagittal || 'Sagittal'
      default: return ori
    }
  }

  return (
    <div className="mosaic-view">
      <div className="mosaic-header">
        <div className="mosaic-header-left">
          <h3>{getOrientationLabel(orientation)} {t.mosaic.slices || 'Slices'}</h3>
          
          {/* Orientation Selector */}
          <div className="mosaic-orientation-selector">
            <button 
              className="mosaic-orientation-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>{getOrientationLabel(orientation)}</span>
              <FiChevronDown 
                size={14} 
                style={{ 
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </button>
            
            {showDropdown && (
              <div className="mosaic-orientation-dropdown">
                <button 
                  className={`mosaic-orientation-option ${orientation === 'axial' ? 'active' : ''}`}
                  onClick={() => handleOrientationChange('axial')}
                >
                  {t.advancedMRI?.axial || 'Axial'}
                </button>
                <button 
                  className={`mosaic-orientation-option ${orientation === 'coronal' ? 'active' : ''}`}
                  onClick={() => handleOrientationChange('coronal')}
                >
                  {t.advancedMRI?.coronal || 'Coronal'}
                </button>
                <button 
                  className={`mosaic-orientation-option ${orientation === 'sagittal' ? 'active' : ''}`}
                  onClick={() => handleOrientationChange('sagittal')}
                >
                  {t.advancedMRI?.sagittal || 'Sagittal'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <span>{t.mosaic?.showing || 'Showing'} {totalItems} {t.mosaic?.of || 'of'} {currentSliceData.length}</span>
      </div>
      
      <div className="mosaic-grid">
        {Array.from({ length: totalItems }, (_, i) => {
          const sliceIndex = startIndex + i
          if (sliceIndex >= currentSliceData.length) return null
          const slice = currentSliceData[sliceIndex]
          const isActive = sliceIndex === currentSlice
          return (
            <MosaicCell
              key={`${orientation}-${sliceIndex}`}
              slice={slice}
              sliceIndex={sliceIndex}
              isActive={isActive}
              onClick={() => handleSliceClick(sliceIndex)}
              structures={structures}
              maskVisibility={maskVisibility}
              orientation={orientation}
            />
          )
        })}
      </div>
    </div>
  )
}

interface MosaicCellProps {
  slice: any
  sliceIndex: number
  isActive: boolean
  onClick: () => void
  structures: any[]
  maskVisibility: Record<number, boolean>
  orientation: Orientation
}

function MosaicCell({ slice, sliceIndex, isActive, onClick, structures, maskVisibility, orientation }: MosaicCellProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!slice?.canvas || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const actualWidth = slice.actualWidth || slice.width
    const actualHeight = slice.actualHeight || slice.height
    
    // Set canvas size
    canvas.width = actualWidth
    canvas.height = actualHeight
    
    // Clear canvas
    ctx.clearRect(0, 0, actualWidth, actualHeight)
    
    // Create image from slice canvas
    const img = new Image()
    img.onload = () => {
      // Draw MRI slice
      ctx.drawImage(img, 0, 0, actualWidth, actualHeight)
      
      // Draw mask overlays
      Object.entries(maskVisibility).forEach(([structureIdStr, visible]) => {
        if (!visible) return
        const structureId = parseInt(structureIdStr)
        const maskSlice = maskManager.getMaskSlice(structureId, orientation, sliceIndex)
        if (!maskSlice) return
        
        const structure = structures.find(s => s.id === structureId)
        const structureColor = structure?.color || '#7ddb94'
        
        // Parse color
        const r = parseInt(structureColor.slice(1, 3), 16)
        const g = parseInt(structureColor.slice(3, 5), 16)
        const b = parseInt(structureColor.slice(5, 7), 16)
        
        // Create temporary canvas for mask overlay
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = actualWidth
        tempCanvas.height = actualHeight
        const tempCtx = tempCanvas.getContext('2d')
        if (!tempCtx) return
        
        // Create overlay image data
        const imageData = tempCtx.createImageData(actualWidth, actualHeight)
        const data = imageData.data
        
        // Fill mask data with transparency
        for (let i = 0; i < maskSlice.length; i++) {
          if (maskSlice[i] > 0) {
            const idx = i * 4
            data[idx] = r
            data[idx + 1] = g
            data[idx + 2] = b
            data[idx + 3] = Math.round(0.5 * 255) // 50% opacity
          }
        }
        
        // Put image data on temp canvas
        tempCtx.putImageData(imageData, 0, 0)
        
        // Draw temp canvas onto main canvas
        ctx.drawImage(tempCanvas, 0, 0)
      })
    }
    
    img.src = slice.canvas.toDataURL()
  }, [slice, sliceIndex, structures, maskVisibility, orientation])
  
  if (!slice?.canvas) return null
  
  return (
    <div
      className={`mosaic-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        className="mosaic-image"
        style={{
          width: '100%',
          height: 'auto',
          minHeight: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
          objectFit: 'contain',
         
        }}
      />
      <div className="mosaic-label">{sliceIndex + 1}</div>
    </div>
  )
}