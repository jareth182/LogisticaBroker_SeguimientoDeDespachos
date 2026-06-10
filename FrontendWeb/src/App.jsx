import { useState, useEffect } from 'react';
import Login from './Components/Auth/Login';
import RecuperarContrasena from './Components/Auth/RecuperarContrasena';
import ActualizarContrasena from './Components/Auth/ActualizarContrasena';
import DetalleDespacho from './Components/Despachos/DetalleDespacho';
import RegistrarEmpresa from './Components/Empresa/RegistrarEmpresa';
import FirmaContrato from './Components/Contratos/FirmaContrato';
import Documentos from './Components/Contratos/Documentos';
import TrackingEnvios from './Components/Tracking/TrackingEnvios';
import ListaClientes from './Components/Empresa/ListaClientes';
import DespachoOperativo from './Components/Despachos/DespachoOperativo';
import ListaDespachos from './Components/Despachos/ListaDespachos';
import ListaLiquidaciones from './Components/Despachos/ListaLiquidaciones';
import ClasificacionArancelaria from './Components/Despachos/ClasificacionArancelaria';
import AdjuntarDocumentosLegales from './Components/Documentos/AdjuntarDocumentosLegales';
import DocumentacionLogistica from './Components/Despachos/DocumentacionLogistica';
import ExtraerDatosFactura from './Components/Despachos/ExtraerDatosFactura';
import EditarDetalleMercancia from './Components/Despachos/EditarDetalleMercancia';
import BorradorDAMFinal from './Components/Despachos/BorradorDAMFinal';
import LiquidacionTributaria from './Components/Despachos/LiquidacionTributaria';
import AdjuntarComprobantes from './Components/Despachos/AdjuntarComprobantes';
import ValidarComprobantes from './Components/Despachos/ValidarComprobantes';
import RegistrarNumeracion from './Components/Despachos/RegistrarNumeracion';
import RegistrarObservacionesAforo from './Components/Despachos/RegistrarObservacionesAforo';

function tokenEstaExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function App() {
  const [usuario, setUsuario]                         = useState(null);
  const [pantallaAuth, setPantallaAuth]               = useState('login');
  const [mensajeAuth, setMensajeAuth]                 = useState('');
  const [requiereCambioContrasena, setRequiereCambio] = useState(false);
  const [view, setView]                               = useState('despachos');
  const [despachoActivo, setDespachoActivo] = useState(null);
  const [liquidacionDespacho, setLiquidacionDespacho] = useState(null);
  const [clasificacionDespacho, setClasificacionDespacho] = useState(null);
  const [itemsExtraidos, setItemsExtraidos] = useState([]);
  const [isCollapsed, setIsCollapsed]   = useState(() => {
    try { return localStorage.getItem('sidebarCollapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) {
      setPantallaAuth('recuperar');
      return;
    }
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('usuario');
    if (token && userData) {
      if (tokenEstaExpirado(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setMensajeAuth('Sesión expirada. Vuelve a iniciar sesión');
        return;
      }
      const parsedUser = JSON.parse(userData);
      setUsuario(parsedUser);
      if (parsedUser.requiereCambioContrasena) {
        setRequiereCambio(true);
      } else if (parsedUser.rol === 'Cliente') {
        setView(parsedUser.estadoEmpresa === 'Pendiente' ? 'firma-contrato' : 'trazabilidad');
      }
    }
  }, []);

  const handleLoginExitoso = (usuarioData) => {
    setUsuario(usuarioData);
    if (usuarioData.requiereCambioContrasena) {
      setRequiereCambio(true);
      return;
    }
    if (usuarioData.rol === 'Cliente') {
      setView(usuarioData.estadoEmpresa === 'Pendiente' ? 'firma-contrato' : 'trazabilidad');
    } else {
      setView('despachos');
    }
  };

  const handleContrasenaActualizada = () => {
    setRequiereCambio(false);
    const updatedUser = { ...usuario, requiereCambioContrasena: false };
    setUsuario(updatedUser);
    localStorage.setItem('usuario', JSON.stringify(updatedUser));
    if (updatedUser.rol === 'Cliente') {
      setView(updatedUser.estadoEmpresa === 'Pendiente' ? 'firma-contrato' : 'trazabilidad');
    } else {
      setView('despachos');
    }
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5018/api/Auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setView('despachos');
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

  const handleVerDetalle = (despacho) => {
    setDespachoActivo(despacho);
    setView('detalle');
  };

  if (!usuario) {
    if (pantallaAuth === 'recuperar')
      return <RecuperarContrasena onVolver={() => setPantallaAuth('login')} />;
    return <Login onLoginExitoso={handleLoginExitoso} onIrRecuperar={() => setPantallaAuth('recuperar')} mensajeInicial={mensajeAuth} />;
  }

  if (requiereCambioContrasena) {
    return <ActualizarContrasena onActualizado={handleContrasenaActualizada} />;
  }

  const iniciales = usuario.nombreCompleto
    ?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`transition-all duration-200 ${isCollapsed ? 'w-20' : 'w-64'} bg-[#0b1727] text-white flex flex-col h-full shadow-xl z-20`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <svg className="w-6 h-6 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {!isCollapsed && <span className="text-lg font-bold tracking-wide">Logística Broker</span>}
          {isCollapsed ? (
            <button onClick={() => setCollapsedPersist(false)} className="ml-auto p-1 rounded bg-[#008b9c] hover:bg-[#007685] text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : (
            <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">

          {/* ── NAV CLIENTE ── */}
          {usuario?.rol === 'Cliente' ? (<>
            {usuario.estadoEmpresa === 'Afiliado Activo' ? (<>
              <NavItem icon="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" text="Panel de Trazabilidad" onClick={() => setView('trazabilidad')} collapsed={isCollapsed} active={view === 'trazabilidad'} />
              <NavItem icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" text="Mis Documentos" onClick={() => setView('documentos')} collapsed={isCollapsed} active={view === 'documentos'} />
            </>) : (<>
              <NavItem icon="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" text="Documentación" onClick={() => setView('documentacion')} collapsed={isCollapsed} active={view === 'documentacion'} />
              <NavItem icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" text="Firmar Contrato" onClick={() => setView('firma-contrato')} collapsed={isCollapsed} active={view === 'firma-contrato'} />
            </>)}
          </>) : (<>

          {/* ── NAV ADMIN / OPERATIVO ── */}
          <NavItem
            icon="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            text="Despachos"
            onClick={() => setView('despachos')}
            collapsed={isCollapsed}
            active={view === 'despachos' || view === 'nuevo-despacho' || view === 'detalle' || view === 'clasificacion' || view === 'liquidaciones'}
          />
          <NavItem
            icon="M12 4v16m8-8H4"
            text="Nuevo Despacho"
            onClick={() => setView('nuevo-despacho')}
            collapsed={isCollapsed}
            active={view === 'nuevo-despacho'}
          />
          <NavItem
            icon="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            text="Panel de Trazabilidad"
            onClick={() => setView('trazabilidad')}
            collapsed={isCollapsed}
            active={view === 'trazabilidad'}
          />

          {!isCollapsed && (
            <div className="px-6 py-2 mt-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Clientes</div>
            </div>
          )}
          <NavItem
            icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            text="Administración"
            onClick={() => setView('clientes')}
            collapsed={isCollapsed}
            active={view === 'clientes' || view === 'nuevo-cliente'}
          />

          <NavItem
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            text="Mis Documentos"
            onClick={() => setView('documentos')}
            collapsed={isCollapsed}
            active={view === 'documentos'}
          />
          </>)}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#0d1b2a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#008b9c] flex items-center justify-center text-xs font-bold shrink-0">
              {iniciales}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{usuario.nombreCompleto}</p>
                <p className="text-xs text-gray-400">{usuario.rol}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 bg-[#ff3b30] hover:bg-red-600 text-white py-2 rounded text-sm font-medium transition-colors ${isCollapsed ? 'px-2' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col h-full relative">

        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <button onClick={toggleCollapse} className="p-2 rounded hover:bg-gray-100 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar despachos, clientes, documentos..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008b9c]"
              />
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

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-8">

          {/* ── Lista de despachos (vista principal) ── */}
          {view === 'despachos' && (
              <ListaDespachos
                  onVerDetalle={handleVerDetalle}
                  onNuevoDespacho={() => setView('nuevo-despacho')}
                  onVerTributos={(d) => { setDespachoActivo(d); setView('liquidacion-tributaria'); }}
                  onAdjuntarComprobantes={(d) => { setDespachoActivo(d); setView('adjuntar-comprobantes'); }}
                  onValidarComprobantes={(d) => { setDespachoActivo(d); setView('validar-comprobantes'); }}
                  onRegistrarNumeracion={(d) => { setDespachoActivo(d); setView('registrar-numeracion'); }}
                  onObservacionesAforo={(d) => { setDespachoActivo(d); setView('observaciones-aforo'); }}
              />
          )}

          {/* ── Crear nuevo despacho ── */}
          {view === 'nuevo-despacho' && (
            <DespachoOperativo
              onVerDetalle={handleVerDetalle}
              onVolver={() => setView('despachos')}
            />
          )}

          {/* ── Detalle de despacho / DAM ── */}
          {view === 'detalle' && despachoActivo && (
              <DetalleDespacho
                  despacho={despachoActivo}
                  onVolver={() => liquidacionDespacho ? setView('liquidaciones') : setView('despachos')}
                  onVerLiquidaciones={(d) => { setLiquidacionDespacho(d); setView('liquidaciones'); }}
              />
          )}

          {view === 'firma-contrato' && (
            <FirmaContrato
              onFirmado={(updatedUser) => {
                setUsuario(updatedUser);
                setView('trazabilidad');
              }}
              onCancelar={() => setView(usuario?.estadoEmpresa === 'Pendiente' ? 'documentacion' : 'trazabilidad')}
            />
          )}

          {view === 'trazabilidad' && (
            <TrackingEnvios />
          )}

          {view === 'documentos' && (
            <Documentos onNavigate={setView} />
          )}

          {view === 'documentacion' && (
            <AdjuntarDocumentosLegales onAvanzarFirma={() => setView('firma-contrato')} />
          )}

          {/* ── Lista de liquidaciones (vista específica) ── */}
          {view === 'liquidaciones' && liquidacionDespacho && (
              <ListaLiquidaciones
                  despacho={liquidacionDespacho}
                  onAbrir={(d) => { setDespachoActivo(d); setView('detalle'); }}
                  onVolver={() => setView('despachos')}
              />
          )}

          {view === 'clasificacion' && clasificacionDespacho && (
              <ClasificacionArancelaria
                  despacho={clasificacionDespacho}
                  onVolver={() => setView('despachos')}
                  onVerLiquidaciones={(d) => { setLiquidacionDespacho(d); setView('liquidaciones'); }}
              />
          )}

          {/* ── HU09: Documentación Logística ── */}
          {view === 'documentacion-logistica' && despachoActivo && (
              <DocumentacionLogistica
                  despacho={despachoActivo}
                  onVolver={() => setView('despachos')}
              />
          )}

          {/* ── HU10: Extraer Datos Factura ── */}
          {view === 'extraer-factura' && despachoActivo && (
              <ExtraerDatosFactura
                  despacho={despachoActivo}
                  onVolver={() => setView('despachos')}
                  onIrEditar={(items) => {
                      setItemsExtraidos(items);
                      setView('editar-detalle');
                  }}
              />
          )}

          {/* ── HU11: Editar Detalle Mercancía ── */}
          {view === 'editar-detalle' && despachoActivo && (
              <EditarDetalleMercancia
                  despacho={despachoActivo}
                  itemsIniciales={itemsExtraidos}
                  onVolver={() => setView('extraer-factura')}
                  onIrBorrador={() => setView('borrador-dam-final')}
              />
          )}

          {/* ── HU12: Generar Borrador DAM ── */}
          {view === 'borrador-dam-final' && despachoActivo && (
              <BorradorDAMFinal
                  despacho={despachoActivo}
                  onVolver={() => setView('despachos')}
                  onGenerado={(nuevoEstado) => {
                      setDespachoActivo(prev => prev ? { ...prev, estado: nuevoEstado } : prev);
                  }}
              />
          )}

          {/* ── HU13: Liquidación Tributaria ── */}
          {view === 'liquidacion-tributaria' && (
              <LiquidacionTributaria
                  despacho={despachoActivo}
                  onVolver={() => setView('despachos')}
                  usuario={usuario}
              />
          )}

          {/* ── HU14: Adjuntar Comprobantes ── */}
          {view === 'adjuntar-comprobantes' && (
              <AdjuntarComprobantes
                  despacho={despachoActivo}
                  onVolver={() => setView('despachos')}
              />
          )}

          {/* ── HU15: Validar Comprobantes ── */}
          {view === 'validar-comprobantes' && (
              <ValidarComprobantes
                  despacho={despachoActivo}
                  onVolver={() => setView('despachos')}
                  usuario={usuario}
              />
          )}

          {/* ── HU16: Registrar Numeración Aduanera ── */}
          {view === 'registrar-numeracion' && (
              <RegistrarNumeracion
                  despacho={despachoActivo}
                  onVolver={() => setView('despachos')}
                  onRegistrado={() => {}}
              />
          )}

          {/* ── HU17: Registrar Observaciones Aforo ── */}
          {view === 'observaciones-aforo' && (
              <RegistrarObservacionesAforo
                  despacho={despachoActivo}
                  onVolver={() => setView('despachos')}
                  usuario={usuario}
              />
          )}

          {/* ── Clientes ── */}
          {view === 'clientes' && (
            <ListaClientes onNuevoCliente={() => setView('nuevo-cliente')} />
          )}

          {view === 'nuevo-cliente' && (
            <RegistrarEmpresa onVolver={() => setView('clientes')} />
          )}

        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, text, collapsed = false, onClick = () => {}, active = false }) {
  const base        = collapsed ? 'justify-center px-2.5 py-3' : 'px-6 py-2.5';
  const activeClass = active
    ? 'bg-[#1e293b] text-white'
    : 'text-gray-300 hover:bg-[#1e293b] hover:text-white';
  return (
    <div onClick={onClick} className={`${base} flex items-center gap-3 cursor-pointer transition-colors ${activeClass}`}>
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
      </svg>
      {!collapsed && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}