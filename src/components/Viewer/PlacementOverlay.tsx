// src/components/Viewer/PlacementOverlay.tsx
import { usePlacementStore } from '../../store/usePlacementStore'
import { useTranslation } from '../../hooks/useTranslation'

export function PlacementOverlay() {
  const { t } = useTranslation()
  // Get state directly from store
  const { isEditing, cancelPlacement } = usePlacementStore()

  return (
    <div className="placement-overlay">
      <div className="placement-message">
        {isEditing
          ? 'Edit Mode: Click new position'
          : t.placement.ClickToSelectPoint}
      </div>
      <button
        className="cancel-placement-btn"
        onClick={(e) => {
          e.stopPropagation()
          cancelPlacement()
        }}
      >
        {t.placement.cancel}
      </button>
    </div>
  )
}