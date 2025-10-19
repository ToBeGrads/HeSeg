// src/store/useStructureStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Structure, Coordinate } from '../types'
import { DEFAULT_STRUCTURES } from '../utils/constants'
import { maskManager } from '../utils/MaskManager'
import { useVolumeStore } from '../store/useVolumeStore'

// Extended Structure type with annotator support
interface ExtendedStructure extends Structure {
  annotator?: 'annotator1' | 'annotator2'
  createdAt?: Date
  isVisible?: boolean
}

interface StructureState {
  // State
  structures: ExtendedStructure[]
  currentAnnotator: 'annotator1' | 'annotator2' | 'rater'
  
  // Actions
  addStructure: (title: string, color: string, annotator?: 'annotator1' | 'annotator2') => void
  updateStructure: (id: number, updates: Partial<ExtendedStructure>) => void
  deleteStructure: (id: number) => void
  addCoordinate: (structureId: number, coordinate: Coordinate) => void
  updateCoordinates: (structureId: number, coordinates: Coordinate[]) => void
  deleteCoordinate: (structureId: number, index: number) => void
  getStructure: (id: number) => ExtendedStructure | undefined
  getStructuresByAnnotator: (annotator: 'annotator1' | 'annotator2') => ExtendedStructure[]
  getStructuresByType: () => Array<{
    name: string
    annotator1: ExtendedStructure | undefined
    annotator2: ExtendedStructure | undefined
  }>
  setCurrentAnnotator: (annotator: 'annotator1' | 'annotator2' | 'rater') => void
  toggleStructureVisibility: (structureId: number) => void
  setStructureVisibility: (structureId: number, visible: boolean) => void
  reset: () => void
}

const initialState = {
  structures: DEFAULT_STRUCTURES.map((s, i) => ({ 
    ...s, 
    id: i + 1,
    annotator: 'annotator1' as const,
    isVisible: true
  })),
  currentAnnotator: 'annotator1' as const
}

export const useStructureStore = create<StructureState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Add new structure with annotator support
      addStructure: (title, color, annotator = 'annotator1') => {
        const { volumeData } = useVolumeStore.getState()
        const newStructure: ExtendedStructure = {
          id: Date.now(),
          title,
          color,
          coordinates: [],
          annotator,
          createdAt: new Date(),
          isVisible: true
        }
        
        set(
          (state) => ({
            structures: [...state.structures, newStructure]
          }),
          false,
          'addStructure'
        )
        
        if (volumeData) {
          maskManager.createMask(newStructure.id, volumeData.dims)
        }
        
        console.log('Structure added:', newStructure)
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

      // Get structures by annotator
      getStructuresByAnnotator: (annotator) => {
        return get().structures.filter((s) => s.annotator === annotator)
      },

      // Get structures grouped by type for rating table
      getStructuresByType: () => {
        const structures = get().structures
        const structureTypes = [...new Set(structures.map(s => s.title))]
        
        return structureTypes.map(type => ({
          name: type,
          annotator1: structures.find(s => s.title === type && s.annotator === 'annotator1'),
          annotator2: structures.find(s => s.title === type && s.annotator === 'annotator2')
        }))
      },

      // Set current annotator mode
      setCurrentAnnotator: (annotator) => {
        set({ currentAnnotator: annotator }, false, 'setCurrentAnnotator')
        console.log(`🔧 Current annotator set to: ${annotator}`)
      },

      // Toggle structure visibility
      toggleStructureVisibility: (structureId) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === structureId ? { ...s, isVisible: !s.isVisible } : s
            )
          }),
          false,
          'toggleStructureVisibility'
        )
      },

      // Set structure visibility
      setStructureVisibility: (structureId, visible) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === structureId ? { ...s, isVisible: visible } : s
            )
          }),
          false,
          'setStructureVisibility'
        )
      },

      // Reset to initial state
      reset: () => set(initialState, false, 'reset')
    }),
    { name: 'StructureStore' }
  )
)