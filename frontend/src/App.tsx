import { useEffect, useState } from "react"

function App() {
  const [status, setStatus] = useState<string>("checking...")

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`)
        .then(res => res.text())
        .then(data => setStatus(data))
        .catch(() => setStatus("error — could not reach backend"))
  }, [])

  return (
      <div>
        <h1>Dinner Sorted</h1>
        <p>Backend status: {status}</p>
      </div>
  )
}

export default App