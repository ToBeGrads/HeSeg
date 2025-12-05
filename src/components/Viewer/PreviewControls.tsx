// src/components/Viewer/PreviewControls.tsx
import { usePlacementStore } from '../../store/usePlacementStore'
import { useTranslation } from '../../hooks/useTranslation';

interface PreviewControlsProps {
  coordinate: { x: number; y: number; z: number }
  onSave: () => void
  onCancel :() => void
}

export function PreviewControls({ coordinate, onSave, onCancel }: PreviewControlsProps) {
  // Get state directly from store
  const { isEditing} = usePlacementStore()
  const { t } = useTranslation();

  return (
    <div className="preview-controls-bottom">
      <div className="preview-info-bar">
        <span className="preview-label">
          {isEditing ? 'Edit Point:' : t.previewCoordinates.preview}
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
          {isEditing ? 'Update' : t.previewCoordinates.save}
        </button>
        <button
          className="preview-btn cancel-btn"
          onClick={(e) => {
            e.stopPropagation()
            onCancel()
          }}
        >
          {t.previewCoordinates.cancel}
        </button>
      </div>
    </div>
  )
}