import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const API = 'http://localhost:5018/api/ItemsFactura';
const DOCS_API = 'http://localhost:5018/api/DocumentosLogisticos';

function normalizarTexto(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function obtenerExtension(nombreArchivo) {
    return String(nombreArchivo || '').split('.').pop().toLowerCase();
}

function esImagen(nombreArchivo) {
    return ['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(obtenerExtension(nombreArchivo));
}

function esExcel(nombreArchivo) {
    return ['xls', 'xlsx'].includes(obtenerExtension(nombreArchivo));
}

function formatearNumero(valor) {
    if (valor === null || valor === undefined || valor === '') return '';
    const numero = Number(String(valor).replace(/[^\d,.-]/g, '').replace(',', '.'));
    return Number.isNaN(numero)
        ? String(valor)
        : numero.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseNumero(valor) {
    const texto = String(valor || '').replace(/[^\d,.-]/g, '').replace(',', '.');
    const numero = Number.parseFloat(texto);
    return Number.isNaN(numero) ? 0 : numero;
}

function extraerPalabras(result) {
    const palabras = [];
    for (const bloque of result?.data?.blocks || []) {
        for (const parrafo of bloque.paragraphs || []) {
            for (const linea of parrafo.lines || []) {
                for (const palabra of linea.words || []) {
                    const texto = String(palabra.text || '').trim();
                    if (!texto) continue;
                    palabras.push(palabra);
                }
            }
        }
    }
    return palabras;
}

function centroX(word) {
    return (word.bbox.x0 + word.bbox.x1) / 2;
}

function centroY(word) {
    return (word.bbox.y0 + word.bbox.y1) / 2;
}

function agruparPorFilas(words) {
    const ordenadas = [...words].sort((a, b) => centroY(a) - centroY(b) || a.bbox.x0 - b.bbox.x0);
    const filas = [];

    for (const word of ordenadas) {
        const y = centroY(word);
        const altura = Math.max(12, (word.bbox.y1 - word.bbox.y0) * 0.7);
        let fila = filas.find(item => Math.abs(item.centro - y) <= Math.max(altura, 10));

        if (!fila) {
            fila = { centro: y, words: [] };
            filas.push(fila);
        }

        fila.words.push(word);
        fila.centro = (fila.centro * (fila.words.length - 1) + y) / fila.words.length;
    }

    filas.forEach(fila => fila.words.sort((a, b) => a.bbox.x0 - b.bbox.x0));
    return filas;
}

function detectarCabeceras(filas) {
    const candidatos = [];
    const patrones = [
        { key: 'cantidad', regex: /cant|cantidad/ },
        { key: 'descripcion', regex: /descrip/ },
        { key: 'unidadMedida', regex: /unidad|medida|u\.m|um/ },
        { key: 'precioUnitario', regex: /precio|unitario|valor/ },
        { key: 'paisOrigen', regex: /pais|origen/ },
    ];

    filas.forEach((fila, index) => {
        const anchors = {};
        let score = 0;

        fila.words.forEach(word => {
            const texto = normalizarTexto(word.text);
            patrones.forEach(patron => {
                if (patron.regex.test(texto) && anchors[patron.key] === undefined) {
                    anchors[patron.key] = centroX(word);
                    score += 1;
                }
            });
        });

        if (score >= 3) {
            candidatos.push({ index, score, anchors });
        }
    });

    if (candidatos.length === 0) return null;
    candidatos.sort((a, b) => b.score - a.score);
    return candidatos[0];
}

function asignarPalabrasAColumnas(fila, columnas) {
    const textoColumnas = {
        cantidad: [],
        descripcion: [],
        unidadMedida: [],
        precioUnitario: [],
        paisOrigen: [],
    };

    if (!columnas.length) {
        return textoColumnas;
    }

    const limites = columnas.map((columna, index) => {
        const izquierda = index === 0 ? -Infinity : (columnas[index - 1].x + columna.x) / 2;
        const derecha = index === columnas.length - 1 ? Infinity : (columna.x + columnas[index + 1].x) / 2;
        return { key: columna.key, izquierda, derecha };
    });

    fila.words.forEach(word => {
        const x = centroX(word);
        const destino = limites.find(limite => x >= limite.izquierda && x < limite.derecha);
        if (destino) textoColumnas[destino.key].push(word.text);
    });

    return textoColumnas;
}

function construirItemsDesdeOCR(filas, cabecera) {
    if (!cabecera) {
        throw new Error('No se pudieron identificar las columnas de la imagen.');
    }

    const columnas = Object.entries(cabecera.anchors)
        .map(([key, x]) => ({ key, x }))
        .sort((a, b) => a.x - b.x);

    const items = [];

    filas.slice(cabecera.index + 1).forEach(fila => {
        const asignadas = asignarPalabrasAColumnas(fila, columnas);
        const cantidadTexto = asignadas.cantidad.join(' ').trim();
        const descripcion = asignadas.descripcion.join(' ').trim();
        const unidadMedida = asignadas.unidadMedida.join(' ').trim();
        const precioTexto = asignadas.precioUnitario.join(' ').trim();
        const paisOrigen = asignadas.paisOrigen.join(' ').trim();

        if (!cantidadTexto && !descripcion && !precioTexto) return;

        const cantidad = parseNumero(cantidadTexto);
        const precioUnitario = parseNumero(precioTexto);
        const costoTotal = cantidad * precioUnitario;

        if (!descripcion) return;

        items.push({
            cantidad: cantidadTexto || '0',
            descripcion,
            unidadMedida,
            precioUnitario,
            paisOrigen,
            costoTotal,
        });
    });

    return items;
}

function parsearExcel(buffer) {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const extracted = rows.slice(1)
        .filter(row => row.some(cell => cell !== undefined && cell !== ''))
        .map(row => {
            const cantidad = row[0] ?? '';
            const descripcion = row[1] ?? '';
            const unidadMedida = row[2] ?? '';
            const precioUnitario = Number(row[3]) || 0;
            const paisOrigen = row[4] ?? '';
            const costoTotal = Number(cantidad) * precioUnitario;
            return { cantidad, descripcion, unidadMedida, precioUnitario, paisOrigen, costoTotal };
        })
        .filter(item => String(item.descripcion || '').trim() !== '');

    if (extracted.length === 0) {
        throw new Error('El archivo no contiene ítems para extraer.');
    }

    return extracted;
}

const UNIDADES = ['U', 'PZA', 'KG', 'LT', 'MT', 'M2', 'M3', 'PAR', 'SET', 'JGO', 'DOC', 'CAJA', 'RLL', 'BL', 'GR'];

export default function ExtraerDatosFactura({ despacho, onVolver, onIrEditar, onGenerarBorrador }) {
    const [facturaGuardada, setFacturaGuardada] = useState(null);
    const [cargandoFactura, setCargandoFactura] = useState(true);
    const [procesandoFactura, setProcesandoFactura] = useState(false);
    const [descargandoFactura, setDescargandoFactura] = useState(false);
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const inputRef = useRef(null);

    // Borrador DAM
    const [borradorItems, setBorradorItems] = useState(null);

    useEffect(() => {
        let cancelado = false;

        const cargarFactura = async () => {
            setCargandoFactura(true);
            setError(null);
            setMensaje(null);
            setItems([]);

            try {
                const res = await fetch(`${DOCS_API}/${despacho.idDespacho}`);
                if (!res.ok) {
                    setFacturaGuardada(null);
                    return;
                }

                const docs = await res.json();
                const aprobadas = docs.filter(doc =>
                    doc.tipoDocumento === 'Factura Comercial' &&
                    doc.estado === 'Aprobado' &&
                    /\.(xlsx|xls|png|jpe?g|webp|bmp)$/i.test(doc.nombreArchivo || '')
                );

                const factura =
                    aprobadas.find(doc => esExcel(doc.nombreArchivo)) ||
                    aprobadas.find(doc => esImagen(doc.nombreArchivo)) ||
                    null;

                if (!cancelado) {
                    setFacturaGuardada(factura || null);
                }
            } catch {
                if (!cancelado) setFacturaGuardada(null);
            } finally {
                if (!cancelado) setCargandoFactura(false);
            }
        };

        cargarFactura();
        return () => { cancelado = true; };
    }, [despacho.idDespacho]);

    useEffect(() => {
        if (!facturaGuardada) return;

        let cancelado = false;

        const procesarFactura = async () => {
            setProcesandoFactura(true);
            setError(null);
            setMensaje(null);
            setItems([]);

            try {
                const res = await fetch(`${DOCS_API}/${facturaGuardada.idDocumentoLogistico}/archivo`);
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.mensaje || 'No se pudo abrir la factura guardada.');
                }

                const blob = await res.blob();
                const nombreArchivo = facturaGuardada.nombreArchivo || '';

                let extracted;
                if (esExcel(nombreArchivo)) {
                    extracted = parsearExcel(await blob.arrayBuffer());
                } else if (esImagen(nombreArchivo)) {
                    const { recognize } = await import('tesseract.js');
                    const resultado = await recognize(blob, 'spa+eng', {
                        logger: () => {},
                    });
                    const palabras = extraerPalabras(resultado);
                    const filas = agruparPorFilas(palabras);
                    const cabecera = detectarCabeceras(filas);
                    extracted = construirItemsDesdeOCR(filas, cabecera);

                    if (extracted.length === 0) {
                        throw new Error('La imagen no contiene ítems claros para extraer. Verifique la calidad o el encuadre.');
                    }
                } else {
                    throw new Error('El archivo aprobado no es un Excel ni una imagen compatible para extraer datos.');
                }

                if (!cancelado) {
                    setItems(extracted);
                    setMensaje('Datos extraídos correctamente desde la factura aprobada. Verifique y confirme antes de continuar.');
                }
            } catch (err) {
                if (!cancelado) {
                    setError(err?.message || 'No se pudo procesar la factura aprobada.');
                }
            } finally {
                if (!cancelado) setProcesandoFactura(false);
            }
        };

        procesarFactura();
        return () => { cancelado = true; };
    }, [facturaGuardada]);

    const handleDescargarFactura = async () => {
        if (!facturaGuardada) return;
        setDescargandoFactura(true);
        setError(null);

        try {
            const res = await fetch(`${DOCS_API}/${facturaGuardada.idDocumentoLogistico}/archivo`);
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.mensaje || 'No se pudo descargar la factura aprobada.');
                return;
            }

            const blob = await res.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const enlace = document.createElement('a');
            enlace.href = objectUrl;
            enlace.download = facturaGuardada.nombreArchivo || 'Factura_Comercial';
            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();
            window.URL.revokeObjectURL(objectUrl);
        } catch {
            setError('No se pudo descargar la factura aprobada.');
        } finally {
            setDescargandoFactura(false);
        }
    };

    const handleConfirmar = async () => {
        if (items.length === 0) return;
        setError(null);
        try {
            const payload = items.map(it => ({
                descripcion: String(it.descripcion),
                cantidad: Number(it.cantidad) || 0,
                valor: Number(it.precioUnitario) || 0,
                unidadMedida: String(it.unidadMedida || ''),
                paisOrigen: String(it.paisOrigen || '')
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
            // Obtener ítems guardados con sus idItem para el Borrador DAM
            const resItems = await fetch(`${API}/${despacho.idDespacho}`);
            const savedItems = resItems.ok ? await resItems.json() : [];
            const mapped = savedItems.map((it, i) => ({
                _idx: i,
                idItem: it.idItem,
                descripcion: it.descripcion,
                cantidad: it.cantidad,
                precioUnitario: it.valor,
                unidadMedida: it.unidadMedida || '',
                paisOrigen: it.paisOrigen || '',
                costoTotal: Number(it.cantidad) * Number(it.valor),
            }));
            setBorradorItems(mapped.length > 0 ? mapped : items.map((it, i) => ({ ...it, _idx: i })));
        } catch {
            setError('Error al conectar con el servidor.');
        }
    };

    const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    /* ── Borrador DAM ── */
    if (borradorItems !== null) {
        const totalCosto = borradorItems.reduce((s, it) => s + Number(it.costoTotal || 0), 0);

        return (
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Operatividad</button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    <span className="font-mono text-gray-500">Expediente {despacho.codigoOrden}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    <button onClick={() => setBorradorItems(null)} className="hover:text-[#008b9c] transition-colors">Extracción de Datos</button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-[#008b9c] font-semibold">Borrador DAM</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Borrador DAM</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Vista previa de los ítems extraídos. Use los botones de abajo para continuar.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-[#e0f7fa] text-[#008b9c] text-xs font-bold rounded-full">
                            {borradorItems.length} ítems
                        </span>
                        <button
                            onClick={() => setBorradorItems(null)}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            Volver a Extracción
                        </button>
                    </div>
                </div>

                {/* Tabla Borrador DAM */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#1a2540] text-white text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 text-center w-8">#</th>
                                    <th className="px-4 py-3 text-left">Descripción</th>
                                    <th className="px-4 py-3 text-center">U.M.</th>
                                    <th className="px-4 py-3 text-right">Cantidad</th>
                                    <th className="px-4 py-3 text-right">P. Unit. (USD)</th>
                                    <th className="px-4 py-3 text-left">País Origen</th>
                                    <th className="px-4 py-3 text-right">Costo Total (USD)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {borradorItems.map((it, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-center">
                                            <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-[#e0f7fa] text-[#008b9c] text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs">
                                            <p className="text-gray-800 font-medium text-xs truncate" title={it.descripcion}>{it.descripcion}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-[#008b9c] text-xs font-semibold">{it.unidadMedida || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-gray-700 text-xs font-mono">{it.cantidad}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-gray-600 text-xs font-mono">{fmt(it.precioUnitario)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-gray-500 text-xs">{it.paisOrigen || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-xs font-semibold font-mono text-gray-700">{fmt(it.costoTotal)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 border-t-2 border-gray-200">
                                    <td colSpan={6} className="px-4 py-3 text-xs font-bold text-gray-500 text-right uppercase tracking-wider">
                                        Total Costo (USD)
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-[#1a2540] font-mono">
                                        {fmt(totalCosto)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                        onClick={() => onIrEditar(borradorItems)}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-[#1a2540] text-[#1a2540] hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Editar Detalle de Mercancía
                    </button>
                    <button
                        onClick={() => onGenerarBorrador(borradorItems)}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#1a2540] text-white hover:bg-[#0f1a30] transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Generar Borrador DAM
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
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
                        La extracción se realiza automáticamente desde la factura comercial aprobada.
                    </p>
                </div>
                <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Volver
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-700 mb-4">Factura Fuente</h2>

                        {cargandoFactura ? (
                            <div className="mb-3 p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500">
                                Buscando factura comercial aprobada...
                            </div>
                        ) : facturaGuardada ? (
                            <div className="mb-3 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold">Factura comercial aprobada encontrada</p>
                                    <p>{facturaGuardada.nombreArchivo}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDescargarFactura}
                                    disabled={descargandoFactura}
                                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
                                >
                                    {descargandoFactura ? 'Descargando...' : 'Descargar'}
                                </button>
                            </div>
                        ) : (
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                                No hay una factura comercial aprobada aún. Debe aprobarla desde Documentación Logística.
                            </div>
                        )}

                        <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                            <p className="font-semibold mb-1">Formato esperado de lectura:</p>
                            <p>La factura debe contener columnas visibles para cantidad, descripción, unidad de medida, precio unitario y país de origen.</p>
                        </div>

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

                        <button
                            onClick={() => facturaGuardada && setFacturaGuardada({ ...facturaGuardada })}
                            disabled={!facturaGuardada || procesandoFactura}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                !facturaGuardada || procesandoFactura
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                    : 'bg-[#008b9c] text-white hover:bg-[#007685]'
                            }`}
                        >
                            {procesandoFactura ? (
                                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Procesando factura...</>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>REPROCESAR FACTURA</>
                            )}
                        </button>
                    </div>

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

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-700">Vista Previa de Ítems</h2>
                        {items.length > 0 && (
                            <span className="px-2.5 py-1 bg-[#e0f7fa] text-[#008b9c] text-xs font-bold rounded-full">
                                {items.length} ítems
                            </span>
                        )}
                    </div>

                    {procesandoFactura ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <svg className="w-10 h-10 animate-spin mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                            <p className="text-sm text-gray-500 text-center">Procesando la factura aprobada y extrayendo los datos...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            <p className="text-sm text-gray-400 text-center">No hay datos extraídos todavía.</p>
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
                                                <td className="py-2 pr-2 text-gray-800 font-medium max-w-[120px]"><p className="truncate">{it.descripcion}</p></td>
                                                <td className="py-2 pr-2 text-gray-500">{it.unidadMedida || '—'}</td>
                                                <td className="py-2 pr-2 text-right text-gray-600">{formatearNumero(it.precioUnitario)}</td>
                                                <td className="py-2 pr-2 text-gray-500">{it.paisOrigen || '—'}</td>
                                                <td className="py-2 text-right font-semibold text-gray-700">{formatearNumero(it.costoTotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-gray-200">
                                            <td colSpan={5} className="pt-2 text-xs font-semibold text-gray-500 text-right pr-2">Total Costo:</td>
                                            <td className="pt-2 text-right text-sm font-bold text-[#1a2540]">{formatearNumero(items.reduce((s, it) => s + Number(it.costoTotal), 0))}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleConfirmar}
                                    className="w-full py-2.5 text-sm font-semibold rounded-lg transition-colors bg-[#1a2540] text-white hover:bg-[#0f1a30]"
                                >
                                    CONFIRMAR EXTRACCIÓN
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
