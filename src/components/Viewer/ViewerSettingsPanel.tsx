// src/components/Viewer/ViewerSettingsPanel.tsx
import { useViewerStore } from '../../store/useViewerStore'

export function ViewerSettingsPanel() {
  // ✨ Get state directly from store
  const { settings, updateSetting } = useViewerStore()

  return (
    <div className="settings-panel">
      <div className="settings-row">
        <label>Brightness:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.brightness}
          onChange={(e) => updateSetting('brightness', parseFloat(e.target.value))}
        />
        <span>{Math.round(settings.brightness * 100)}%</span>
      </div>
      
      <div className="settings-row">
        <label>Contrast:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.contrast}
          onChange={(e) => updateSetting('contrast', parseFloat(e.target.value))}
        />
        <span>{Math.round(settings.contrast * 100)}%</span>
      </div>
      
      <div className="settings-row">
        <label>Crosshair (C):</label>
        <input
          type="checkbox"
          checked={settings.crosshair}
          onChange={(e) => updateSetting('crosshair', e.target.checked)}
        />
      </div>
    </div>
  )
}