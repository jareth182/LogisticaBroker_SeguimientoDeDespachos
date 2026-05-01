'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ItemMercancia {
  id: number;
  descripcion: string;
  partidaArancelaria: string;
  cantidad: number;
  unidadMedida: string;
  valorUnitario: number;
  valorTotal: number;
  pesoNeto: number;
  pesoBruto: number;
}

interface DAMForm {
  despachoId: number;
  items: ItemMercancia[];
  exportador: string;
  importador: string;
  paisDestino: string;
  paisOrigen: string;
  incoterm: string;
  condicionVenta: string;
  transporte: string;
  puertoEmbarque: string;
  puertoDestino: string;
}

export default function GenerarDAMPage() {
  const [formData, setFormData] = useState<DAMForm>({
    despachoId: 0,
    items: [{
      id: 1,
      descripcion: '',
      partidaArancelaria: '',
      cantidad: 0,
      unidadMedida: '',
      valorUnitario: 0,
      valorTotal: 0,
      pesoNeto: 0,
      pesoBruto: 0,
    }],
    exportador: '',
    importador: '',
    paisDestino: '',
    paisOrigen: '',
    incoterm: '',
    condicionVenta: '',
    transporte: '',
    puertoEmbarque: '',
    puertoDestino: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index: number, field: keyof ItemMercancia, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'descripcion' || field === 'partidaArancelaria' || field === 'unidadMedida' ? value : Number(value),
    };
    
    // Recalcular valor total si cambia cantidad o valor unitario
    if (field === 'cantidad' || field === 'valorUnitario') {
      newItems[index].valorTotal = newItems[index].cantidad * newItems[index].valorUnitario;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    const newItem: ItemMercancia = {
      id: formData.items.length + 1,
      descripcion: '',
      partidaArancelaria: '',
      cantidad: 0,
      unidadMedida: '',
      valorUnitario: 0,
      valorTotal: 0,
      pesoNeto: 0,
      pesoBruto: 0,
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dam/generar-borrador', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dam/${data.damId}/borrador`);
      } else {
        console.error('Error generando DAM');
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
            <h1 className="text-3xl font-bold text-gray-900">Generar DAM</h1>
            <p className="mt-2 text-gray-600">Complete los datos para generar la Declaración Aduanera de Mercancías</p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="despachoId" className="block text-sm font-medium text-gray-700">
                    Despacho *
                  </label>
                  <select
                    id="despachoId"
                    name="despachoId"
                    required
                    value={formData.despachoId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Seleccione un despacho</option>
                    <option value="1">DSP-2024-1001 - Empresa Demo</option>
                    <option value="2">DSP-2024-1002 - Logística Peruana</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="exportador" className="block text-sm font-medium text-gray-700">
                    Exportador *
                  </label>
                  <input
                    type="text"
                    id="exportador"
                    name="exportador"
                    required
                    value={formData.exportador}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Nombre del exportador"
                  />
                </div>

                <div>
                  <label htmlFor="importador" className="block text-sm font-medium text-gray-700">
                    Importador *
                  </label>
                  <input
                    type="text"
                    id="importador"
                    name="importador"
                    required
                    value={formData.importador}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Nombre del importador"
                  />
                </div>

                <div>
                  <label htmlFor="incoterm" className="block text-sm font-medium text-gray-700">
                    Incoterm *
                  </label>
                  <select
                    id="incoterm"
                    name="incoterm"
                    required
                    value={formData.incoterm}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Seleccione incoterm</option>
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="EXW">EXW</option>
                    <option value="DDP">DDP</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="paisOrigen" className="block text-sm font-medium text-gray-700">
                    País de Origen *
                  </label>
                  <input
                    type="text"
                    id="paisOrigen"
                    name="paisOrigen"
                    required
                    value={formData.paisOrigen}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ej: China, Estados Unidos"
                  />
                </div>

                <div>
                  <label htmlFor="paisDestino" className="block text-sm font-medium text-gray-700">
                    País de Destino *
                  </label>
                  <input
                    type="text"
                    id="paisDestino"
                    name="paisDestino"
                    required
                    value={formData.paisDestino}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ej: Perú, Chile"
                  />
                </div>

                <div>
                  <label htmlFor="puertoEmbarque" className="block text-sm font-medium text-gray-700">
                    Puerto de Embarque *
                  </label>
                  <input
                    type="text"
                    id="puertoEmbarque"
                    name="puertoEmbarque"
                    required
                    value={formData.puertoEmbarque}
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
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Ítems de Mercancía</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    + Agregar Ítem
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Descripción *
                          </label>
                          <textarea
                            rows={2}
                            value={item.descripcion}
                            onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Descripción detallada del ítem"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Partida Arancelaria *
                          </label>
                          <input
                            type="text"
                            value={item.partidaArancelaria}
                            onChange={(e) => handleItemChange(index, 'partidaArancelaria', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Ej: 8471.30.00.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Cantidad *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.cantidad}
                            onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Unidad Medida *
                          </label>
                          <input
                            type="text"
                            value={item.unidadMedida}
                            onChange={(e) => handleItemChange(index, 'unidadMedida', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Ej: unidades, kg, cajas"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Valor Unitario (USD) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.valorUnitario}
                            onChange={(e) => handleItemChange(index, 'valorUnitario', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Peso Neto (kg) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.pesoNeto}
                            onChange={(e) => handleItemChange(index, 'pesoNeto', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Peso Bruto (kg) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.pesoBruto}
                            onChange={(e) => handleItemChange(index, 'pesoBruto', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="text-sm text-gray-600">Valor Total:</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${item.valorTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      {formData.items.length > 1 && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Eliminar ítem
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
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
                  {isLoading ? 'Generando...' : 'Generar Borrador DAM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
