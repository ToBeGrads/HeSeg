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
    private history: Map<number, HistoryEntry[]> = new Map()
    private historyIndex: Map<number, number> = new Map()
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
      this.history.set(structureId, [{ 
        data: new Uint8Array(totalVoxels), 
        timestamp: Date.now() 
      }])
      this.historyIndex.set(structureId, 0)
      
      console.log(`✅ Created mask for structure ${structureId}`, mask)
      return mask
    }
  
    getMask(structureId: number): Mask | undefined {
      return this.masks.get(structureId)
    }
  
    saveHistory(structureId: number): void {
      const mask = this.masks.get(structureId)
      if (!mask) return
  
      const history = this.history.get(structureId) || []
      const currentIndex = this.historyIndex.get(structureId) || 0
  
      // Remove any future history if we're not at the end
      const newHistory = history.slice(0, currentIndex + 1)
  
      // Add new state
      newHistory.push({
        data: new Uint8Array(mask.data),
        timestamp: Date.now()
      })
  
      // Limit history size
      if (newHistory.length > this.maxHistorySize) {
        newHistory.shift()
      } else {
        this.historyIndex.set(structureId, newHistory.length - 1)
      }
  
      this.history.set(structureId, newHistory)
    }
  
    undo(structureId: number): boolean {
      const mask = this.masks.get(structureId)
      const history = this.history.get(structureId)
      const currentIndex = this.historyIndex.get(structureId)
  
      if (!mask || !history || currentIndex === undefined || currentIndex <= 0) {
        return false
      }
  
      const newIndex = currentIndex - 1
      mask.data = new Uint8Array(history[newIndex].data)
      this.historyIndex.set(structureId, newIndex)
      this.emit('maskUpdated', structureId)
      return true
    }
  
    redo(structureId: number): boolean {
      const mask = this.masks.get(structureId)
      const history = this.history.get(structureId)
      const currentIndex = this.historyIndex.get(structureId)
  
      if (!mask || !history || currentIndex === undefined || currentIndex >= history.length - 1) {
        return false
      }
  
      const newIndex = currentIndex + 1
      mask.data = new Uint8Array(history[newIndex].data)
      this.historyIndex.set(structureId, newIndex)
      this.emit('maskUpdated', structureId)
      return true
    }
  
    canUndo(structureId: number): boolean {
      const currentIndex = this.historyIndex.get(structureId)
      return currentIndex !== undefined && currentIndex > 0
    }
  
    canRedo(structureId: number): boolean {
      const history = this.history.get(structureId)
      const currentIndex = this.historyIndex.get(structureId)
      return history !== undefined && currentIndex !== undefined && currentIndex < history.length - 1
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
      // Only paint in X and Y directions, keep Z fixed (for axial)
      // The calling code determines which coordinate is the slice coordinate
      for (let dx = -halfSize; dx <= halfSize; dx++) {
        for (let dy = -halfSize; dy <= halfSize; dy++) {
          const nx = x + dx
          const ny = y + dy
          const nz = z // Keep Z fixed - don't iterate in depth!
  
          if (nx >= 0 && nx < dimX && ny >= 0 && ny < dimY && nz >= 0 && nz < dimZ) {
            // Circular brush in 2D only
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
      this.history.delete(structureId)
      this.historyIndex.delete(structureId)
      this.emit('maskDeleted', structureId)
    }
  
    clearAllMasks(): void {
      this.masks.clear()
      this.history.clear()
      this.historyIndex.clear()
      this.emit('allMasksCleared')
    }
  }
  
  export const maskManager = new MaskManager()