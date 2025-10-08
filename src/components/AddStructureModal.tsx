import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import './AddStructureModal.css'

interface AddStructureModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (title: string, color: string) => void
  existingColors: string[]
}

const AVAILABLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#F8B500', '#78E08F', '#3742FA', '#2ED573', '#FF6348',
  '#1E90FF', '#FF1493', '#00CED1', '#FFD700', '#32CD32',
  '#FF4500', '#DA70D6', '#40E0D0', '#FF69B4', '#00FF7F',
  '#FF6347', '#4169E1', '#FF1493', '#00BFFF', '#ADFF2F'
]

function AddStructureModal({ isOpen, onClose, onAdd, existingColors }: AddStructureModalProps) {
  const [title, setTitle] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    
    if (!selectedColor) {
      setError('Please select a color')
      return
    }
    
    onAdd(title.trim(), selectedColor)
    setTitle('')
    setSelectedColor('')
    setError('')
    onClose()
  }

  const handleClose = () => {
    setTitle('')
    setSelectedColor('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Structure</h3>
          <button className="close-btn" onClick={handleClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Structure Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter structure name"
              className="title-input"
            />
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
                    onClick={() => !isUsed && setSelectedColor(color)}
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
            <button type="submit" className="add-btn">
              Add Structure
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddStructureModal