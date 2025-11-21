// src/store/useMaskStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Tool } from '../types'
import { BRUSH_SIZE } from '../utils/constants'

interface RulerPoints {
  start: { x: number; y: number; z: number }
  end: { x: number; y: number; z: number }
  id: string
  orientation: 'axial' | 'coronal' | 'sagittal'
  distance: number
}

interface MaskState {
  // State
  activeStructureId: number | null
  maskVisibility: Record<number, boolean>
  tool: Tool
  brushSize: number
  maskOpacity: Record<number, number> 
  rulers: RulerPoints[] // Array of rulers instead of single rulerPoints
  activeRuler: { start: { x: number; y: number; z: number } | null; end: { x: number; y: number; z: number } | null } | null // Currently being created
  rulerDragging: { rulerId: string; point: 'start' | 'end' } | null
  
  // Actions
  setActiveStructure: (id: number | null) => void
  toggleMaskVisibility: (structureId: number) => void
  setMaskVisibility: (structureId: number, visible: boolean) => void
  setTool: (tool: Tool) => void
  setBrushSize: (size: number) => void
  setMaskOpacity: (structureId: number, opacity: number) => void
  reset: () => void
  
  // Ruler actions
  startNewRuler: (point: { x: number; y: number; z: number }) => void
  setActiveRulerEnd: (point: { x: number; y: number; z: number }, orientation: 'axial' | 'coronal' | 'sagittal') => void
  deleteRuler: (id: string) => void
  updateRulerPoint: (id: string, point: 'start' | 'end', newPos: { x: number; y: number; z: number }) => void
  setRulerDragging: (rulerId: string | null, point: 'start' | 'end' | null) => void
  clearActiveRuler: () => void
}

const initialState = {
  activeStructureId: null,
  maskVisibility: {},
  maskOpacity: {},
  tool: 'draw' as Tool,
  brushSize: BRUSH_SIZE.DEFAULT,
  rulers: [] as RulerPoints[],
  activeRuler: null,
  rulerDragging: null
}

export const useMaskStore = create<MaskState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Set active structure for editing
      setActiveStructure: (id) => {
        set({ activeStructureId: id }, false, 'setActiveStructure')
        if (id) {
          console.log(`Editing structure: ${id}`)
        } else {
          console.log('Stopped editing')
        }
      },

      // Toggle mask visibility
      toggleMaskVisibility: (structureId) => {
        set(
          (state) => ({
            maskVisibility: {
              ...state.maskVisibility,
              [structureId]: !state.maskVisibility[structureId]
            }
          }),
          false,
          'toggleMaskVisibility'
        )
        console.log(`Toggled mask visibility for structure ${structureId}`)
      },

      // Set mask visibility
      setMaskVisibility: (structureId, visible) => {
        set(
          (state) => ({
            maskVisibility: {
              ...state.maskVisibility,
              [structureId]: visible
            }
          }),
          false,
          'setMaskVisibility'
        )
      },

      // Set tool
      setTool: (tool) => {
        set({ tool }, false, 'setTool')
        console.log(`Tool: ${tool}`)
      },

      // Set brush size
      setBrushSize: (size) => {
        set({ brushSize: size }, false, 'setBrushSize')
      },

      // Set mask opacity
      setMaskOpacity: (structureId, opacity) => {
        set(
          (state) => ({
            maskOpacity: {
              ...state.maskOpacity,
              [structureId]: opacity
            }
          }),
          false,
          'setMaskOpacity'
        )
      },

      // RULER ACTIONS - UPDATED FOR MULTIPLE RULERS
      startNewRuler: (point) => {
        set({ 
          activeRuler: { start: point, end: null } 
        }, false, 'startNewRuler')
      },

      setActiveRulerEnd: (point, orientation) => {
        set((state) => {
          if (!state.activeRuler?.start) return state

          // Calculate distance
          const dx = (point.x - state.activeRuler.start.x)
          const dy = (point.y - state.activeRuler.start.y)
          const dz = (point.z - state.activeRuler.start.z)
          
          // Assuming 1mm voxel spacing - you can adjust based on volumeData.pixDims
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

          const newRuler: RulerPoints = {
            id: `ruler-${Date.now()}`,
            start: state.activeRuler.start,
            end: point,
            orientation,
            distance
          }

          return {
            rulers: [...state.rulers, newRuler],
            activeRuler: null
          }
        }, false, 'setActiveRulerEnd')
      },

      deleteRuler: (id) => {
        set((state) => ({
          rulers: state.rulers.filter(r => r.id !== id)
        }), false, 'deleteRuler')
      },

      updateRulerPoint: (id, point, newPos) => {
        set((state) => ({
          rulers: state.rulers.map(ruler => {
            if (ruler.id !== id) return ruler
            
            const updatedRuler = {
              ...ruler,
              [point]: newPos
            }

            // Recalculate distance
            const dx = updatedRuler.end.x - updatedRuler.start.x
            const dy = updatedRuler.end.y - updatedRuler.start.y
            const dz = updatedRuler.end.z - updatedRuler.start.z
            updatedRuler.distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

            return updatedRuler
          })
        }), false, 'updateRulerPoint')
      },

      setRulerDragging: (rulerId, point) => {
        if (rulerId && point) {
          set({ rulerDragging: { rulerId, point } }, false, 'setRulerDragging')
        } else {
          set({ rulerDragging: null }, false, 'clearRulerDragging')
        }
      },

      clearActiveRuler: () => {
        set({ activeRuler: null }, false, 'clearActiveRuler')
      },

      // Reset
      reset: () => set(initialState, false, 'reset')
    }),
    { name: 'MaskStore' }
  )
)