// src/store/useMaskStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Tool } from '../types'
import { BRUSH_SIZE } from '../utils/constants'

interface MaskState {
  // State
  activeStructureId: number | null
  maskVisibility: Record<number, boolean>
  tool: Tool
  brushSize: number
  
  // Actions
  setActiveStructure: (id: number | null) => void
  toggleMaskVisibility: (structureId: number) => void
  setMaskVisibility: (structureId: number, visible: boolean) => void
  setTool: (tool: Tool) => void
  setBrushSize: (size: number) => void
  reset: () => void
}

const initialState = {
  activeStructureId: null,
  maskVisibility: {},
  tool: 'draw' as Tool,
  brushSize: BRUSH_SIZE.DEFAULT
}

export const useMaskStore = create<MaskState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Set active structure for editing
      setActiveStructure: (id) => {
        set({ activeStructureId: id }, false, 'setActiveStructure')
        
        if (id) {
          console.log(`✏️ Editing structure: ${id}`)
        } else {
          console.log('✅ Stopped editing')
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
        
        console.log(`👁️ Toggled mask visibility for structure ${structureId}`)
      },

      // Set mask visibility explicitly
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

      // Set drawing tool
      setTool: (tool) => {
        set({ tool }, false, 'setTool')
        console.log(`🔧 Tool changed to: ${tool}`)
      },

      // Set brush size
      setBrushSize: (size) => {
        const clampedSize = Math.max(BRUSH_SIZE.MIN, Math.min(BRUSH_SIZE.MAX, size))
        set({ brushSize: clampedSize }, false, 'setBrushSize')
        console.log(`🖌️ Brush size: ${clampedSize}px`)
      },

      // Reset to initial state
      reset: () => set(initialState, false, 'reset')
    }),
    { name: 'MaskStore' }
  )
)