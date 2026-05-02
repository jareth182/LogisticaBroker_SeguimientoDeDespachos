import { useState } from 'react';

export default function RegistrarEmpresa({ onSuccess }) {
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [correo, setCorreo] = useState('');
  const [celular, setCelular] = useState('');
  const [direccion, setDireccion] = useState('');
  const [rubro, setRubro] = useState('');
  const [montoItem, setMontoItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const API_BASE_URL = 'http://localhost:5018/api/Empresa';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (!ruc || !razonSocial || !nombreContacto || !correo) {
      setError('RUC, Razón Social, Nombre de contacto y Correo son obligatorios.');
      setLoading(false);
      return;
    }

    const payload = {
      Ruc: ruc,
      RazonSocial: razonSocial,
      NombreContacto: nombreContacto,
      Correo: correo,
      Celular: celular || null,
      Direccion: direccion || null,
      Rubro: rubro || null,
      MontoItem: montoItem ? Number(montoItem) : null
    };

    try {
      const res = await fetch(`${API_BASE_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.mensaje || 'Empresa registrada correctamente');
        setRuc(''); setRazonSocial(''); setNombreContacto(''); setCorreo(''); setCelular(''); setDireccion(''); setRubro(''); setMontoItem('');
        if (onSuccess) onSuccess(data.mensaje || 'Empresa registrada correctamente');
      } else {
        setError(data.error || data.mensaje || 'Error al registrar empresa');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#0f172a] mb-4">Registrar Empresa</h1>
      <p className="text-sm text-gray-600 mb-6">Completa los datos de la empresa. Se creará automáticamente un usuario y se enviará la contraseña al correo indicado.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">{successMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">RUC *</label>
          <input value={ruc} onChange={e => setRuc(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8]" placeholder="20123456789" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social *</label>
          <input value={razonSocial} onChange={e => setRazonSocial(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8]" placeholder="Empresa S.A.C." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de contacto *</label>
          <input value={nombreContacto} onChange={e => setNombreContacto(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8]" placeholder="Juan Pérez" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Correo *</label>
          <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8]" placeholder="contacto@empresa.com" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Celular</label>
          <input value={celular} onChange={e => setCelular(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8]" placeholder="987654321" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <input value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8]" placeholder="Av. Principal 123" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rubro</label>
          <input value={rubro} onChange={e => setRubro(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8]" placeholder="Import/Export" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monto estimado por ítem (opcional)</label>
          <input value={montoItem} onChange={e => setMontoItem(e.target.value)} type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8]" placeholder="0.00" />
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-3 mt-3">
          <button type="submit" disabled={loading} className={`px-4 py-2 bg-[#00b4d8] text-white rounded-lg font-medium hover:bg-[#009bc2] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? 'Registrando...' : 'Registrar Empresa'}
          </button>
        </div>
      </form>
    </div>
  );
}
