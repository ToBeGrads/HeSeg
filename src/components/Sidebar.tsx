// src/components/Sidebar.tsx
import './Sidebar.css'
import SidebarItem from './SidebarItem'
import AddStructureModal from './AddStructureModal'
import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { maskManager } from '../utils/MaskManager'
import { useAppStore } from '../store/useAppStore'
import { useStructureStore } from '../store/useStructureStore'
import { usePlacementStore } from '../store/usePlacementStore'
import { useVolumeStore } from '../store/useVolumeStore'

function Sidebar() {
  // ========================
  // GET STATE FROM STORES
  // ========================
  const { sidebarVisible, toggleSidebar } = useAppStore()
  const structures = useStructureStore((state) => state.structures)
  const { addStructure } = useStructureStore()
  const { startPlacement } = usePlacementStore()
  const volumeData = useVolumeStore((state) => state.volumeData)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // ========================
  // EFFECTS
  // ========================
  
  // Initialize masks when volume data loads (we did it here becuase we have some predefined structures)
  useEffect(() => {
    if (volumeData && volumeData.dims) {
      console.log('🎭 Volume loaded, initializing masks')
      
      structures.forEach(structure => {
        if (!maskManager.getMask(structure.id)) {
          console.log(`📝 Creating mask for structure ${structure.id}`)
          maskManager.createMask(structure.id, volumeData.dims)
        }
      })
    }
  }, [volumeData, structures])

  // ========================
  // HANDLERS
  // ========================

  const handleAddStructure = () => {
    setIsModalOpen(true)
  }

  const handleAddNewStructure = (title: string, color: string) => {
    addStructure(title, color)
    setIsModalOpen(false)
  }

  const handleAddCoordinate = (structureId: number) => {
    const structure = structures.find(s => s.id === structureId)
    if (structure) {
      console.log(`Starting placement for structure ${structureId}`)
      startPlacement(structureId, structure.color)
    }
  }
  
  const existingColors = structures.map(structure => structure.color)
  
  // ========================
  // RENDER
  // ========================
  
  return (
    <>
      <aside className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
        <div className="sidebar-toggle">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            {sidebarVisible ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
          </button>
        </div>
        
        <div className='sidebar-header'>
          <h5>Structures</h5>
          <button className="add-st" onClick={handleAddStructure}>
            +
          </button>
        </div>
        
        <div className='sidebar-content'>
          {structures.map(structure => (
            <SidebarItem
              key={structure.id}
              structureId={structure.id}
              onAddCoordinate={() => handleAddCoordinate(structure.id)}
            />
          ))}
        </div>
      </aside>
      
      <AddStructureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddNewStructure}
        existingColors={existingColors}
      />
    </>
  )
}

export default Sidebar