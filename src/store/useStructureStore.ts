// src/store/useStructureStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Structure, Coordinate } from '../types'
import { DEFAULT_STRUCTURES } from '../utils/constants'
import { maskManager } from '../utils/MaskManager'

interface StructureState {
  // State
  structures: Structure[]
  
  // Actions
  addStructure: (title: string, color: string) => void
  updateStructure: (id: number, updates: Partial<Structure>) => void
  deleteStructure: (id: number) => void
  addCoordinate: (structureId: number, coordinate: Coordinate) => void
  updateCoordinates: (structureId: number, coordinates: Coordinate[]) => void
  deleteCoordinate: (structureId: number, index: number) => void
  getStructure: (id: number) => Structure | undefined
  reset: () => void
}

const initialState = {
  structures: DEFAULT_STRUCTURES.map((s, i) => ({ ...s, id: i + 1 }))
}

export const useStructureStore = create<StructureState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Add new structure
      addStructure: (title, color) => {
        const newStructure: Structure = {
          id: Date.now(),
          title,
          color,
          coordinates: []
        }
        
        set(
          (state) => ({
            structures: [...state.structures, newStructure]
          }),
          false,
          'addStructure'
        )
        
        console.log('✅ Structure added:', newStructure)
      },

      // Update structure
      updateStructure: (id, updates) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            )
          }),
          false,
          'updateStructure'
        )
        
        console.log(`🔄 Structure ${id} updated:`, updates)
      },

      // Delete structure
      deleteStructure: (id) => {
        set(
          (state) => ({
            structures: state.structures.filter((s) => s.id !== id)
          }),
          false,
          'deleteStructure'
        )
        
        // Delete associated mask
        maskManager.deleteMask(id)
        console.log(`🗑️ Structure ${id} deleted`)
      },

      // Add coordinate to structure
      addCoordinate: (structureId, coordinate) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === structureId
                ? { ...s, coordinates: [...s.coordinates, coordinate] }
                : s
            )
          }),
          false,
          'addCoordinate'
        )
        
        console.log(`📍 Coordinate added to structure ${structureId}:`, coordinate)
      },

      // Update all coordinates for a structure
      updateCoordinates: (structureId, coordinates) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === structureId ? { ...s, coordinates } : s
            )
          }),
          false,
          'updateCoordinates'
        )
        
        console.log(`🔄 Coordinates updated for structure ${structureId}`)
      },

      // Delete coordinate by index
      deleteCoordinate: (structureId, index) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === structureId
                ? {
                    ...s,
                    coordinates: s.coordinates.filter((_, i) => i !== index)
                  }
                : s
            )
          }),
          false,
          'deleteCoordinate'
        )
        
        console.log(`🗑️ Coordinate ${index} deleted from structure ${structureId}`)
      },

      // Get structure by ID
      getStructure: (id) => {
        return get().structures.find((s) => s.id === id)
      },

      // Reset to initial state
      reset: () => set(initialState, false, 'reset')
    }),
    { name: 'StructureStore' }
  )
)