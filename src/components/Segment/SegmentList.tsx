import { FaChevronLeft } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'
import './SegmentList.css'
import { useEffect, useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import axios from "axios"
import { BASEURL } from "../../utils/constants"
import App from "../../App"
import AppHeader from "../AppHeader/AppHeader"
import { useTranslation } from "../../hooks/useTranslation"




export default function SegmentList() {
  const { t } = useTranslation();
  const [data, setData] = useState([
    {
      patient_id: "PID_100",
      sex: 'male',
      age: '60',
      mri_path: '',
      modality : 'T1',
      last_modified: '2023-10-01',
    }
  ])
  const { token } = useAuth();
  // add useEffect to render the mist of MRI images for the doctor 
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${BASEURL}/segment/MRI_List_For_Segment`, {
          headers: {
            "Content-Type": "application/json",
            // "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (res.status == 200) {
          console.log("from segment list", res.data)
          setData(res.data["mris"])
          // console.log(res.data["mris"])
        }
      } catch (err) {
        console.error("Error fetching:", err);
      }
    }

    fetchData();
  }, []);

  // handling clikcin g on of the elements on the list 
  const navigate = useNavigate()
  const handle = (patient_id: string, mri_path: string, modality : string) => {
    localStorage.setItem("selected_patient", patient_id)
    localStorage.setItem("selected_modality",modality)
    navigate('/viewer', { state: { path: BASEURL + mri_path, patient_id: patient_id } })

  }

  return (
    <div className="segment-list-container">
      <AppHeader link="/Documentation#sub-3" />
      <div className='segment-header'>
        <button className="segment-return-btn" onClick={() => navigate('main')}>
          <FaChevronLeft size={16} />
        </button>
        <h2>{t.segmentList.segmentCases}</h2>
        <span></span>
      </div>
      <div className="segment-table-wrapper">
        <table className="segment-table">
          <thead>
            <tr>
              <th>{t.segmentList.gender}</th>
              <th>{t.segmentList.age}</th>
              <th>{t.segmentList.modality}</th>
              <th>{t.segmentList.lastModified}</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((c, i) => (
                <tr
                  key={i}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handle(c.patient_id, c.mri_path, c.modality)}
                >
                  <td>{c.sex}</td>
                  <td>{c.age}</td>
                  <td>{c.modality}</td>
                  <td>
                    <span className={`segment-status ${c.last_modified}`}>
                      {c.last_modified ? c.last_modified : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'gray' }}>
                  Not Found
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  )
}