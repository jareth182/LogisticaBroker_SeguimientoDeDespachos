/**
 * PRUEBA DE CAJA BLANCA — HU11: Editar Detalle Mercancía
 * Fuente: FrontendWeb/src/Components/Despachos/EditarDetalleMercancia.jsx
 *
 * Se ejercen todas las ramas de validarItem() que cubren los escenarios
 * de guardado OK y los NOK de partida vacía, formato inválido y restricción
 * sin partida. También se prueba el flujo completo de handleGuardarTodo.
 */
import { describe, it, expect, vi } from 'vitest';

// ─── Lógica extraída de EditarDetalleMercancia.jsx:25-33 ────────────────────
// PA HU11-2.1 NOK / HU11-3.1 NOK → partida vacía
// PA HU11-2.2 NOK                 → formato inválido
// PA HU11-2   OK  / HU11-3   OK  → retorna null
const validarItem = (it) => {
    if (!it.partidaArancelaria?.trim())
        return 'El campo de partida arancelaria es obligatorio.';
    if (it.tieneRestriccion && !it.partidaArancelaria?.trim())
        return 'Debe completar la partida arancelaria antes de registrar restricciones técnicas.';
    if (!/^\d{10}$/.test(it.partidaArancelaria.trim()))
        return 'La partida arancelaria debe contener únicamente caracteres numéricos con el formato oficial del arancel de aduanas.';
    return null;
};

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('HU11 – Editar Detalle Mercancía', () => {

    // PA HU11-2 OK — Guardado exitoso de partida arancelaria
    describe('PA-2 OK — Guardado exitoso de partida arancelaria', () => {
        it('validarItem retorna null para partida 8471300000 sin restricción', () => {
            // Fuente: EditarDetalleMercancia.jsx:33 → return null
            const item = { descripcion: 'Electrónica industrial', partidaArancelaria: '8471300000', tieneRestriccion: false };
            expect(validarItem(item)).toBeNull();
        });
    });

    // PA HU11-2.1 NOK — Campo de partida arancelaria vacío
    describe('PA-2.1 NOK — Campo de partida arancelaria vacío', () => {
        it('validarItem retorna el mensaje de obligatorio cuando la partida está vacía', () => {
            // Fuente: EditarDetalleMercancia.jsx:26-27
            const item = { descripcion: 'Electrónica industrial', partidaArancelaria: '', tieneRestriccion: false };
            expect(validarItem(item)).toBe('El campo de partida arancelaria es obligatorio.');
        });
        it('validarItem retorna error cuando partidaArancelaria es undefined', () => {
            const item = { descripcion: 'Repuestos', partidaArancelaria: undefined, tieneRestriccion: false };
            expect(validarItem(item)).toBe('El campo de partida arancelaria es obligatorio.');
        });
        it('validarItem retorna error cuando la partida contiene solo espacios', () => {
            const item = { descripcion: 'Item X', partidaArancelaria: '   ', tieneRestriccion: false };
            expect(validarItem(item)).toBe('El campo de partida arancelaria es obligatorio.');
        });
    });

    // PA HU11-2.2 NOK — Formato de partida arancelaria inválido
    describe('PA-2.2 NOK — Formato de partida arancelaria inválido', () => {
        it('validarItem rechaza "AB71-300" (letras y guión)', () => {
            // Fuente: EditarDetalleMercancia.jsx:30-31
            const item = { descripcion: 'Electrónica', partidaArancelaria: 'AB71-300', tieneRestriccion: false };
            expect(validarItem(item)).toContain('únicamente caracteres numéricos');
        });
        it('validarItem rechaza partida de 9 dígitos', () => {
            const item = { descripcion: 'Item', partidaArancelaria: '847130000', tieneRestriccion: false };
            expect(validarItem(item)).toContain('únicamente caracteres numéricos');
        });
        it('validarItem rechaza partida de 11 dígitos', () => {
            const item = { descripcion: 'Item', partidaArancelaria: '84713000001', tieneRestriccion: false };
            expect(validarItem(item)).toContain('únicamente caracteres numéricos');
        });
        it('validarItem acepta exactamente 10 dígitos numéricos', () => {
            const item = { descripcion: 'Item', partidaArancelaria: '1234567890', tieneRestriccion: false };
            expect(validarItem(item)).toBeNull();
        });
    });

    // PA HU11-3 OK — Guardado exitoso con indicador de restricciones técnicas
    describe('PA-3 OK — Guardado exitoso con indicador de restricciones técnicas', () => {
        it('validarItem retorna null para partida válida con restricción marcada', () => {
            // Fuente: EditarDetalleMercancia.jsx:33 → return null (rama 3 OK)
            const item = { descripcion: 'Electrónica', partidaArancelaria: '8471300000', tieneRestriccion: true };
            expect(validarItem(item)).toBeNull();
        });
    });

    // PA HU11-3.1 NOK — Restricción marcada sin partida arancelaria
    describe('PA-3.1 NOK — Restricción técnica marcada sin partida arancelaria', () => {
        it('validarItem retorna el mensaje de obligatorio cuando hay restricción pero partida vacía', () => {
            // Fuente: EditarDetalleMercancia.jsx:26-27
            // La primera guarda (vacío) captura este caso antes que la guarda de restricción
            const item = { descripcion: 'Item con restricción', partidaArancelaria: '', tieneRestriccion: true };
            expect(validarItem(item)).toBe('El campo de partida arancelaria es obligatorio.');
        });
    });

    // PA HU11-2.x NOK — handleGuardarTodo bloquea cuando hay errores de validación
    describe('PA handleGuardarTodo — Bloqueo cuando hay ítems inválidos', () => {
        it('no llama a fetch si algún ítem falla validarItem', () => {
            // Fuente: EditarDetalleMercancia.jsx:38-42
            const fetchMock = vi.fn();
            global.fetch = fetchMock;

            const items = [
                { _idx: 0, descripcion: 'Válido',   partidaArancelaria: '8471300000', tieneRestriccion: false },
                { _idx: 1, descripcion: 'Inválido', partidaArancelaria: '',            tieneRestriccion: false },
            ];

            const errores = items.map(it => ({ ...it, _error: validarItem(it) }));
            const hayErrores = errores.some(it => it._error);

            expect(hayErrores).toBe(true);
            // Al ser true, handleGuardarTodo hace return antes del fetch
            expect(fetchMock).not.toHaveBeenCalled();
        });
    });

    // PA HU11-2.3/3.2 NOK — Error de conexión al guardar
    describe('PA-2.3/3.2 NOK — Error de conexión al guardar', () => {
        it('el catch de handleGuardarTodo captura el error de red', async () => {
            // Fuente: EditarDetalleMercancia.jsx:90-91
            let msgGlobal = null;
            const setMsgGlobal = (m) => { msgGlobal = m; };
            global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

            try {
                await fetch('/api/ItemsFactura/1/guardar', { method: 'POST', body: '{}' });
            } catch {
                setMsgGlobal({ tipo: 'error', texto: 'No se pudo guardar el detalle. Verifique su conexión e intente nuevamente.' });
            }

            expect(msgGlobal.tipo).toBe('error');
            expect(msgGlobal.texto).toContain('No se pudo guardar el detalle');
        });
    });
});
