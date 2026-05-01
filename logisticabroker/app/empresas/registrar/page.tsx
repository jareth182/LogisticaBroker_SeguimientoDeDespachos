'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EmpresaForm {
  ruc: string;
  razonSocial: string;
  nombreContacto: string;
  correo: string;
  celular: string;
  direccion: string;
  rubro: string;
  montoItem: number;
}

export default function RegistrarEmpresaPage() {
  const [formData, setFormData] = useState<EmpresaForm>({
    ruc: '',
    razonSocial: '',
    nombreContacto: '',
    correo: '',
    celular: '',
    direccion: '',
    rubro: '',
    montoItem: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ruc || formData.ruc.length !== 11) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    }

    if (!formData.razonSocial) {
      newErrors.razonSocial = 'La razón social es requerida';
    }

    if (!formData.nombreContacto) {
      newErrors.nombreContacto = 'El nombre de contacto es requerido';
    }

    if (!formData.correo) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'montoItem' ? Number(value) : value,
    }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/empresa/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/empresas?registro=exitoso');
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.error || 'Error al registrar la empresa' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión. Intente nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Registrar Nueva Empresa</h1>
            <p className="mt-2 text-gray-600">Complete los datos para registrar una nueva empresa en el sistema</p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-800">{errors.general}</div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ruc" className="block text-sm font-medium text-gray-700">
                    RUC *
                  </label>
                  <input
                    type="text"
                    id="ruc"
                    name="ruc"
                    required
                    maxLength={11}
                    value={formData.ruc}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.ruc ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="11 dígitos del RUC"
                  />
                  {errors.ruc && <p className="mt-1 text-sm text-red-600">{errors.ruc}</p>}
                </div>

                <div>
                  <label htmlFor="razonSocial" className="block text-sm font-medium text-gray-700">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    id="razonSocial"
                    name="razonSocial"
                    required
                    value={formData.razonSocial}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.razonSocial ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="Nombre completo de la empresa"
                  />
                  {errors.razonSocial && <p className="mt-1 text-sm text-red-600">{errors.razonSocial}</p>}
                </div>

                <div>
                  <label htmlFor="nombreContacto" className="block text-sm font-medium text-gray-700">
                    Nombre de Contacto *
                  </label>
                  <input
                    type="text"
                    id="nombreContacto"
                    name="nombreContacto"
                    required
                    value={formData.nombreContacto}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.nombreContacto ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="Persona de contacto"
                  />
                  {errors.nombreContacto && <p className="mt-1 text-sm text-red-600">{errors.nombreContacto}</p>}
                </div>

                <div>
                  <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    required
                    value={formData.correo}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.correo ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="correo@empresa.com"
                  />
                  {errors.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
                </div>

                <div>
                  <label htmlFor="celular" className="block text-sm font-medium text-gray-700">
                    Teléfono/Celular
                  </label>
                  <input
                    type="tel"
                    id="celular"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="+51 999 888 777"
                  />
                </div>

                <div>
                  <label htmlFor="rubro" className="block text-sm font-medium text-gray-700">
                    Rubro
                  </label>
                  <input
                    type="text"
                    id="rubro"
                    name="rubro"
                    value={formData.rubro}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ej: Importación, Comercio, Manufactura"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    rows={2}
                    value={formData.direccion}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Dirección completa de la empresa"
                  />
                </div>

                <div>
                  <label htmlFor="montoItem" className="block text-sm font-medium text-gray-700">
                    Monto por Item (USD)
                  </label>
                  <input
                    type="number"
                    id="montoItem"
                    name="montoItem"
                    min="0"
                    step="0.01"
                    value={formData.montoItem}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="0.00"
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
                  {isLoading ? 'Registrando...' : 'Registrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
