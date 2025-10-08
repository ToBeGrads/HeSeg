import './Sidebar.css'
import SidebarItem from './SidebarItem'
import AddStructureModal from './AddStructureModal'
import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { maskManager } from '../utils/MaskManager'
import { useMRI } from '../Context/MRIcontext' 

interface Structure {
  id: number
  title: string
  color: string
  coordinates: Array<{ x: number, y: number, z: number }>
}

interface SidebarProps {
  isVisible: boolean
  onToggle: () => void
  onStartPlacement?: (structureId: number, color: string) => void
  activeStructureId?: number | null
  onStartEditing?: (structureId: number) => void
  maskVisibility?: Record<number, boolean>
  onToggleMask?: (structureId: number) => void
  onStructuresChange?: (structures: Structure[]) => void // ADD THIS
  onJumpToCoordinate?: (coord: { x: number; y: number; z: number }) => void
}

function Sidebar({ 
  isVisible, 
  onToggle, 
  onStartPlacement,
  activeStructureId = null,
  onStartEditing,
  maskVisibility = {},
  onToggleMask,
  onStructuresChange,
  onJumpToCoordinate
}: SidebarProps) {
  const { volumeData } = useMRI()
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

  // CREATE MASKS WHEN VOLUME DATA IS AVAILABLE
 // Around line 63-77
 useEffect(() => {
  if (volumeData && volumeData.dims) {
    console.log('🎭 Volume data loaded, creating masks for structures')
    console.log('📊 Volume dimensions:', volumeData.dims)
    
    structures.forEach(structure => {
      if (!maskManager.getMask(structure.id)) {
        console.log(`📝 Creating mask for structure ${structure.id}: ${structure.title}`)
        maskManager.createMask(structure.id, volumeData.dims)
      }
    })
  }
}, [volumeData])

  // NOTIFY PARENT OF STRUCTURE CHANGES
  useEffect(() => {
    if (onStructuresChange) {
      onStructuresChange(structures)
    }
  }, [structures, onStructuresChange])

  const handleAddStructure = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleAddNewStructure = (title: string, color: string) => {
    const newStructure: Structure = {
      id: Date.now(),
      title,
      color,
      coordinates: []
    }
    
    setStructures([...structures, newStructure])
    
    // Create mask immediately when structure is created
    if (volumeData && volumeData.dims) {
      console.log('📝 Creating mask for new structure:', newStructure.id)
      maskManager.createMask(newStructure.id, volumeData.dims)
    } else {
      console.warn('⚠️ Volume data not available yet for mask creation')
    }
  }

  const handleAddCoordinate = (structureId: number) => {
    const structure = structures.find(s => s.id === structureId)
    if (structure && onStartPlacement) {
      onStartPlacement(structureId, structure.color)
    }
  }

  const handleCoordinateAdded = (structureId: number, coordinate: { x: number, y: number, z: number }) => {
    setStructures(prevStructures => 
      prevStructures.map(structure => 
        structure.id === structureId
          ? { ...structure, coordinates: [...structure.coordinates, coordinate] }
          : structure
      )
    )
  }
  const handleCoordinatesChange = (structureId: number, newCoords: Array<{ x: number, y: number, z: number, hasSegmentation?: boolean }>) => {
    console.log(`🔄 Updating coordinates for structure ${structureId}`, newCoords)
    setStructures(prevStructures => 
      prevStructures.map(structure => 
        structure.id === structureId
          ? { ...structure, coordinates: newCoords }
          : structure
      )
    )
  }
  const handleCoordinateClick = (coord: { x: number; y: number; z: number }) => {
    console.log('📍 Sidebar: Jumping to coordinate:', coord)
    if (onJumpToCoordinate) {
      onJumpToCoordinate(coord)
    }
  }
  
  const existingColors = structures.map(structure => structure.color)

  // Expose method to add coordinates from parent
  ;(window as any).addCoordinateToStructure = handleCoordinateAdded

  return (
    <>
      <aside className={`sidebar ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="sidebar-toggle">
          <button className="sidebar-toggle-btn" onClick={onToggle}>
            {isVisible ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
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
              title={structure.title}
              color={structure.color}
              coordinates={structure.coordinates}
              onAdd={() => handleAddCoordinate(structure.id)}
              onToggleMask={() => onToggleMask?.(structure.id)}
              onStartEditing={() => onStartEditing?.(structure.id)}
              onCoordinatesChange={(newCoords) => handleCoordinatesChange(structure.id, newCoords)}
              onCoordinateClick={handleCoordinateClick}
              maskVisible={maskVisibility[structure.id] || false}
              isEditing={activeStructureId === structure.id}
              structureId={structure.id}
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