// src/components/SegmentationToolbar.tsx
import React from 'react'
import { FiEdit2, FiDelete, FiRotateCcw, FiRotateCw, FiCheck, FiArrowRight } from 'react-icons/fi'
import { TfiEraser } from "react-icons/tfi"
import './SegmentationToolbar.css'

interface SegmentationToolbarProps {
  structureColor: string
  structureName: string
  brushSize: number
  onBrushSizeChange: (size: number) => void
  tool: 'draw' | 'erase'
  onToolChange: (tool: 'draw' | 'erase') => void
  onUndo: () => void
  onRedo: () => void
  onComplete: () => void
  onNext: () => void
  canUndo: boolean
  canRedo: boolean
}

export const SegmentationToolbar: React.FC<SegmentationToolbarProps> = ({
  structureColor,
  structureName,
  brushSize,
  onBrushSizeChange,
  tool,
  onToolChange,
  onUndo,
  onRedo,
  onComplete,
  onNext,
  canUndo,
  canRedo
}) => {
  return (
    <div 
      className="segmentation-toolbar"
      style={{ 
        borderColor: structureColor,
        backgroundColor: `${structureColor}15`
      }}
    >
      <div 
        className="segmentation-toolbar-header"
        style={{  }}
      >
        <span className="segmentation-toolbar-title">{structureName}</span>
      </div>
      
      <div className="segmentation-toolbar-content">
        {/* Tool Selection */}
        <div className="segmentation-tool-group">
          <button
            className={`segmentation-tool-btn ${tool === 'draw' ? 'active' : ''}`}
            onClick={() => onToolChange('draw')}
            style={{ 
              borderColor: tool === 'draw' ? structureColor : 'transparent',
              color: tool === 'draw' ? structureColor : undefined
            }}
            title="Draw (D)"
          >
            <FiEdit2 size={16} />
            
          </button>
          <button
            className={`segmentation-tool-btn ${tool === 'erase' ? 'active' : ''}`}
            onClick={() => onToolChange('erase')}
            style={{ 
              borderColor: tool === 'erase' ? structureColor : 'transparent',
              color: tool === 'erase' ? structureColor : undefined
            }}
            title="Erase (E)"
          >
            <TfiEraser size={16} />
            
          </button>
        </div>

        {/* Brush Size */}
        <div className="segmentation-brush-group">
          <label className="segmentation-label">
            Brush Size: <span className="segmentation-value">{brushSize}px</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
            className="segmentation-slider"
            style={{
              background: `linear-gradient(to right, ${structureColor} 0%, ${structureColor} ${(brushSize / 20) * 100}%, rgba(255,255,255,0.2) ${(brushSize / 20) * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Actions */}
        <div className="segmentation-action-group">
          <button
            className="segmentation-action-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <FiRotateCcw size={16} />
          </button>
          <button
            className="segmentation-action-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <FiRotateCw size={16} />
          </button>
          <button
            className="segmentation-action-btn next-btn"
            onClick={onNext}
            style={{ color: structureColor }}
            title="Next Slice"
          >
            <FiArrowRight size={16} />
          </button>
          <button
            className="segmentation-action-btn complete-btn"
            onClick={onComplete}
            style={{ backgroundColor: structureColor }}
            title="Complete (Enter)"
          >
            <FiCheck size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SegmentationToolbar