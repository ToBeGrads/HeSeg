// src/utils/MaskManager.ts
import { saveMask, deleteMask, loadMask } from './MaskDB';
import { debounce } from 'lodash'
import { createMask, Load_Mask } from './functionalities';

export interface Mask {
  id: string
  structureId: number
  data: Uint8Array | null
  dims: [number, number, number] | null
  visible: boolean
  opacity: number
}

interface HistoryEntry {
  data: Uint8Array
  timestamp: number
  orientation: 'axial' | 'coronal' | 'sagittal'
}

interface SliceHistory {
  [sliceIndex: number]: {
    entries: HistoryEntry[]
    currentIndex: number
  }
}

// Simple EventEmitter for browser
class SimpleEventEmitter {
  private events: Map<string, Function[]> = new Map()

  on(event: string, listener: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
  }

  off(event: string, listener: Function) {
    if (!this.events.has(event)) return
    const listeners = this.events.get(event)!
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.events.get(event)
    // console.log('Emitting:', event, 'Listeners count:', handlers?.length || 0)

    if (handlers) {
      handlers.forEach(handler => {
        // console.log('Calling handler for', event)
        handler(...args)
      })
    } else {
      console.warn('No handlers registered for event:', event)
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }
}

export class MaskManager extends SimpleEventEmitter {
  private masks: Map<string, Mask> = new Map()
  private sliceHistory: Map<number, SliceHistory> = new Map()
  private currentSlice: Map<number, number> = new Map()
  private currentOrientation: Map<number, 'axial' | 'coronal' | 'sagittal'> = new Map()
  private maxHistorySize = 50

  // reduce the rate of saving the mask to the local database
  private debouncedSave = debounce(
    (structureId: number, patient_id: string, dims: [number, number, number], data: Uint8Array) => {
      const modality = localStorage.getItem("selected_modality")!
      saveMask(structureId, patient_id, dims, data,modality)
    },
    250 // wait 0.5s after the last draw before saving
  )

  setCurrentSlice(structureId: number, sliceIndex: number, orientation?: 'axial' | 'coronal' | 'sagittal'): void {
    this.currentSlice.set(structureId, sliceIndex)
    if (orientation) {
      this.currentOrientation.set(structureId, orientation)
    }
  }

  getCurrentSlice(structureId: number): number {
    return this.currentSlice.get(structureId) ?? 0
  }

  getCurrentOrientation(structureId: number): 'axial' | 'coronal' | 'sagittal' {
    return this.currentOrientation.get(structureId) ?? 'axial'
  }

  async createMask(patient_id: string, structureId: number, dims: [number, number, number]): Promise<Mask> {
    const totalVoxels = dims[0] * dims[1] * dims[2]
    const modality = localStorage.getItem("selected_modality")!
    const mask: Mask = {
      id: `mask-${patient_id}-${structureId}-${modality}`,
      structureId,
      data: new Uint8Array(totalVoxels),
      dims,
      visible: false,
      opacity: 0.2
    }

    this.masks.set(`${patient_id}-${structureId}-${modality}`, mask)
    this.sliceHistory.set(structureId, {})
    this.currentSlice.set(structureId, 0)

    // save into local db first 
    console.log('unless you pack your bags : here are dims', dims)
    await saveMask(structureId, patient_id, dims, mask.data!,modality)
    console.log(`Creating mask for structure ${structureId} in local db`, mask)

    // upload to the database in the backend
    const arrayBuffer = mask.data!.buffer as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
    console.log("Creating the mask in the backend ...")
    await createMask(blob, structureId, patient_id, localStorage.getItem('color')!, mask.dims!)
    return mask
  }

  async getMask(structureId: number): Promise<Mask | null> {

    // Check in-memory first
    const patient_id = localStorage.getItem("selected_patient")
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (mask) {
      return mask
    }
    //Try to load from IndexedDB
    let stored
    try {
      stored = await loadMask(structureId)
    } catch (err) {
      console.error(`Failed to load mask from DB for structure ${structureId}:`, err)
      return null
    }

    // If nothing in DB, look in teh backend
    if (!stored || !stored.data || !stored.dims || stored.dims.length !== 3) {
    console.warn(`No mask found for structure ${structureId} in indexedDB`)
    console.log("loading the mask from the database-backend")

    const formData = new FormData()
    formData.append('structure_id', structureId.toString())
    formData.append('patient_id', localStorage.getItem('selected_patient')!)
    formData.append('modality', localStorage.getItem('selected_modality')!)

    // fetch from backend 
    stored = await Load_Mask(formData)
    // add to the indexedDB for future use
    // createMask(
    //   new Blob([stored.data.buffer], { type: "application/octet-stream" }),
    //   structureId,
    //   patient_id!,
    //   localStorage.getItem('color')!,
    //   stored.dims!
    // )
    console.log(`Loaded mask for structure ${structureId} from backend`)
    }

    // Rebuild mask from DB
    const loadedMask: Mask = {
      id: `mask-${localStorage.getItem("selected_patient")}-${structureId}`,
      structureId,
      data: stored!.data,
      dims: stored!.dims,
      visible: true,
      opacity: stored!.opacity ?? 0.2,
    }

    // Save in memory
    this.masks.set(`${patient_id}-${structureId}-${modality}`, loadedMask)
    this.sliceHistory.set(structureId, {})
    this.currentSlice.set(structureId, 0)

    // console.log(`Loaded mask for structure ${structureId} from IndexedDB`)
    this.emit('maskLoaded', structureId)

    return loadedMask
  }




  setCurrentSlice(structureId: number, sliceIndex: number): void {
    this.currentSlice.set(structureId, sliceIndex)
  }

  getCurrentSlice(structureId: number): number {
    return this.currentSlice.get(structureId) || 0
  }

  // Get slice data for ANY orientation
  private getSliceData(
    structureId: number, 
    sliceIndex: number, 
    orientation: 'axial' | 'coronal' | 'sagittal' = 'axial'
  ): Uint8Array {
    const patient_id = localStorage.getItem("selected_patient")
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (!mask || !mask.data || !mask.dims) return new Uint8Array(0)

    const [dimX, dimY, dimZ] = mask.dims

    switch (orientation) {
      case 'axial': {
        // Z slice: extract X-Y plane at sliceIndex
        const sliceSize = dimX * dimY
        const sliceData = new Uint8Array(sliceSize)
        for (let y = 0; y < dimY; y++) {
          for (let x = 0; x < dimX; x++) {
            const index3D = x + y * dimX + sliceIndex * dimX * dimY
            const index2D = x + y * dimX
            sliceData[index2D] = mask.data[index3D]
          }
        }
        return sliceData
      }
      case 'coronal': {
        // Y slice: extract X-Z plane at sliceIndex
        const sliceSize = dimX * dimZ
        const sliceData = new Uint8Array(sliceSize)
        for (let z = 0; z < dimZ; z++) {
          for (let x = 0; x < dimX; x++) {
            const index3D = x + sliceIndex * dimX + z * dimX * dimY
            const index2D = x + z * dimX
            sliceData[index2D] = mask.data[index3D]
          }
        }
        return sliceData
      }
      case 'sagittal': {
        // X slice: extract Y-Z plane at sliceIndex
        const sliceSize = dimY * dimZ
        const sliceData = new Uint8Array(sliceSize)
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            const index3D = sliceIndex + y * dimX + z * dimX * dimY
            const index2D = y + z * dimY
            sliceData[index2D] = mask.data[index3D]
          }
        }
        return sliceData
      }
    }
  }

  // Set slice data for ANY orientation
  private setSliceData(
    structureId: number, 
    sliceIndex: number, 
    sliceData: Uint8Array,
    orientation: 'axial' | 'coronal' | 'sagittal' = 'axial'
  ): void {
    const patient_id = localStorage.getItem("selected_patient")
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (!mask || !mask.data || !mask.dims) return

    const [dimX, dimY, dimZ] = mask.dims

    switch (orientation) {
      case 'axial': {
        // Z slice: write X-Y plane at sliceIndex
        for (let y = 0; y < dimY; y++) {
          for (let x = 0; x < dimX; x++) {
            const index3D = x + y * dimX + sliceIndex * dimX * dimY
            const index2D = x + y * dimX
            mask.data[index3D] = sliceData[index2D]
          }
        }
        break
      }
      case 'coronal': {
        // Y slice: write X-Z plane at sliceIndex
        for (let z = 0; z < dimZ; z++) {
          for (let x = 0; x < dimX; x++) {
            const index3D = x + sliceIndex * dimX + z * dimX * dimY
            const index2D = x + z * dimX
            mask.data[index3D] = sliceData[index2D]
          }
        }
        break
      }
      case 'sagittal': {
        // X slice: write Y-Z plane at sliceIndex
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            const index3D = sliceIndex + y * dimX + z * dimX * dimY
            const index2D = y + z * dimY
            mask.data[index3D] = sliceData[index2D]
          }
        }
        break
      }
    }
  }

  // Updated saveHistory with orientation
  saveHistory(
    structureId: number, 
    sliceIndex?: number,
    orientation?: 'axial' | 'coronal' | 'sagittal'
  ): void {
    const patient_id = localStorage.getItem('selected_patient')
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (!mask) return

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const currentOrientation = orientation ?? this.getCurrentOrientation(structureId)
    
    // Create a unique key for this slice+orientation combo
    const historyKey = `${currentOrientation}-${currentSliceIndex}`
    
    const sliceData = this.getSliceData(structureId, currentSliceIndex, currentOrientation)

    let history = this.sliceHistory.get(structureId)
    if (!history) {
      history = {}
      this.sliceHistory.set(structureId, history)
    }

    if (!history[historyKey]) {
      history[historyKey] = {
        entries: [],
        currentIndex: -1
      }
    }

    const sliceHist = history[historyKey]

    // Remove any future history if we're not at the end
    sliceHist.entries = sliceHist.entries.slice(0, sliceHist.currentIndex + 1)

    // Add new state
    sliceHist.entries.push({
      data: new Uint8Array(sliceData),
      orientation: currentOrientation
    })

    // Limit history size
    if (sliceHist.entries.length > this.maxHistorySize) {
      sliceHist.entries.shift()
    } else {
      sliceHist.currentIndex++
    }
  }

  // Updated undo with orientation
  undo(
    structureId: number, 
    sliceIndex?: number,
    orientation?: 'axial' | 'coronal' | 'sagittal'
  ): boolean {
    const patient_id = localStorage.getItem('selected_patient')
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    const history = this.sliceHistory.get(structureId)
    if (!mask || !history) return false

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const currentOrientation = orientation ?? this.getCurrentOrientation(structureId)
    const historyKey = `${currentOrientation}-${currentSliceIndex}`
    
    const sliceHist = history[historyKey]
    if (!sliceHist || sliceHist.currentIndex <= 0) {
      return false
    }

    const newIndex = sliceHist.currentIndex - 1
    const entry = sliceHist.entries[newIndex]
    
    this.setSliceData(structureId, currentSliceIndex, entry.data, currentOrientation)
    sliceHist.currentIndex = newIndex

    // Save to local database
    saveMask(structureId, patient_id!, mask.dims!, mask.data!, modality)
    this.emit('maskUpdated', structureId)
    return true
  }

  // Updated redo with orientation
  redo(
    structureId: number, 
    sliceIndex?: number,
    orientation?: 'axial' | 'coronal' | 'sagittal'
  ): boolean {
    const patient_id = localStorage.getItem('selected_patient')
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    const history = this.sliceHistory.get(structureId)
    if (!mask || !history) return false

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const currentOrientation = orientation ?? this.getCurrentOrientation(structureId)
    const historyKey = `${currentOrientation}-${currentSliceIndex}`
    
    const sliceHist = history[historyKey]
    if (!sliceHist || sliceHist.currentIndex >= sliceHist.entries.length - 1) {
      return false
    }

    const newIndex = sliceHist.currentIndex + 1
    const entry = sliceHist.entries[newIndex]
    
    this.setSliceData(structureId, currentSliceIndex, entry.data, currentOrientation)
    sliceHist.currentIndex = newIndex

    // Save to local database
    saveMask(structureId, patient_id!, mask.dims!, mask.data!, modality)
    this.emit('maskUpdated', structureId)
    return true
  }

  // Updated canUndo with orientation
  canUndo(
    structureId: number, 
    sliceIndex?: number,
    orientation?: 'axial' | 'coronal' | 'sagittal'
  ): boolean {
    const history = this.sliceHistory.get(structureId)
    if (!history) return false

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const currentOrientation = orientation ?? this.getCurrentOrientation(structureId)
    const historyKey = `${currentOrientation}-${currentSliceIndex}`
    
    const sliceHist = history[historyKey]
    return sliceHist !== undefined && sliceHist.currentIndex > 0
  }

  // Updated canRedo with orientation
  canRedo(
    structureId: number, 
    sliceIndex?: number,
    orientation?: 'axial' | 'coronal' | 'sagittal'
  ): boolean {
    const history = this.sliceHistory.get(structureId)
    if (!history) return false

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const currentOrientation = orientation ?? this.getCurrentOrientation(structureId)
    const historyKey = `${currentOrientation}-${currentSliceIndex}`
    
    const sliceHist = history[historyKey]
    return sliceHist !== undefined && sliceHist.currentIndex < sliceHist.entries.length - 1
  }

  // In MaskManager.ts - COMPLETE FIX

updateMaskVoxel(
  structure_id: number,
  patient_id: string,
  x: number,
  y: number,
  z: number,
  value: number,
  brushSize: number = 1,
  orientation: 'axial' | 'coronal' | 'sagittal' = 'axial'
): void {
  const modality = localStorage.getItem("selected_modality")!
  const mask = this.masks.get(`${patient_id}-${structure_id}-${modality}`)
  if (!mask || !mask.data || !mask.dims) return

  const [dimX, dimY, dimZ] = mask.dims
  const halfSize = Math.floor(brushSize / 2)

  // 2D brush in the correct plane based on orientation
  for (let d1 = -halfSize; d1 <= halfSize; d1++) {
    for (let d2 = -halfSize; d2 <= halfSize; d2++) {
      const dist = Math.sqrt(d1 * d1 + d2 * d2)
      if (dist > halfSize) continue

      let nx = x, ny = y, nz = z

      switch (orientation) {
        case 'axial':
          // Axial view: brush expands in X-Y plane, Z is fixed
          nx = x + d1
          ny = y + d2
          // nz stays as z (the slice)
          break
        case 'coronal':
          // Coronal view: brush expands in X-Z plane, Y is fixed
          nx = x + d1
          // ny stays as y (the slice)
          nz = z + d2
          break
        case 'sagittal':
          // Sagittal view: brush expands in Y-Z plane, X is fixed
          // nx stays as x (the slice)
          ny = y + d1
          nz = z + d2
          break
      }

      // Bounds check
      if (nx >= 0 && nx < dimX && ny >= 0 && ny < dimY && nz >= 0 && nz < dimZ) {
        const index = nx + ny * dimX + nz * dimX * dimY
        mask.data[index] = value
      }
    }
  }

  this.debouncedSave(structure_id, patient_id, mask.dims, mask.data)
  this.emit('maskUpdated', structure_id)
}

  getMaskSlice(
    structureId: number,
    orientation: 'axial' | 'coronal' | 'sagittal',
    sliceIndex: number
  ): Uint8Array | null {
    const patient_id = localStorage.getItem("selected_patient")
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (!mask || !mask.data || !mask.dims) return null
    
    const [dimX, dimY, dimZ] = mask.dims
    let sliceData: Uint8Array
  
    switch (orientation) {
      case 'axial':
        sliceData = new Uint8Array(dimX * dimY)
        for (let y = 0; y < dimY; y++) {
          for (let x = 0; x < dimX; x++) {
            const index3D = x + y * dimX + sliceIndex * dimX * dimY
            const index2D = x + y * dimX
            sliceData[index2D] = mask.data[index3D]
          }
        }
        break
  
      case 'coronal':
        sliceData = new Uint8Array(dimX * dimZ)
        for (let z = 0; z < dimZ; z++) {
          for (let x = 0; x < dimX; x++) {
            const index3D = x + sliceIndex * dimX + z * dimX * dimY
            // Flip Z for display (match image extraction)
            const dstZ = dimZ - 1 - z
            const index2D = x + dstZ * dimX
            sliceData[index2D] = mask.data[index3D]
          }
        }
        break
  
      case 'sagittal':
        sliceData = new Uint8Array(dimY * dimZ)
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            const index3D = sliceIndex + y * dimX + z * dimX * dimY
            // Flip Z for display (match image extraction)
            const dstZ = dimZ - 1 - z
            const index2D = y + dstZ * dimY
            sliceData[index2D] = mask.data[index3D]
          }
        }
        break
    }
  
    return sliceData
  }

  toggleVisibility(structureId: number): void {
    const patient_id = localStorage.getItem("selected_patient")
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (mask) {
      mask.visible = !mask.visible
      this.emit('maskUpdated', structureId)
    }
  }

  setVisibility(structureId: number, visible: boolean): void {
    const patient_id = localStorage.getItem("selected_patient")
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (mask) {
      mask.visible = visible
      this.emit('maskUpdated', structureId)
    }
  }

  deleteMask(structureId: number): void {
    const modality = localStorage.getItem("selected_modality")!
    const patient_id = localStorage.getItem('selected_patient')
    this.masks.delete(`${patient_id}-${structureId}-${modality}`)
    this.sliceHistory.delete(structureId)
    this.currentSlice.delete(structureId)
    // save local storage
    deleteMask(structureId)

    // delete in the backend
    this.emit('maskDeleted', structureId)
  }

  clearAllMasks(): void {
    this.masks.clear()
    this.sliceHistory.clear()
    this.currentSlice.clear()
    this.emit('allMasksCleared')
  }
  // Add this method after getCurrentSlice (around line 93)
  getMaskVoxelValue(
    structureId: number,
    x: number,
    y: number,
    z: number
  ): number {
    const modality = localStorage.getItem("selected_modality")!
    const patient_id = localStorage.getItem("selected_patient")
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (!mask) return 0

    const [dimX, dimY, dimZ] = mask.dims!

    // Check bounds
    if (x < 0 || x >= dimX || y < 0 || y >= dimY || z < 0 || z >= dimZ) {
      return 0
    }

    const index = x + y * dimX + z * dimX * dimY
    return mask.data![index]
  }
}



export const maskManager = new MaskManager()