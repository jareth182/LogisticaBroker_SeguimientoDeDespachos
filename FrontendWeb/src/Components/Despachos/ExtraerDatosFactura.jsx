import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const API = 'http://localhost:5018/api/ItemsFactura';

export default function ExtraerDatosFactura({ despacho, onVolver, onIrEditar }) {
    const [archivo, setArchivo]       = useState(null);
    const [dragging, setDragging]     = useState(false);
    const [extrayendo, setExtrayendo] = useState(false);
    const [guardando, setGuardando]   = useState(false);
    const [items, setItems]           = useState([]);
    const [error, setError]           = useState(null);
    const [mensaje, setMensaje]       = useState(null);
    const inputRef = useRef();

    const onFileChange = (file) => {
        if (!file) return;
        setError(null);
        setItems([]);
        setMensaje(null);
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'xlsx' && ext !== 'xls') {
            setError('El formato del archivo no es válido. Solo se aceptan XLSX y XLS');
            setArchivo(null);
            return;
        }
        setArchivo(file);
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragging(false);
        onFileChange(e.dataTransfer.files[0]);
    };

    const handleExtraer = () => {
        if (!archivo) {
            setError('Debe seleccionar un archivo Excel antes de continuar.');
            return;
        }
        setExtrayendo(true); setError(null); setMensaje(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                const extracted = rows.slice(1)
                    .filter(row => row.some(cell => cell !== undefined && cell !== ''))
                    .map(row => {
                        const cantidad      = row[0] ?? '';
                        const descripcion   = row[1] ?? '';
                        const unidadMedida  = row[2] ?? '';
                        const precioUnitario = Number(row[3]) || 0;
                        const paisOrigen    = row[4] ?? '';
                        const costoTotal    = Number(cantidad) * precioUnitario;
                        return { cantidad, descripcion, unidadMedida, precioUnitario, paisOrigen, costoTotal };
                    });

                if (extracted.length === 0) {
                    setError('El archivo no contiene ítems para extraer');
                } else {
                    setItems(extracted);
                    setMensaje('Datos extraídos correctamente. Verifique y complete la información antes de continuar.');
                }
            } catch {
                setError('No se pudo procesar el archivo. Verifica que el archivo no esté dañado');
            } finally {
                setExtrayendo(false);
            }
        };
        reader.onerror = () => {
            setError('No se pudo leer el archivo.');
            setExtrayendo(false);
        };
        reader.readAsArrayBuffer(archivo);
    };

    const handleConfirmar = async () => {
        if (items.length === 0) return;
        setGuardando(true);
        setError(null);
        try {
            const payload = items.map(it => ({
                descripcion:   String(it.descripcion),
                cantidad:      Number(it.cantidad) || 0,
                valor:         Number(it.precioUnitario) || 0,
                unidadMedida:  String(it.unidadMedida || ''),
                paisOrigen:    String(it.paisOrigen || '')
            }));
            const res = await fetch(`${API}/${despacho.idDespacho}/guardar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const d = await res.json();
                setError(d.mensaje || 'Error al guardar los ítems.');
                return;
            }
            onIrEditar(items);
        } catch {
            setError('Error al conectar con el servidor.');
        } finally {
            setGuardando(false);
        }
    };

    const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
                {/* ── Columna izquierda ── */}
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-700 mb-4">Archivo Fuente</h2>

                        {/* Instrucciones de columnas */}
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                            <p className="font-semibold mb-1">Formato esperado del Excel (columnas en orden):</p>
                            <p>A: Cantidad · B: Descripción · C: Unidad de Medida · D: Precio Unitario · E: País de Origen</p>
                        </div>

                        {/* Drag & drop */}
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all mb-3 ${
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
                                    <p className="text-sm font-semibold text-gray-500">Arrastre el archivo Excel aquí o haga clic para examinar</p>
                                    <p className="text-xs text-gray-400 mt-1">(XLSX, XLS)</p>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleExtraer}
                            disabled={extrayendo || !archivo}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                extrayendo || !archivo
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                    : 'bg-[#008b9c] text-white hover:bg-[#007685]'
                            }`}
                        >
                            {extrayendo ? (
                                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Extrayendo...</>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>EXTRAER DATOS FACTURA</>
                            )}
                        </button>

                        {error && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}
                        {mensaje && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                                {mensaje}
                            </div>
                        )}
                    </div>

                    {/* Contexto DUA */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Contexto DUA</p>
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

                {/* ── Columna derecha: Vista Previa ── */}
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
                            <p className="text-sm text-gray-400 text-center">No hay datos extraídos. Cargue un archivo y ejecute la extracción para visualizar los ítems.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 font-semibold text-gray-500 uppercase">
                                            <th className="pb-2 pr-2 text-right">Cant.</th>
                                            <th className="pb-2 pr-2">Descripción</th>
                                            <th className="pb-2 pr-2">U.M.</th>
                                            <th className="pb-2 pr-2 text-right">P. Unit.</th>
                                            <th className="pb-2 pr-2">País</th>
                                            <th className="pb-2 text-right">Costo Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {items.map((it, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-2 pr-2 text-right text-gray-600">{it.cantidad}</td>
                                                <td className="py-2 pr-2 text-gray-800 font-medium max-w-[120px]">
                                                    <p className="truncate">{it.descripcion}</p>
                                                </td>
                                                <td className="py-2 pr-2 text-gray-500">{it.unidadMedida || '—'}</td>
                                                <td className="py-2 pr-2 text-right text-gray-600">{fmt(it.precioUnitario)}</td>
                                                <td className="py-2 pr-2 text-gray-500">{it.paisOrigen || '—'}</td>
                                                <td className="py-2 text-right font-semibold text-gray-700">{fmt(it.costoTotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-gray-200">
                                            <td colSpan={5} className="pt-2 text-xs font-semibold text-gray-500 text-right pr-2">Total Costo:</td>
                                            <td className="pt-2 text-right text-sm font-bold text-[#1a2540]">
                                                {fmt(items.reduce((s, it) => s + Number(it.costoTotal), 0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleConfirmar}
                                    disabled={guardando}
                                    className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                                        guardando
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-[#1a2540] text-white hover:bg-[#0f1a30]'
                                    }`}
                                >
                                    {guardando ? 'Guardando...' : 'CONFIRMAR EXTRACCIÓN'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
