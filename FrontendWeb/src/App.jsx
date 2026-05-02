import { useState } from 'react';
import CrearDespacho from './Components/Despachos/CrearDespacho';
import FirmaContrato from './Components/Contratos/FirmaContrato';
import Documentos from './Components/Contratos/Documentos';

function App() {
  const [paginaActual, setPaginaActual] = useState('firma-contrato');

  const renderPagina = () => {
    switch (paginaActual) {
      case 'despachos':
        return <CrearDespacho />;
      case 'firma-contrato':
        return <FirmaContrato />;
      case 'documentos':
        return <Documentos />;
      default:
        return <FirmaContrato />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Logística Broker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPaginaActual('firma-contrato')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  paginaActual === 'firma-contrato'
                    ? 'bg-[#00b4d8] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Firma de Contrato
              </button>
              <button
                onClick={() => setPaginaActual('documentos')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  paginaActual === 'documentos'
                    ? 'bg-[#00b4d8] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Mis Documentos
              </button>
              <button
                onClick={() => setPaginaActual('despachos')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  paginaActual === 'despachos'
                    ? 'bg-[#00b4d8] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Crear Despacho
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="py-10">
        {renderPagina()}
      </main>
    </div>
  )
}

export default App