import { useState, useEffect } from 'react'
import axios from 'axios'
import ReconnectingEventSource from 'reconnecting-eventsource'
import sikLogo from './assets/SIK.svg'
import kikLogo from './assets/KIK.png'
import './App.css'

const backend: String = import.meta.env.VITE_BACKEND_URL

type Guild = "SIK" | "KIK" | null;

enum Sport {
  steps = "Steps",
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

  const numSymbols = 51;
  const symbolWidth = 18;
  const midSymSize = leader ? leader === "SIK" ? 1.5 : 1.8 : 2.2;
  
  const sikSymbols = leader ? Math.round(numSymbols*(sport.sik_sum/(sport.sik_sum + sport.kik_sum))) : Math.floor(numSymbols / 2);
  const kikSymbols = leader ? numSymbols - sikSymbols : Math.floor(numSymbols / 2);

  const sikSymbol = "\u26A1";
  const kikSymbol = "\u2699";

  const sikElement = <span style={{"display":"inline-block","width":`${symbolWidth}px`,"fontSize":"0.5em"}}>{sikSymbol}</span>;
  const kikElement = <span style={{"display":"inline-block","width":`${symbolWidth}px`,"fontSize":"0.6em"}}>{kikSymbol}</span>; 

  const leftSikSymbols = [...Array(Math.min(sikSymbols, Math.floor(numSymbols / 2)))].map(() => sikElement);
  const leftKikSymbols = [...Array(Math.max(Math.floor(numSymbols / 2) - sikSymbols, 0))].map(() => kikElement);
  const middleSymbol = <span style={{"display":"inline-block","width":`${3*symbolWidth}px`,"fontSize":`${midSymSize}em`}}>{leader ? leader === "SIK" ? sikSymbol : kikSymbol : "="}</span>
  const rightSikSymbols = [...Array(Math.max(Math.floor(numSymbols / 2) - kikSymbols, 0))].map(() => sikElement);
  const rightKikSymbols = [...Array(Math.min(kikSymbols, Math.floor(numSymbols / 2)))].map(() => kikElement);

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
        <td colSpan={5}>{leftSikSymbols}{leftKikSymbols}{middleSymbol}{rightSikSymbols}{rightKikSymbols}</td>
      </tr>
    </>
  )
}

function App() {
  const [sports, setSports] = useState<SportInfo[]>([]);
  const [participants, setParticipants] = useState<number[]>([]);

  const [listening, setListening] = useState<boolean>(false);

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
    if (!listening) {
      const events = new ReconnectingEventSource(backend.concat("/notifications"));

      events.onerror = (err) => {
        console.log("SSE error:",err)
      }

      events.onmessage = (event) => {
        const data: string = event.data

        console.log("Received notification:", data)

        const sections: string[] = data.split("::");

        switch(sections[0]){
          case "logchange":
            console.log("\tSports changed")
            if(sections[1] && JSON.parse(sections[1])){
              console.log("\t\tNotification includes sport information, updating")
              const newSport: SportInfo = JSON.parse(sections[1])
              console.log("\t\t\tParsed as", JSON.stringify(newSport))
              setSports((sports) => sports.map((s) => s.sport === newSport.sport ? newSport : s))
            }else{
              console.log("\t\tNo sport information, fetching")
              axios
                .get(backend.concat("/sports"))
                .then((response) => {
                  setSports(response.data)
                })
                .catch(() => console.log("Could not get sport info"))
            }
            break;
          case "userchange":
            console.log("\tParticipants changed")
            if(sections[1] && sections[1].split(",").length == 2){
              console.log("\t\tNotification includes participant information, updating")
              const userCounts: number[] = sections[1].split(",").map((x) => Number.parseInt(x));
              if(userCounts && userCounts.length == 2 && userCounts[0] && userCounts[1]){
                console.log("\t\t\tParsed as", userCounts)
                setParticipants(userCounts)
              }else{
                console.log("\t\t\tImproper format")
              }
            }else{
              console.log("\t\tNo participant information, fetching")
              axios
                .get(backend.concat("/participants"))
                .then((response) => {
                  setParticipants(response.data)
                })
                .catch(() => console.log("Could not get participant info"))
            }
            break;
          case "reload":
            console.log("\tReload requested")
            location.reload();
            break;
          case "initstream":
            console.log("\tStream initiated")
            break;
          case "ping":
            // Just a keep-alive ping and all info is in earlier log; do nothing
            break;
          default:
            console.log("\tUnrecognized notification header", sections[0])
            break;
        }
        
      };

      setListening(true);
    }
  }, [listening]);

  return (
    <>
      <h1><span className="sik">SIK</span> vs <span className="kik">KIK</span> spring battle 2025</h1>
      <span className="logoSpan">
        <a href="https://sahkoinsinoorikilta.fi" target="_blank">
          <img src={sikLogo} className="logo" alt="SIK logo" />
        </a>
        <h2 className="sik"><div className="participants">{participants[0] || "N/A"}</div> participants</h2>
      </span>
      <span className="contentSpan">
        <table className="sportTable">
          <tbody>
            <tr>
              <th className="sik entries">Entries</th>
              <th className="sik distance">Distance</th>
              <th className="leader">Leader</th>
              <th className="kik distance">Distance</th>
              <th className="kik entries">Entries</th>
            </tr>
            {sports.map((sport) => SportRow(sport))}
          </tbody>
        </table>
      </span>
      <span className="logoSpan">
        <a href="https://koneinsinoorikilta.fi" target="_blank">
          <img src={kikLogo} className="logo" alt="KIK logo" />
        </a>
        <h2 className="kik"><div className="participants">{participants[1] || "N/A"}</div>participants</h2>
      </span>
    </>
  )
}

export default App
