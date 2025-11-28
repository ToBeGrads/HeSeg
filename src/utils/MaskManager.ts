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
  private maxHistorySize = 50

  // reduce the rate of saving the mask to the local database
  private debouncedSave = debounce(
    (structureId: number, patient_id: string, dims: [number, number, number], data: Uint8Array) => {
      const modality = localStorage.getItem("selected_modality")!
      saveMask(structureId, patient_id, dims, data,modality)
    },
    250 // wait 0.5s after the last draw before saving
  )

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

    // fetch from backend 
    stored = await Load_Mask(formData)
    // return stored
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

  private getSliceData(structureId: number, sliceIndex: number): Uint8Array {
    const patient_id = localStorage.getItem("selected_patient")
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (!mask) return new Uint8Array()

    const [dimX, dimY] = mask.dims!
    const sliceSize = dimX * dimY
    const start = sliceIndex * sliceSize
    const end = start + sliceSize

    return mask.data!.slice(start, end)
  }

  private setSliceData(structureId: number, sliceIndex: number, sliceData: Uint8Array): void {
    const patient_id = localStorage.getItem("selected_patient")
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (!mask) return

    const [dimX, dimY] = mask.dims!
    const sliceSize = dimX * dimY
    const start = sliceIndex * sliceSize

    mask.data!.set(sliceData, start)
  }

  saveHistory(structureId: number, sliceIndex?: number): void {
    const patient_id = localStorage.getItem('selected_patient')
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    if (!mask) return

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const sliceData = this.getSliceData(structureId, currentSliceIndex)

    let history = this.sliceHistory.get(structureId)
    if (!history) {
      history = {}
      this.sliceHistory.set(structureId, history)
    }

    if (!history[currentSliceIndex]) {
      history[currentSliceIndex] = {
        entries: [],
        currentIndex: -1
      }
    }

    const sliceHist = history[currentSliceIndex]

    // Remove any future history if we're not at the end
    sliceHist.entries = sliceHist.entries.slice(0, sliceHist.currentIndex + 1)

    // Add new state
    sliceHist.entries.push({
      data: new Uint8Array(sliceData),
      timestamp: Date.now()
    })

    // Limit history size
    if (sliceHist.entries.length > this.maxHistorySize) {
      sliceHist.entries.shift()
    } else {
      sliceHist.currentIndex = sliceHist.entries.length - 1
    }

    // console.log(`Saved history for structure ${structureId}, slice ${currentSliceIndex}, entries: ${sliceHist.entries.length}`)
  }

  undo(structureId: number, sliceIndex?: number ): boolean {
    const patient_id = localStorage.getItem('selected_patient')
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    const history = this.sliceHistory.get(structureId)

    if (!mask || !history) return false

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const sliceHist = history[currentSliceIndex]

    if (!sliceHist || sliceHist.currentIndex <= 0) {
      // console.log(`Cannot undo: no history for slice ${currentSliceIndex}`)
      return false
    }

    const newIndex = sliceHist.currentIndex - 1
    const restoredData = sliceHist.entries[newIndex].data

    this.setSliceData(structureId, currentSliceIndex, restoredData)
    sliceHist.currentIndex = newIndex

    // console.log(`Undo slice ${currentSliceIndex}, index: ${newIndex}`)
    // save to local database
    saveMask(structureId, patient_id!, mask.dims!, mask.data!,modality)
    // save to database backedn 

    this.emit('maskUpdated', structureId)
    return true
  }

  redo(structureId: number, sliceIndex?: number): boolean {
    const patient_id = localStorage.getItem('selected_patient')
    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structureId}-${modality}`)
    const history = this.sliceHistory.get(structureId)

    if (!mask || !history) return false

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const sliceHist = history[currentSliceIndex]

    if (!sliceHist || sliceHist.currentIndex >= sliceHist.entries.length - 1) {
      // console.log(`Cannot redo: no future history for slice ${currentSliceIndex}`)
      return false
    }

    const newIndex = sliceHist.currentIndex + 1
    const restoredData = sliceHist.entries[newIndex].data

    this.setSliceData(structureId, currentSliceIndex, restoredData)
    sliceHist.currentIndex = newIndex

    // save to local database
    saveMask(structureId, patient_id!, mask.dims!, mask.data!, modality)
    // save to database backedn 
    this.emit('maskUpdated', structureId)
    return true
  }

  canUndo(structureId: number, sliceIndex?: number): boolean {
    const history = this.sliceHistory.get(structureId)
    if (!history) return false

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const sliceHist = history[currentSliceIndex]

    return sliceHist !== undefined && sliceHist.currentIndex > 0
  }

  canRedo(structureId: number, sliceIndex?: number): boolean {
    const history = this.sliceHistory.get(structureId)
    if (!history) return false

    const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
    const sliceHist = history[currentSliceIndex]

    return sliceHist !== undefined && sliceHist.currentIndex < sliceHist.entries.length - 1
  }

  updateMaskVoxel(
    structure_id: number,
    patient_id: string,
    x: number,
    y: number,
    z: number,
    value: number,
    brushSize: number = 1
  ): void {

    const modality = localStorage.getItem("selected_modality")!
    const mask = this.masks.get(`${patient_id}-${structure_id}-${modality}`)
    // console.log('the mask found from update mask voxel', mask)
    if (!mask) return

    const [dimX, dimY, dimZ] = mask.dims!
    const halfSize = Math.floor(brushSize / 2)

    // 2D brush only - no depth painting
    for (let dx = -halfSize; dx <= halfSize; dx++) {
      for (let dy = -halfSize; dy <= halfSize; dy++) {
        const nx = x + dx
        const ny = y + dy
        const nz = z

        if (nx >= 0 && nx < dimX && ny >= 0 && ny < dimY && nz >= 0 && nz < dimZ) {
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist <= halfSize) {
            const index = nx + ny * dimX + nz * dimX * dimY
            mask.data![index] = value
          }
        }
      }
    }

    // console.log('Emitting maskUpdated for structure', structureId)
    // save to local database
    // console.log('from maskmanager, lin 355: the dims are', mask.dims)
    this.debouncedSave(structure_id, patient_id, mask.dims!, mask.data!)
    // saveMask(structureId, patient_id, mask.dims, mask.data)

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
    if (!mask) return null
    
    const [dimX, dimY, dimZ] = mask.dims!
    let sliceData: Uint8Array

    switch (orientation) {
      case 'axial':
        sliceData = new Uint8Array(dimX * dimY)
        for (let y = 0; y < dimY; y++) {
          for (let x = 0; x < dimX; x++) {
            const index3D = x + y * dimX + sliceIndex * dimX * dimY
            const index2D = x + y * dimX
            sliceData[index2D] = mask.data![index3D]
          }
        }
        break

      case 'coronal':
        sliceData = new Uint8Array(dimX * dimZ)
        for (let z = 0; z < dimZ; z++) {
          for (let x = 0; x < dimX; x++) {
            const index3D = x + sliceIndex * dimX + z * dimX * dimY
            const index2D = x + z * dimX
            sliceData[index2D] = mask.data![index3D]
          }
        }
        break

      case 'sagittal':
        sliceData = new Uint8Array(dimY * dimZ)
        for (let z = 0; z < dimZ; z++) {
          for (let y = 0; y < dimY; y++) {
            const index3D = sliceIndex + y * dimX + z * dimX * dimY
            const index2D = y + z * dimY
            sliceData[index2D] = mask.data![index3D]
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