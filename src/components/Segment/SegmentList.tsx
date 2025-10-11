import { FaChevronLeft } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'
import './SegmentList.css'

const dummyCases = [
  {
    name: "John Doe",
    sex: "M",
    age: 34,
    modality: "T1",
    dimension: "256×256×150",
    status: "Finished"
  },
  {
    name: "Jane Smith",
    sex: "F",
    age: 29,
    modality: "T2",
    dimension: "192×192×120",
    status: "Not Yet"
  },
  {
    name: "Alex Kim",
    sex: "M",
    age: 41,
    modality: "FLAIR",
    dimension: "128×128×90",
    status: "Finished"
  },
  {
    name: "Sara Lee",
    sex: "F",
    age: 22,
    modality: "T1",
    dimension: "256×256×160",
    status: "Not Yet"
  }
]

export default function SegmentList({ onReturn }: { onReturn: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="segment-list-container">
      <div className='segment-header'>
        <button className="segment-return-btn" onClick={() => navigate('main')}>
          <FaChevronLeft size={16}/>
        </button>
        <h2>Segment Cases</h2>
        <span></span>
      </div>
      <div className="segment-table-wrapper">
        <table className="segment-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Sex</th>
              <th>Age</th>
              <th>Modality</th>
              <th>Dimension</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dummyCases.map((c, i) => (
             <tr
             key={i}
             style={{ cursor: 'pointer' }}
             onClick={() => navigate(`/viewer`)} 
           >
                <td>{c.name}</td>
                <td>{c.sex}</td>
                <td>{c.age}</td>
                <td>{c.modality}</td>
                <td>{c.dimension}</td>
                <td>
                  <span className={`segment-status ${c.status === "Finished" ? "finished" : "notyet"}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}