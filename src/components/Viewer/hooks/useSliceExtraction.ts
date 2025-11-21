// src/components/Viewer/hooks/useSliceExtraction.ts
import { useState, useEffect } from 'react'
import { MedicalImageLoader } from '../../../utils/medicalImageLoader'
import { useViewerStore } from '../../../store/useViewerStore'
import { useVolumeStore } from '../../../store/useVolumeStore'

type Orientation = 'axial' | 'coronal' | 'sagittal'

export function useSliceExtraction() {
  // Get state directly from stores
  const volumeData = useVolumeStore((state) => state.volumeData)
  const { setCurrentSlice } = useViewerStore()

  const [allSlices, setAllSlices] = useState<Record<Orientation, any[]>>({
    axial: [],
    coronal: [],
    sagittal: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!volumeData) return

    const extractAllSlices = async () => {
      setLoading(true)
      try {
        // console.log(' Extracting slices...')
        
        const axialSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, 'axial')
        const coronalSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, 'coronal')
        const sagittalSlices = MedicalImageLoader.getSlicesByOrientation(volumeData, 'sagittal')

        const processSlices = (slices: any[]) => {
          return slices.map((data) => {
            const imageData = MedicalImageLoader.convertToImageData(data)
            const canvas = MedicalImageLoader.createCanvas(imageData)
            return {
              ...data,
              imageData,
              canvas,
              actualWidth: data.width,
              actualHeight: data.height
            }
          })
        }

        const processedAxial = processSlices(axialSlices)
        const processedCoronal = processSlices(coronalSlices)
        const processedSagittal = processSlices(sagittalSlices)

        setAllSlices({
          axial: processedAxial,
          coronal: processedCoronal,
          sagittal: processedSagittal
        })

        // Set initial slices to middle
        const midAxial = Math.floor(axialSlices.length / 2)
        const midCoronal = Math.floor(coronalSlices.length / 2)
        const midSagittal = Math.floor(sagittalSlices.length / 2)

        setCurrentSlice('axial', midAxial)
        setCurrentSlice('coronal', midCoronal)
        setCurrentSlice('sagittal', midSagittal)

        // console.log('Slices extracted')
      } catch (error) {
        console.error('Error extracting slices:', error)
      } finally {
        setLoading(false)
      }
    }

    extractAllSlices()
  }, [volumeData, setCurrentSlice])

  return { allSlices, loading }
}