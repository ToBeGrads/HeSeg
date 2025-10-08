import { useEffect, useRef, useState } from 'react'
import './MaskDebugViewer.css'

interface MaskDebugViewerProps {
  maskBase64?: string
  visible?: boolean
  onClose?: () => void
}

function MaskDebugViewer({ maskBase64, visible = false, onClose }: MaskDebugViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [info, setInfo] = useState({ width: 0, height: 0, nonZeroPixels: 0 })

  useEffect(() => {
    if (!maskBase64 || !canvasRef.current) return

    const img = new Image()
    img.src = maskBase64

    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Draw the mask
      ctx.drawImage(img, 0, 0)

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      const data = imageData.data

      // Count non-zero pixels
      let count = 0
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 128) count++ // White pixels
      }

      setInfo({
        width: img.width,
        height: img.height,
        nonZeroPixels: count
      })
    }
  }, [maskBase64])

  if (!visible) return null

  return (
    <div className="mask-debug-overlay">
      <div className="mask-debug-panel">
        <div className="mask-debug-header">
          <h3>🎭 Mask Debug Viewer</h3>
          <button className="close-debug" onClick={onClose}>✕</button>
        </div>

        <div className="mask-debug-content">
          <div className="mask-info">
            <p>📐 Size: {info.width} × {info.height}</p>
            <p>🎨 Non-zero pixels: {info.nonZeroPixels}</p>
            <p>📊 Coverage: {((info.nonZeroPixels / (info.width * info.height)) * 100).toFixed(2)}%</p>
          </div>

          <div className="mask-canvas-container">
            <canvas ref={canvasRef} className="mask-debug-canvas" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaskDebugViewer