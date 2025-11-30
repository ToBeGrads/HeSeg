import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MedicalImageLoader } from '../utils/medicalImageLoader'
import type { VolumeData, RotationOption } from '../types'

interface VolumeState {
  volumeData: VolumeData | null
  loading: boolean
  error: string | null
  rotation: RotationOption
  
  loadVolume: (mriPath: string, rotation?: RotationOption) => Promise<void>
  setVolumeData: (data: VolumeData | null) => void
  setRotation: (rotation: RotationOption) => void
  clearVolume: () => void
}

export const useVolumeStore = create<VolumeState>()(
  devtools(
    (set, get) => ({
      volumeData: null,
      loading: false,
      error: null,
      rotation: 'none',

      loadVolume: async (mriPath: string, rotation?: RotationOption) => {
        set({ loading: true, error: null }, false, 'loadVolume/start')
        
        try {
          const rotationToUse = rotation || get().rotation
          
          // Try different path variations
          const pathsToTry = [
            mriPath,
            mriPath.startsWith('/') ? mriPath : `/${mriPath}`,
            mriPath.replace(/^\/+/, ''),
          ]
          
          let volume: VolumeData | null = null
          
          for (const tryPath of pathsToTry) {
            try {
              console.log(`Attempting to load: ${tryPath} with rotation: ${rotationToUse}`)
              volume = await MedicalImageLoader.loadNiftiVolume(tryPath, rotationToUse)
              
              if (!volume.dims || volume.dims.length !== 3) {
                throw new Error('Invalid volume dimensions')
              }
              
              console.log(`✅ Loaded successfully from: ${tryPath}`)
              console.log(`   Dimensions: ${volume.dims.join('×')}`)
              console.log(`   Pixel spacing: ${volume.pixDims?.join('×') || 'unknown'} mm`)
              console.log(`   Value range: ${volume.min.toFixed(2)} to ${volume.max.toFixed(2)}`)
              console.log(`   Rotation applied: ${rotationToUse}`)
              break
            } catch (error) {
              console.warn(`Failed: ${tryPath}`)
            }
          }
          
          if (volume) {
            set(
              { volumeData: volume, loading: false, error: null, rotation: rotationToUse },
              false,
              'loadVolume/success'
            )
          } else {
            throw new Error('No MRI file found')
          }
        } catch (error: any) {
          console.error('Volume loading error:', error)
          set(
            { volumeData: null, loading: false, error: error.message },
            false,
            'loadVolume/error'
          )
        }
      },

      setVolumeData: (data) => {
        set({ volumeData: data }, false, 'setVolumeData')
      },
      
      setRotation: (rotation) => {
        set({ rotation }, false, 'setRotation')
      },

      clearVolume: () => {
        set({ volumeData: null, loading: false, error: null }, false, 'clearVolume')
      }
    }),
    { name: 'VolumeStore' }
  )
)