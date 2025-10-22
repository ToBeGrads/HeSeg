// src/components/Viewer/ThreeDView.tsx
import { useRef, useEffect } from 'react'
import { Niivue } from '@niivue/niivue'
import { useVolumeStore } from '../../store/useVolumeStore'
import { useViewerStore } from '../../store/useViewerStore'

export function ThreeDView() {
  // ✨ Get state directly from stores
  const volumeData = useVolumeStore((state) => state.volumeData)
  const { settings, viewMode } = useViewerStore()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const niivueRef = useRef<Niivue | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !volumeData || (viewMode !== 'quad' && viewMode !== '3d')) return

    const initializeNiiVue = async () => {
      try {
        if (niivueRef.current) {
          niivueRef.current.updateGLVolume()
          return
        }

        const nv = new Niivue({
          dragAndDropEnabled: true,
          backColor: [0.1, 0.1, 0.1, 1],
          crosshairColor: [0, 1, 0, 1],
          show3Dcrosshair: settings.crosshair,
          textHeight: 0.02,
          isRadiologicalConvention: false
        })

        await nv.attachToCanvas(canvasRef.current!)

        if (volumeData.nvImage) {
          await nv.addVolume(volumeData.nvImage)
          nv.setSliceType(nv.sliceTypeRender)
          nv.setOpacity(0, settings.opacity)
          nv.setScale(1.0)
          niivueRef.current = nv
        }
      } catch (error) {
        console.error('Error initializing NiiVue:', error)
      }
    }

    initializeNiiVue()

    return () => {
      if (viewMode !== 'quad' && viewMode !== '3d') {
        niivueRef.current = null
      }
    }
  }, [volumeData, settings.crosshair, settings.opacity, viewMode])

  return (
    <div className="threed-view">
      <canvas ref={canvasRef} className="niivue-canvas" />
    </div>
  )
}