// src/store/useRatingStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type RatingValue = 'annotator1' | 'annotator2' | 'both' | 'neither'
type VisualizationMode = 'annotator1' | 'annotator2' | 'overlap' | 'difference'

interface Rating {
  structureId: number
  sliceIndex: number
  orientation: 'axial' | 'coronal' | 'sagittal'
  rating: RatingValue
  confidence?: number
  comments?: string
  ratedAt: Date
}

interface RatingState {
  // Ratings: { [structureId]: { [sliceIndex]: Rating } }
  ratings: Record<number, Record<number, Rating>>
  
  // Visualization settings
  visualizationMode: VisualizationMode
  showAnnotator1: boolean
  showAnnotator2: boolean
  showOverlap: boolean
  
  // UI State
  selectedStructureType: string | null
  selectedSlice: number
  
  // Actions
  setRating: (structureId: number, sliceIndex: number, rating: RatingValue, orientation: 'axial' | 'coronal' | 'sagittal') => void
  getRating: (structureId: number, sliceIndex: number) => RatingValue | null
  setVisualizationMode: (mode: VisualizationMode) => void
  toggleAnnotatorVisibility: (annotator: 'annotator1' | 'annotator2') => void
  setShowOverlap: (show: boolean) => void
  setSelectedStructureType: (type: string | null) => void
  setSelectedSlice: (slice: number) => void
  exportRatings: () => any
  importRatings: (data: any) => void
  clearRatings: () => void
}

const initialState = {
  ratings: {},
  visualizationMode: 'overlap' as VisualizationMode,
  showAnnotator1: true,
  showAnnotator2: true,
  showOverlap: true,
  selectedStructureType: null,
  selectedSlice: 0
}

export const useRatingStore = create<RatingState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Set rating for a structure and slice
      setRating: (structureId, sliceIndex, rating, orientation) => {
        const newRating: Rating = {
          structureId,
          sliceIndex,
          orientation,
          rating,
          ratedAt: new Date()
        }
        
        set(
          (state) => ({
            ratings: {
              ...state.ratings,
              [structureId]: {
                ...state.ratings[structureId],
                [sliceIndex]: newRating
              }
            }
          }),
          false,
          'setRating'
        )
        
        console.log(`⭐ Rating set: Structure ${structureId}, Slice ${sliceIndex}, Rating: ${rating}`)
      },

      // Get rating for a structure and slice
      getRating: (structureId, sliceIndex) => {
        const state = get()
        return state.ratings[structureId]?.[sliceIndex]?.rating || null
      },

      // Set visualization mode
      setVisualizationMode: (mode) => {
        set({ visualizationMode: mode }, false, 'setVisualizationMode')
        console.log(`🎨 Visualization mode: ${mode}`)
      },

      // Toggle annotator visibility
      toggleAnnotatorVisibility: (annotator) => {
        if (annotator === 'annotator1') {
          set((state) => ({ showAnnotator1: !state.showAnnotator1 }), false, 'toggleAnnotator1')
        } else {
          set((state) => ({ showAnnotator2: !state.showAnnotator2 }), false, 'toggleAnnotator2')
        }
      },

      // Set overlap visibility
      setShowOverlap: (show) => {
        set({ showOverlap: show }, false, 'setShowOverlap')
      },

      // Set selected structure type
      setSelectedStructureType: (type) => {
        set({ selectedStructureType: type }, false, 'setSelectedStructureType')
      },

      // Set selected slice
      setSelectedSlice: (slice) => {
        set({ selectedSlice: slice }, false, 'setSelectedSlice')
      },

      // Export ratings
      exportRatings: () => {
        const state = get()
        return {
          exportDate: new Date().toISOString(),
          ratings: state.ratings,
          visualizationMode: state.visualizationMode
        }
      },

      // Import ratings
      importRatings: (data) => {
        if (data && data.ratings) {
          set({ ratings: data.ratings }, false, 'importRatings')
          console.log('📥 Ratings imported')
        }
      },

      // Clear all ratings
      clearRatings: () => {
        set({ ratings: {} }, false, 'clearRatings')
        console.log('🗑️ All ratings cleared')
      }
    }),
    { name: 'RatingStore' }
  )
)