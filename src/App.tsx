import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import MainContent from './components/MainContent'
import Sidebar from './components/Sidebar'

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [placementMode, setPlacementMode] = useState<{
    active: boolean
    structureId: number | null
    color: string | null
  }>({
    active: false,
    structureId: null,
    color: null
  })

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

  return (
    
      <div className="app">
        
        <div className="app-body">
          <Sidebar 
            isVisible={isSidebarVisible} 
            onToggle={handleToggleSidebar}
            onStartPlacement={handleStartPlacement}
          />
          <MainContent 
            placementMode={placementMode}
            onPlacementComplete={handlePlacementComplete}
          />
        </div>
      </div>
  )
}

export default App