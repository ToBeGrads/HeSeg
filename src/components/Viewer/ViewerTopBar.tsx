// src/components/Viewer/ViewerTopBar.tsx
import { FiSettings, FiGrid, FiSquare, FiLayers, FiEye } from 'react-icons/fi'
import { useVolumeStore } from '../../store/useVolumeStore'
import { useViewerStore } from '../../store/useViewerStore'

interface ViewerTopBarProps {
  voxelCoords: { x: number; y: number; z: number }
}

export function ViewerTopBar({ voxelCoords }: ViewerTopBarProps) {
  // ✨ Get state directly from stores
  const volumeData = useVolumeStore((state) => state.volumeData)
  const { viewMode, showSettings, setViewMode, toggleSettings } = useViewerStore()

  return (
    <div className="viewer-topbar">
      <div className="topbar-left">
        <span className="viewer-title">MRI Viewer</span>
        {volumeData && (
          <>
            <span className="volume-dims">
              {volumeData.dims[0]}×{volumeData.dims[1]}×{volumeData.dims[2]}
            </span>
            <span className="voxel-coords">
              ({voxelCoords.x}, {voxelCoords.y}, {voxelCoords.z})
            </span>
          </>
        )}
      </div>

      <div className="topbar-center">
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'single' ? 'active' : ''}`}
            onClick={() => setViewMode('single')}
            title="Single view (1)"
          >
            <FiSquare size={14} />
          </button>
          <button
            className={`view-btn ${viewMode === 'quad' ? 'active' : ''}`}
            onClick={() => setViewMode('quad')}
            title="4-Panel view (4)"
          >
            
            <FiGrid size={14} />
          </button>
          {/*
          <button
            className={`view-btn ${viewMode === '3d' ? 'active' : ''}`}
            onClick={() => setViewMode('3d')}
            title="3D view (3)"
          >
            <FiLayers size={14} />
          </button>
          */}
          <button
            className={`view-btn ${viewMode === 'mosaic' ? 'active' : ''}`}
            onClick={() => setViewMode('mosaic')}
            title="Mosaic view (M)"
          >
            <FiEye size={14} />
          </button>
        </div>
      </div>

      <div className="topbar-right">
        <button
          className={`settings-btn ${showSettings ? 'active' : ''}`}
          onClick={toggleSettings}
          title="Settings"
        >
          <FiSettings size={16} />
        </button>
      </div>
    </div>
  )
}