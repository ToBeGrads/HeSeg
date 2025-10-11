// src/components/Viewer/MosaicView.tsx
import { useRef, useEffect } from 'react'
import { useViewerStore } from '../../store/useViewerStore'
import { useStructureStore } from '../../store/useStructureStore'
import { useMaskStore } from '../../store/useMaskStore'
import { maskManager } from '../../utils/MaskManager'

interface MosaicViewProps {
  slices: any[]
}

export function MosaicView({ slices }: MosaicViewProps) {
  const { currentSlices, setCurrentSlice } = useViewerStore()
  const structures = useStructureStore((state) => state.structures)
  const { maskVisibility } = useMaskStore()
  const currentSlice = currentSlices.axial

  const totalItems = Math.min(30, slices.length)
  const startIndex = Math.max(0, currentSlice - Math.floor(totalItems / 2))

  const handleSliceClick = (index: number) => {
    setCurrentSlice('axial', index)
  }

  return (
    <div className="mosaic-view">
      <div className="mosaic-header">
        <h3>Axial Slices</h3>
        <span>Showing {totalItems} of {slices.length}</span>
      </div>
      <div className="mosaic-grid">
        {Array.from({ length: totalItems }, (_, i) => {
          const sliceIndex = startIndex + i
          if (sliceIndex >= slices.length) return null

          const slice = slices[sliceIndex]
          const isActive = sliceIndex === currentSlice

          return (
            <MosaicCell
              key={sliceIndex}
              slice={slice}
              sliceIndex={sliceIndex}
              isActive={isActive}
              onClick={() => handleSliceClick(sliceIndex)}
              structures={structures}
              maskVisibility={maskVisibility}
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
}

function MosaicCell({ slice, sliceIndex, isActive, onClick, structures, maskVisibility }: MosaicCellProps) {
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
        const maskSlice = maskManager.getMaskSlice(structureId, 'axial', sliceIndex)
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
        
        // Draw temp canvas onto main canvas (this preserves the underlying image)
        ctx.drawImage(tempCanvas, 0, 0)
      })
    }
    
    img.src = slice.canvas.toDataURL()
  }, [slice, sliceIndex, structures, maskVisibility])

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
          height: '100%',
          imageRendering: 'pixelated'
        }}
      />
      <div className="mosaic-label">{sliceIndex + 1}</div>
    </div>
  )
}