// src/components/Viewer/ThreeDView.tsx
import { useState } from 'react'
import { Structure3DView } from './Structure3DView'
import { FiMaximize2, FiMinimize2, FiSliders } from 'react-icons/fi'
import './ThreeDView.css'

export function ThreeDView() {
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
        <span className="threed-title">3D Structure View</span>
        
        <div className="threed-controls">
          <button 
            className={`control-btn ${showControls ? 'active' : ''}`}
            onClick={() => setShowControls(!showControls)}
            title="Display Options"
          >
            <FiSliders size={14} />
          </button>
          <button 
            className="control-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize' : 'Maximize'}
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
            <span className="control-section-title">Render Mode</span>
            <div className="render-mode-buttons">
              <button 
                className={`render-mode-btn ${displayOptions.renderMode === 'surface' ? 'active' : ''}`}
                onClick={() => updateOption('renderMode', 'surface')}
                title="Smooth surface rendering"
              >
                Surface
              </button>
              <button 
                className={`render-mode-btn ${displayOptions.renderMode === 'cubes' ? 'active' : ''}`}
                onClick={() => updateOption('renderMode', 'cubes')}
                title="Show individual voxels as cubes"
              >
                Cubes
              </button>
              <button 
                className={`render-mode-btn ${displayOptions.renderMode === 'points' ? 'active' : ''}`}
                onClick={() => updateOption('renderMode', 'points')}
                title="Point cloud rendering"
              >
                Points
              </button>
            </div>
          </div>

          {/* Display Options */}
          <div className="control-section">
            <span className="control-section-title">Display Options</span>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.showAxes}
                  onChange={(e) => updateOption('showAxes', e.target.checked)}
                />
                <span>Show Axes</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.showGrid}
                  onChange={(e) => updateOption('showGrid', e.target.checked)}
                />
                <span>Show Grid</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.showBoundingBox}
                  onChange={(e) => updateOption('showBoundingBox', e.target.checked)}
                />
                <span>Bounding Box</span>
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
                <span>Brain Outline</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={displayOptions.wireframe}
                  onChange={(e) => updateOption('wireframe', e.target.checked)}
                />
                <span>Wireframe</span>
              </label>
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="control-section">
            <span className="control-section-title">Structure Opacity</span>
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