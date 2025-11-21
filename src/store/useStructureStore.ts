// src/store/useStructureStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Structure, Coordinate } from '../types'
import { maskManager } from '../utils/MaskManager'
import { useVolumeStore } from '../store/useVolumeStore'
import Axios from '../utils/Axios'
import { AddCoordinates, AddStructure, GetMyStructures } from '../utils/functionalities'
import axios from 'axios'

// Extended Structure type with annotator support
export interface ExtendedStructure extends Structure {
  annotator?: 'annotator1' | 'annotator2'
  createdAt?: Date
  isVisible?: boolean
}

interface StructureState {
  // State
  structures: ExtendedStructure[]
  mystructures: ExtendedStructure[]
  currentAnnotator: 'annotator1' | 'annotator2' | 'rater'

  // Actions
  fetchCoordinates: (token: string) => Promise<void>
  fetchStructures: (token: string) => Promise<void>
  fetchMyStructures: (token: string, patient_id: string) => Promise<void>
  addStructure: (id: number, title: string, color: string, annotator?: 'annotator1' | 'annotator2') => void
  updateStructure: (id: number, updates: Partial<ExtendedStructure>) => void
  deleteStructure: (id: number) => void
  addCoordinate: (structureId: number, coordinate: Coordinate, modality : string) => void
  updateCoordinates: (structureId: number, coordinates: Coordinate[]) => void
  deleteCoordinate: (structureId: number, index: number) => void
  getStructure: (id: number) => ExtendedStructure | undefined
  getStructuresByAnnotator: (annotator: 'annotator1' | 'annotator2') => ExtendedStructure[]
  getStructuresByType: () => Array<{
    name: string
    annotator1: ExtendedStructure | undefined
    annotator2: ExtendedStructure | undefined
  }>
  setCurrentAnnotator: (annotator: 'annotator1' | 'annotator2' | 'rater') => void
  toggleStructureVisibility: (structureId: number) => void
  setStructureVisibility: (structureId: number, visible: boolean) => void
  reset: () => void
}

const initialState = {
  structures: [],
  mystructures: [],
  currentAnnotator: 'annotator1' as const
}

export const useStructureStore = create<StructureState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Add new structure with annotator support
      addStructure: async (id, title, color, annotator = 'annotator1') => {
        const { volumeData } = useVolumeStore.getState()
        const newStructure: ExtendedStructure = {
          id,
          title,
          color,
          coordinates: [],
          annotator,
          createdAt: new Date(),
          isVisible: true
        }

        try {
          // Upload the new structure to the backend
          const res = await AddStructure(newStructure)
          if (res.status === 200) {
            // console.log('Structure :', res.data)
            set(
              (state) => ({
                mystructures: [...state.mystructures, newStructure]
              }),
              false,
              'addStructure'
            )
            if (volumeData) {
              const patient_id = localStorage.getItem('selected_patient')!
              maskManager.createMask(patient_id, newStructure.id, volumeData.dims)
            }
          }
        } catch (err) {
          if (axios.isAxiosError(err)) {
            console.log("API error:", err.response?.data);
          } else {
            console.error("Unknown error:", err);
          }
        }
      },
      //fetch the structures from the backend 
      fetchStructures: async (token) => {
        try {
          const res = await Axios.get('segment/structures', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          if (res.status === 200 && Array.isArray(res.data.structures)) {
            const structures = res.data.structures.map((structure: any) => ({
              id: structure.id,
              title: structure.title,
            }))
            set({ structures })
            // console.log('Structures loaded:', res.data.structures)
          } else if (res.status == 400) {
            // console.log(res.data.message)
          }
          else {
            // console.log(res.data.message)
          }
        } catch (err) {
          // console.error('Error fetching structures:', err)
          console.log('Error fetching structures')
          if (axios.isAxiosError(err)) {
            console.log("API error:", err.response?.data);
          } else {
            console.error("Unknown error:", err);
          }
        }
      },
      // fetch my structures 
      fetchMyStructures: async (token, patient_id) => {
        // console.log("loading the structures the doctor is labeling for the patient", token, patient_id)

        try {
          const res = await GetMyStructures(token, patient_id)

          if (res.status === 200 && Array.isArray(res.data.mystructures)) {
            // console.log("this what front see from my structures", res.data)
            if (res.data.mystructures) {
              const mystructures = res.data.mystructures.map((structure: any) => ({
                id: structure.structure_id,
                title: structure.structure_title,
                color: structure.structure_color,
                coordinates: structure.coordinates || [],
              }))
              set({ mystructures })
              // console.log('Structures loaded for the doctor-patient:', res.data.structures)
            } else {
              // console.log("this doctors did not start annotation yet")
            }
          } else {

            // console.log("this what front see from my structures", res.data)
          }
        } catch (err) {
          console.log('Error fetching structures')
          if (axios.isAxiosError(err)) {
            console.log("API error:", err.response?.data);
          } else {
            console.error("Unknown error:", err);
          }
        }
      },
      // Update structure
      updateStructure: (id, updates) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            )
          }),
          false,
          'updateStructure'
        )

        // console.log(`Structure ${id} updated:`, updates)
      },

      // Delete structure
      deleteStructure: (id) => {
        set(
          (state) => ({
            structures: state.structures.filter((s) => s.id !== id)
          }),
          false,
          'deleteStructure'
        )

        // Delete associated mask
        maskManager.deleteMask(id)
        // console.log(`Structure ${id} deleted`)
      },

      // Add coordinate to structure
      addCoordinate: async (structureId, coordinate, modality) => {
        try {
          const res = await AddCoordinates(coordinate, structureId, modality)
          // console.log("from add coordinates", res.data)
          if (res.status == 200) {
            // console.log(res.data.message)
            if (res.data.message == "Coordinates added successfully") {
              set(
                (state) => ({
                  mystructures: state.mystructures.map((s) =>
                    s.id === structureId
                      ? { ...s, coordinates: [...s.coordinates, coordinate] }
                      : s
                  )
                }),
                false,
                'addCoordinate'
              )
            }
          } else {
            // console.log(res.data.message);
          }
        } catch (err) {
          // console.error('error saveing coordinates', e)
          console.log('error adding coordinates')
          if (axios.isAxiosError(err)) {
            console.log("API error:", err.response?.data);
          } else {
            console.error("Unknown error:", err);
          }
        }


        // console.log(`Coordinate added to structure ${structureId}:`, coordinate)
      },

      // Update all coordinates for a structure
      updateCoordinates: async (structureId, coordinates) => {
        // send request to update to backend 
        try {
          const res = await Axios.post(
            "segment/UpdateCoordinates",
            {
              coordinates: coordinates,
              structure_id: structureId,
              patient_id: localStorage.getItem("selected_patient")
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
              }
            }
          );
          if (res.status == 200) {
            // console.log(res.data.message)
            if (res.data.message == "Coordinates updated successfully") {
              set(
                (state) => ({
                  mystructures: state.mystructures.map((s) =>
                    s.id === structureId ? { ...s, coordinates } : s
                  )
                }),
                false,
                'updateCoordinates'
              )
            }
          } else {
            // console.log(res.data.message);
          }
        } catch (err) {
          // console.error('error saveing coordinates', e)
          console.log('error updating coordinates')
          if (axios.isAxiosError(err)) {
            console.log("API error:", err.response?.data);
          } else {
            console.error("Unknown error:", err);
          }
        }
        // console.log(`Coordinates updated for structure ${structureId}`)
      },

      // Delete coordinate by index
      deleteCoordinate: (structureId, index) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === structureId
                ? {
                  ...s,
                  coordinates: s.coordinates.filter((_, i) => i !== index)
                }
                : s
            )
          }),
          false,
          'deleteCoordinate'
        )

        // console.log(`Coordinate ${index} deleted from structure ${structureId}`)
      },

      // Get structure by ID
      getStructure: (id) => {
        return get().structures.find((s) => s.id === id)
      },

      // Get structures by annotator
      getStructuresByAnnotator: (annotator) => {
        return get().structures.filter((s) => s.annotator === annotator)
      },

      // Get structures grouped by type for rating table
      getStructuresByType: () => {
        const structures = get().structures
        const structureTypes = [...new Set(structures.map(s => s.title))]

        return structureTypes.map(type => ({
          name: type,
          annotator1: structures.find(s => s.title === type && s.annotator === 'annotator1'),
          annotator2: structures.find(s => s.title === type && s.annotator === 'annotator2')
        }))
      },

      // Set current annotator mode
      setCurrentAnnotator: (annotator) => {
        set({ currentAnnotator: annotator }, false, 'setCurrentAnnotator')
        // console.log(`Current annotator set to: ${annotator}`)
      },

      // Toggle structure visibility
      toggleStructureVisibility: (structureId) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === structureId ? { ...s, isVisible: !s.isVisible } : s
            )
          }),
          false,
          'toggleStructureVisibility'
        )
      },

      // Set structure visibility
      setStructureVisibility: (structureId, visible) => {
        set(
          (state) => ({
            structures: state.structures.map((s) =>
              s.id === structureId ? { ...s, isVisible: visible } : s
            )
          }),
          false,
          'setStructureVisibility'
        )
      },

      // Reset to initial state
      reset: () => set(initialState, false, 'reset')
    }),
    { name: 'StructureStore' }
  )
)