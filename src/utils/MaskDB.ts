// src/utils/MaskDB.ts
import { openDB } from 'idb'
import { save_mask } from './functionalities'
import { debounce } from 'lodash'

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
const debouncedUploadMask = debounce(save_mask, 5000)

export async function saveMask(structureId: number, patient_id: string, dims: [number, number, number], data: Uint8Array) {
  const db = await getDB()
  const blob = new Blob([data.buffer])
  await db.put(STORE_NAME, { dims, blob }, `${patient_id}-${structureId}`)
  console.log(`Saved ${patient_id}-${structureId} in IndexedDB`)

  //update the backend with the changes 
  debouncedUploadMask(structureId, patient_id, blob, dims)
}

export async function loadMask(structureId: number): Promise<StoredMask | null> {
  const db = await getDB()
  const patient_id = localStorage.getItem('selected_patient')
  const record = await db.get(STORE_NAME, `${patient_id}-${structureId}`)
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
  const patient_id = localStorage.getItem("selected_patient")
  await db.delete(STORE_NAME, `${patient_id}-${structureId}`)
  console.log(`Deleted ${patient_id}-${structureId} from IndexedDB`)
}

export async function clearAllMasks() {
  const db = await getDB()
  await db.clear(STORE_NAME)
  console.log('Cleared all masks from IndexedDB')
}

//clearAllMasks()