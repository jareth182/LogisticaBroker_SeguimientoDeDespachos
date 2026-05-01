'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalDespachos: number;
  despachosEnProceso: number;
  despachosFinalizados: number;
  despachosConAlertas: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDespachos: 0,
    despachosEnProceso: 0,
    despachosFinalizados: 0,
    despachosConAlertas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/trazabilidad/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalDespachos: data.totalDespachos,
          despachosEnProceso: data.despachosEnProceso,
          despachosFinalizados: data.despachosFinalizados,
          despachosConAlertas: data.despachosConAlertas,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Trazabilidad</h1>
          <p className="mt-2 text-gray-600">Panel de monitoreo de despachos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">📦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Despachos
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats.totalDespachos}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">⏳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      En Proceso
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats.despachosEnProceso}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Finalizados
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats.despachosFinalizados}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">⚠️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Con Alertas
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats.despachosConAlertas}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Acciones Rápidas
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-4">
                <button
                  onClick={() => router.push('/despachos/crear')}
                  className="w-full text-left px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <div className="font-medium text-indigo-900">Crear Nuevo Despacho</div>
                  <div className="text-sm text-indigo-700">Iniciar un nuevo despacho de importación</div>
                </button>
                <button
                  onClick={() => router.push('/dam/generar')}
                  className="w-full text-left px-4 py-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                >
                  <div className="font-medium text-green-900">Generar DAM</div>
                  <div className="text-sm text-green-700">Crear borrador de Declaración Aduanera</div>
                </button>
                <button
                  onClick={() => router.push('/empresas/registrar')}
                  className="w-full text-left px-4 py-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <div className="font-medium text-blue-900">Registrar Empresa</div>
                  <div className="text-sm text-blue-700">Agregar nueva empresa al sistema</div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Actividad Reciente
              </h3>
              <div className="mt-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">DAM generada</span> por Kiara
                    </p>
                    <p className="text-xs text-gray-500">Hace 30 minutos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Despacho creado</span> por Jazarelly
                    </p>
                    <p className="text-xs text-gray-500">Hace 1 hora</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Partida asignada</span> por Jareth
                    </p>
                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
