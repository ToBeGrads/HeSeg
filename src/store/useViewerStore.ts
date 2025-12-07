// src/store/useViewerStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Orientation, ViewMode } from '../types'
import { DEFAULT_VIEWER_SETTINGS } from '../utils/constants'

interface ViewerSettings {
  brightness: number
  contrast: number
  opacity: number
  crosshair: boolean
}

interface ViewState {
  scale: number
  offsetX: number
  offsetY: number
}

interface ViewerState {
  // View mode
  viewMode: ViewMode

  // Single view orientation
  singleViewOrientation: Orientation
  
  // Current slices
  currentSlices: Record<Orientation, number>
  
  // View states (zoom, pan)
  viewStates: Record<Orientation, ViewState>
  
  // Settings
  settings: ViewerSettings
  showSettings: boolean
  
  // Jump to coordinate
  jumpToCoord: { x: number; y: number; z: number } | null

  
  
  // Actions
  setViewMode: (mode: ViewMode) => void
  setSingleViewOrientation: (orientation: Orientation) => void
  setCurrentSlice: (orientation: Orientation, slice: number) => void
  updateViewState: (orientation: Orientation, state: Partial<ViewState>) => void
  resetViewState: (orientation: Orientation) => void
  updateSetting: (key: keyof ViewerSettings, value: any) => void
  toggleSettings: () => void
  jumpToCoordinate: (coord: { x: number; y: number; z: number }) => void
  clearJump: () => void
  reset: () => void
}


const initialViewState: ViewState = {
    scale: 1,
    offsetX: 0,
    offsetY: 0
  }
  
  const initialState = {
    viewMode: 'single' as ViewMode,
    singleViewOrientation: 'axial' as Orientation, 
    currentSlices: {
      axial: 0,
      coronal: 0,
      sagittal: 0
    },
    viewStates: {
      axial: { ...initialViewState },
      coronal: { ...initialViewState },
      sagittal: { ...initialViewState }
    },
    settings: DEFAULT_VIEWER_SETTINGS,
    showSettings: false,
    jumpToCoord: null
  }

export const useViewerStore = create<ViewerState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Set view mode
      setViewMode: (mode) => {
        set({ viewMode: mode }, false, 'setViewMode')
        // console.log(`View mode: ${mode}`)
      },
      setSingleViewOrientation: (orientation: Orientation) => {
        set({ singleViewOrientation: orientation }, false, 'setSingleViewOrientation')
      },
      // Set current slice
      setCurrentSlice: (orientation, slice) => {
        set(
          (state) => ({
            currentSlices: {
              ...state.currentSlices,
              [orientation]: slice
            }
          }),
          false,
          'setCurrentSlice'
        )
      },

      // Update view state (zoom, pan)
      updateViewState: (orientation, newState) => {
        set(
          (state) => ({
            viewStates: {
              ...state.viewStates,
              [orientation]: {
                ...state.viewStates[orientation],
                ...newState
              }
            }
          }),
          false,
          'updateViewState'
        )
      },

      // Reset view state
      resetViewState: (orientation) => {
        set(
          (state) => ({
            viewStates: {
              ...state.viewStates,
              [orientation]: { ...initialViewState }
            }
          }),
          false,
          'resetViewState'
        )
        // console.log(`Reset view for ${orientation}`)
      },

      // Update setting
      updateSetting: (key, value) => {
        set(
          (state) => ({
            settings: {
              ...state.settings,
              [key]: value
            }
          }),
          false,
          'updateSetting'
        )
      },

      // Toggle settings panel
      toggleSettings: () => {
        set((state) => ({ showSettings: !state.showSettings }), false, 'toggleSettings')
      },

      // Jump to coordinate
jumpToCoordinate: (coord) => {
  // console.log('Jumping to:', coord)
  // console.log('Setting slices:', { axial: coord.z, coronal: coord.y, sagittal: coord.x })
  set(() => ({ 
    jumpToCoord: coord,
    currentSlices: {
      axial: coord.z,
      coronal: coord.y,
      sagittal: coord.x
    }
  }), false, 'jumpToCoordinate')
  
  // Log after update
  // const newState = get()
  // console.log('Store updated. New slices:', newState.currentSlices)
  
  // Auto-clear after processing
  setTimeout(() => {
    set({ jumpToCoord: null }, false, 'clearJump')
  }, 500)
},

      // Clear jump
      clearJump: () => {
        set({ jumpToCoord: null }, false, 'clearJump')
      },

      // Reset to initial state
      reset: () => set(initialState, false, 'reset')
    }),
    { name: 'ViewerStore' }
  )
)