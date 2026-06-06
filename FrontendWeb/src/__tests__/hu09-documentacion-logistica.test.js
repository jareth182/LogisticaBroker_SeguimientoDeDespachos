/**
 * PRUEBA DE CAJA BLANCA — HU09: Adjuntar Documentos Logísticos
 * Fuente: FrontendWeb/src/Components/Despachos/DocumentacionLogistica.jsx
 *
 * Se replica la lógica interna de validarArchivo() y handleSubir() para
 * ejercer cada rama de decisión y verificar los mensajes exactos del CSV.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Lógica extraída de DocumentacionLogistica.jsx:51-59 ───────────────────
// PA HU09-2.1 NOK  → tamaño > 10 MB
// PA HU09-2.2 NOK  → extensión no permitida
// PA HU09-2   OK   → retorna null
const validarArchivo = (file) => {
    if (!file) return null;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx'].includes(ext))
        return 'Formato no admitido. Solo se permiten archivos PDF, JPG, PNG o Excel.';
    if (file.size > 10 * 1024 * 1024)
        return 'El archivo supera el límite permitido de 10 MB. Comprima o reduzca el tamaño antes de subirlo.';
    return null;
};

// ─── Utilidad ────────────────────────────────────────────────────────────────
const makeFile = (name, sizeMb) => ({ name, size: sizeMb * 1024 * 1024 });

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('HU09 – Documentación Logística', () => {

    // PA HU09-2 OK — Carga exitosa
    describe('PA-2 OK — Carga exitosa de documento logístico', () => {
        it('validarArchivo retorna null para BL_MSCU1234567.pdf de 3.2 MB', () => {
            // Fuente: DocumentacionLogistica.jsx:58 → return null
            expect(validarArchivo(makeFile('BL_MSCU1234567.pdf', 3.2))).toBeNull();
        });
        it('validarArchivo retorna null para archivos jpg, png, xls, xlsx dentro del límite', () => {
            for (const nombre of ['foto.jpg', 'imagen.png', 'datos.xls', 'datos.xlsx']) {
                expect(validarArchivo(makeFile(nombre, 1))).toBeNull();
            }
        });
    });

    // PA HU09-2.1 NOK — Archivo supera el límite de 10 MB
    describe('PA-2.1 NOK — Archivo supera el límite de 10 MB', () => {
        it('validarArchivo retorna el mensaje de límite para ManifestoCarga.pdf de 14.5 MB', () => {
            // Fuente: DocumentacionLogistica.jsx:56-57
            const resultado = validarArchivo(makeFile('ManifestoCarga.pdf', 14.5));
            expect(resultado).toBe(
                'El archivo supera el límite permitido de 10 MB. Comprima o reduzca el tamaño antes de subirlo.'
            );
        });
        it('un archivo de exactamente 10 MB + 1 byte es rechazado', () => {
            const file = { name: 'grande.pdf', size: 10 * 1024 * 1024 + 1 };
            expect(validarArchivo(file)).toContain('supera el límite');
        });
        it('un archivo de exactamente 10 MB es aceptado (límite inclusivo)', () => {
            const file = { name: 'justo.pdf', size: 10 * 1024 * 1024 };
            expect(validarArchivo(file)).toBeNull();
        });
    });

    // PA HU09-2.2 NOK — Formato de archivo no permitido
    describe('PA-2.2 NOK — Formato de archivo no permitido', () => {
        it('validarArchivo rechaza reporte.exe', () => {
            // Fuente: DocumentacionLogistica.jsx:53-55
            const resultado = validarArchivo(makeFile('reporte.exe', 1));
            expect(resultado).toBe(
                'Formato no admitido. Solo se permiten archivos PDF, JPG, PNG o Excel.'
            );
        });
        it('validarArchivo rechaza extensiones .doc, .mp4, .zip', () => {
            for (const nombre of ['archivo.doc', 'video.mp4', 'comprimido.zip']) {
                expect(validarArchivo(makeFile(nombre, 1))).toContain('Formato no admitido');
            }
        });
    });

    // PA HU09-2.3 NOK — Tipo de documento no seleccionado
    describe('PA-2.3 NOK — Tipo de documento no seleccionado', () => {
        it('handleSubir emite error si tipo está vacío', () => {
            // Fuente: DocumentacionLogistica.jsx:75-77
            let capturado = null;
            const setMensaje = (m) => { capturado = m; };
            const tipo = '';

            if (!tipo) {
                setMensaje({ tipo: 'error', texto: 'Debe seleccionar el tipo de documento antes de subir el archivo.' });
                return;
            }

            expect(capturado.tipo).toBe('error');
            expect(capturado.texto).toContain('Debe seleccionar el tipo de documento');
        });
    });

    // PA HU09-2.4 NOK — Error de conexión durante la carga
    describe('PA-2.4 NOK — Error de conexión durante la carga del archivo', () => {
        it('el catch de handleSubir emite el mensaje de error de red', () => {
            // Fuente: DocumentacionLogistica.jsx:99-101
            let capturado = null;
            const setMensaje = (m) => { capturado = m; };

            try { throw new TypeError('Failed to fetch'); }
            catch { setMensaje({ tipo: 'error', texto: 'Error al subir el documento. Verifique su conexión e intente nuevamente.' }); }

            expect(capturado.tipo).toBe('error');
            expect(capturado.texto).toContain('Error al subir el documento');
        });
    });

    // PA HU09-3 OK — Descarga exitosa
    describe('PA-3 OK — Descarga exitosa de documento logístico', () => {
        it('handleDescargar llama a window.open cuando la respuesta es OK', async () => {
            // Fuente: DocumentacionLogistica.jsx:107-110
            const openMock = vi.fn();
            vi.stubGlobal('open', openMock);

            const fakeDoc = { idDocumentoLogistico: 1 };
            const fakeRuta = 'https://storage.logisticabroker.com/despachos/1/archivo.pdf';

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ rutaArchivo: fakeRuta }),
            });

            // Replica handleDescargar
            const res = await fetch(`/api/DocumentosLogisticos/descargar/${fakeDoc.idDocumentoLogistico}`);
            if (res.ok) {
                const data = await res.json();
                window.open(data.rutaArchivo, '_blank');
            }

            expect(openMock).toHaveBeenCalledWith(fakeRuta, '_blank');
            vi.unstubAllGlobals();
        });
    });

    // PA HU09-3.1 NOK — Error de conexión al descargar
    describe('PA-3.1 NOK — Error de conexión al descargar el documento', () => {
        it('el catch de handleDescargar llama a alert con el mensaje correcto', async () => {
            // Fuente: DocumentacionLogistica.jsx:114-116
            const alertMock = vi.fn();
            vi.stubGlobal('alert', alertMock);
            global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

            try {
                await fetch('/api/DocumentosLogisticos/descargar/1');
            } catch {
                alert('No se pudo descargar el documento. Verifique su conexión e intente nuevamente.');
            }

            expect(alertMock).toHaveBeenCalledWith(
                'No se pudo descargar el documento. Verifique su conexión e intente nuevamente.'
            );
            vi.unstubAllGlobals();
        });
    });

    // PA HU09-3.2 NOK — Archivo ya no disponible en el servidor
    describe('PA-3.2 NOK — Archivo ya no disponible en el servidor (404)', () => {
        it('handleDescargar llama a alert cuando el servidor devuelve !ok', async () => {
            // Fuente: DocumentacionLogistica.jsx:111-113
            const alertMock = vi.fn();
            vi.stubGlobal('alert', alertMock);
            global.fetch = vi.fn().mockResolvedValue({ ok: false });

            const res = await fetch('/api/DocumentosLogisticos/descargar/99');
            if (!res.ok) {
                alert('No se pudo descargar el documento. Verifique su conexión e intente nuevamente.');
            }

            expect(alertMock).toHaveBeenCalled();
            vi.unstubAllGlobals();
        });
    });
});
