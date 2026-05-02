import { useState, useEffect } from 'react';
import Login from './Components/Auth/Login';
import CrearDespacho from './Components/Despachos/CrearDespacho';
import ListaDespachos from './Components/Despachos/ListaDespachos';
import DetalleDespacho from './Components/Despachos/DetalleDespacho';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [view, setView] = useState('crear');
  const [despachoActivo, setDespachoActivo] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebarCollapsed') === 'true'; } catch { return false; }
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('usuario');
    if (token && userData) {
      setUsuario(JSON.parse(userData));
    }
  }, []);

  const handleLoginExitoso = (usuarioData) => {
    setUsuario(usuarioData);
    if (usuarioData.rol === 'Cliente') {
      setView('trazabilidad');
    } else {
      setView('crear');
    }
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5018/api/Auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setView('crear');
  };

  const handleCreated = (data) => {
    setRefreshKey(k => k + 1);
    setView('lista');
    setToast({ show: true, title: 'Éxito', message: `Despacho ${data.codigoOrden} creado exitosamente!`, type: 'success' });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 5000);
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebarCollapsed', next ? 'true' : 'false'); } catch {}
      return next;
    });
  };

  const setCollapsedPersist = (value) => {
    try { localStorage.setItem('sidebarCollapsed', value ? 'true' : 'false'); } catch {}
    setIsCollapsed(value);
  };

  if (!usuario) {
    return <Login onLoginExitoso={handleLoginExitoso} />;
  }

  const iniciales = usuario.nombreCompleto
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleVerDetalle = (despacho) => {
    setDespachoActivo(despacho);
    setView('detalle');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* ================= SIDEBAR (MENÚ LATERAL) ================= */}
      <aside className={`transition-all duration-200 ${isCollapsed ? 'w-20' : 'w-64'} bg-[#0b1727] text-white flex flex-col h-full shadow-xl z-20`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <svg className="w-6 h-6 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span className={`${isCollapsed ? 'hidden' : 'text-lg font-bold tracking-wide'}`}>Logística Broker</span>
          {/* Si está colapsado mostramos un botón pequeño para reabrir */}
          {isCollapsed ? (
            <button aria-label="Abrir menú" onClick={() => setCollapsedPersist(false)} className="ml-auto p-1 rounded bg-[#008b9c] hover:bg-[#007685] text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          ) : (
            <svg className={`w-4 h-4 ml-auto text-gray-400 ${isCollapsed ? 'hidden' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <NavItem icon="M12 4v16m8-8H4" text="Crear Despacho" onClick={() => setView('crear')} collapsed={isCollapsed} active={view === 'crear'} />
          <NavItem icon="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" text="Repositorio de Despacho" onClick={() => setView('lista')} collapsed={isCollapsed} active={view === 'lista' || view === 'detalle'} />
          <NavItem icon="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" text="Panel de Trazabilidad" onClick={() => setView('trazabilidad')} collapsed={isCollapsed} active={view === 'trazabilidad'} />
          <NavItem icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" text="Configuración" collapsed={isCollapsed} />
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-800 bg-[#0d1b2a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#008b9c] flex items-center justify-center text-xs font-bold">
              {iniciales}
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-medium">{usuario.nombreCompleto}</p>
                <p className="text-xs text-gray-400">{usuario.rol}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 bg-[#ff3b30] hover:bg-red-600 text-white py-2 rounded text-sm font-medium transition-colors ${isCollapsed ? 'px-2' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            {!isCollapsed && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <button aria-label="Toggle menu" onClick={toggleCollapse} className="p-2 rounded hover:bg-gray-100 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="relative flex-1">
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
          {view === 'crear' && (
            <CrearDespacho onCreated={handleCreated} />
          )}

          {view === 'lista' && (
              <ListaDespachos
                  refreshKey={refreshKey}
                  onVerDetalle={handleVerDetalle}
              />
          )}

          {view === 'detalle' && despachoActivo && (
              <DetalleDespacho
                  despacho={despachoActivo}
                  onVolver={() => setView('lista')}
              />
          )}
        </div>

        {/* ================= NOTIFICACIÓN TOAST (FLOTANTE) ================= */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 bg-white border border-green-100 rounded-lg shadow-xl p-4 flex items-start gap-4 z-50 min-w-[320px] animate-fade-in-up">
            <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900">{toast.title}</h4>
              <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
            </div>
            <button onClick={() => setToast(t => ({ ...t, show: false }))} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

// Subcomponente reutilizable para los links del menú lateral
function NavItem({ icon, text, collapsed = false, onClick = () => {}, active = false }) {
  const base = collapsed ? 'justify-center px-2.5 py-3' : 'px-6 py-2.5';
  const activeClass = active ? 'bg-[#1e293b] text-white' : 'text-gray-300 hover:bg-[#1e293b] hover:text-white';
  return (
    <div onClick={onClick} className={`${base} flex items-center gap-3 cursor-pointer transition-colors ${activeClass}`}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
      {!collapsed && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}
