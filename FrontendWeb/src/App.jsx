import { useState } from 'react'
import CrearDespacho from './components/Despachos/CrearDespacho'
import AsignarPartida from './components/Despachos/AsignarPartida'

function App() {
  const [idDespacho, setIdDespacho] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50 py-10">

      {/* Selector rápido para pruebas — lo quitas cuando tengas router */}
      <div className="max-w-4xl mx-auto mb-4 flex gap-3">
        <button
          onClick={() => setIdDespacho(null)}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${!idDespacho ? 'bg-[#00b4d8] text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
        >
          Crear Despacho
        </button>
        <button
          onClick={() => setIdDespacho(1)}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${idDespacho ? 'bg-[#00b4d8] text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
        >
          Asignar Partida (Despacho #1)
        </button>
      </div>

      {!idDespacho ? (
        <CrearDespacho />
      ) : (
        <AsignarPartida idDespacho={idDespacho} />
      )}

    </div>
  )
}

export default App