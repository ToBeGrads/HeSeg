// src/components/Viewer/PreviewControls.tsx
import { usePlacementStore } from '../../store/usePlacementStore'

interface PreviewControlsProps {
  coordinate: { x: number; y: number; z: number }
  onSave: () => void
}

export function PreviewControls({ coordinate, onSave }: PreviewControlsProps) {
  // ✨ Get state directly from store
  const { isEditing, cancelPlacement } = usePlacementStore()

  return (
    <div className="preview-controls-bottom">
      <div className="preview-info-bar">
        <span className="preview-label">
          {isEditing ? 'Edit Point:' : 'Preview:'}
        </span>
        <span className="preview-coord-display">
          X: {coordinate.x}, Y: {coordinate.y}, Z: {coordinate.z}
        </span>
      </div>
      <div className="preview-actions-bar">
        <button
          className="preview-btn save-btn"
          onClick={(e) => {
            e.stopPropagation()
            onSave()
          }}
        >
          {isEditing ? 'Update' : 'Save'}
        </button>
        <button
          className="preview-btn cancel-btn"
          onClick={(e) => {
            e.stopPropagation()
            cancelPlacement()
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}