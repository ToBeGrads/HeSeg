import { NVImage } from '@niivue/niivue'
import type { VolumeData } from '../types'

export interface MedicalImageData {
  pixelData: Uint8Array | Uint16Array | Float32Array;
  width: number;
  height: number;
  sliceIndex: number;
  orientation: 'axial' | 'coronal' | 'sagittal';
  min?: number;
  max?: number;
}



export class MedicalImageLoader {
  static async loadNiftiVolume(filePath: string): Promise<VolumeData> {
    try {
      // console.log('Loading NIfTI file:', filePath);
      
      const nvImage = await NVImage.loadFromUrl({ url: filePath, 
  //       headers: {
  //       'ngrok-skip-browser-warning': '69420' 
  // } 
});
      
      if (!nvImage || !nvImage.img) {
        throw new Error('Failed to load NIfTI image - no image data');
      }
      
      // console.log('NIfTI loaded successfully');
      // console.log('  Header dims:', nvImage.hdr?.dims);
      // console.log('  Datatype:', nvImage.hdr?.datatypeCode);
      
      const dims = (nvImage.hdr?.dims?.slice(1, 4) as [number, number, number]) || [256, 256, 180];
      const voxelSize = nvImage.hdr?.pixDims?.slice(1, 4) || [1, 1, 1];
    

      const pixDims = nvImage.hdr?.pixDims?.slice(1, 4) || [0, 0, 0];

      console.log(pixDims)
      
      const scl_slope = nvImage.hdr?.scl_slope || 1;
      const scl_inter = nvImage.hdr?.scl_inter || 0;
      
      // console.log('scaling: slope =', scl_slope, ', intercept =', scl_inter);
      
      // BRAINCHOP METHOD: Calculate min/max from actual data
      let min = Infinity;
      let max = -Infinity;
      
      // Apply scaling and find true min/max
      for (let i = 0; i < nvImage.img.length; i++) {
        const val = nvImage.img[i] * scl_slope + scl_inter;
        if (isFinite(val)) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
      
      // console.log('Volume info:');
      // console.log('  Dimensions:', dims);
      // console.log('  Pixel Dimensions (spacing):', pixDims);
      // console.log('  Value Range:', [min, max]);
      
      return {
        nvImage,
        dims,
        min,
        max,
        voxelSize,
        scl_slope,
        scl_inter,
        pixDims
      };

    } catch (error) {
      console.error('Error loading NIfTI file:', error);
      throw error;
    }
  }

  static extractAxialSlices(volume: VolumeData): MedicalImageData[] {
    const { nvImage, dims, scl_slope, scl_inter, min, max } = volume;
    const [cols, rows, depth] = dims;
    const slices: MedicalImageData[] = [];
    
    if (!nvImage.img) {
      throw new Error('No image data available');
    }
    
    // console.log(`Extracting ${depth} axial slices (${cols}x${rows})`);
    
    const sliceSize = cols * rows;
    
    for (let z = 0; z < depth; z++) {
      const sliceData = new Float32Array(sliceSize);
      const sliceOffset = z * sliceSize;
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const volumeIndex = sliceOffset + y * cols + x;
          const sliceIndex = y * cols + x;
          
          let value = nvImage.img[volumeIndex];
          value = value * scl_slope + scl_inter;
          
          sliceData[sliceIndex] = value;
        }
      }
      
      slices.push({
        pixelData: sliceData,
        width: cols,
        height: rows,
        sliceIndex: z,
        orientation: 'axial',
        min,
        max
      });
    }
    
    // console.log(`Extracted ${slices.length} axial slices`);
    return slices;
  }

  static extractCoronalSlices(volume: VolumeData): MedicalImageData[] {
    const { nvImage, dims, scl_slope, scl_inter, min, max } = volume;
    const [cols, rows, depth] = dims;
    const slices: MedicalImageData[] = [];
    
    if (!nvImage.img) {
      throw new Error('No image data available');
    }
    
    // console.log(`Extracting ${rows} coronal slices (${cols}x${depth})`);
    
    const sliceSize = cols * rows;
    
    for (let y = 0; y < rows; y++) {
      const sliceData = new Float32Array(cols * depth);
      
      for (let z = 0; z < depth; z++) {
        for (let x = 0; x < cols; x++) {
          const volumeIndex = z * sliceSize + y * cols + x;
          const sliceIndex = z * cols + x;
          
          let value = nvImage.img[volumeIndex];
          value = value * scl_slope + scl_inter;
          
          sliceData[sliceIndex] = value;
        }
      }
      
      slices.push({
        pixelData: sliceData,
        width: cols,
        height: depth,
        sliceIndex: y,
        orientation: 'coronal',
        min,
        max
      });
    }
    
    // console.log(`Extracted ${slices.length} coronal slices`);
    return slices;
  }

  static extractSagittalSlices(volume: VolumeData): MedicalImageData[] {
    const { nvImage, dims, scl_slope, scl_inter, min, max } = volume;
    const [cols, rows, depth] = dims;
    const slices: MedicalImageData[] = [];
    
    if (!nvImage.img) {
      throw new Error('No image data available');
    }
    
    // console.log(`Extracting ${cols} sagittal slices (${rows}x${depth})`);
    
    const sliceSize = cols * rows;
    
    for (let x = 0; x < cols; x++) {
      const sliceData = new Float32Array(rows * depth);
      
      for (let z = 0; z < depth; z++) {
        for (let y = 0; y < rows; y++) {
          const volumeIndex = z * sliceSize + y * cols + x;
          const sliceIndex = z * rows + y;
          
          let value = nvImage.img[volumeIndex];
          value = value * scl_slope + scl_inter;
          
          sliceData[sliceIndex] = value;
        }
      }
      
      slices.push({
        pixelData: sliceData,
        width: rows,
        height: depth,
        sliceIndex: x,
        orientation: 'sagittal',
        min,
        max
      });
    }
    
    // console.log(`Extracted ${slices.length} sagittal slices`);
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

  /**
   * BRAINCHOP EXACT METHOD: Simple linear mapping from min to max
   * This is what Brainchop does - just normalize to 0-255
   */
  static convertToImageData(medicalData: MedicalImageData): ImageData {
    const { pixelData, width, height, min = 0, max = 255 } = medicalData;
    
    const imageData = new ImageData(width, height);
    const data = imageData.data;
    
    const range = max - min;
    
    if (range === 0 || !isFinite(range)) {
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
    
    // BRAINCHOP METHOD: Simple linear scaling
    // value = Math.ceil(value * 255 / (n_classes - 1))
    // For our case: normalized = (value - min) / range * 255
    
    for (let i = 0; i < pixelData.length; i++) {
      const pixelValue = pixelData[i];
      
      // Clamp to range
      const clampedValue = Math.max(min, Math.min(max, pixelValue));
      
      // Linear normalization to 0-255
      const normalizedValue = Math.round(((clampedValue - min) / range) * 255);
      
      const pixelIndex = i * 4;
      
      // Grayscale
      data[pixelIndex] = normalizedValue;
      data[pixelIndex + 1] = normalizedValue;
      data[pixelIndex + 2] = normalizedValue;
      data[pixelIndex + 3] = 255;
    }
    
    return imageData;
  }

  static createCanvas(imageData: ImageData, options?: {
    scale?: number;
    targetWidth?: number;
    targetHeight?: number;
    smoothing?: boolean;
  }): HTMLCanvasElement {
    const scale = options?.scale || 1;
    const targetWidth = options?.targetWidth;
    const targetHeight = options?.targetHeight;
    const smoothing = options?.smoothing ?? true;
    
    const nativeCanvas = document.createElement('canvas');
    nativeCanvas.width = imageData.width;
    nativeCanvas.height = imageData.height;
    
    const nativeCtx = nativeCanvas.getContext('2d', { 
      alpha: false,
      willReadFrequently: false
    });
    
    if (!nativeCtx) {
      throw new Error('Failed to get 2D context');
    }
    
    nativeCtx.imageSmoothingEnabled = false;
    nativeCtx.putImageData(imageData, 0, 0);
    
    if (scale === 1 && !targetWidth && !targetHeight) {
      return nativeCanvas;
    }
    
    let finalWidth: number;
    let finalHeight: number;
    
    if (targetWidth && targetHeight) {
      finalWidth = targetWidth;
      finalHeight = targetHeight;
    } else if (targetWidth) {
      finalWidth = targetWidth;
      finalHeight = Math.round((targetWidth / imageData.width) * imageData.height);
    } else if (targetHeight) {
      finalHeight = targetHeight;
      finalWidth = Math.round((targetHeight / imageData.height) * imageData.width);
    } else {
      finalWidth = Math.round(imageData.width * scale);
      finalHeight = Math.round(imageData.height * scale);
    }
    
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = finalWidth;
    scaledCanvas.height = finalHeight;
    
    const scaledCtx = scaledCanvas.getContext('2d', {
      alpha: false,
      willReadFrequently: false
    });
    
    if (!scaledCtx) {
      throw new Error('Failed to get scaled 2D context');
    }
    
    scaledCtx.imageSmoothingEnabled = smoothing;
    scaledCtx.imageSmoothingQuality = 'high';
    
    scaledCtx.drawImage(
      nativeCanvas,
      0, 0, imageData.width, imageData.height,
      0, 0, finalWidth, finalHeight
    );
    
    return scaledCanvas;
  }

  static createDisplayCanvas(
    imageData: ImageData,
    containerWidth: number,
    containerHeight: number,
    fitMode: 'contain' | 'cover' | 'fill' = 'contain'
  ): HTMLCanvasElement {
    const aspectRatio = imageData.width / imageData.height;
    const containerAspect = containerWidth / containerHeight;
    
    let targetWidth: number;
    let targetHeight: number;
    
    if (fitMode === 'fill') {
      targetWidth = containerWidth;
      targetHeight = containerHeight;
    } else if (fitMode === 'contain') {
      if (aspectRatio > containerAspect) {
        targetWidth = containerWidth;
        targetHeight = containerWidth / aspectRatio;
      } else {
        targetHeight = containerHeight;
        targetWidth = containerHeight * aspectRatio;
      }
    } else {
      if (aspectRatio > containerAspect) {
        targetHeight = containerHeight;
        targetWidth = containerHeight * aspectRatio;
      } else {
        targetWidth = containerWidth;
        targetHeight = containerWidth / aspectRatio;
      }
    }
    
    return this.createCanvas(imageData, {
      targetWidth: Math.round(targetWidth),
      targetHeight: Math.round(targetHeight),
      smoothing: true
    });
  }
}