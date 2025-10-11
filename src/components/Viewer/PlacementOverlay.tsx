// src/components/Viewer/PlacementOverlay.tsx
import { usePlacementStore } from '../../store/usePlacementStore'

export function PlacementOverlay() {
  // ✨ Get state directly from store
  const { isEditing, cancelPlacement } = usePlacementStore()

  return (
    <div className="placement-overlay">
      <div className="placement-message">
        {isEditing
          ? '✏️ Edit Mode: Click new position'
          : 'Click to select point'}
      </div>
      <button
        className="cancel-placement-btn"
        onClick={(e) => {
          e.stopPropagation()
          cancelPlacement()
        }}
      >
        Cancel
      </button>
    </div>
  )
}