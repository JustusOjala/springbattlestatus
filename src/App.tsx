import { useState } from 'react'
import axios from 'axios'
import sikLogo from './assets/SIK.svg'
import kikLogo from './assets/KIK.png'
import './App.css'

const backend: String = import.meta.env.VITE_BACKEND_URL

function App() {
  axios.get(backend.concat("/sports")).then((response) => {
    const sports = response.data;
  });

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
      <div className="card">
        <table>
          
        </table>
      </div>
    </>
  )
}

export default App
