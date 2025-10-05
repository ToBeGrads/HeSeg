import './Sidebar.css'
import SidebarItem from './SidebarItem'
import AddStructureModal from './AddStructureModal'
import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface Structure {
  id: number
  title: string
  color: string
  coordinates: Array<{ x: number, y: number, z: number }>
}

interface SidebarProps {
  isVisible: boolean
  onToggle: () => void
}

function Sidebar({ isVisible, onToggle }: SidebarProps) {
  const [structures, setStructures] = useState<Structure[]>([
    {
      id: 1, 
      title: 'Brain Tissue', 
      color: '#F54927', 
      coordinates: [
        { x: 120, y: 80, z: 45 },
        { x: 125, y: 85, z: 50 }
      ]
    },
    {
      id: 2, 
      title: 'STN', 
      color: '#4ecdc4', 
      coordinates: [
        { x: 100, y: 60, z: 30 }
      ]
    },
    {
      id: 3, 
      title: 'Putamen', 
      color: '#45b7d1', 
      coordinates: []
    },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddStructure = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleAddNewStructure = (title: string, color: string) => {
    const newStructure: Structure = {
      id: Date.now(), // Simple ID generation
      title,
      color,
      coordinates: []
    }
    setStructures([...structures, newStructure])
  }

  const existingColors = structures.map(structure => structure.color)

  return (
    <>
      <aside className={`sidebar ${isVisible ? 'visible' : 'hidden'}`}>
        {/* Toggle Button */}
        <div className="sidebar-toggle">
          <button className="sidebar-toggle-btn" onClick={onToggle}>
            {isVisible ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
          </button>
        </div>

        {/* Sidebar Header */}
        <div className='sidebar-header'>
          <h5>Structures</h5>
          <button className="add-st" onClick={handleAddStructure}>
            +
          </button>
        </div>

        {/* Sidebar Content */}
        <div className='sidebar-content'>
          {structures.map(structure => (
            <SidebarItem
              key={structure.id}
              title={structure.title}
              color={structure.color}
              coordinates={structure.coordinates}
              onAdd={() => console.log(`Add to ${structure.title}`)}
            />
          ))}
        </div>
      </aside>
      
      <AddStructureModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAdd={handleAddNewStructure}
        existingColors={existingColors}
      />
    </>
  )
}

export default Sidebar