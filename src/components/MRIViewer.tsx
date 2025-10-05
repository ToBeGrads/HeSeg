import { useState, useEffect, useRef } from 'react'
import { FiGrid, FiSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './MRIViewer.css'
import { MedicalImageLoader, type VolumeData } from '../utils/medicalImageLoader'

type ViewType = 'axial' | 'coronal' | 'sagittal'
type ViewMode = 'single' | 'triple'

interface MRIViewerProps {
  volumeData: VolumeData | null
}

function MRIViewer({ volumeData }: MRIViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('single')
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
  const [leftPanelWidth, setLeftPanelWidth] = useState(50) // Percentage
  const [topRightHeight, setTopRightHeight] = useState(50) // Percentage of right panel
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false)
  const [isResizingVertical, setIsResizingVertical] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract all slices when volume data changes
  useEffect(() => {
    if (!volumeData) return

    const extractAllSlices = async () => {
      setLoading(true)
      try {
        console.log('Extracting all slices for MRI viewer...')
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
        
        console.log('All slices extracted for MRI viewer')
      } catch (error) {
        console.error('Error extracting slices:', error)
      } finally {
        setLoading(false)
      }
    }

    extractAllSlices()
  }, [volumeData])

  const handleSliceChange = (orientation: ViewType, direction: 'prev' | 'next') => {
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

      return { ...prev, [orientation]: newSlice }
    })
  }

  // Horizontal resize handler (left-right split)
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

  // Vertical resize handler (top-bottom split in right panel)
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
        />
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

  if (loading) {
    return (
      <div className="mri-viewer">
        <div className="viewer-topbar">
          <div className="topbar-left">
            <span className="viewer-title">MRI Viewer</span>
          </div>
          <div className="topbar-right">
            <button 
              className={`view-mode-btn ${viewMode === 'single' ? 'active' : ''}`}
              onClick={() => setViewMode('single')}
            >
              <FiSquare size={18} />
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'triple' ? 'active' : ''}`}
              onClick={() => setViewMode('triple')}
            >
              <FiGrid size={18} />
            </button>
          </div>
        </div>
        <div className="viewer-content">
          <div className="loading-viewer">
            <div className="loading-spinner large"></div>
            <p>Loading MRI viewer...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mri-viewer">
      {/* Green Topbar */}
      <div className="viewer-topbar">
        <div className="topbar-left">
          <span className="viewer-title">MRI Viewer</span>
          {volumeData && (
            <span className="volume-dims">
              {volumeData.dims[0]}×{volumeData.dims[1]}×{volumeData.dims[2]}
            </span>
          )}
        </div>
        <div className="topbar-right">
          <button 
            className={`view-mode-btn ${viewMode === 'single' ? 'active' : ''}`}
            onClick={() => setViewMode('single')}
            title="Single view"
          >
            <FiSquare size={18} />
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'triple' ? 'active' : ''}`}
            onClick={() => setViewMode('triple')}
            title="Triple view"
          >
            <FiGrid size={18} />
          </button>
        </div>
      </div>

      {/* Viewer Content */}
      <div className="viewer-content" ref={containerRef}>
        {viewMode === 'single' ? (
          <div className="single-view">
            {renderSliceImage('axial')}
          </div>
        ) : (
          <div className="triple-view">
            {/* Left Panel - Axial */}
            <div 
              className="left-panel"
              style={{ width: `${leftPanelWidth}%` }}
            >
              <div className="view-panel axial-panel">
                <div className="panel-header">Axial View</div>
                {renderSliceImage('axial')}
              </div>
            </div>

            {/* Horizontal Resize Handle */}
            <div 
              className={`resize-handle horizontal ${isResizingHorizontal ? 'resizing' : ''}`}
              onMouseDown={handleHorizontalMouseDown}
            >
              <div className="resize-line"></div>
            </div>

            {/* Right Panel - Coronal & Sagittal */}
            <div 
              className="right-panel"
              style={{ width: `${100 - leftPanelWidth - 1}%` }}
            >
              {/* Top Right - Coronal */}
              <div 
                className="view-panel coronal-panel"
                style={{ height: `${topRightHeight}%` }}
              >
                <div className="panel-header">Coronal View</div>
                {renderSliceImage('coronal')}
              </div>

              {/* Vertical Resize Handle */}
              <div 
                className={`resize-handle vertical ${isResizingVertical ? 'resizing' : ''}`}
                onMouseDown={handleVerticalMouseDown}
              >
                <div className="resize-line"></div>
              </div>

              {/* Bottom Right - Sagittal */}
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
      </div>
    </div>
  )
}

export default MRIViewer