import { useState, useEffect } from 'react'
import axios from 'axios'
import sikLogo from './assets/SIK.svg'
import kikLogo from './assets/KIK.png'
import './App.css'

const backend: String = import.meta.env.VITE_BACKEND_URL

type Guild = "SIK" | "KIK" | null;

enum Sport {
  activity = "Activity",
  biking = "Biking",
  running_walking = "Running/Walking",
}

interface SportInfo {
  sport: Sport;
  sik_sum: number;
  kik_sum: number;
  sik_entries: number;
  kik_entries: number;
}

function SportRow(sport: SportInfo){
  const leader: Guild = sport.sik_sum != sport.kik_sum ? sport.sik_sum > sport.kik_sum ? "SIK" : "KIK" : null; 
  const difference: number = Math.abs(sport.sik_sum - sport.kik_sum);

  return (
    <>
      <tr>
        <td></td><td></td>
        <td className="sportHeader">{sport.sport}</td>
        <td></td><td></td>
      </tr>
      <tr>
        <td>{sport.sik_entries.toString()}</td>
        <td>{sport.sik_sum.toFixed(1)}</td>
        <td>{leader ? `${leader} by ${difference.toFixed(1)}` : "even"}</td>
        <td>{sport.kik_sum.toFixed(1)}</td>
        <td>{sport.kik_entries.toString()}</td>
      </tr>
    </>
  )
}

function App() {
  const [sports, setSports] = useState([]);

  useEffect(() => {
    axios
      .get(backend.concat("/sports"))
      .then((response) => {
        setSports(response.data)
      })
  })

  return (
    <>
      <div>
        <a href="https://sahkoinsinoorikilta.fi" target="_blank">
          <img src={sikLogo} className="logo" alt="SIK logo" />
        </a>
        <a href="https://koneinsinoorikilta.fi" target="_blank">
          <img src={kikLogo} className="logo" alt="KIK logo" />
        </a>
      </div>
      <h1>SIK vs KIK spring battle 2025</h1>
      <table className="sportTable">
        <tbody>
          <tr>
            <th>SIK entries</th>
            <th>SIK distance</th>
            <th>Leader</th>
            <th>KIK distance</th>
            <th>KIK entries</th>
          </tr>
          {sports.map((sport) => SportRow(sport))}
        </tbody>
      </table>
    </>
  )
}

export default App
