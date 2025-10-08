import { useState, useRef, useEffect } from 'react'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import './EndBar.css'
import { MedicalImageLoader, type VolumeData } from '../utils/medicalImageLoader'

type ViewType = 'axial' | 'coronal' | 'sagittal'

interface EndBarProps {
  isVisible: boolean
  onToggle: () => void
}

interface MRISlice {
  id: number
  number: number
  imagePath: string
  fileType: 'nii.gz' | 'dicom'
  imageData?: ImageData | null
  canvas?: HTMLCanvasElement | null
  orientation: ViewType
}

function EndBar({ isVisible, onToggle }: EndBarProps) {
  const [selectedView, setSelectedView] = useState<ViewType>('axial')
  const [height, setHeight] = useState(25)
  const [isResizing, setIsResizing] = useState(false)
  const [slices, setSlices] = useState<MRISlice[]>([])
  const [loading, setLoading] = useState(false)
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resizeRef = useRef<HTMLDivElement>(null)

  // Load the MRI volume once
  useEffect(() => {
    const loadVolume = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Loading MRI volume...')
        
        // Try different possible paths for MRI files
        const possiblePaths = [
            "../public/Data/MRI/brain.nii.gz"
        ]
        
        let volume = null
        let loadedPath = ''
        
        for (const path of possiblePaths) {
          try {
            console.log(`Trying to load: ${path}`)
            volume = await MedicalImageLoader.loadNiftiVolume(path)
            loadedPath = path
            console.log(`Successfully loaded MRI from: ${loadedPath}`)
            break
          } catch (error) {
            console.warn(`Failed to load ${path}:`, error)
          }
        }
        
        if (volume) {
          setVolumeData(volume)
          console.log('Volume dimensions:', volume.dims)
          console.log('Value range:', volume.min, 'to', volume.max)
        } else {
          throw new Error('No MRI file found. Please place a brain.nii.gz file in the public folder.')
        }
      } catch (error) {
        console.error('Could not load MRI volume:', error)
        setError(error instanceof Error ? error.message : 'Failed to load MRI data')
        setVolumeData(null)
      } finally {
        setLoading(false)
      }
    }

    loadVolume()
  }, [])

  // Extract slices based on view type when volume or view changes
  useEffect(() => {
    if (!volumeData) {
      return
    }

    const extractSlices = async () => {
        try {
          setLoading(true)
          console.log(`Extracting ${selectedView} slices...`)
          
          // Add a small delay to show the loading spinner
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const medicalSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, selectedView)
          console.log(`Extracted ${medicalSlices.length} ${selectedView} slices`)
          console.log(`First slice dimensions: ${medicalSlices[0]?.width}x${medicalSlices[0]?.height}`)
          
          const loadedSlices: MRISlice[] = medicalSlices.map((data, index) => {
            const imageData = MedicalImageLoader.convertToImageData(data)
            const canvas = MedicalImageLoader.createCanvas(imageData)
            
            return {
              id: index + 1,
              number: index + 1,
              imagePath: 'brain.nii.gz',
              fileType: 'nii.gz',
              imageData,
              canvas,
              orientation: selectedView
            }
          })
          
          setSlices(loadedSlices)
          console.log(`Generated ${loadedSlices.length} ${selectedView} slice images`)
        } catch (error) {
          console.error('Error extracting slices:', error)
          setError(`Failed to extract ${selectedView} slices`)
        } finally {
          setLoading(false)
        }
      }

    extractSlices()
  }, [volumeData, selectedView])

  const handleViewChange = (view: ViewType) => {
    console.log(`Changing view to: ${view}`)
    setSelectedView(view)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    
    const startY = e.clientY
    const startHeight = height
    const parentHeight = resizeRef.current?.parentElement?.offsetHeight || 0
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY
      const deltaPercentage = (deltaY / parentHeight) * 100
      const newHeight = Math.min(Math.max(startHeight + deltaPercentage, 15), 60)
      setHeight(newHeight)
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const renderSliceImage = (slice: MRISlice) => {
    if (slice.canvas) {
      const dataUrl = slice.canvas.toDataURL()
      return (
        <img 
          src={dataUrl} 
          alt={`${slice.orientation} slice ${slice.number}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    }
    
    // Fallback placeholder only if no canvas data
    return (
      <div className="image-placeholder">
        <div className="file-type-indicator">NII.GZ</div>
        <span className="slice-label">No Data</span>
        <span className="slice-number-label">#{slice.number}</span>
      </div>
    )
  }

  return (
    <div 
      ref={resizeRef}
      className={`endbar ${isVisible ? 'visible' : 'hidden'}`}
      style={{ height: isVisible ? `${height}%` : '0%' }}
    >
      <div 
        className={`resize-handle ${isResizing ? 'resizing' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="resize-line"></div>
      </div>
      
      <div className="endbar-header">
        <div className="header-top-row">
          <div className="header-info">
            <span className="slice-count">{slices.length} {selectedView} slices</span>
            {volumeData && (
              <span className="volume-info">
                {volumeData.dims[0]}×{volumeData.dims[1]}×{volumeData.dims[2]}
              </span>
            )}
            {error && <span className="error-info">⚠️ {error}</span>}
          </div>
          <button className="toggle-btn" onClick={onToggle}>
            {isVisible ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
          </button>
        </div>
        
        <div className="header-bottom-row">
          <div className="view-controls">
            <button
              className={`view-btn ${selectedView === 'axial' ? 'active' : ''}`}
              onClick={() => handleViewChange('axial')}
              disabled={loading}
            >
              Axial
            </button>
            <button
              className={`view-btn ${selectedView === 'coronal' ? 'active' : ''}`}
              onClick={() => handleViewChange('coronal')}
              disabled={loading}
            >
              Coronal
            </button>
            <button
              className={`view-btn ${selectedView === 'sagittal' ? 'active' : ''}`}
              onClick={() => handleViewChange('sagittal')}
              disabled={loading}
            >
              Sagittal
            </button>
          </div>
        </div>
      </div>
      
      <div className="endbar-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner large"></div>
            <p>Loading {selectedView} slices...</p>
          </div>
        ) : (
          <div className="slices-grid">
            {slices.map((slice) => (
              <div 
                key={slice.id} 
                className={`slice-item ${slice.fileType.replace('.', '-')}`}
                title={`${slice.orientation.toUpperCase()} slice ${slice.number}`}
              >
                <div className="slice-image">
                  {renderSliceImage(slice)}
                </div>
                <div className="slice-info">
                  <div className="slice-number">#{slice.number}</div>
                  <div className="file-type">{slice.orientation}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EndBar