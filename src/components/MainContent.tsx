import { useState, useEffect } from 'react'
import './MainContent.css'
import EndBar from './EndBar'
import AdvancedMRIViewer from './AdvancedMRIViewer'
import { MedicalImageLoader, type VolumeData } from '../utils/medicalImageLoader'

function MainContent() {
  const [isEndBarVisible, setIsEndBarVisible] = useState(true)
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null)
  const [loading, setLoading] = useState(false)

  const handleToggleEndBar = () => {
    setIsEndBarVisible(!isEndBarVisible)
  }

  // Load MRI volume for the main viewer
  useEffect(() => {
    const loadVolume = async () => {
      try {
        setLoading(true)
        console.log('Loading MRI volume for advanced viewer...')
        
        const possiblePaths = [
         '../public/Data/MRI/brain.nii.gz'
        ]
        
        let volume = null
        
        for (const path of possiblePaths) {
          try {
            volume = await MedicalImageLoader.loadNiftiVolume(path)
            console.log(`Successfully loaded MRI from: ${path}`)
            break
          } catch (error) {
            console.warn(`Failed to load ${path}:`, error)
          }
        }
        
        if (volume) {
          setVolumeData(volume)
        } else {
          console.warn('No MRI file found for advanced viewer')
        }
      } catch (error) {
        console.error('Could not load MRI volume for advanced viewer:', error)
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
            <p>Loading Advanced MRI Viewer...</p>
          </div>
        ) : (
          <AdvancedMRIViewer volumeData={volumeData} />
        )}
      </div>
      
      
    </main>
  )
}

export default MainContent