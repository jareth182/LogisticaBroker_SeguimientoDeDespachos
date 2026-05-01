import { useState, useEffect } from 'react';
import Login from './Components/Auth/Login';
import CrearDespacho from './Components/Despachos/CrearDespacho';
import ListaDespachos from './Components/Despachos/ListaDespachos';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [view, setView]       = useState('crear');

  // Al cargar la app verificar si ya hay sesión activa
  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('usuario');
    if (token && userData) {
      setUsuario(JSON.parse(userData));
    }
  }, []);

  // Callback que recibe Login cuando el login es exitoso
  const handleLoginExitoso = (usuarioData) => {
    setUsuario(usuarioData);
    // HU28 criterio 2: redirigir según rol
    if (usuarioData.rol === 'Cliente') {
      setView('trazabilidad');
    } else {
      setView('crear');
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await fetch('http://localhost:5018/api/Auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setView('crear');
  };

  // Si no hay sesión mostrar Login
  if (!usuario) {
    return <Login onLoginExitoso={handleLoginExitoso} />;
  }

  // Iniciales del usuario para el avatar
  const iniciales = usuario.nombreCompleto
    ?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-[#0b1727] text-white flex flex-col h-full shadow-xl z-20">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <svg className="w-6 h-6 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-lg font-bold tracking-wide">Logística Broker</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <NavItem icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            text="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon="M12 4v16m8-8H4"
            text="Crear Despacho" active={view === 'crear'} onClick={() => setView('crear')} />
          <NavItem icon="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            text="Repositorio de Despacho" active={view === 'lista'} onClick={() => setView('lista')} />
          <NavItem icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
            text="Tracking de Envíos" active={view === 'tracking'} onClick={() => setView('tracking')} />
          <NavItem icon="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            text="Panel de Trazabilidad" active={view === 'trazabilidad'} onClick={() => setView('trazabilidad')} />
          <NavItem icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            text="Generar Borrador DAM" active={view === 'dam'} onClick={() => setView('dam')} />
          <NavItem icon="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            text="Firma de Documentos" active={view === 'firma'} onClick={() => setView('firma')} />
          <NavItem icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            text="Clientes" active={view === 'clientes'} onClick={() => setView('clientes')} />
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-800 bg-[#0d1b2a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#008b9c] flex items-center justify-center text-xs font-bold">
              {iniciales}
            </div>
            <div>
              <p className="text-sm font-medium">{usuario.nombreCompleto}</p>
              <p className="text-xs text-gray-400">{usuario.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#ff3b30] hover:bg-red-600 text-white py-2 rounded text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input type="text" placeholder="Buscar despachos, clientes, documentos..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008b9c]" />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4 border-l pl-6 border-gray-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800">{usuario.nombreCompleto}</p>
              <p className="text-xs text-gray-500">{usuario.rol}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#008b9c] flex items-center justify-center text-white text-xs font-bold">
              {iniciales}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {view === 'crear'       && <CrearDespacho onCreated={() => setView('lista')} />}
          {view === 'lista'       && <ListaDespachos />}
          {view === 'dashboard'   && <CrearDespacho onCreated={() => setView('lista')} />}
          {view === 'tracking'    && <div className="bg-white border border-gray-200 rounded-lg p-8"><h2 className="text-xl font-bold text-gray-700">Tracking de Envíos — próximamente</h2></div>}
          {view === 'trazabilidad'&& <div className="bg-white border border-gray-200 rounded-lg p-8"><h2 className="text-xl font-bold text-gray-700">Panel de Trazabilidad — próximamente</h2></div>}
          {view === 'dam'         && <div className="bg-white border border-gray-200 rounded-lg p-8"><h2 className="text-xl font-bold text-gray-700">Borrador DAM — próximamente</h2></div>}
          {view === 'firma'       && <div className="bg-white border border-gray-200 rounded-lg p-8"><h2 className="text-xl font-bold text-gray-700">Firma de Documentos — próximamente</h2></div>}
          {view === 'clientes'    && <div className="bg-white border border-gray-200 rounded-lg p-8"><h2 className="text-xl font-bold text-gray-700">Clientes — próximamente</h2></div>}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, text, active, onClick }) {
  return (
    <div onClick={onClick}
      className={`px-6 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
        active
          ? 'bg-[#008b9c] bg-opacity-90 border-l-4 border-white text-white'
          : 'text-gray-300 hover:bg-[#1e293b] hover:text-white'
      }`}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
      </svg>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
