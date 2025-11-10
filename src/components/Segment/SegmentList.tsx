import { FaChevronLeft } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'
import './SegmentList.css'
import { useEffect, useState } from "react"
import Axios from "../../utils/Axios"
import { useAuth } from "../../hooks/useAuth"
import axios from "axios"
import { BASEURL } from "../../utils/constants"




export default function SegmentList({ onReturn }: { onReturn: () => void }) {
  const [data, setData] = useState([
    {
      patient_id: "PID_100",
      sex: 'male',
      age: '60',
      mri_path: '',
      status: "Unfinished"
    }
  ])
  const { token } = useAuth();
  // add useEffect to render the mist of MRI images for the doctor 
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("https://stackless-gablewindowed-yanira.ngrok-free.dev/segment/MRI_List_For_Segment", {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
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
  const handle = (patient_id: string, mri_path: string) => {
    localStorage.setItem("selected_patient", patient_id)
    navigate('/viewer', { state: { path: BASEURL + mri_path, patient_id: patient_id } })

  }

  return (
    <div className="segment-list-container">
      <div className='segment-header'>
        <button className="segment-return-btn" onClick={() => navigate('main')}>
          <FaChevronLeft size={16} />
        </button>
        <h2>Segment Cases</h2>
        <span></span>
      </div>
      <div className="segment-table-wrapper">
        <table className="segment-table">
          <thead>
            <tr>
              <th>Sex</th>
              <th>Age</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((c, i) => (
                <tr
                  key={i}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handle(c.patient_id, c.mri_path)}
                >
                  <td>{c.sex}</td>
                  <td>{c.age}</td>
                  <td>
                    <span className={`segment-status ${c.status}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: 'gray' }}>
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