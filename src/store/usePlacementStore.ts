// src/store/usePlacementStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Coordinate } from '../types'

interface PlacementState {
  // State
  active: boolean
  structureId: number | null
  color: string | null
  isEditing: boolean
  currentCoordinate: Coordinate | null
  previewCoordinate: Coordinate | null
  
  // Actions
  startPlacement: (structureId: number, color: string) => void
  startEditing: (structureId: number, color: string, coordinate: Coordinate) => void
  setPreviewCoordinate: (coordinate: Coordinate | null) => void
  completePlacement: () => void
  cancelPlacement: () => void
  reset: () => void
}

const initialState = {
  active: false,
  structureId: null,
  color: null,
  isEditing: false,
  currentCoordinate: null,
  previewCoordinate: null
}

export const usePlacementStore = create<PlacementState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Start placement mode for new coordinate
      startPlacement: (structureId, color) => {
        set(
          {
            active: true,
            structureId,
            color,
            isEditing: false,
            currentCoordinate: null,
            previewCoordinate: null
          },
          false,
          'startPlacement'
        )
        
        console.log(`Started placement mode for structure ${structureId} with color ${color}`)
      },

      // Start editing existing coordinate
      startEditing: (structureId, color, coordinate) => {
        set(
          {
            active: true,
            structureId,
            color,
            isEditing: true,
            currentCoordinate: coordinate,
            previewCoordinate: null
          },
          false,
          'startEditing'
        )
        
        console.log(`Started editing coordinate for structure ${structureId}:`, coordinate)
      },

      // Set preview coordinate
      setPreviewCoordinate: (coordinate) => {
        set({ previewCoordinate: coordinate }, false, 'setPreviewCoordinate')
        
        if (coordinate) {
          console.log('Preview coordinate:', coordinate)
        }
      },

      // Complete placement
      completePlacement: () => {
        set(initialState, false, 'completePlacement')
        console.log('Placement completed')
      },

      // Cancel placement
      cancelPlacement: () => {
        set(initialState, false, 'cancelPlacement')
        console.log('Placement cancelled')
      },

      // Reset to initial state
      reset: () => set(initialState, false, 'reset')
    }),
    { name: 'PlacementStore' }
  )
)