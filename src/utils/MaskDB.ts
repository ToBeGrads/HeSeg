// src/utils/MaskDB.ts
import { openDB } from 'idb'

export interface StoredMask {
  opacity: number
  structureId: number
  dims: [number, number, number]
  data: Uint8Array
}

const DB_NAME = 'BrainSegMaskDB'
const STORE_NAME = 'masks'

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function saveMask(structureId: number, dims: [number, number, number], data: Uint8Array) {
  const db = await getDB()
  const blob = new Blob([data.buffer])
  await db.put(STORE_NAME, { dims, blob }, `mask-${structureId}`)
  console.log(`✅ Saved mask-${structureId} in IndexedDB`)
}

export async function loadMask(structureId: number): Promise<StoredMask | null> {
  const db = await getDB()
  const record = await db.get(STORE_NAME, `mask-${structureId}`)
  if (!record) return null

  const arrayBuffer = await record.blob.arrayBuffer()
  return {
    structureId,
    dims: record.dims,
    data: new Uint8Array(arrayBuffer),
    opacity: 0.5, // Default opacity, can be adjusted later
  }
}

export async function deleteMask(structureId: number) {
  const db = await getDB()
  await db.delete(STORE_NAME, `mask-${structureId}`)
  console.log(`🗑️ Deleted mask-${structureId} from IndexedDB`)
}

export async function clearAllMasks() {
  const db = await getDB()
  await db.clear(STORE_NAME)
  console.log('🗑️ Cleared all masks from IndexedDB')
}

//clearAllMasks()
