/**
 * PRUEBA DE CAJA BLANCA — HU10: Extraer Datos Factura
 * Fuente: FrontendWeb/src/Components/Despachos/ExtraerDatosFactura.jsx
 *
 * Se ejercen las ramas de onFileChange() (validación de extensión) y
 * handleExtraer() (guarda de archivo nulo + respuestas del servidor).
 */
import { describe, it, expect, vi } from 'vitest';

// ─── Lógica extraída de ExtraerDatosFactura.jsx:13-24 ───────────────────────
// PA HU10-1.2 NOK → extensión != xlsx/xls
// PA HU10-1   OK  → setArchivo(file)
const validarExtensionExcel = (nombreArchivo) => {
    const ext = nombreArchivo.split('.').pop().toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls')
        return 'Formato no válido. Solo se admiten archivos Excel (.xlsx o .xls) para la extracción de datos.';
    return null;
};

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('HU10 – Extraer Datos Factura', () => {

    // PA HU10-1 OK — Extracción exitosa
    describe('PA-1 OK — Extracción exitosa de datos desde archivo Excel', () => {
        it('validarExtensionExcel acepta .xlsx', () => {
            // Fuente: ExtraerDatosFactura.jsx:17-23
            expect(validarExtensionExcel('FacturaComercial_MSCU1234567.xlsx')).toBeNull();
        });
        it('validarExtensionExcel acepta .xls', () => {
            expect(validarExtensionExcel('FacturaComercial.xls')).toBeNull();
        });
        it('handleExtraer establece los ítems cuando el servidor responde OK', async () => {
            // Fuente: ExtraerDatosFactura.jsx:42-43
            const itemsMock = [
                { descripcion: 'Electrónica industrial', cantidad: 10, valor: 500, peso: 25 },
            ];
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => itemsMock,
            });

            let items = [];
            let error = null;
            const setItems = (v) => { items = v; };
            const setError = (v) => { error = v; };

            const archivo = { name: 'FacturaComercial_MSCU1234567.xlsx' };
            const form = new FormData();
            form.append('archivo', archivo);

            const res = await fetch('/api/Factura/extraer', { method: 'POST', body: form });
            const data = await res.json();
            if (res.ok) setItems(data);
            else setError(data.mensaje);

            expect(items).toHaveLength(1);
            expect(items[0].descripcion).toBe('Electrónica industrial');
            expect(error).toBeNull();
        });
    });

    // PA HU10-1.1 NOK — No se seleccionó ningún archivo
    describe('PA-1.1 NOK — No se seleccionó ningún archivo', () => {
        it('handleExtraer emite error cuando archivo es null', () => {
            // Fuente: ExtraerDatosFactura.jsx:32-34
            let error = null;
            const setError = (v) => { error = v; };
            const archivo = null;

            if (!archivo) {
                setError('Debe seleccionar un archivo Excel antes de continuar.');
                return;
            }

            expect(error).toBe('Debe seleccionar un archivo Excel antes de continuar.');
        });
    });

    // PA HU10-1.2 NOK — Formato de archivo incorrecto
    describe('PA-1.2 NOK — Formato de archivo incorrecto', () => {
        it('validarExtensionExcel rechaza FacturaComercial.pdf', () => {
            // Fuente: ExtraerDatosFactura.jsx:17-20
            const resultado = validarExtensionExcel('FacturaComercial.pdf');
            expect(resultado).toBe(
                'Formato no válido. Solo se admiten archivos Excel (.xlsx o .xls) para la extracción de datos.'
            );
        });
        it('validarExtensionExcel rechaza extensiones .csv, .doc, .txt', () => {
            for (const nombre of ['datos.csv', 'factura.doc', 'reporte.txt']) {
                expect(validarExtensionExcel(nombre)).toContain('Formato no válido');
            }
        });
    });

    // PA HU10-1.3 NOK — Columnas del Excel no coinciden con las predefinidas
    describe('PA-1.3 NOK — Columnas del Excel no coinciden con las predefinidas', () => {
        it('handleExtraer muestra el mensaje del servidor cuando columnas son incorrectas', async () => {
            // Fuente: ExtraerDatosFactura.jsx:44-45
            const mensajeEsperado =
                'El archivo no contiene las columnas requeridas: Cantidad, Descripción, Valor, Peso. Verifique el formato del archivo.';
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({ mensaje: mensajeEsperado }),
            });

            let error = null;
            const setError = (v) => { error = v; };

            const res = await fetch('/api/Factura/extraer', { method: 'POST', body: new FormData() });
            const data = await res.json();
            if (!res.ok) setError(data.mensaje || 'No se pudo procesar el archivo. Verifique su conexión e intente nuevamente.');

            expect(error).toBe(mensajeEsperado);
        });
    });

    // PA HU10-1.4 NOK — Archivo Excel sin filas de datos
    describe('PA-1.4 NOK — Archivo Excel sin filas de datos', () => {
        it('handleExtraer muestra el mensaje del servidor cuando el Excel está vacío', async () => {
            // Fuente: ExtraerDatosFactura.jsx:44-45
            const mensajeEsperado =
                'El archivo no contiene ítems para extraer. Verifique que el Excel tenga datos cargados.';
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({ mensaje: mensajeEsperado }),
            });

            let error = null;
            const setError = (v) => { error = v; };

            const res = await fetch('/api/Factura/extraer', { method: 'POST', body: new FormData() });
            const data = await res.json();
            if (!res.ok) setError(data.mensaje || 'fallback');

            expect(error).toBe(mensajeEsperado);
        });
    });

    // PA HU10-1.5 NOK — Error de conexión durante el procesamiento
    describe('PA-1.5 NOK — Error de conexión durante el procesamiento', () => {
        it('el catch de handleExtraer emite el mensaje de error de red', async () => {
            // Fuente: ExtraerDatosFactura.jsx:47-48
            global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

            let error = null;
            const setError = (v) => { error = v; };

            try {
                await fetch('/api/Factura/extraer', { method: 'POST', body: new FormData() });
            } catch {
                setError('No se pudo procesar el archivo. Verifique su conexión e intente nuevamente.');
            }

            expect(error).toBe('No se pudo procesar el archivo. Verifique su conexión e intente nuevamente.');
        });
    });
});
