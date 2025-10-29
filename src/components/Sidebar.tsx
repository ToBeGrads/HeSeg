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
import { useAuth } from '../hooks/useAuth'
import Axios from '../utils/Axios'
import { useLocation } from 'react-router-dom'
interface SidebarProps {
  ratingMode?: boolean
}
function Sidebar({ ratingMode = false }: SidebarProps) {
  // ========================
  // GET STATE FROM STORES
  // ========================
  const { sidebarVisible, toggleSidebar } = useAppStore()
  // const structures = useStructureStore((state) => state.structures)
  const mystructures = useStructureStore((state) => state.mystructures)
  const { addStructure, fetchMyStructures } = useStructureStore()
  const { startPlacement } = usePlacementStore()
  const volumeData = useVolumeStore((state) => state.volumeData)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const location = useLocation();
  const { patient_id } = location.state || {};
  // ========================
  // EFFECTS
  // ========================
  // fetch the structures that the doc is using 
  const { token } = useAuth()
  useEffect(() => {
    fetchMyStructures(token!, patient_id)
    // load the masks 
}, [])
  // }, [token])
  // Initialize masks when volume data loads (we did it here becuase we have some predefined structures)
  useEffect(() => {
    if (volumeData && volumeData.dims) {
      // console.log('Volume loaded, initializing masks')
      mystructures.forEach(async structure => {
        if (!await maskManager.getMask(structure.id)) {
          // console.log(`Creating mask for structure ${structure.id}`)
          // get patient id from localstorage
          const patient_id = localStorage.getItem("selected_patient")!
          maskManager.createMask(patient_id, structure.id, volumeData.dims)
        }
      })
    }
  }, [volumeData, mystructures])

  // ========================
  // HANDLERS
  // ========================

  const handleAddStructure = () => {
    setIsModalOpen(true)
  }

  const handleAddNewStructure = (id: number, title: string, color: string) => {
    addStructure(id, title, color)
    setIsModalOpen(false)
  }

  const handleAddCoordinate = (structureId: number) => {
    const structure = mystructures.find(s => s.id === structureId)
    if (structure) {
      // console.log(`Starting placement for structure ${structureId}`)
      startPlacement(structureId, structure.color)
    }
  }

  const existingColors = mystructures.map(mystructures => mystructures.color)

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
          {mystructures.map(structure => (
            <SidebarItem
              key={structure.id}
              structureId={structure.id}
              onAddCoordinate={() => handleAddCoordinate(structure.id)}
              ratingMode={ratingMode}
              titre={structure.title}
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