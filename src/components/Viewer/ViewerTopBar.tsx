// src/components/Viewer/ViewerTopBar.tsx
import { FiSettings, FiGrid, FiSquare, FiEye } from 'react-icons/fi'
import { useVolumeStore } from '../../store/useVolumeStore'
import { useViewerStore } from '../../store/useViewerStore'
import { useMaskStore } from '../../store/useMaskStore';
import type { Tool } from '../../types';
import { TfiRuler } from 'react-icons/tfi';

interface ViewerTopBarProps {
  voxelCoords: { x: number; y: number; z: number }
}

export function ViewerTopBar({ voxelCoords }: ViewerTopBarProps) {
  // ✨ Get state directly from stores
  const volumeData = useVolumeStore((state) => state.volumeData)
  const { viewMode, showSettings, setViewMode, toggleSettings } = useViewerStore()
  const {tool, setTool, clearActiveRuler} = useMaskStore()

  const handleRulerToggle = () => {
    if (tool === 'ruler' as Tool) {
      // Turn off ruler
      setTool('draw')
      clearActiveRuler()
    } else {
      // Turn on ruler
      setTool('ruler' as Tool)
      clearActiveRuler()
    }
  }

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
             <span className="volume-spacing">
                {volumeData.pixDims[0].toFixed(2)}×{volumeData.pixDims[1].toFixed(2)}×{volumeData.pixDims[2].toFixed(2)} mm
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
         {/* Ruler Button */}
         <button
          className={`settings-btn ruler-btn ${tool === 'ruler' as Tool ? 'active' : ''}`}
          onClick={handleRulerToggle}
          title="Ruler - Measure distance (R)"
        >
          <TfiRuler size={16} />
        </button>
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