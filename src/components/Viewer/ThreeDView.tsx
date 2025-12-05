// src/components/Viewer/ThreeDView.tsx
import { useState } from 'react'
import { Structure3DView } from './Structure3DView'
import { FiMaximize2, FiMinimize2, FiSliders } from 'react-icons/fi'
import './ThreeDView.css'
import { useTranslation } from '../../hooks/useTranslation'


export function ThreeDView() {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showControls, setShowControls] = useState(false)
  
  // Display options
  const [displayOptions, setDisplayOptions] = useState({
    showAxes: true,
    showGrid: true,
    showBoundingBox: true,
    showDirectionLabels: true,
    showBrainOutline: true,
    renderMode: 'surface' as 'surface' | 'cubes' | 'points',
    structureOpacity: 0.8,
    wireframe: false
  })

  const updateOption = (key: keyof typeof displayOptions, value: any) => {
    setDisplayOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={`threed-view ${isExpanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="threed-header">
        <span className="threed-title">{t.advancedMRI.threeD}</span>
        
        <div className="threed-controls">
          <button 
            className={`control-btn ${showControls ? 'active' : ''}`}
            onClick={() => setShowControls(!showControls)}
            title={t.reconstruction.displayOptions}
          >
            <FiSliders size={14} />
          </button>
          <button 
            className="control-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? t.reconstruction.minimize : t.reconstruction.maximize}
          >
            {isExpanded ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
          </button>
        </div>
      </div>
      
      {/* Controls Panel */}
      {showControls && (
        <div className="threed-controls-panel">
          {/* Render Mode */}
          <div className="control-section">
            <span className="control-section-title">{t.reconstruction.renderMode}</span>
            <div className="render-mode-buttons">
              <button 
                className={`render-mode-btn ${displayOptions.renderMode === 'surface' ? 'active' : ''}`}
                onClick={() => updateOption('renderMode', 'surface')}
                title={t.reconstruction.smoothSurfaceRendering}
              >
                {t.reconstruction.surface}
              </button>
              <button 
                className={`render-mode-btn ${displayOptions.renderMode === 'cubes' ? 'active' : ''}`}
                onClick={() => updateOption('renderMode', 'cubes')}
                title={t.reconstruction.ShowIndividualVoxelsAsCubes}
              >
                {t.reconstruction.cubes}
              </button>
              <button 
                className={`render-mode-btn ${displayOptions.renderMode === 'points' ? 'active' : ''}`}
                onClick={() => updateOption('renderMode', 'points')}
                title={t.reconstruction.pointCloudRendering}
              >
                {t.reconstruction.points}
              </button>
            </div>
          </div>

          {/* Display Options */}
          <div className="control-section">
            <span className="control-section-title">{t.reconstruction.displayOptions}</span>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.showAxes}
                  onChange={(e) => updateOption('showAxes', e.target.checked)}
                />
                <span>{t.reconstruction.showAxes}</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.showGrid}
                  onChange={(e) => updateOption('showGrid', e.target.checked)}
                />
                <span>{t.reconstruction.showGrid}</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.showBoundingBox}
                  onChange={(e) => updateOption('showBoundingBox', e.target.checked)}
                />
                <span>{t.reconstruction.boundingBox}</span>
              </label>
              {/** 
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.showDirectionLabels}
                  onChange={(e) => updateOption('showDirectionLabels', e.target.checked)}
                />
                <span>Direction Labels</span>
              </label>
              **/}
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.showBrainOutline}
                  onChange={(e) => updateOption('showBrainOutline', e.target.checked)}
                />
                <span>{t.reconstruction.brainOutline}</span>
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.wireframe}
                  onChange={(e) => updateOption('wireframe', e.target.checked)}
                />
                <span>{t.reconstruction.wireframe}</span>
              </label>
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="control-section">
            <span className="control-section-title">{t.reconstruction.structureOpacity}</span>
            <div className="slider-row">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={displayOptions.structureOpacity}
                onChange={(e) => updateOption('structureOpacity', parseFloat(e.target.value))}
              />
              <span className="slider-value">{Math.round(displayOptions.structureOpacity * 100)}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 3D Content */}
      <div className="threed-content">
        <Structure3DView 
          showAll={true} 
          isExpanded={isExpanded}
          displayOptions={displayOptions}
        />
      </div>
    </div>
  )
}

export default ThreeDView