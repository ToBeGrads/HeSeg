import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import { maskManager } from './utils/MaskManager'
import { MRIProvider } from "./Context/MRIcontext"


function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [volumeData, setVolumeData] = useState<any>(null)
  const [structures, setStructures] = useState<any[]>([])

  const [placementMode, setPlacementMode] = useState<{
    active: boolean
    structureId: number | null
    color: string | null
  }>({
    active: false,
    structureId: null,
    color: null
  })

  // Mask editing state
  const [maskVisibility, setMaskVisibility] = useState<Record<number, boolean>>({})
  const [activeStructureId, setActiveStructureId] = useState<number | null>(null)

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  const handleStartPlacement = (structureId: number, color: string) => {
    console.log('🎯 Starting placement mode for structure:', structureId, 'with color:', color)
    setPlacementMode({
      active: true,
      structureId,
      color
    })
  }

  const handlePlacementComplete = () => {
    console.log('✅ Placement mode completed')
    setPlacementMode({
      active: false,
      structureId: null,
      color: null
    })
  }

  const handleToggleMask = (structureId: number) => {
    console.log('👁️ Toggle mask for structure:', structureId)
    setMaskVisibility(prev => ({
      ...prev,
      [structureId]: !prev[structureId]
    }))
    maskManager.toggleVisibility(structureId)
  }

  const handleStartEditing = (structureId: number) => {
    console.log('✏️ App: Start editing structure', structureId)
    // Stop editing any other structure
    if (activeStructureId && activeStructureId !== structureId) {
      setActiveStructureId(null)
    }
    setActiveStructureId(structureId)
  }

  const handleStopEditing = () => {
    console.log('✅ App: Stop editing')
    setActiveStructureId(null)
  }

  return (

    <MRIProvider>
      <div className="app">
        <div className="app-body">
          <Sidebar
            isVisible={isSidebarVisible}
            onToggle={handleToggleSidebar}
            onStartPlacement={handleStartPlacement}
            volumeData={volumeData}
            activeStructureId={activeStructureId}
            onStartEditing={handleStartEditing}
            maskVisibility={maskVisibility}
            onToggleMask={handleToggleMask}
            onStructuresChange={setStructures}
          />
          <MainContent
            placementMode={placementMode}
            onPlacementComplete={handlePlacementComplete}
            structures={structures}
            maskVisibility={maskVisibility}
            activeStructureId={activeStructureId}
            onVolumeDataLoaded={setVolumeData}
            onStopEditing={handleStopEditing}
          />
        </div>
      </div>
    </MRIProvider>
  )
}

export default App