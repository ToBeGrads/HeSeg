import { NVImage } from '@niivue/niivue'
import type { VolumeData, RotationOption } from '../types'

export interface MedicalImageData {
  pixelData: Float32Array;  // Changed from Uint8Array for quality!
  width: number;
  height: number;
  sliceIndex: number;
  orientation: 'axial' | 'coronal' | 'sagittal';
  min: number;
  max: number;
}

export class MedicalImageLoader {
  
  /**
   * Load NIfTI volume with optional rotation
   * Rotation is applied to the RAW DATA, not just display
   */
  static async loadNiftiVolume(
    filePath: string, 
    rotation: RotationOption = 'none'
  ): Promise<VolumeData> {
    try {
      const nvImage = await NVImage.loadFromUrl({ url: filePath });
      
      if (!nvImage || !nvImage.img) {
        throw new Error('Failed to load NIfTI image - no image data');
      }
      
      const originalDims = (nvImage.hdr?.dims?.slice(1, 4) as [number, number, number]) || [256, 256, 180];
      const pixDims = (nvImage.hdr?.pixDims?.slice(1, 4) as [number, number, number]) || [1, 1, 1];
      const scl_slope = nvImage.hdr?.scl_slope || 1;
      const scl_inter = nvImage.hdr?.scl_inter || 0;
      
      // Convert to Float32Array for full precision
      let rawData = new Float32Array(nvImage.img.length);
      let min = Infinity;
      let max = -Infinity;
      
      for (let i = 0; i < nvImage.img.length; i++) {
        const val = nvImage.img[i] * scl_slope + scl_inter;
        rawData[i] = val;
        if (isFinite(val)) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
      
      // Apply rotation to the raw data if needed
      let dims = [...originalDims] as [number, number, number];
      let rotatedPixDims = [...pixDims] as [number, number, number];
      
      if (rotation !== 'none') {
        const rotationResult = this.rotateVolumeData(rawData, dims, pixDims, rotation);
        rawData = rotationResult.data;
        dims = rotationResult.dims;
        rotatedPixDims = rotationResult.pixDims;
      }
      
      return {
        nvImage,
        dims,
        min,
        max,
        voxelSize: rotatedPixDims,
        scl_slope: 1,  // Already applied
        scl_inter: 0,  // Already applied
        pixDims: rotatedPixDims,
        originalDims,
        rotation,
        rawData  // Keep full precision data!
      };
    } catch (error) {
      console.error('Error loading NIfTI file:', error);
      throw error;
    }
  }

  /**
   * Rotate 3D volume data - operates on the actual voxel array
   * This ensures segmentation coordinates match the rotated display
   */
  static rotateVolumeData(
    data: Float32Array,
    dims: [number, number, number],
    pixDims: [number, number, number],
    rotation: RotationOption
  ): { data: Float32Array; dims: [number, number, number]; pixDims: [number, number, number] } {
    const [dimX, dimY, dimZ] = dims;
    
    switch (rotation) {
      case 'rotate90': {
        // Rotate 90° around Z-axis: (x,y,z) -> (y, dimX-1-x, z)
        const newDims: [number, number, number] = [dimY, dimX, dimZ];
        const newPixDims: [number, number, number] = [pixDims[1], pixDims[0], pixDims[2]];
        const newData = new Float32Array(data.length);
        
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            for (let x = 0; x < dimX; x++) {
              const srcIdx = z * dimX * dimY + y * dimX + x;
              const newX = y;
              const newY = dimX - 1 - x;
              const dstIdx = z * newDims[0] * newDims[1] + newY * newDims[0] + newX;
              newData[dstIdx] = data[srcIdx];
            }
          }
        }
        return { data: newData, dims: newDims, pixDims: newPixDims };
      }
      
      case 'rotate180': {
        // Rotate 180° around Z-axis: (x,y,z) -> (dimX-1-x, dimY-1-y, z)
        const newData = new Float32Array(data.length);
        
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            for (let x = 0; x < dimX; x++) {
              const srcIdx = z * dimX * dimY + y * dimX + x;
              const newX = dimX - 1 - x;
              const newY = dimY - 1 - y;
              const dstIdx = z * dimX * dimY + newY * dimX + newX;
              newData[dstIdx] = data[srcIdx];
            }
          }
        }
        return { data: newData, dims, pixDims };
      }
      
      case 'rotate270': {
        // Rotate 270° (or -90°) around Z-axis: (x,y,z) -> (dimY-1-y, x, z)
        const newDims: [number, number, number] = [dimY, dimX, dimZ];
        const newPixDims: [number, number, number] = [pixDims[1], pixDims[0], pixDims[2]];
        const newData = new Float32Array(data.length);
        
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            for (let x = 0; x < dimX; x++) {
              const srcIdx = z * dimX * dimY + y * dimX + x;
              const newX = dimY - 1 - y;
              const newY = x;
              const dstIdx = z * newDims[0] * newDims[1] + newY * newDims[0] + newX;
              newData[dstIdx] = data[srcIdx];
            }
          }
        }
        return { data: newData, dims: newDims, pixDims: newPixDims };
      }
      
      case 'flipX': {
        // Flip along X-axis: (x,y,z) -> (dimX-1-x, y, z)
        const newData = new Float32Array(data.length);
        
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            for (let x = 0; x < dimX; x++) {
              const srcIdx = z * dimX * dimY + y * dimX + x;
              const dstIdx = z * dimX * dimY + y * dimX + (dimX - 1 - x);
              newData[dstIdx] = data[srcIdx];
            }
          }
        }
        return { data: newData, dims, pixDims };
      }
      
      case 'flipY': {
        // Flip along Y-axis: (x,y,z) -> (x, dimY-1-y, z)
        const newData = new Float32Array(data.length);
        
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            for (let x = 0; x < dimX; x++) {
              const srcIdx = z * dimX * dimY + y * dimX + x;
              const dstIdx = z * dimX * dimY + (dimY - 1 - y) * dimX + x;
              newData[dstIdx] = data[srcIdx];
            }
          }
        }
        return { data: newData, dims, pixDims };
      }
      
      case 'flipZ': {
        // Flip along Z-axis: (x,y,z) -> (x, y, dimZ-1-z)
        const newData = new Float32Array(data.length);
        
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            for (let x = 0; x < dimX; x++) {
              const srcIdx = z * dimX * dimY + y * dimX + x;
              const dstIdx = (dimZ - 1 - z) * dimX * dimY + y * dimX + x;
              newData[dstIdx] = data[srcIdx];
            }
          }
        }
        return { data: newData, dims, pixDims };
      }
      
      default:
        return { data, dims, pixDims };
    }
  }

  /**
   * Extract axial slices - QUALITY PRESERVED
   * Uses Float32Array internally, converts to display format only at render time
   */
  static extractAxialSlices(volume: VolumeData): MedicalImageData[] {
    const slices: MedicalImageData[] = [];
    const [dimX, dimY, dimZ] = volume.dims;
    const data = volume.rawData || volume.nvImage?.img;
    
    if (!data) return slices;
    
    const { min = 0, max = 255 } = volume;
    
    for (let z = 0; z < dimZ; z++) {
      const width = dimX;
      const height = dimY;
      // Use Float32Array to preserve full precision!
      const pixelData = new Float32Array(width * height);
      
      for (let y = 0; y < dimY; y++) {
        for (let x = 0; x < dimX; x++) {
          const srcIndex = z * dimX * dimY + y * dimX + x;
          const dstIndex = y * dimX + x;
          pixelData[dstIndex] = data[srcIndex];  // No normalization yet!
        }
      }
      
      slices.push({
        pixelData,
        sliceIndex: z,
        width,
        height,
        orientation: 'axial',
        min,
        max
      });
    }
    return slices;
  }

  /**
   * Extract coronal slices - QUALITY PRESERVED
   */
  static extractCoronalSlices(volume: VolumeData): MedicalImageData[] {
    const slices: MedicalImageData[] = [];
    const [dimX, dimY, dimZ] = volume.dims;
    const data = volume.rawData || volume.nvImage?.img;
    
    if (!data) return slices;
    
    const { min = 0, max = 255 } = volume;
    
    for (let y = 0; y < dimY; y++) {
      const width = dimX;
      const height = dimZ;
      const pixelData = new Float32Array(width * height);
      
      for (let z = 0; z < dimZ; z++) {
        for (let x = 0; x < dimX; x++) {
          const srcIndex = z * dimX * dimY + y * dimX + x;
          const dstZ = dimZ - 1 - z;
          const dstIndex = dstZ * dimX + x;
          pixelData[dstIndex] = data[srcIndex];  // No normalization yet!
        }
      }
      
      slices.push({
        pixelData,
        sliceIndex: y,
        width,
        height,
        orientation: 'coronal',
        min,
        max
      });
    }
    return slices;
  }

  /**
   * Extract sagittal slices - QUALITY PRESERVED
   */
  static extractSagittalSlices(volume: VolumeData): MedicalImageData[] {
    const slices: MedicalImageData[] = [];
    const [dimX, dimY, dimZ] = volume.dims;
    const data = volume.rawData || volume.nvImage?.img;
    
    if (!data) return slices;
    
    const { min = 0, max = 255 } = volume;
    
    for (let x = 0; x < dimX; x++) {
      const width = dimY;
      const height = dimZ;
      const pixelData = new Float32Array(width * height);
      
      for (let z = 0; z < dimZ; z++) {
        for (let y = 0; y < dimY; y++) {
          const srcIndex = z * dimX * dimY + y * dimX + x;
          const dstZ = dimZ - 1 - z;
          const dstIndex = dstZ * dimY + y;
          pixelData[dstIndex] = data[srcIndex];  // No normalization yet!
        }
      }
      
      slices.push({
        pixelData,
        sliceIndex: x,
        width,
        height,
        orientation: 'sagittal',
        min,
        max
      });
    }
    return slices;
  }

  static getSlicesByOrientation(
    volume: VolumeData, 
    orientation: 'axial' | 'coronal' | 'sagittal'
  ): MedicalImageData[] {
    switch (orientation) {
      case 'axial':
        return this.extractAxialSlices(volume);
      case 'coronal':
        return this.extractCoronalSlices(volume);
      case 'sagittal':
        return this.extractSagittalSlices(volume);
      default:
        throw new Error(`Unknown orientation: ${orientation}`);
    }
  }

  /**
   * Convert to ImageData for display - normalization happens HERE only
   * This is the ONLY place where we reduce to 8-bit for display
   */
  static convertToImageData(
    medicalData: MedicalImageData,
    windowLevel?: { center: number; width: number }
  ): ImageData {
    const { pixelData, width, height, min, max } = medicalData;
    const imageData = new ImageData(width, height);
    const data = imageData.data;
    
    // Calculate window/level for display (doesn't affect stored data)
    let displayMin = min;
    let displayMax = max;
    
    if (windowLevel) {
      displayMin = windowLevel.center - windowLevel.width / 2;
      displayMax = windowLevel.center + windowLevel.width / 2;
    }
    
    const range = displayMax - displayMin;
    
    if (range === 0 || !isFinite(range)) {
      data.fill(128);
      for (let i = 3; i < data.length; i += 4) data[i] = 255;
      return imageData;
    }
    
    for (let i = 0; i < pixelData.length; i++) {
      const pixelValue = pixelData[i];
      // Apply window/level and normalize to 0-255 for display only
      const clampedValue = Math.max(displayMin, Math.min(displayMax, pixelValue));
      const normalizedValue = Math.round(((clampedValue - displayMin) / range) * 255);
      
      const pixelIndex = i * 4;
      data[pixelIndex] = normalizedValue;
      data[pixelIndex + 1] = normalizedValue;
      data[pixelIndex + 2] = normalizedValue;
      data[pixelIndex + 3] = 255;
    }
    
    return imageData;
  }

  /**
   * Get raw voxel value at specific coordinates - FULL PRECISION
   */
  static getVoxelValue(volume: VolumeData, x: number, y: number, z: number): number {
    const [dimX, dimY, dimZ] = volume.dims;
    
    if (x < 0 || x >= dimX || y < 0 || y >= dimY || z < 0 || z >= dimZ) {
      return NaN;
    }
    
    const data = volume.rawData || volume.nvImage?.img;
    if (!data) return NaN;
    
    const index = z * dimX * dimY + y * dimX + x;
    return data[index];
  }

  static createCanvas(
    imageData: ImageData,
    options?: {
      scale?: number;
      targetWidth?: number;
      targetHeight?: number;
      smoothing?: boolean;
    }
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const scale = options?.scale || 1;
    const targetWidth = options?.targetWidth || imageData.width * scale;
    const targetHeight = options?.targetHeight || imageData.height * scale;
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Use high quality interpolation for scaling
    ctx.imageSmoothingEnabled = options?.smoothing !== false;
    ctx.imageSmoothingQuality = 'high';
    
    // Create temp canvas at original size
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Draw scaled
    ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
    
    return canvas;
  }
}