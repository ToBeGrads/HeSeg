// src/components/SegmentationToolbar.tsx
import React, { useState, useRef, useEffect } from 'react'
import { FiEdit2, FiRotateCcw, FiRotateCw, FiCheck, FiArrowRight, FiArrowLeft, FiMove } from 'react-icons/fi'
import { TfiEraser } from "react-icons/tfi"
import './SegmentationToolbar.css'
import { useTranslation } from '../hooks/useTranslation'

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
  onPrevious: () => void
  canUndo: boolean
  canRedo: boolean
  currentSlice?: number  // ADD THIS
  totalSlices?: number   // ADD THIS
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
  onPrevious,
  canUndo,
  canRedo,
  currentSlice = 0,  // ADD THIS
  totalSlices = 0    // ADD THIS
}) => {
  const { t } = useTranslation()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))

      setDragStart({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.segmentation-toolbar-header')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  return (
    <div 
      ref={toolbarRef}
      className={`segmentation-toolbar ${isDragging ? 'dragging' : ''}`}
      style={{ 
        borderColor: structureColor,
        backgroundColor: `${structureColor}15`,
        transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`
      }}
    >
      <div 
        className="segmentation-toolbar-header"
        onMouseDown={handleHeaderMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiMove size={14} style={{ opacity: 0.6 }} />
          <span className="segmentation-toolbar-title">{structureName}</span>
        </div>
        {totalSlices > 0 && (
          <span className="segmentation-slice-counter">
            {currentSlice + 1} / {totalSlices}
          </span>
        )}
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
            title={t.segmentationToolbar.draw}
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
            title={t.segmentationToolbar.erase}
          >
            <TfiEraser size={16} />
          </button>
        </div>

        {/* Brush Size */}
        <div className="segmentation-brush-group">
          <label className="segmentation-label">
          {t.segmentationToolbar.brushSize}: <span className="segmentation-value">{brushSize}px</span>
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
            className="segmentation-action-btn prev-btn"
            onClick={onPrevious}
            disabled={currentSlice === 0}
            style={{ color: structureColor }}
            title={t.segmentationToolbar.previousSlice}
          >
            <FiArrowLeft size={16} />
          </button>
          <button
            className="segmentation-action-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title={t.segmentationToolbar.undo}
          >
            <FiRotateCcw size={16} />
          </button>
          <button
            className="segmentation-action-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title={t.segmentationToolbar.redo}
          >
            <FiRotateCw size={16} />
          </button>
          <button
            className="segmentation-action-btn next-btn"
            onClick={onNext}
            disabled={currentSlice === totalSlices - 1}
            style={{ color: structureColor }}
            title={t.segmentationToolbar.nextSlice}
          >
            <FiArrowRight size={16} />
          </button>
          <button
            className="segmentation-action-btn complete-btn"
            onClick={onComplete}
            style={{ backgroundColor: structureColor }}
            title={t.segmentationToolbar.complete}
          >
            <FiCheck size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SegmentationToolbar