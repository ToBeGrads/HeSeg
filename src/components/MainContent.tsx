import { useState, useEffect } from 'react'
import './MainContent.css'
import EndBar from './EndBar'
import AdvancedMRIViewer from './AdvancedMRIViewer'
import { MedicalImageLoader, type VolumeData } from '../utils/medicalImageLoader'

interface PlacementMode {
  active: boolean
  structureId: number | null
  color: string | null
}

interface MainContentProps {
  placementMode: PlacementMode
  onPlacementComplete: () => void
}

function MainContent({ placementMode, onPlacementComplete }: MainContentProps) {
  const [isEndBarVisible, setIsEndBarVisible] = useState(true)
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggleEndBar = () => {
    setIsEndBarVisible(!isEndBarVisible)
  }

  // Load MRI volume for the main viewer
  useEffect(() => {
    const loadVolume = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🚀 Starting MRI volume loading...')
        
        const possiblePaths = [
          '../public/Data/MRI/brain.nii.gz'
        ]
        
        let volume = null
        let loadedPath = ''
        
        for (const path of possiblePaths) {
          try {
            console.log(`🔍 Trying: ${path}`)
            volume = await MedicalImageLoader.loadNiftiVolume(path)
            loadedPath = path
            console.log(`✅ SUCCESS! Loaded from: ${loadedPath}`)
            break
          } catch (error) {
            console.warn(`❌ Failed: ${path}`)
          }
        }
        
        if (volume) {
          setVolumeData(volume)
          console.log('🎉 Volume ready for viewing!')
        } else {
          const errorMsg = 'No MRI file found. Using demo file or check public folder.'
          console.error('❌', errorMsg)
          setError(errorMsg)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error('❌ Fatal error loading MRI:', errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    loadVolume()
  }, [])

  return (
    <main className="main-content">
      <div className="content-area">
        {loading ? (
          <div className="viewer-loading">
            <div className="loading-spinner large"></div>
            <p>Loading MRI Viewer...</p>
            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
              This may take a few moments...
            </p>
          </div>
        ) : error ? (
          <div className="viewer-loading">
            <p style={{ color: '#ff6b6b', fontSize: '1rem' }}>⚠️ {error}</p>
            <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Place brain.nii.gz in the public folder and refresh
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#7ddb94',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <AdvancedMRIViewer 
            volumeData={volumeData}
            placementMode={placementMode}
            onPlacementComplete={onPlacementComplete}
          />
        )}
      </div>
      
      
    </main>
  )
}

export default MainContent