import { useState, useEffect } from 'react'
import axios from 'axios'
import sikLogo from './assets/SIK.svg'
import kikLogo from './assets/KIK.png'
import './App.css'

const backend: String = import.meta.env.VITE_BACKEND_URL

//type Guild = "SIK" | "KIK";

enum Sport {
  activity = "Activity",
  biking = "Biking",
  running_walking = "Running/Walking",
}

interface SportInfo {
  sport: Sport;
  sik_sum: Number;
  kik_sum: Number;
  sik_entries: Number;
  kik_entries: Number;
}

function SportRow(sport: SportInfo){
  return (
    <tr>
      <td>{sport.sport.toString()}</td>
      <td>{sport.sik_entries.toString()}</td>
      <td>{sport.sik_sum.toString()}</td>
      <td>{sport.kik_sum.toString()}</td>
      <td>{sport.kik_entries.toString()}</td>
    </tr>
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
            <td>Sport</td>
            <td>SIK entries</td>
            <td>SIK distance</td>
            <td>KIK distance</td>
            <td>KIK entries</td>
          </tr>
          {sports.map((sport) => SportRow(sport))}
        </tbody>
      </table>
    </>
  )
}

export default App
