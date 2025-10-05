export interface SegmentationSettings {
    model: string
    threshold: number
    smoothing: boolean
    postProcessing: boolean
  }
  
  export interface ColorLUT {
    [key: number]: {
      label: string
      color: [number, number, number, number]
    }
  }
  
  export class BrainchopIntegration {
    private static colorLUT: ColorLUT = {
      0: { label: 'Background', color: [0, 0, 0, 0] },
      1: { label: 'Cerebral Cortex', color: [205, 62, 78, 255] },
      2: { label: 'Cerebral White Matter', color: [120, 18, 134, 255] },
      3: { label: 'Lateral Ventricle', color: [196, 58, 250, 255] },
      4: { label: 'Inferior Lateral Ventricle', color: [220, 248, 164, 255] },
      5: { label: 'Cerebellum Cortex', color: [230, 148, 34, 255] },
      6: { label: 'Cerebellum White Matter', color: [0, 118, 14, 255] },
      7: { label: 'Thalamus', color: [122, 186, 220, 255] },
      8: { label: 'Caudate', color: [236, 13, 176, 255] },
      9: { label: 'Putamen', color: [12, 48, 255, 255] },
      10: { label: 'Pallidum', color: [204, 182, 142, 255] },
      11: { label: 'Brain Stem', color: [42, 204, 164, 255] },
      12: { label: 'Hippocampus', color: [119, 159, 176, 255] },
      13: { label: 'Amygdala', color: [220, 216, 20, 255] },
      14: { label: 'CSF', color: [60, 60, 60, 255] },
      15: { label: 'Accumbens', color: [255, 165, 0, 255] },
      16: { label: 'Ventral DC', color: [165, 42, 42, 255] }
    }
  
    static getColorLUT(): ColorLUT {
      return this.colorLUT
    }
  
    static getLabelColor(labelIndex: number): [number, number, number, number] {
      const label = this.colorLUT[labelIndex]
      return label ? label.color : [128, 128, 128, 255]
    }
  
    static getLabelName(labelIndex: number): string {
      const label = this.colorLUT[labelIndex]
      return label ? label.label : 'Unknown'
    }
  
    static applyColorMap(segmentationData: Uint8Array, width: number, height: number): ImageData {
      const imageData = new ImageData(width, height)
      const data = imageData.data
  
      for (let i = 0; i < segmentationData.length; i++) {
        const labelIndex = segmentationData[i]
        const color = this.getLabelColor(labelIndex)
        const pixelIndex = i * 4
  
        data[pixelIndex] = color[0]     // Red
        data[pixelIndex + 1] = color[1] // Green
        data[pixelIndex + 2] = color[2] // Blue
        data[pixelIndex + 3] = color[3] // Alpha
      }
  
      return imageData
    }
  
    static blendImages(originalData: ImageData, segmentationData: ImageData, opacity: number = 0.5): ImageData {
      const blendedData = new ImageData(originalData.width, originalData.height)
      const blended = blendedData.data
      const original = originalData.data
      const segmentation = segmentationData.data
  
      for (let i = 0; i < original.length; i += 4) {
        if (segmentation[i + 3] > 0) { // If segmentation pixel is not transparent
          // Blend the colors
          blended[i] = Math.round(original[i] * (1 - opacity) + segmentation[i] * opacity)
          blended[i + 1] = Math.round(original[i + 1] * (1 - opacity) + segmentation[i + 1] * opacity)
          blended[i + 2] = Math.round(original[i + 2] * (1 - opacity) + segmentation[i + 2] * opacity)
          blended[i + 3] = 255
        } else {
          // Use original pixel
          blended[i] = original[i]
          blended[i + 1] = original[i + 1]
          blended[i + 2] = original[i + 2]
          blended[i + 3] = original[i + 3]
        }
      }
  
      return blendedData
    }
  
    static createMesh(segmentationData: Uint8Array, dimensions: number[], labelIndex: number): number[] {
      // Simplified mesh generation for a specific label
      const vertices: number[] = []
      const [width, height, depth] = dimensions
  
      for (let z = 0; z < depth - 1; z++) {
        for (let y = 0; y < height - 1; y++) {
          for (let x = 0; x < width - 1; x++) {
            const index = z * width * height + y * width + x
            
            if (segmentationData[index] === labelIndex) {
              // Add cube vertices for this voxel
              const voxelVertices = this.generateCubeVertices(x, y, z)
              vertices.push(...voxelVertices)
            }
          }
        }
      }
  
      return vertices
    }
  
    private static generateCubeVertices(x: number, y: number, z: number): number[] {
      const size = 1
      return [
        // Front face
        x, y, z + size,
        x + size, y, z + size,
        x + size, y + size, z + size,
        x, y, z + size,
        x + size, y + size, z + size,
        x, y + size, z + size,
  
        // Back face
        x, y, z,
        x, y + size, z,
        x + size, y + size, z,
        x, y, z,
        x + size, y + size, z,
        x + size, y, z,
  
        // Top face
        x, y + size, z,
        x, y + size, z + size,
        x + size, y + size, z + size,
        x, y + size, z,
        x + size, y + size, z + size,
        x + size, y + size, z,
  
        // Bottom face
        x, y, z,
        x + size, y, z,
        x + size, y, z + size,
        x, y, z,
        x + size, y, z + size,
        x, y, z + size,
  
        // Right face
        x + size, y, z,
        x + size, y + size, z,
        x + size, y + size, z + size,
        x + size, y, z,
        x + size, y + size, z + size,
        x + size, y, z + size,
  
        // Left face
        x, y, z,
        x, y, z + size,
        x, y + size, z + size,
        x, y, z,
        x, y + size, z + size,
        x, y + size, z
      ]
    }
  
    static calculateVolume(segmentationData: Uint8Array, labelIndex: number, voxelSize: number[] = [1, 1, 1]): number {
      let voxelCount = 0
      
      for (let i = 0; i < segmentationData.length; i++) {
        if (segmentationData[i] === labelIndex) {
          voxelCount++
        }
      }
      
      const voxelVolume = voxelSize[0] * voxelSize[1] * voxelSize[2]
      return voxelCount * voxelVolume
    }
  
    static getSegmentationStatistics(segmentationData: Uint8Array): { [label: string]: { count: number, percentage: number } } {
      const stats: { [label: string]: { count: number, percentage: number } } = {}
      const totalVoxels = segmentationData.length
      
      // Count voxels for each label
      const labelCounts: { [key: number]: number } = {}
      for (let i = 0; i < segmentationData.length; i++) {
        const label = segmentationData[i]
        labelCounts[label] = (labelCounts[label] || 0) + 1
      }
      
      // Convert to statistics with label names
      for (const [labelIndex, count] of Object.entries(labelCounts)) {
        const labelName = this.getLabelName(parseInt(labelIndex))
        stats[labelName] = {
          count,
          percentage: (count / totalVoxels) * 100
        }
      }
      
      return stats
    }
  }