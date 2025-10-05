import { useState, useEffect, useRef, useCallback } from 'react'
import { FiGrid, FiSquare, FiChevronLeft, FiChevronRight, FiRotateCw, FiZoomIn, FiZoomOut, FiSettings, FiEye, FiLayers } from 'react-icons/fi'
import './AdvancedMRIViewer.css'
import { MedicalImageLoader, type VolumeData } from '../utils/medicalImageLoader'
import { Niivue, NVImage } from '@niivue/niivue'

type ViewType = 'axial' | 'coronal' | 'sagittal'
type ViewMode = 'single' | 'triple' | '3d' | 'mosaic'
type RenderMode = '2d' | '3d' | 'multiplanar'

interface AdvancedMRIViewerProps {
  volumeData: VolumeData | null
}

interface ViewSettings {
  brightness: number
  contrast: number
  colormap: string
  opacity: number
  crosshair: boolean
  ruler: boolean
  orientation: string
}

function AdvancedMRIViewer({ volumeData }: AdvancedMRIViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('single')
  const [renderMode, setRenderMode] = useState<RenderMode>('2d')
  const [currentSlices, setCurrentSlices] = useState({
    axial: 0,
    coronal: 0,
    sagittal: 0
  })
  const [allSlices, setAllSlices] = useState<{
    axial: any[],
    coronal: any[],
    sagittal: any[]
  }>({
    axial: [],
    coronal: [],
    sagittal: []
  })
  const [loading, setLoading] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(50)
  const [topRightHeight, setTopRightHeight] = useState(50)
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false)
  const [isResizingVertical, setIsResizingVertical] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<ViewSettings>({
    brightness: 0.5,
    contrast: 0.5,
    colormap: 'gray',
    opacity: 1.0,
    crosshair: true,
    ruler: false,
    orientation: 'neurological'
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const niivueRef = useRef<Niivue | null>(null)
  const canvas3DRef = useRef<HTMLCanvasElement>(null)
  const canvasAxialRef = useRef<HTMLCanvasElement>(null)
  const canvasCoronalRef = useRef<HTMLCanvasElement>(null)
  const canvasSagittalRef = useRef<HTMLCanvasElement>(null)

  // Initialize NiiVue for 3D rendering
  useEffect(() => {
    if (renderMode === '3d' && canvas3DRef.current && volumeData) {
      const initializeNiiVue = async () => {
        try {
          const nv = new Niivue({
            logging: true,
            dragAndDropEnabled: false,
            backColor: [0.2, 0.2, 0.2, 1],
            crosshairColor: [0, 1, 0, 1],
            show3Dcrosshair: settings.crosshair,
            meshShader: 'Default',
            textHeight: 0.05
          })
          
          await nv.attachTo(canvas3DRef.current!)
          
          // Load the volume data
          if (volumeData.nvImage) {
            await nv.addVolume(volumeData.nvImage)
            nv.setSliceType(nv.sliceTypeMultiplanar)
            nv.setOpacity(0, settings.opacity)
            niivueRef.current = nv
          }
        } catch (error) {
          console.error('Error initializing NiiVue:', error)
        }
      }
      
      initializeNiiVue()
    }
    
    return () => {
      if (niivueRef.current) {
        niivueRef.current = null
      }
    }
  }, [renderMode, volumeData, settings.crosshair, settings.opacity])

  // Extract all slices when volume data changes
  useEffect(() => {
    if (!volumeData) return

    const extractAllSlices = async () => {
      setLoading(true)
      try {
        console.log('Extracting all slices for advanced MRI viewer...')
        const axialSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, 'axial')
        const coronalSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, 'coronal')
        const sagittalSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, 'sagittal')

        const processSlices = (slices: any[]) => 
          slices.map((data, index) => ({
            ...data,
            imageData: MedicalImageLoader.convertToImageData(data),
            canvas: MedicalImageLoader.createCanvas(MedicalImageLoader.convertToImageData(data))
          }))

        setAllSlices({
          axial: processSlices(axialSlices),
          coronal: processSlices(coronalSlices),
          sagittal: processSlices(sagittalSlices)
        })

        // Set initial slice positions to middle
        setCurrentSlices({
          axial: Math.floor(axialSlices.length / 2),
          coronal: Math.floor(coronalSlices.length / 2),
          sagittal: Math.floor(sagittalSlices.length / 2)
        })
        
        console.log('All slices extracted for advanced MRI viewer')
      } catch (error) {
        console.error('Error extracting slices:', error)
      } finally {
        setLoading(false)
      }
    }

    extractAllSlices()
  }, [volumeData])

  const handleSliceChange = useCallback((orientation: ViewType, direction: 'prev' | 'next') => {
    const slices = allSlices[orientation]
    if (slices.length === 0) return

    setCurrentSlices(prev => {
      const current = prev[orientation]
      let newSlice = current

      if (direction === 'next') {
        newSlice = current < slices.length - 1 ? current + 1 : current
      } else {
        newSlice = current > 0 ? current - 1 : current
      }

      // Update NiiVue if in 3D mode
      if (niivueRef.current && renderMode === '3d') {
        const sliceIndex = newSlice / slices.length
        switch (orientation) {
          case 'axial':
            niivueRef.current.setSliceMM(true, sliceIndex)
            break
          case 'coronal':
            niivueRef.current.setSliceMM(false, sliceIndex)
            break
          case 'sagittal':
            niivueRef.current.setSliceMM(false, sliceIndex)
            break
        }
      }

      return { ...prev, [orientation]: newSlice }
    })
  }, [allSlices, renderMode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!volumeData) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          handleSliceChange('axial', 'next')
          break
        case 'ArrowDown':
          e.preventDefault()
          handleSliceChange('axial', 'prev')
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleSliceChange('coronal', 'prev')
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSliceChange('coronal', 'next')
          break
        case '1':
          setViewMode('single')
          break
        case '2':
          setViewMode('triple')
          break
        case '3':
          setViewMode('3d')
          setRenderMode('3d')
          break
        case 'c':
          setSettings(prev => ({ ...prev, crosshair: !prev.crosshair }))
          break
        case 'r':
          setSettings(prev => ({ ...prev, ruler: !prev.ruler }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleSliceChange, volumeData])

  const handleSettingChange = (key: keyof ViewSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      
      // Apply settings to NiiVue if in 3D mode
      if (niivueRef.current && renderMode === '3d') {
        switch (key) {
          case 'brightness':
            // niivueRef.current.setBrightness(value)
            break
          case 'contrast':
            // niivueRef.current.setContrast(value)
            break
          case 'opacity':
            niivueRef.current.setOpacity(0, value)
            break
          case 'crosshair':
            niivueRef.current.opts.show3Dcrosshair = value
            niivueRef.current.drawScene()
            break
        }
      }
      
      return newSettings
    })
  }

  // Horizontal resize handler
  const handleHorizontalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizingHorizontal(true)
    
    const startX = e.clientX
    const startWidth = leftPanelWidth
    const containerWidth = containerRef.current?.offsetWidth || 0
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaPercentage = (deltaX / containerWidth) * 100
      const newWidth = Math.min(Math.max(startWidth + deltaPercentage, 20), 80)
      setLeftPanelWidth(newWidth)
    }
    
    const handleMouseUp = () => {
      setIsResizingHorizontal(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Vertical resize handler
  const handleVerticalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizingVertical(true)
    
    const startY = e.clientY
    const startHeight = topRightHeight
    const rightPanel = e.currentTarget.closest('.right-panel') as HTMLElement
    const containerHeight = rightPanel?.offsetHeight || 0
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY
      const deltaPercentage = (deltaY / containerHeight) * 100
      const newHeight = Math.min(Math.max(startHeight + deltaPercentage, 20), 80)
      setTopRightHeight(newHeight)
    }
    
    const handleMouseUp = () => {
      setIsResizingVertical(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const renderSliceImage = (orientation: ViewType) => {
    const slices = allSlices[orientation]
    const currentSlice = currentSlices[orientation]
    
    if (slices.length === 0 || !slices[currentSlice]?.canvas) {
      return (
        <div className="slice-placeholder">
          <div className="loading-spinner"></div>
          <span>Loading {orientation} slice...</span>
        </div>
      )
    }

    const canvas = slices[currentSlice].canvas
    const dataUrl = canvas.toDataURL()

    return (
      <div className="slice-viewer">
        <img 
          src={dataUrl} 
          alt={`${orientation} slice ${currentSlice + 1}`}
          className="slice-image"
          style={{
            filter: `brightness(${settings.brightness * 2}) contrast(${settings.contrast * 2})`,
            opacity: settings.opacity
          }}
        />
        {settings.crosshair && <div className="crosshair" />}
        <div className="slice-controls">
          <button 
            className="slice-nav-btn"
            onClick={() => handleSliceChange(orientation, 'prev')}
            disabled={currentSlice === 0}
          >
            <FiChevronLeft size={16} />
          </button>
          <span className="slice-counter">
            {currentSlice + 1} / {slices.length}
          </span>
          <button 
            className="slice-nav-btn"
            onClick={() => handleSliceChange(orientation, 'next')}
            disabled={currentSlice === slices.length - 1}
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  const renderMosaicView = () => {
    const axialSlices = allSlices.axial
    const itemsPerRow = 6
    const totalItems = Math.min(24, axialSlices.length)
    const startIndex = Math.max(0, currentSlices.axial - Math.floor(totalItems / 2))
    
    return (
      <div className="mosaic-view">
        <div className="mosaic-grid">
          {Array.from({ length: totalItems }, (_, i) => {
            const sliceIndex = startIndex + i
            if (sliceIndex >= axialSlices.length) return null
            
            const slice = axialSlices[sliceIndex]
            const isActive = sliceIndex === currentSlices.axial
            
            return (
              <div 
                key={sliceIndex} 
                className={`mosaic-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentSlices(prev => ({ ...prev, axial: sliceIndex }))}
              >
                {slice?.canvas && (
                  <img 
                    src={slice.canvas.toDataURL()} 
                    alt={`Axial slice ${sliceIndex + 1}`}
                    className="mosaic-image"
                  />
                )}
                <div className="mosaic-label">{sliceIndex + 1}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="advanced-mri-viewer">
        <div className="viewer-topbar">
          <div className="topbar-left">
            <span className="viewer-title">Advanced MRI Viewer</span>
          </div>
        </div>
        <div className="viewer-content">
          <div className="loading-viewer">
            <div className="loading-spinner large"></div>
            <p>Loading advanced MRI viewer...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="advanced-mri-viewer">
      {/* Enhanced Topbar */}
      <div className="viewer-topbar">
        <div className="topbar-left">
          <span className="viewer-title">Advanced MRI Viewer</span>
          {volumeData && (
            <span className="volume-dims">
              {volumeData.dims[0]}×{volumeData.dims[1]}×{volumeData.dims[2]}
            </span>
          )}
          <span className="render-mode">{renderMode.toUpperCase()}</span>
        </div>
        
        <div className="topbar-center">
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'single' ? 'active' : ''}`}
              onClick={() => { setViewMode('single'); setRenderMode('2d'); }}
              title="Single view"
            >
              <FiSquare size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'triple' ? 'active' : ''}`}
              onClick={() => { setViewMode('triple'); setRenderMode('2d'); }}
              title="Triple view"
            >
              <FiGrid size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => { setViewMode('3d'); setRenderMode('3d'); }}
              title="3D view"
            >
              <FiLayers size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'mosaic' ? 'active' : ''}`}
              onClick={() => { setViewMode('mosaic'); setRenderMode('2d'); }}
              title="Mosaic view"
            >
              <FiEye size={16} />
            </button>
          </div>
        </div>
        
        <div className="topbar-right">
          <button 
            className={`settings-btn ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <FiSettings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-row">
            <label>Brightness:</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.brightness}
              onChange={(e) => handleSettingChange('brightness', parseFloat(e.target.value))}
            />
            <span>{Math.round(settings.brightness * 100)}%</span>
          </div>
          <div className="settings-row">
            <label>Contrast:</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.contrast}
              onChange={(e) => handleSettingChange('contrast', parseFloat(e.target.value))}
            />
            <span>{Math.round(settings.contrast * 100)}%</span>
          </div>
          <div className="settings-row">
            <label>Opacity:</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.opacity}
              onChange={(e) => handleSettingChange('opacity', parseFloat(e.target.value))}
            />
            <span>{Math.round(settings.opacity * 100)}%</span>
          </div>
          <div className="settings-row">
            <label>Crosshair:</label>
            <input 
              type="checkbox" 
              checked={settings.crosshair}
              onChange={(e) => handleSettingChange('crosshair', e.target.checked)}
            />
          </div>
          <div className="settings-row">
            <label>Ruler:</label>
            <input 
              type="checkbox" 
              checked={settings.ruler}
              onChange={(e) => handleSettingChange('ruler', e.target.checked)}
            />
          </div>
        </div>
      )}

      {/* Viewer Content */}
      <div className="viewer-content" ref={containerRef}>
        {viewMode === 'single' && renderMode === '2d' && (
          <div className="single-view">
            {renderSliceImage('axial')}
          </div>
        )}

        {viewMode === 'triple' && renderMode === '2d' && (
          <div className="triple-view">
            <div 
              className="left-panel"
              style={{ width: `${leftPanelWidth}%` }}
            >
              <div className="view-panel axial-panel">
                <div className="panel-header">Axial View</div>
                {renderSliceImage('axial')}
              </div>
            </div>

            <div 
              className={`resize-handle horizontal ${isResizingHorizontal ? 'resizing' : ''}`}
              onMouseDown={handleHorizontalMouseDown}
            >
              <div className="resize-line"></div>
            </div>

            <div 
              className="right-panel"
              style={{ width: `${100 - leftPanelWidth - 1}%` }}
            >
              <div 
                className="view-panel coronal-panel"
                style={{ height: `${topRightHeight}%` }}
              >
                <div className="panel-header">Coronal View</div>
                {renderSliceImage('coronal')}
              </div>

              <div 
                className={`resize-handle vertical ${isResizingVertical ? 'resizing' : ''}`}
                onMouseDown={handleVerticalMouseDown}
              >
                <div className="resize-line"></div>
              </div>

              <div 
                className="view-panel sagittal-panel"
                style={{ height: `${100 - topRightHeight - 1}%` }}
              >
                <div className="panel-header">Sagittal View</div>
                {renderSliceImage('sagittal')}
              </div>
            </div>
          </div>
        )}

        {viewMode === '3d' && renderMode === '3d' && (
          <div className="threed-view">
            <canvas 
              ref={canvas3DRef}
              className="niivue-canvas"
            />
          </div>
        )}

        {viewMode === 'mosaic' && renderMode === '2d' && renderMosaicView()}
      </div>

      {/* Keyboard shortcuts info */}
      <div className="shortcuts-info">
        <span>Shortcuts: ↑↓ Axial | ←→ Coronal | 1,2,3 Views | C Crosshair | R Ruler</span>
      </div>
    </div>
  )
}

export default AdvancedMRIViewer