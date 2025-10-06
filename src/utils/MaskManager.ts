// src/utils/MaskManager.ts

export interface Mask {
    id: number
    structureId: number
    data: Uint8Array
    dims: [number, number, number]
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
  
    emit(event: string, ...args: any[]) {
      if (!this.events.has(event)) return
      const listeners = this.events.get(event)!
      listeners.forEach(listener => listener(...args))
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
    private masks: Map<number, Mask> = new Map()
    private sliceHistory: Map<number, SliceHistory> = new Map()
    private currentSlice: Map<number, number> = new Map()
    private maxHistorySize = 50
  
    createMask(structureId: number, dims: [number, number, number]): Mask {
      const totalVoxels = dims[0] * dims[1] * dims[2]
      const mask: Mask = {
        id: Date.now(),
        structureId,
        data: new Uint8Array(totalVoxels),
        dims,
        visible: false,
        opacity: 0.5
      }
      
      this.masks.set(structureId, mask)
      this.sliceHistory.set(structureId, {})
      this.currentSlice.set(structureId, 0)
      
      console.log(`✅ Created mask for structure ${structureId}`, mask)
      return mask
    }
  
    getMask(structureId: number): Mask | undefined {
      return this.masks.get(structureId)
    }
  
    setCurrentSlice(structureId: number, sliceIndex: number): void {
      this.currentSlice.set(structureId, sliceIndex)
    }
  
    getCurrentSlice(structureId: number): number {
      return this.currentSlice.get(structureId) || 0
    }
  
    private getSliceData(structureId: number, sliceIndex: number): Uint8Array {
      const mask = this.masks.get(structureId)
      if (!mask) return new Uint8Array()
  
      const [dimX, dimY, dimZ] = mask.dims
      const sliceSize = dimX * dimY
      const start = sliceIndex * sliceSize
      const end = start + sliceSize
      
      return mask.data.slice(start, end)
    }
  
    private setSliceData(structureId: number, sliceIndex: number, sliceData: Uint8Array): void {
      const mask = this.masks.get(structureId)
      if (!mask) return
  
      const [dimX, dimY] = mask.dims
      const sliceSize = dimX * dimY
      const start = sliceIndex * sliceSize
      
      mask.data.set(sliceData, start)
    }
  
    saveHistory(structureId: number, sliceIndex?: number): void {
      const mask = this.masks.get(structureId)
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
  
      console.log(`💾 Saved history for structure ${structureId}, slice ${currentSliceIndex}, entries: ${sliceHist.entries.length}`)
    }
  
    undo(structureId: number, sliceIndex?: number): boolean {
      const mask = this.masks.get(structureId)
      const history = this.sliceHistory.get(structureId)
      
      if (!mask || !history) return false
  
      const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
      const sliceHist = history[currentSliceIndex]
  
      if (!sliceHist || sliceHist.currentIndex <= 0) {
        console.log(`⚠️ Cannot undo: no history for slice ${currentSliceIndex}`)
        return false
      }
  
      const newIndex = sliceHist.currentIndex - 1
      const restoredData = sliceHist.entries[newIndex].data
      
      this.setSliceData(structureId, currentSliceIndex, restoredData)
      sliceHist.currentIndex = newIndex
      
      console.log(`↩️ Undo slice ${currentSliceIndex}, index: ${newIndex}`)
      this.emit('maskUpdated', structureId)
      return true
    }
  
    redo(structureId: number, sliceIndex?: number): boolean {
      const mask = this.masks.get(structureId)
      const history = this.sliceHistory.get(structureId)
      
      if (!mask || !history) return false
  
      const currentSliceIndex = sliceIndex ?? this.getCurrentSlice(structureId)
      const sliceHist = history[currentSliceIndex]
  
      if (!sliceHist || sliceHist.currentIndex >= sliceHist.entries.length - 1) {
        console.log(`⚠️ Cannot redo: no future history for slice ${currentSliceIndex}`)
        return false
      }
  
      const newIndex = sliceHist.currentIndex + 1
      const restoredData = sliceHist.entries[newIndex].data
      
      this.setSliceData(structureId, currentSliceIndex, restoredData)
      sliceHist.currentIndex = newIndex
      
      console.log(`↪️ Redo slice ${currentSliceIndex}, index: ${newIndex}`)
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
      structureId: number,
      x: number,
      y: number,
      z: number,
      value: number,
      brushSize: number = 1
    ): void {
      const mask = this.masks.get(structureId)
      if (!mask) return
  
      const [dimX, dimY, dimZ] = mask.dims
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
              mask.data[index] = value
            }
          }
        }
      }
  
      this.emit('maskUpdated', structureId)
    }
  
    getMaskSlice(
      structureId: number,
      orientation: 'axial' | 'coronal' | 'sagittal',
      sliceIndex: number
    ): Uint8Array | null {
      const mask = this.masks.get(structureId)
      if (!mask) return null
  
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
              const index2D = x + z * dimX
              sliceData[index2D] = mask.data[index3D]
            }
          }
          break
  
        case 'sagittal':
          sliceData = new Uint8Array(dimY * dimZ)
          for (let z = 0; z < dimZ; z++) {
            for (let y = 0; y < dimY; y++) {
              const index3D = sliceIndex + y * dimX + z * dimX * dimY
              const index2D = y + z * dimY
              sliceData[index2D] = mask.data[index3D]
            }
          }
          break
      }
  
      return sliceData
    }
  
    toggleVisibility(structureId: number): void {
      const mask = this.masks.get(structureId)
      if (mask) {
        mask.visible = !mask.visible
        this.emit('maskUpdated', structureId)
      }
    }
  
    setVisibility(structureId: number, visible: boolean): void {
      const mask = this.masks.get(structureId)
      if (mask) {
        mask.visible = visible
        this.emit('maskUpdated', structureId)
      }
    }
  
    deleteMask(structureId: number): void {
      this.masks.delete(structureId)
      this.sliceHistory.delete(structureId)
      this.currentSlice.delete(structureId)
      this.emit('maskDeleted', structureId)
    }
  
    clearAllMasks(): void {
      this.masks.clear()
      this.sliceHistory.clear()
      this.currentSlice.clear()
      this.emit('allMasksCleared')
    }
  }
  
  export const maskManager = new MaskManager()