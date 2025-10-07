// src/components/SidebarItem.tsx
import { FiEdit3, FiStar, FiGrid, FiEye, FiEyeOff, FiEdit2 } from 'react-icons/fi'
import './SidebarItem.css'
import { useState } from 'react'
import  Axios  from "../utils/Axios";
import  { useMRI }  from "../Context/MRIcontext"

interface Coordinate {
  x: number
  y: number
  z: number
}

interface SidebarItemProps {
  title: string
  color: string
  coordinates: Coordinate[]
  onAdd: () => void
  // ADD THESE NEW PROPS
  onToggleMask?: () => void
  onStartEditing?: () => void
  maskVisible?: boolean
  isEditing?: boolean
}

function SidebarItem({ 
  title, 
  color, 
  coordinates, 
  onAdd,
  onToggleMask,
  onStartEditing,
  maskVisible = false,
  isEditing = false
}: SidebarItemProps) {
  // retreive the image from the context 
  const {currentSliceURL, setSelectedCoordinates} = useMRI()
  // set the coordinates
  setSelectedCoordinates(coordinates)
  console.log("from side bar item,line 40, here the coordinates",coordinates)

  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleGeminiAction = () => {
    console.log(`Gemini action for ${title}`)
  }

  const handleEditCoordinate = (index: number) => {
    console.log(`Edit coordinate ${index} from ${title}`)
  }

  const handleGenerateCoordinate = async (index: number) => {
    try{
      const response = await Axios.post(
  "/segment",
  {
    coords: coordinates[index],
    file: currentSliceURL,
  },
  {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  }
);

    if (response.data) {
      console.log("Request passed"); 
      console.log(response.data)
    }else{
      console.log('failed')
    }
    }catch {
      console.log("ended with abruption")
    }
    
    console.log(` other mssg : Generate from coordinate ${index} from ${title}`)
  }

  return (
    <div className="sidebar-item-container">
      <div className="sidebar-item">
        <div className="sidebar-item-color" style={{ backgroundColor: color }}></div>
        <span className="sidebar-item-title" onClick={toggleExpanded}>
          {title}
        </span>
        
        {/* EYE BUTTON - Toggle Mask Visibility */}
        <button 
          className={`sidebar-item-btn ${maskVisible ? 'active-mask' : ''}`}
          onClick={onToggleMask}
          title={maskVisible ? 'Hide mask' : 'Show mask'}
          style={maskVisible ? {
            backgroundColor: `${color}33`,
            color: color
          } : {}}
        >
          {maskVisible ? <FiEye /> : <FiEyeOff />}
        </button>

        {/* PEN BUTTON - Edit Mask */}
        <button 
          className={`sidebar-item-btn ${isEditing ? 'active-editing' : ''}`}
          onClick={onStartEditing}
          disabled={isEditing}
          title={isEditing ? 'Editing...' : 'Edit mask'}
          style={isEditing ? {
            backgroundColor: `${color}55`,
            color: color,
            cursor: 'not-allowed'
          } : {}}
        >
          <FiEdit2 />
        </button>

        {/* ADD COORDINATE BUTTON */}
        <button className="sidebar-item-btn" onClick={onAdd}>
          +
        </button>
      </div>
      
      {isExpanded && (
        <div className="coordinates-list">
          <div className="coordinates-header">
            <span>Coordinates</span>
            <button className="gen-btn" onClick={handleGeminiAction}>
              <FiGrid size={16} />
            </button>
          </div>
          
          {coordinates.length > 0 ? (
            coordinates.map((coord, index) => (
              <div key={index} className="coordinate-item">
                <div className="coord-info">
                  <span className="coord-label">P{index + 1}:</span>
                  <span className="coord-values">
                    X:{coord.x} Y:{coord.y} Z:{coord.z}
                  </span>
                </div>
                <div className="coord-actions">
                  <button 
                    className="coord-action-btn edit-btn" 
                    onClick={() => handleEditCoordinate(index)}
                    title="Edit coordinate"
                  >
                    <FiEdit3/>
                  </button>
                  <button 
                    className="coord-action-btn generate-btn" 
                    onClick={() => handleGenerateCoordinate(index)}
                    // send request here to backend to fetch the mask
                    title="Generate from coordinate"
                  >
                    <FiStar/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-coordinates">No coordinates</div>
          )}
        </div>
      )}
    </div>
  )
}

export default SidebarItem