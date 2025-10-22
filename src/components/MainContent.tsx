// src/components/MainContent.tsx
import { useEffect } from 'react'
import './MainContent.css'
import AdvancedMRIViewer from './Viewer/AdvancedMRIViewer'
import { useVolumeStore } from '../store/useVolumeStore' 
import { useAppStore } from '../store/useAppStore' 
import { useLocation } from 'react-router-dom'
function MainContent() {
  //  Get state from stores
  const { volumeData, loading, error, loadVolume } = useVolumeStore()
  const appLoading = useAppStore((state) => state.loading)

  // Load volume on mount
  const location = useLocation();
  const { path } = location.state || {}
  useEffect(() => {
    loadVolume(path)
  }, [loadVolume])

  // Loading state
  if (loading || appLoading) {
    return (
      <main className="main-content">
        <div className="content-area">
          <div className="viewer-loading">
            <div className="loading-spinner large"></div>
            <p>Loading MRI data...</p>
          </div>
        </div>
      </main>
    )
  }

  // Error state
  if (error) {
    return (
      <main className="main-content">
        <div className="content-area">
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
        </div>
      </main>
    )
  }

  // Main viewer
  return (
    <main className="main-content">
      <div className="content-area">
        {volumeData ? (
          <AdvancedMRIViewer />
        ) : (
          <div className="viewer-loading">
            <p>No volume data</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default MainContent