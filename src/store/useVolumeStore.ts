// src/store/useVolumeStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { VolumeData } from '../types'
import { MedicalImageLoader } from '../utils/medicalImageLoader'
import { VOLUME_PATH } from '../utils/constants'

interface VolumeState {
  // State
  volumeData: VolumeData | null
  loading: boolean
  error: string | null
  
  // Actions
  loadVolume: (path?: string) => Promise<void>
  setVolumeData: (data: VolumeData | null) => void
  clearVolume: () => void
  reset: () => void
}

const initialState = {
  volumeData: null,
  loading: false,
  error: null
}

export const useVolumeStore = create<VolumeState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Load volume from file
      loadVolume: async (path = VOLUME_PATH) => {
        set({ loading: true, error: null }, false, 'loadVolume/start')
        
        try {
          console.log('🚀 Loading MRI volume from:', path)
          
          const possiblePaths = [
            path,
            '../public/Data/MRI/brain.nii.gz',
            './Data/MRI/brain.nii.gz'
          ]
          
          let volume: VolumeData | null = null
          let loadedPath = ''
          
          for (const tryPath of possiblePaths) {
            try {
              console.log(`🔍 Trying: ${tryPath}`)
              const loadedVolume = await MedicalImageLoader.loadNiftiVolume(tryPath)
              if (loadedVolume.dims.length === 3) {
                volume = {
                  ...loadedVolume,
                  dims: [loadedVolume.dims[0], loadedVolume.dims[1], loadedVolume.dims[2]] as [number, number, number]
                }
              } else {
                throw new Error('Invalid volume dimensions. Expected 3 elements.')
              }
              loadedPath = tryPath
              console.log(`✅ SUCCESS! Loaded from: ${loadedPath}`)
              break
            } catch (error) {
              console.warn(`❌ Failed: ${tryPath}`)
            }
          }
          
          if (volume) {
            set(
              { volumeData: volume, loading: false, error: null },
              false,
              'loadVolume/success'
            )
            console.log('🎉 Volume loaded successfully!')
            console.log('📊 Volume dimensions:', volume.dims)
            console.log('📈 Value range:', volume.min, 'to', volume.max)
          } else {
            throw new Error('No MRI file found. Please place brain.nii.gz in the public folder.')
          }
        } catch (error: any) {
          console.error('❌ Volume loading error:', error)
          set(
            {
              volumeData: null,
              loading: false,
              error: error.message || 'Failed to load volume'
            },
            false,
            'loadVolume/error'
          )
        }
      },

      // Set volume data directly
      setVolumeData: (data) => {
        set({ volumeData: data }, false, 'setVolumeData')
      },

      // Clear volume
      clearVolume: () => {
        set({ volumeData: null, error: null }, false, 'clearVolume')
      },

      // Reset to initial state
      reset: () => set(initialState, false, 'reset')
    }),
    { name: 'VolumeStore' }
  )
)