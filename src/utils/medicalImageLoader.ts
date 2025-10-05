import { Niivue, NVImage } from '@niivue/niivue'

export interface MedicalImageData {
  pixelData: Uint8Array | Uint16Array | Float32Array;
  width: number;
  height: number;
  sliceIndex: number;
  orientation: 'axial' | 'coronal' | 'sagittal';
  min?: number;
  max?: number;
}

export interface VolumeData {
  nvImage: NVImage;
  dims: number[];
  min: number;
  max: number;
  voxelSize: number[];
}

export class MedicalImageLoader {
  static async loadNiftiVolume(filePath: string): Promise<VolumeData> {
    try {
      console.log('🔄 Loading NIfTI file:', filePath);
      
      // Use NVImage.loadFromUrl which returns a Promise<NVImage>
      const nvImage = await NVImage.loadFromUrl({ url: filePath });
      
      if (!nvImage || !nvImage.img) {
        throw new Error('Failed to load NIfTI image - no image data');
      }
      
      console.log('✅ NIfTI loaded successfully');
      console.log('  Header dims:', nvImage.hdr?.dims);
      console.log('  Datatype:', nvImage.hdr?.datatypeCode);
      console.log('  Image array length:', nvImage.img.length);
      
      // Get proper dimensions and voxel spacing
      const dims = nvImage.hdr?.dims?.slice(1, 4) || [256, 256, 180];
      const voxelSize = nvImage.hdr?.pixDims?.slice(1, 4) || [1, 1, 1];
      
      // Calculate min/max efficiently without spreading the array
      let min = Infinity;
      let max = -Infinity;
      
      // Process in chunks to avoid stack overflow
      const chunkSize = 10000;
      for (let i = 0; i < nvImage.img.length; i += chunkSize) {
        const end = Math.min(i + chunkSize, nvImage.img.length);
        for (let j = i; j < end; j++) {
          const val = nvImage.img[j];
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
      
      // Use header values if available and reasonable
      if (nvImage.hdr?.cal_min !== undefined && 
          nvImage.hdr?.cal_max !== undefined &&
          nvImage.hdr.cal_min < nvImage.hdr.cal_max) {
        min = nvImage.hdr.cal_min;
        max = nvImage.hdr.cal_max;
      }
      
      console.log('📊 Volume info:');
      console.log('  Dimensions:', dims);
      console.log('  Voxel Size:', voxelSize);
      console.log('  Value Range:', [min, max]);
      
      return {
        nvImage,
        dims,
        min,
        max,
        voxelSize
      };
    } catch (error) {
      console.error('❌ Error loading NIfTI file:', error);
      throw error;
    }
  }

  // Brainchop-style axial extraction (Z-axis slicing)
  static extractAxialSlices(volume: VolumeData): MedicalImageData[] {
    const { nvImage } = volume;
    const [width, height, depth] = volume.dims;
    const slices: MedicalImageData[] = [];
    
    if (!nvImage.img) {
      throw new Error('No image data available');
    }
    
    console.log(`📸 Extracting ${depth} axial slices (${width}x${height})`);
    
    for (let z = 0; z < depth; z++) {
      const sliceData = new Float32Array(width * height);
      
      // Axial slices: XY plane at different Z levels
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const volumeIndex = z * (width * height) + y * width + x;
          const sliceIndex = y * width + x;
          sliceData[sliceIndex] = nvImage.img[volumeIndex];
        }
      }
      
      slices.push({
        pixelData: sliceData,
        width,
        height,
        sliceIndex: z,
        orientation: 'axial',
        min: volume.min,
        max: volume.max
      });
    }
    
    console.log(`✅ Extracted ${slices.length} axial slices`);
    return slices;
  }

  // Brainchop-style coronal extraction (Y-axis slicing)
  static extractCoronalSlices(volume: VolumeData): MedicalImageData[] {
    const { nvImage } = volume;
    const [width, height, depth] = volume.dims;
    const slices: MedicalImageData[] = [];
    
    if (!nvImage.img) {
      throw new Error('No image data available');
    }
    
    console.log(`📸 Extracting ${height} coronal slices (${width}x${depth})`);
    
    for (let y = 0; y < height; y++) {
      const sliceData = new Float32Array(width * depth);
      
      // Coronal slices: XZ plane at different Y levels
      for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
          const volumeIndex = z * (width * height) + y * width + x;
          // Flip Z coordinate for proper radiological orientation
          const flippedZ = depth - 1 - z;
          const sliceIndex = flippedZ * width + x;
          sliceData[sliceIndex] = nvImage.img[volumeIndex];
        }
      }
      
      slices.push({
        pixelData: sliceData,
        width,
        height: depth,
        sliceIndex: y,
        orientation: 'coronal',
        min: volume.min,
        max: volume.max
      });
    }
    
    console.log(`✅ Extracted ${slices.length} coronal slices`);
    return slices;
  }

  // Brainchop-style sagittal extraction (X-axis slicing)
  static extractSagittalSlices(volume: VolumeData): MedicalImageData[] {
    const { nvImage } = volume;
    const [width, height, depth] = volume.dims;
    const slices: MedicalImageData[] = [];
    
    if (!nvImage.img) {
      throw new Error('No image data available');
    }
    
    console.log(`📸 Extracting ${width} sagittal slices (${height}x${depth})`);
    
    for (let x = 0; x < width; x++) {
      const sliceData = new Float32Array(height * depth);
      
      // Sagittal slices: YZ plane at different X levels
      for (let z = 0; z < depth; z++) {
        for (let y = 0; y < height; y++) {
          const volumeIndex = z * (width * height) + y * width + x;
          // Flip Z coordinate for proper radiological orientation
          const flippedZ = depth - 1 - z;
          const sliceIndex = flippedZ * height + y;
          sliceData[sliceIndex] = nvImage.img[volumeIndex];
        }
      }
      
      slices.push({
        pixelData: sliceData,
        width: height,
        height: depth,
        sliceIndex: x,
        orientation: 'sagittal',
        min: volume.min,
        max: volume.max
      });
    }
    
    console.log(`✅ Extracted ${slices.length} sagittal slices`);
    return slices;
  }

  static getSlicesByOrientation(volume: VolumeData, orientation: 'axial' | 'coronal' | 'sagittal'): MedicalImageData[] {
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

  static convertToImageData(medicalData: MedicalImageData): ImageData {
    const { pixelData, width, height, min = 0, max = 255 } = medicalData;
    
    const imageData = new ImageData(width, height);
    const data = imageData.data;
    
    // Apply proper windowing - Brainchop style
    const range = max - min;
    
    if (range === 0) {
      // All pixels same value, return gray image
      const grayValue = 128;
      for (let i = 0; i < pixelData.length; i++) {
        const pixelIndex = i * 4;
        data[pixelIndex] = grayValue;
        data[pixelIndex + 1] = grayValue;
        data[pixelIndex + 2] = grayValue;
        data[pixelIndex + 3] = 255;
      }
      return imageData;
    }
    
    const windowCenter = min + range * 0.5;
    const windowWidth = range * 0.8;
    const windowMin = windowCenter - windowWidth / 2;
    const windowMax = windowCenter + windowWidth / 2;
    
    for (let i = 0; i < pixelData.length; i++) {
      let normalizedValue = 0;
      const pixelValue = pixelData[i];
      
      if (pixelValue <= windowMin) {
        normalizedValue = 0;
      } else if (pixelValue >= windowMax) {
        normalizedValue = 255;
      } else {
        normalizedValue = ((pixelValue - windowMin) / windowWidth) * 255;
      }
      
      const pixelIndex = i * 4;
      
      // Grayscale with improved contrast
      data[pixelIndex] = normalizedValue;     // Red
      data[pixelIndex + 1] = normalizedValue; // Green
      data[pixelIndex + 2] = normalizedValue; // Blue
      data[pixelIndex + 3] = 255;             // Alpha
    }
    
    return imageData;
  }

  static createCanvas(imageData: ImageData): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
    }
    
    return canvas;
  }
}