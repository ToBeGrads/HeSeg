// src/components/SegmentationRating/SegmentationRatingPage.tsx
import { useState, useRef, useEffect } from 'react'
import './SegmentationRatingPage.css'
import { FiEye, FiEyeOff, FiCheck, FiX, FiGrid, FiList } from 'react-icons/fi'

// Import stores
import { useVolumeStore } from '../../store/useVolumeStore'
import { useStructureStore } from '../../store/useStructureStore'
import { useViewerStore } from '../../store/useViewerStore'
import { useRatingStore } from '../../store/useRatingStore'

// Import components
import { ViewerTopBar } from '../Viewer/ViewerTopBar'
import { ViewerSettingsPanel } from '../Viewer/ViewerSettingsPanel'
import SliceView from '../Viewer/SliceView'

// Import hooks
import { useSliceExtraction } from '../Viewer/hooks/useSliceExtraction'

type ViewType = 'axial' | 'coronal' | 'sagittal'

export function SegmentationRatingPage() {
  // ========================
  // STORES
  // ========================
  const { volumeData, loading: volumeLoading, error: volumeError, loadVolume } = useVolumeStore()
  const { getStructuresByType } = useStructureStore()
  
  const {
    currentSlices,
    showSettings,
  } = useViewerStore()

  const {
    setRating,
    getRating,
    showAnnotator1,
    showAnnotator2,
    showOverlap,
    toggleAnnotatorVisibility,
    setShowOverlap,
    selectedStructureType,
    setSelectedStructureType,
    setSelectedSlice
  } = useRatingStore()

  // ========================
  // LOCAL STATE
  // ========================
  const [viewOrientation, setViewOrientation] = useState<ViewType>("axial")
  const [voxelCoords, setVoxelCoords] = useState({ x: 0, y: 0, z: 0 })
  const [ratingView, setRatingView] = useState<'table' | 'list'>('table')
  
  const containerRef = useRef<HTMLDivElement>(null)

  // ========================
  // HOOKS
  // ========================
  const { allSlices, loading: slicesLoading } = useSliceExtraction()

  // ========================
  // EFFECTS
  // ========================
  useEffect(() => {
    // Load volume if not already loaded
    if (!volumeData && !volumeLoading && !volumeError) {
      console.log('🔄 Rating page: Loading volume...')
      loadVolume()
    }
  }, [volumeData, volumeLoading, volumeError, loadVolume])

  useEffect(() => {
    // Set initial selected slice
    setSelectedSlice(currentSlices[viewOrientation])
  }, [currentSlices, viewOrientation, setSelectedSlice])

  // ========================
  // DERIVED STATE
  // ========================
  const structureTypes = getStructuresByType()
  const currentSlice = currentSlices[viewOrientation]
  const totalSlices = allSlices[viewOrientation]?.length || 0
  const loading = volumeLoading || slicesLoading

  // ========================
  // HANDLERS
  // ========================
  // const handleSliceChange = useCallback((orientation: ViewType, direction: 'prev' | 'next') => {
  //   const slices = allSlices[orientation]
  //   if (!slices || slices.length === 0) return

  //   const current = currentSlices[orientation]
  //   let newSlice = current

  //   if (direction === 'next') {
  //     newSlice = current < slices.length - 1 ? current + 1 : current
  //   } else {
  //     newSlice = current > 0 ? current - 1 : current
  //   }

  //   if (newSlice !== current) {
  //     setCurrentSlice(orientation, newSlice)
  //     setSelectedSlice(newSlice)

  //     if (volumeData) {
  //       setVoxelCoords(prevCoords => {
  //         const newCoords = { ...prevCoords }
  //         switch (orientation) {
  //           case 'axial':
  //             newCoords.z = newSlice
  //             break
  //           case 'coronal':
  //             newCoords.y = newSlice
  //             break
  //           case 'sagittal':
  //             newCoords.x = newSlice
  //             break
  //         }
  //         return newCoords
  //       })
  //     }
  //   }
  // }, [allSlices, currentSlices, volumeData, setCurrentSlice, setSelectedSlice])

  const handleRatingChange = (structureId: number, rating: 'annotator1' | 'annotator2' | 'both' | 'neither') => {
    setRating(structureId, currentSlice, rating, viewOrientation)
  }

  const handleStructureTypeSelect = (type: string) => {
    setSelectedStructureType(type === selectedStructureType ? null : type)
  }

  // ========================
  // RENDER - LOADING & ERROR STATES
  // ========================
  if (loading) {
    return (
      <div className="segmentation-rating-page">
        <div className="rating-loading-state">
          <div className="loading-spinner large"></div>
          <p>Loading MRI data for rating...</p>
          {volumeLoading && <p className="loading-subtitle">Loading volume data</p>}
          {slicesLoading && <p className="loading-subtitle">Extracting slices</p>}
        </div>
      </div>
    )
  }

  if (volumeError) {
    return (
      <div className="segmentation-rating-page">
        <div className="rating-error-state">
          <p style={{ color: '#ff6b6b', fontSize: '1.2rem' }}>⚠️ Failed to load MRI data</p>
          <p style={{ color: '#ccc', marginTop: '0.5rem' }}>{volumeError}</p>
          <button
            onClick={() => loadVolume()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#7ddb94',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  if (!volumeData) {
    return (
      <div className="segmentation-rating-page">
        <div className="rating-error-state">
          <p style={{ color: '#ff6b6b' }}>⚠️ No MRI data available</p>
          <p style={{ color: '#ccc', marginTop: '0.5rem' }}>
            Please load MRI data first in the main annotation interface
          </p>
        </div>
      </div>
    )
  }

  // Check if slices are available for current orientation
  const currentSlicesData = allSlices[viewOrientation]
  if (!currentSlicesData || currentSlicesData.length === 0) {
    return (
      <div className="segmentation-rating-page">
        <ViewerTopBar voxelCoords={voxelCoords} />
        <div className="rating-error-state">
          <p style={{ color: '#ff6b6b' }}>⚠️ No slices available for {viewOrientation} view</p>
          <p style={{ color: '#ccc', marginTop: '0.5rem' }}>
            Try switching orientation or check if the volume data is valid
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="segmentation-rating-page">
      <ViewerTopBar voxelCoords={voxelCoords} />

      {showSettings && <ViewerSettingsPanel />}

      {/* Rating Controls Panel */}
      <div className="rating-controls-panel">
        <div className="annotator-visibility">
          <button 
            className={`annotator-btn ${showAnnotator1 ? 'active' : ''}`}
            onClick={() => toggleAnnotatorVisibility('annotator1')}
          >
            {showAnnotator1 ? <FiEye /> : <FiEyeOff />}
            <span>Annotator 1</span>
          </button>
          
          <button 
            className={`annotator-btn ${showAnnotator2 ? 'active' : ''}`}
            onClick={() => toggleAnnotatorVisibility('annotator2')}
          >
            {showAnnotator2 ? <FiEye /> : <FiEyeOff />}
            <span>Annotator 2</span>
          </button>
          
          <button 
            className={`overlap-btn ${showOverlap ? 'active' : ''}`}
            onClick={() => setShowOverlap(!showOverlap)}
          >
            <FiEye />
            <span>Overlap</span>
          </button>
        </div>

        <div className="view-mode-selector">
          <button 
            className={`view-mode-btn ${ratingView === 'table' ? 'active' : ''}`}
            onClick={() => setRatingView('table')}
          >
            <FiGrid />
            <span>Table</span>
          </button>
          <button 
            className={`view-mode-btn ${ratingView === 'list' ? 'active' : ''}`}
            onClick={() => setRatingView('list')}
          >
            <FiList />
            <span>List</span>
          </button>
        </div>
      </div>

      <div className="rating-content" ref={containerRef}>
        {/* Viewer Section */}
        <div className="rating-viewer-section">
          <div className="single-view">
            <SliceView
              orientation={viewOrientation}
              slices={currentSlicesData}
              onVoxelCoordsChange={setVoxelCoords}
              viewOnly={true}
              ratingMode={true}
            />
          </div>
        </div>

        {/* Rating Section */}
        <div className="rating-table-section">
          <div className="rating-table-container">
            <div className="rating-table-header">
              <h3>
                {viewOrientation.toUpperCase()} Slice {currentSlice + 1}
                <span className="slice-counter">/{totalSlices}</span>
              </h3>
              
              <div className="orientation-selector">
                <button 
                  className={viewOrientation === 'axial' ? 'active' : ''}
                  onClick={() => setViewOrientation('axial')}
                >
                  Axial
                </button>
                <button 
                  className={viewOrientation === 'coronal' ? 'active' : ''}
                  onClick={() => setViewOrientation('coronal')}
                >
                  Coronal
                </button>
                <button 
                  className={viewOrientation === 'sagittal' ? 'active' : ''}
                  onClick={() => setViewOrientation('sagittal')}
                >
                  Sagittal
                </button>
              </div>
            </div>
            
            {ratingView === 'table' ? (
              <div className="rating-table">
                <div className="table-header">
                  <div className="structure-col">Structure</div>
                  <div className="rating-col">Annotator 1</div>
                  <div className="rating-col">Annotator 2</div>
                  <div className="rating-col">Both</div>
                  <div className="rating-col">Neither</div>
                  <div className="status-col">Rating</div>
                </div>
                
                <div className="table-body">
                  {structureTypes.map(({ name, annotator1, annotator2 }) => {
                    const structureId = annotator1?.id || annotator2?.id
                    if (!structureId) return null
                    
                    const currentRating = getRating(structureId, currentSlice)
                    
                    return (
                      <div 
                        key={name} 
                        className={`table-row ${selectedStructureType === name ? 'selected' : ''}`}
                        onClick={() => handleStructureTypeSelect(name)}
                      >
                        <div className="structure-col">
                          <span>{name}</span>
                          <div className="structure-annotators">
                            {annotator1 && <span className="annotator-badge a1">A1</span>}
                            {annotator2 && <span className="annotator-badge a2">A2</span>}
                          </div>
                        </div>
                        
                        <div className="rating-col">
                          <button
                            className={`rating-btn ${currentRating === 'annotator1' ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRatingChange(structureId, 'annotator1')
                            }}
                            disabled={!annotator1}
                          >
                            <FiCheck />
                          </button>
                        </div>
                        
                        <div className="rating-col">
                          <button
                            className={`rating-btn ${currentRating === 'annotator2' ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRatingChange(structureId, 'annotator2')
                            }}
                            disabled={!annotator2}
                          >
                            <FiCheck />
                          </button>
                        </div>
                        
                        <div className="rating-col">
                          <button
                            className={`rating-btn ${currentRating === 'both' ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRatingChange(structureId, 'both')
                            }}
                            disabled={!annotator1 || !annotator2}
                          >
                            <FiCheck />
                          </button>
                        </div>
                        
                        <div className="rating-col">
                          <button
                            className={`rating-btn ${currentRating === 'neither' ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRatingChange(structureId, 'neither')
                            }}
                          >
                            <FiX />
                          </button>
                        </div>
                        
                        <div className="status-col">
                          <span className={`rating-status ${currentRating || 'unrated'}`}>
                            {currentRating || 'Not Rated'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="rating-list">
                {structureTypes.map(({ name, annotator1, annotator2 }) => {
                  const structureId = annotator1?.id || annotator2?.id
                  if (!structureId) return null
                  
                  const currentRating = getRating(structureId, currentSlice)
                  
                  return (
                    <div 
                      key={name} 
                      className={`rating-list-item ${selectedStructureType === name ? 'selected' : ''}`}
                      onClick={() => handleStructureTypeSelect(name)}
                    >
                      <div className="list-item-header">
                        <span className="structure-name">{name}</span>
                        <div className="annotator-badges">
                          {annotator1 && <span className="annotator-badge a1">A1</span>}
                          {annotator2 && <span className="annotator-badge a2">A2</span>}
                        </div>
                      </div>
                      
                      <div className="rating-actions">
                        <button
                          className={`rating-action-btn ${currentRating === 'annotator1' ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRatingChange(structureId, 'annotator1')
                          }}
                          disabled={!annotator1}
                        >
                          <FiCheck /> A1
                        </button>
                        
                        <button
                          className={`rating-action-btn ${currentRating === 'annotator2' ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRatingChange(structureId, 'annotator2')
                          }}
                          disabled={!annotator2}
                        >
                          <FiCheck /> A2
                        </button>
                        
                        <button
                          className={`rating-action-btn ${currentRating === 'both' ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRatingChange(structureId, 'both')
                          }}
                          disabled={!annotator1 || !annotator2}
                        >
                          <FiCheck /> Both
                        </button>
                        
                        <button
                          className={`rating-action-btn ${currentRating === 'neither' ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRatingChange(structureId, 'neither')
                          }}
                        >
                          <FiX /> Neither
                        </button>
                      </div>
                      
                      <div className="current-rating">
                        <span className={`rating-status ${currentRating || 'unrated'}`}>
                          {currentRating ? `Rated: ${currentRating}` : 'Not Rated'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

     {/* Rating Stats */}
     <div className="rating-stats">
        <div className="stat-item">
          <span>Completed: </span>
          <strong>
            {structureTypes.filter(({ annotator1, annotator2 }) => {
              const structureId = annotator1?.id || annotator2?.id
              return structureId && getRating(structureId, currentSlice)
            }).length} / {structureTypes.length}
          </strong>
        </div>
        <div className="stat-item">
          <span>Slice: </span>
          <strong>{currentSlice + 1} / {totalSlices}</strong>
        </div>
        <div className="stat-item">
          <span>Orientation: </span>
          <strong>{viewOrientation}</strong>
        </div>
      </div>
    </div>
  )
}

export default SegmentationRatingPage