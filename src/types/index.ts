// src/types/index.ts

export type RotationOption = 'none' | 'rotate90' | 'rotate180' | 'rotate270' | 'flipX' | 'flipY' | 'flipZ'
export interface Coordinate {
    x: number
    y: number
    z: number
    hasSegmentation?: boolean
    orientation?: 'axial' | 'coronal' | 'sagittal'
  }
  
  export interface Structure {
    id: number
    title: string
    color: string
    coordinates: Coordinate[]
  }
  
  export interface VolumeData {
    nvImage: any
    dims: [number, number, number]
    min: number
    max: number
    voxelSize: number[]
    scl_slope : number 
    scl_inter : number
    pixDims: number[]
    originalDims?: [number, number, number]  // Store original before rotation
  rotation?: RotationOption
  // Keep original data reference for quality preservation
  rawData?: Float32Array  // Full precision!
  }
  
  export interface Mask {
    id: number
    structureId: number
    data: Uint8Array
    dims: [number, number, number]
    visible: boolean
    opacity: number
  }
  
  export type Orientation = 'axial' | 'coronal' | 'sagittal'
  export type ViewMode = 'single' | 'quad' | '3d' | 'mosaic'
  export type Tool = 'draw' | 'erase' | 'ruler'
  
  export interface ViewerSettings {
    brightness: number
    contrast: number
    opacity: number
    crosshair: boolean
  }
  
  export interface PlacementMode {
    active: boolean
    structureId: number | null
    color: string | null
    isEditing?: boolean
    currentCoordinate?: Coordinate
  }
  
  export interface SliceData {
    pixelData: Uint8Array
    width: number
    height: number
    sliceIndex: number
    orientation: Orientation
    min: number
    max: number
    canvas?: HTMLCanvasElement
    imageData?: ImageData
  }