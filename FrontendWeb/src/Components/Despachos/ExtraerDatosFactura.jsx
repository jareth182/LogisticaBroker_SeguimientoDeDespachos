import { useState, useRef } from 'react';

const API = 'http://localhost:5018/api/Factura';

export default function ExtraerDatosFactura({ despacho, onVolver, onIrEditar }) {
    const [archivo, setArchivo]   = useState(null);
    const [dragging, setDragging] = useState(false);
    const [extrayendo, setExtrayendo] = useState(false);
    const [items, setItems]       = useState([]);
    const [error, setError]       = useState(null);
    const inputRef = useRef();

    const onFileChange = (file) => {
        if (!file) return;
        setError(null);
        setItems([]);
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'xlsx' && ext !== 'xls') { // PA HU10-1.2 NOK — formato de archivo incorrecto (PDF, exe, etc.)
            setError('Formato no válido. Solo se admiten archivos Excel (.xlsx o .xls) para la extracción de datos.');
            setArchivo(null);
            return;
        }
        setArchivo(file); // PA HU10-1 OK (parcial) — archivo Excel válido seleccionado
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragging(false);
        onFileChange(e.dataTransfer.files[0]);
    };

    const handleExtraer = async () => {
        if (!archivo) { // PA HU10-1.1 NOK — no se seleccionó ningún archivo
            setError('Debe seleccionar un archivo Excel antes de continuar.');
            return;
        }
        setExtrayendo(true); setError(null);
        const form = new FormData();
        form.append('archivo', archivo);
        try {
            const res = await fetch(`${API}/extraer`, { method: 'POST', body: form });
            const data = await res.json();
            if (res.ok) { // PA HU10-1 OK — extracción exitosa, tabla de ítems disponible
                setItems(data);
            } else { // PA HU10-1.3 NOK / HU10-1.4 NOK — backend rechaza (columnas incorrectas o sin filas)
                setError(data.mensaje || 'No se pudo procesar el archivo. Verifique su conexión e intente nuevamente.');
            }
        } catch { // PA HU10-1.5 NOK — error de conexión durante el procesamiento
            setError('No se pudo procesar el archivo. Verifique su conexión e intente nuevamente.');
        } finally { setExtrayendo(false); }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Operatividad</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="font-mono text-gray-500">Expediente {despacho.codigoOrden}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Extracción de Datos</span>
            </div>

            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Extraer Datos Factura</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Cargue la factura comercial (Excel) para extraer automáticamente los ítems a declarar.
                    </p>
                </div>
                <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Volver
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* ── Columna izquierda: carga ── */}
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-700 mb-4">Archivo Fuente</h2>

                        {/* Drag & drop */}
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all mb-4 ${
                                dragging ? 'border-[#008b9c] bg-[#e0f7fa]' :
                                archivo  ? 'border-green-400 bg-green-50' :
                                           'border-gray-300 bg-gray-50 hover:border-[#008b9c]'
                            }`}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={e => onFileChange(e.target.files[0])}
                            />
                            {archivo ? (
                                <>
                                    <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-sm font-semibold text-green-700 text-center">{archivo.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">Clic para cambiar archivo</p>
                                </>
                            ) : (
                                <>
                                    <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-sm font-semibold text-gray-500">Arrastre el archivo Excel aquí</p>
                                    <p className="text-xs text-gray-400 mt-1">o haga clic para examinar</p>
                                    <p className="text-xs text-gray-400">[XLSX, XLS]</p>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleExtraer}
                            disabled={extrayendo || !archivo}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                extrayendo || !archivo
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#008b9c] text-white hover:bg-[#007685]'
                            }`}
                        >
                            {extrayendo ? (
                                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Extrayendo...</>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Extraer Datos</>
                            )}
                        </button>

                        {error && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Contexto DUA */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contexto DUA</p>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Régimen</span>
                                <span className="font-semibold text-gray-700">10 - Importación Definitiva</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Incoterm</span>
                                <span className="font-bold text-[#008b9c]">FOB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Moneda</span>
                                <span className="font-bold text-[#008b9c]">USD</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Columna derecha: preview ── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-700">Vista Previa de Ítems</h2>
                        {items.length > 0 && (
                            <span className="px-2.5 py-1 bg-[#e0f7fa] text-[#008b9c] text-xs font-bold rounded-full">
                                {items.length} ítems
                            </span>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            <p className="text-sm text-gray-400 text-center">No hay datos extraídos</p>
                            <p className="text-xs text-gray-400 text-center mt-1">Cargue un archivo y ejecute la extracción para visualizar la clasificación técnica de los ítems de la factura.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                                            <th className="pb-3 pr-3">#</th>
                                            <th className="pb-3 pr-3">Descripción</th>
                                            <th className="pb-3 pr-3 text-right">Cant.</th>
                                            <th className="pb-3 pr-3 text-right">Valor</th>
                                            <th className="pb-3 text-right">Peso</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {items.map((it, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-2.5 pr-3 text-gray-400 text-xs">{i + 1}</td>
                                                <td className="py-2.5 pr-3 text-gray-800 font-medium max-w-[180px]">
                                                    <p className="truncate">{it.descripcion}</p>
                                                </td>
                                                <td className="py-2.5 pr-3 text-right text-gray-600">{it.cantidad}</td>
                                                <td className="py-2.5 pr-3 text-right text-gray-600">${it.valor.toFixed(2)}</td>
                                                <td className="py-2.5 text-right text-gray-600">{it.peso} kg</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => onIrEditar(items)}
                                    className="w-full py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a30] transition-colors"
                                >
                                    Clasificar Ítems →
                                </button>
                                <p className="text-xs text-gray-400 text-center mt-2">
                                    Revise los ítems y continue para asignar la partida arancelaria a cada uno.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
