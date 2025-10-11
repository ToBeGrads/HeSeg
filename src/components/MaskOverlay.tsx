import { useEffect, useRef } from 'react'

interface MaskOverlayProps {
  maskData: Uint8Array
  width: number
  height: number
  color: string
  opacity: number
  scale: number
  offsetX: number
  offsetY: number
}

export function MaskOverlay({ 
  maskData, 
  width, 
  height, 
  color, 
  opacity,
  scale,
  offsetX,
  offsetY 
}: MaskOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    console.log('🎨 MaskOverlay updating, data length:', maskData.length)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Create image data
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    // Parse color
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    // Fill mask data
    for (let i = 0; i < maskData.length; i++) {
      if (maskData[i] > 0) {
        const idx = i * 4
        data[idx] = r
        data[idx + 1] = g
        data[idx + 2] = b
        data[idx + 3] = Math.round(opacity * 255)
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [maskData, width, height, color, opacity])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none',
        imageRendering: 'pixelated'
      }}
    />
  )
}