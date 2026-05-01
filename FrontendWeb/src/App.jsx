import React, { useState } from 'react';
import CrearDespacho from './Components/Despachos/CrearDespacho';
import ListaDespachos from './Components/Despachos/ListaDespachos';

export default function App() {
  // Estado para simular que el toast se puede cerrar
  const [mostrarToast, setMostrarToast] = useState(true);
  const [view, setView] = useState('crear');

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      
      {/* ================= SIDEBAR (MENÚ LATERAL) ================= */}
      <aside className="w-64 bg-[#0b1727] text-white flex flex-col h-full shadow-xl z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <svg className="w-6 h-6 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span className="text-lg font-bold tracking-wide">Logística Broker</span>
          <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </div>

        {/* Links del Menú */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <NavItem icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" text="Dashboard" onClick={() => setView('dashboard')} />
          <div onClick={() => setView('crear')} className="bg-[#008b9c] bg-opacity-90 border-l-4 border-white text-white px-6 py-3 flex items-center gap-3 cursor-pointer">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             <span className="text-sm font-medium">Crear Despacho</span>
          </div>
          <NavItem icon="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" text="Repositorio de Despacho" onClick={() => setView('lista')} />
          <NavItem icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" text="Tracking de Envíos" onClick={() => setView('tracking')} />
          <NavItem icon="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" text="Panel de Trazabilidad" onClick={() => setView('trazabilidad')} />
          <NavItem icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" text="Generar Borrador DAM" onClick={() => setView('dam')} />
          <NavItem icon="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" text="Firma de Documentos" onClick={() => setView('firma')} />
          <NavItem icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" text="Clientes" onClick={() => setView('clientes')} />
          <NavItem icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" text="Configuración" />
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-gray-800 bg-[#0d1b2a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#008b9c] flex items-center justify-center text-xs font-bold">JD</div>
            <div>
              <p className="text-sm font-medium">Juan Díaz</p>
              <p className="text-xs text-gray-400">Agente Aduanal</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-[#ff3b30] hover:bg-red-600 text-white py-2 rounded text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input type="text" placeholder="Buscar despachos, clientes, documentos..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008b9c]" />
            </div>
          </div>
          <div className="flex items-center gap-6 ml-4">
            <button className="relative text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-800">Juan Díaz</p>
                <p className="text-xs text-gray-500">Agente Aduanal</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#008b9c] flex items-center justify-center text-white text-xs font-bold">JD</div>
            </div>
          </div>
        </header>

        {/* ÁREA DE SCROLL (Dashboard Content) */}
        <div className="flex-1 overflow-auto p-8">
          {view === 'crear' && (
            <CrearDespacho onCreated={() => setView('lista')} />
          )}

          {view === 'lista' && (
            <ListaDespachos />
          )}

          {view === 'tracking' && (
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Tracking de Envíos</h1>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">{/* Pantalla en blanco por ahora */}</div>
            </div>
          )}

          {view === 'dam' && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">{/* Borrador DAM: pantalla en blanco (placeholder) */}</div>
          )}

          {view === 'dashboard' && (
            <div>
              <CrearDespacho onCreated={() => setView('lista')} />
            </div>
          )}
        </div>

        {/* ================= NOTIFICACIÓN TOAST (FLOTANTE) ================= */}
        {mostrarToast && (
          <div className="fixed bottom-6 right-6 bg-white border border-green-100 rounded-lg shadow-xl p-4 flex items-start gap-4 z-50 min-w-[320px] animate-fade-in-up">
            <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900">Éxito</h4>
              <p className="text-sm text-gray-600 mt-0.5">¡Despacho ORD-001 creado exitosamente!</p>
            </div>
            <button onClick={() => setMostrarToast(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

// Subcomponente reutilizable para los links del menú lateral
function NavItem({ icon, text }) {
  return (
    <div className="px-6 py-2.5 flex items-center gap-3 text-gray-300 hover:bg-[#1e293b] hover:text-white cursor-pointer transition-colors">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

// Subcomponente reutilizable para las filas de la tabla
function TableRow({ code, ruc, name, bl, state, stateColor, date }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900">{code}</td>
      <td className="px-6 py-4">{ruc}</td>
      <td className="px-6 py-4">{name}</td>
      <td className="px-6 py-4">{bl}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stateColor}`}>
          {state}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-500">{date}</td>
      <td className="px-6 py-4 text-center flex justify-center gap-3">
        <button className="text-gray-400 hover:text-[#008b9c]" title="Ver detalle">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
        </button>
        <button className="text-gray-400 hover:text-[#008b9c]" title="Actualizar">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </button>
      </td>
    </tr>
  );
}