'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DespachoForm {
  empresaId: number;
  tipoDespacho: string;
  descripcionMercancia: string;
  valorFOB: number;
  puertoOrigen: string;
  puertoDestino: string;
  clienteNombre: string;
  clienteContacto: string;
  observaciones: string;
}

export default function CrearDespachoPage() {
  const [formData, setFormData] = useState<DespachoForm>({
    empresaId: 0,
    tipoDespacho: '',
    descripcionMercancia: '',
    valorFOB: 0,
    puertoOrigen: '',
    puertoDestino: '',
    clienteNombre: '',
    clienteContacto: '',
    observaciones: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'empresaId' || name === 'valorFOB' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/despacho/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/despachos/${data.id}`);
      } else {
        console.error('Error creando despacho');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Despacho</h1>
            <p className="mt-2 text-gray-600">Complete los datos para iniciar un nuevo despacho de importación</p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="empresaId" className="block text-sm font-medium text-gray-700">
                    Empresa *
                  </label>
                  <select
                    id="empresaId"
                    name="empresaId"
                    required
                    value={formData.empresaId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Seleccione una empresa</option>
                    <option value="1">Empresa Demo S.A.C.</option>
                    <option value="2">Logística Peruana Ltda.</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tipoDespacho" className="block text-sm font-medium text-gray-700">
                    Tipo de Despacho *
                  </label>
                  <select
                    id="tipoDespacho"
                    name="tipoDespacho"
                    required
                    value={formData.tipoDespacho}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Seleccione tipo</option>
                    <option value="Importación">Importación</option>
                    <option value="Exportación">Exportación</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="descripcionMercancia" className="block text-sm font-medium text-gray-700">
                    Descripción de Mercancía *
                  </label>
                  <textarea
                    id="descripcionMercancia"
                    name="descripcionMercancia"
                    required
                    rows={3}
                    value={formData.descripcionMercancia}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describa detalladamente la mercancía a despachar"
                  />
                </div>

                <div>
                  <label htmlFor="valorFOB" className="block text-sm font-medium text-gray-700">
                    Valor FOB (USD) *
                  </label>
                  <input
                    type="number"
                    id="valorFOB"
                    name="valorFOB"
                    required
                    min="0"
                    step="0.01"
                    value={formData.valorFOB}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="puertoOrigen" className="block text-sm font-medium text-gray-700">
                    Puerto de Origen *
                  </label>
                  <input
                    type="text"
                    id="puertoOrigen"
                    name="puertoOrigen"
                    required
                    value={formData.puertoOrigen}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ej: Shanghai, Los Angeles"
                  />
                </div>

                <div>
                  <label htmlFor="puertoDestino" className="block text-sm font-medium text-gray-700">
                    Puerto de Destino *
                  </label>
                  <input
                    type="text"
                    id="puertoDestino"
                    name="puertoDestino"
                    required
                    value={formData.puertoDestino}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ej: Callao, Iquique"
                  />
                </div>

                <div>
                  <label htmlFor="clienteNombre" className="block text-sm font-medium text-gray-700">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    id="clienteNombre"
                    name="clienteNombre"
                    required
                    value={formData.clienteNombre}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Nombre completo del cliente"
                  />
                </div>

                <div>
                  <label htmlFor="clienteContacto" className="block text-sm font-medium text-gray-700">
                    Contacto del Cliente *
                  </label>
                  <input
                    type="text"
                    id="clienteContacto"
                    name="clienteContacto"
                    required
                    value={formData.clienteContacto}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Email o teléfono"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    rows={3}
                    value={formData.observaciones}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Información adicional relevante"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Creando...' : 'Crear Despacho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
