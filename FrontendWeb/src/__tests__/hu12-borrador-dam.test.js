/**
 * PRUEBA DE CAJA BLANCA — HU12: Generar Borrador DAM
 * Fuente: FrontendWeb/src/Components/Despachos/BorradorDAMFinal.jsx
 *
 * Se ejercen las ramas de handleGenerar(): la guarda del checkbox
 * confirmado, la respuesta OK del servidor y los distintos NOK que
 * provienen del backend (ítems sin partida, ya generado, error de PDF).
 */
import { describe, it, expect, vi } from 'vitest';

// ─── Replica de la lógica de handleGenerar() ────────────────────────────────
// BorradorDAMFinal.jsx:11-29
const simularHandleGenerar = async ({ confirmado, fetchMock }) => {
    let resultado = null;
    let error = null;

    if (!confirmado) return { resultado, error }; // botón deshabilitado

    global.fetch = fetchMock;

    try {
        const res = await fetch('/api/DAM/1/confirmar-borrador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (res.ok) { // PA HU12-1 OK
            resultado = data;
        } else { // PA HU12-1.1/1.2/1.4 NOK
            error = data.mensaje || 'No se pudo generar el borrador. Verifique su conexión e intente nuevamente.';
        }
    } catch { // PA HU12-1.3 NOK
        error = 'No se pudo generar el borrador. Verifique su conexión e intente nuevamente.';
    }

    return { resultado, error };
};

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('HU12 – Generar Borrador DAM', () => {

    // PA HU12-1 OK — Generación exitosa del borrador DAM
    describe('PA-1 OK — Generación exitosa del borrador DAM', () => {
        it('handleGenerar establece resultado cuando el servidor responde OK', async () => {
            // Fuente: BorradorDAMFinal.jsx:20-22
            const payload = {
                estado: 'Borrador Finalizado',
                totalItems: 3,
                pesoBrutoTotal: 150,
                valorCifTotal: 9000,
                tributos: { adValorem: 540, igv: 1526.4, ipm: 190.8, total: 2257.2 },
                items: [],
            };
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => payload,
            });

            const { resultado, error } = await simularHandleGenerar({ confirmado: true, fetchMock });

            expect(resultado.estado).toBe('Borrador Finalizado');
            expect(resultado.totalItems).toBe(3);
            expect(error).toBeNull();
        });

        it('no genera nada si el checkbox no está confirmado', async () => {
            // Fuente: BorradorDAMFinal.jsx:12 → if (!confirmado) return
            const fetchMock = vi.fn();
            const { resultado, error } = await simularHandleGenerar({ confirmado: false, fetchMock });

            expect(fetchMock).not.toHaveBeenCalled();
            expect(resultado).toBeNull();
            expect(error).toBeNull();
        });
    });

    // PA HU12-1.1 NOK — Existen ítems sin partida arancelaria
    describe('PA-1.1 NOK — Existen ítems sin partida arancelaria asignada', () => {
        it('handleGenerar captura el mensaje del backend sobre ítems sin partida', async () => {
            // Fuente: BorradorDAMFinal.jsx:23-25
            const mensajeEsperado =
                'No se puede generar el borrador. Hay ítems sin partida arancelaria asignada. Complete todos los campos antes de continuar.';
            const fetchMock = vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({ mensaje: mensajeEsperado }),
            });

            const { resultado, error } = await simularHandleGenerar({ confirmado: true, fetchMock });

            expect(error).toBe(mensajeEsperado);
            expect(resultado).toBeNull();
        });
    });

    // PA HU12-1.2 NOK — Error al generar el PDF consolidado
    describe('PA-1.2 NOK — Error al generar el PDF consolidado del borrador', () => {
        it('handleGenerar muestra el mensaje del servidor cuando el PDF falla', async () => {
            // Fuente: BorradorDAMFinal.jsx:23-25
            const mensajeEsperado =
                'No se pudo generar el documento PDF del borrador. Intente nuevamente más tarde.';
            const fetchMock = vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({ mensaje: mensajeEsperado }),
            });

            const { resultado, error } = await simularHandleGenerar({ confirmado: true, fetchMock });

            expect(error).toBe(mensajeEsperado);
        });
    });

    // PA HU12-1.3 NOK — Error de conexión al procesar la generación
    describe('PA-1.3 NOK — Error de conexión al procesar la generación', () => {
        it('el catch captura el error de red y establece el mensaje de conexión', async () => {
            // Fuente: BorradorDAMFinal.jsx:26-27
            const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

            const { resultado, error } = await simularHandleGenerar({ confirmado: true, fetchMock });

            expect(error).toBe('No se pudo generar el borrador. Verifique su conexión e intente nuevamente.');
            expect(resultado).toBeNull();
        });
    });

    // PA HU12-1.4 NOK — Borrador ya generado previamente
    describe('PA-1.4 NOK — Borrador ya generado previamente para el mismo despacho', () => {
        it('handleGenerar captura el mensaje del backend cuando el borrador ya existe', async () => {
            // Fuente: BorradorDAMFinal.jsx:23-25
            const mensajeEsperado =
                'Este despacho ya cuenta con un borrador DAM generado. Si desea regenerarlo, debe revertir el estado del expediente desde el panel de administración.';
            const fetchMock = vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({ mensaje: mensajeEsperado }),
            });

            const { resultado, error } = await simularHandleGenerar({ confirmado: true, fetchMock });

            expect(error).toBe(mensajeEsperado);
            expect(resultado).toBeNull();
        });
    });
});
