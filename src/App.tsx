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
  const leaderClass: string = leader ? leader === "SIK" ? "sik" : "kik" : ""

  const numSymbols = 25;
  const sikSymbols = leader ? Math.round(numSymbols*(sport.sik_sum/(sport.sik_sum + sport.kik_sum))) : Math.floor(numSymbols / 2);
  const kikSymbols = leader ? numSymbols - sikSymbols : Math.floor(numSymbols / 2);

  const leftSikSymbols = "\u26A1".repeat(Math.min(sikSymbols, Math.floor(numSymbols / 2)));
  const leftKikSymbols = "\u2699".repeat(Math.max(Math.floor(numSymbols / 2) - sikSymbols, 0))
  const middleSymbol = leader ? leader === "SIK" ? "\u26A1" : "\u2699" : "=";
  const rightSikSymbols = "\u26A1".repeat(Math.max(Math.floor(numSymbols / 2) - kikSymbols, 0));
  const rightKikSymbols = "\u2699".repeat(Math.min(kikSymbols, Math.floor(numSymbols / 2)));

  return (
    <>
      <tr>
        <td colSpan={5} className={`sportHeader ${leaderClass}`}>{sport.sport}</td>
      </tr>
      <tr>
        <td className="sik">{sport.sik_entries.toString()}</td>
        <td className="sik">{sport.sik_sum.toFixed(1)}</td>
        <td className={leaderClass}>{leader ? `${leader} by ${difference.toFixed(1)}` : "even"}</td>
        <td className="kik">{sport.kik_sum.toFixed(1)}</td>
        <td className="kik">{sport.kik_entries.toString()}</td>
      </tr>
      <tr>
        <td colSpan={5}>{leftSikSymbols}{leftKikSymbols}<span className="middleSymbol">{middleSymbol}</span>{rightSikSymbols}{rightKikSymbols}</td>
      </tr>
    </>
  )
}

function App() {
  const [sports, setSports] = useState<SportInfo[]>([]);
  const [listeningSports, setListeningSports] = useState<boolean>(false);

  const [participants, setParticipants] = useState<number[]>([]);
  const [listeningParticipants, setListeningParticipants] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get(backend.concat("/participants"))
      .then((response) => {
        setParticipants(response.data)
      })
      .catch(() => console.log("Could not get participant info"))  
  },[])

  useEffect(() => {
    axios
      .get(backend.concat("/sports"))
      .then((response) => {
        setSports(response.data)
      })
      .catch(() => console.log("Could not get sport info"))
  },[])

  useEffect( () => {
    if (!listeningSports) {
      const events = new EventSource(backend.concat("/sportnotif"));

      events.onmessage = (event) => {
        console.log("Sports updated ", event.data)

        axios
          .get(backend.concat("/sports"))
          .then((response) => {
            setSports(response.data)
          })
          .catch(() => console.log("Could not get sport info"))
      };

      setListeningSports(true);
    }
  }, [listeningSports]);

  useEffect( () => {
    if (!listeningParticipants) {
      const events = new EventSource(backend.concat("/participantnotif"));

      events.onmessage = (event) => {
        console.log("Participants updated ", event.data)

        axios
          .get(backend.concat("/participants"))
          .then((response) => {
            setParticipants(response.data)
          })
          .catch(() => console.log("Could not get participant info"))
      };

      setListeningParticipants(true);
    }
  }, [listeningParticipants]);

  return (
    <>
      <span style={{"display":"inline-block"}}>
        <a href="https://sahkoinsinoorikilta.fi" target="_blank">
          <img src={sikLogo} className="logo" alt="SIK logo" />
        </a>
        <h2 className="sik">{participants[0] || "N/A"} participants</h2>
      </span>
      <h1 style={{"display":"inline"}}><span className="sik">SIK</span> vs <span className="kik">KIK</span> spring battle 2025</h1>
      <span style={{"display":"inline-block"}}>
        <a href="https://koneinsinoorikilta.fi" target="_blank">
          <img src={kikLogo} className="logo" alt="KIK logo" />
        </a>
        <h2 className="kik">{participants[1] || "N/A"} participants</h2>
      </span>
      <table className="sportTable">
        <tbody>
          <tr>
            <th className="sik">Entries</th>
            <th className="sik">Distance</th>
              <th>Leader</th>
            <th className="kik">Distance</th>
            <th className="kik">Entries</th>
          </tr>
          {sports.map((sport) => SportRow(sport))}
        </tbody>
      </table>
    </>
  )
}

export default App
