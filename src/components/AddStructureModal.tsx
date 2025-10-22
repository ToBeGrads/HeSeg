import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import './AddStructureModal.css'
import { AVAILABLE_COLORS, DEFAULT_STRUCTURE_TITLES } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import { useStructureStore } from '../store/useStructureStore'

interface AddStructureModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (id: number, title: string, color: string) => void
  existingColors: string[]
  existingTitles?: string[] // ✅ Added this prop
}

function AddStructureModal({
  isOpen,
  onClose,
  onAdd,
  existingColors,
  existingTitles = []
}: AddStructureModalProps) {

  const structures = useStructureStore((state) => state.structures)
  // Filter out already added titles
  const { fetchStructures } = useStructureStore()
  const { token } = useAuth()
  useEffect(() => {
    if (token) fetchStructures(token)
  }, [token])

  const availableTitles = structures.map(s => s.title);
  const availableIDs = structures.map(s => s.id); // the ids of the structures fetched from the backend


  const [selectedTitle, setSelectedTitle] = useState(availableTitles[0] || '')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedID, setSelectedID] = useState(availableIDs[0])
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTitle) {
      setError('Please select a structure')
      return
    }

    if (!selectedColor) {
      setError('Please select a color')
      return
    }

    onAdd(selectedID, selectedTitle, selectedColor)
    console.log("from inside add structure handle submit")
    setSelectedTitle(availableTitles[0] || '')
    setSelectedColor('')
    setError('')
    onClose()
  }

  const handleClose = () => {
    setSelectedTitle(availableTitles[0] || '')
    setSelectedColor('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Structure</h3>
          <button className="close-btn" onClick={handleClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Dropdown for structure names */}
          <div className="form-group">
            <label htmlFor="structure">Structure</label>
            <select
              id="structure"
              value={selectedTitle}
              onChange={(e) => {
                setSelectedTitle(e.target.value)
                const id = structures.find(s => s.title === e.target.value)!.id;
                setSelectedID(id);
              }
              }
              disabled={availableTitles.length === 0}
              className="title-input"
            >
              {availableTitles.length > 0 ? (
                availableTitles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))
              ) : (
                <option disabled>No structures left</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Choose Color</label>
            <div className="color-grid">
              {AVAILABLE_COLORS.map((color) => {
                const isUsed = existingColors.includes(color)
                const isSelected = selectedColor === color

                return (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${isSelected ? 'selected' : ''} ${isUsed ? 'disabled' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      if (!isUsed) {
                        setSelectedColor(color);
                        localStorage.setItem('color', color);
                      }
                    }}

                    disabled={isUsed}
                    title={isUsed ? 'Color already in use' : `Select ${color}`}
                  >
                    {isSelected && <span className="checkmark">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="add-btn" disabled={availableTitles.length === 0}>
              Add Structure
            </button>
          </div>
        </form>
      </div >
    </div >
  )
}

export default AddStructureModal
