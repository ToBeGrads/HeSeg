import type { List } from "lodash";
import Axios from "./Axios";
import type { Coordinate } from "../types";
import { type ExtendedStructure } from "../store/useStructureStore";

export async function save_mask(structure_id: number, patient_id: string, blob: Blob, dims: [number, number, number]) {
  try {
    //send the changes to the backend
    console.log(blob)
    const file = new File([blob], `mask-${structure_id}-${patient_id}.raw`, {
      type: 'application/octet-stream',
    })

    const response = await Axios.post('segment/Update_mask', {
      file,
      'structure_id': structure_id.toString(),
      patient_id,
      "dims": JSON.stringify(dims)
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        'Content-Type': "multipart/form-data"
      }
    })
    if (response.status == 200) {
      console.log('updated mask in the backend :', `mask-${structure_id}`)
      console.log(response.data.message)
    } else {
      console.log(response.data.message)
    }

  } catch (e) {
    console.error('Error occured', e)
  }
}

export async function segment(coord: Coordinate, currentSliceURL: string) {
  const response = await Axios.post("segment/", {
    coords: coord,
    file: currentSliceURL,
  }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
    },
  })

  return response;
}

export async function createMask(Mask: Blob, structure_id: number, patient_id: string, color: string, dims: [number, number, number]) {

  try {
    // create the form data 
    const mask = new File([Mask], `mask-${structure_id}-${patient_id}.raw`, {
      type: 'application/octet-stream',
    })
    const formData = {
      mask,
      structure_id,
      patient_id,
      color,
      dims: JSON.stringify(dims)
    }
    //load from local storage
    const token = localStorage.getItem('jwt')
    const res = await Axios.post("segment/save_mask", formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    })
    console.log('Mask uploaded:', res.data)
    if (res.status == 200) {
      // set local storage to the mask id value
      localStorage.setItem(`current_mask_id`, res.data.mask_id)
    }
  } catch (err) {
    console.error('Error uploading mask:', err)
  }

}

export async function Load_Mask(formData: FormData) {
  try {
    const res = await Axios.post("segment/Load_mask", formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
      },
    })
    console.log('Mask loaded:', res.data)
    if (res.status == 200) {
      const base64 = res.data.mask.mask_data
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const maskData = bytes
      console.log("loading sm :", base64)
      let data = {
        data: maskData,
        dims: res.data.mask.mask_dims,
        opacity: ""
      }
      return data

    } else {
      let data = {
        data: "",
        dims: "",
        opacity: ""
      }
      return data
    }
  } catch (err) {
    console.error('Error uploading mask:', err)
  }

  return null
}

export async function GetMyStructures(token: string, patient_id: string) {
  const res = await Axios.post('segment/mystructures',
    { patient_id },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  return res
}


export async function AddCoordinates(coordinate: Coordinate, structureId: number) {
  const res = await Axios.post(
    "segment/AddCoordinates",
    {
      coordinates: coordinate,
      structure_id: structureId,
      patient_id: localStorage.getItem("selected_patient")
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`
      }
    }
  );
  return res
}

export async function AddStructure(newStructure: ExtendedStructure) {

  const res = await Axios.post(
    "segment/Addstructure",
    {
      patient_id: localStorage.getItem('selected_patient'),
      structure: newStructure
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`
      }
    }
  )

  return res
}