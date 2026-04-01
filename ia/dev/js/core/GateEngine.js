// =============================================================================
// TEAMTOWERS SOS V10.1 — GATE ENGINE
// Ruta: /ia/dev/js/core/GateEngine.js
//
// Enforcement del Codex SOS en runtime.
// Intercepta store.dispatch() antes de que mute el estado.
// Si un action viola una gate → bloquea + emite sos:gate-blocked.
//
// Gates del Codex V10:
//   1. No localStorage directa          (block)
//   2. No mutación directa store.state  (block)
//   3. Slices siempre .toFixed(3)       (warn)
//   4. No import de store fuera de core (warn)
//
// API estática:
//   check(action, gates)            → { blocked, level, reason?, gate? }
//   wrap(dispatch, gates, options)  → safeDispatch function
//   promote(gate)                   → añade gate a DEFAULT_GATES (idempotente)
//   loadGates(customGates)          → fusiona con DEFAULT_GATES
//   DEFAULT_GATES                   → array de gates del Codex
// =============================================================================

// ─── Serializar un action a string para matching ──────────────────────────────
function _serialize(action) {
    try { return JSON.stringify(action); } catch(_) { return String(action); }
}

// ═════════════════════════════════════════════════════════════════════════════
export class GateEngine {

    // ── Gates del Codex SOS V10 ───────────────────────────────────────────────
    static DEFAULT_GATES = [
        {
            name:    'no-localStorage-direct',
            pattern: 'localStorage',
            level:   'block',
            message: 'Codex V10: Zero localStorage. Usar KB.saveNode() via store.dispatch().',
            enabled: true,
        },
        {
            name:    'no-store-state-mutation',
            pattern: 'store.state',
            level:   'block',
            message: 'Codex V10: NUNCA mutación directa de store.state. Usar store.dispatch().',
            enabled: true,
        },
        {
            name:    'slices-toFixed3-precision',
            pattern: 'slices',
            level:   'warn',
            message: 'Codex V10: Slices siempre con .toFixed(3). Verificar precisión decimal.',
            enabled: true,
        },
        {
            name:    'no-sessionStorage-direct',
            pattern: 'sessionStorage',
            level:   'block',
            message: 'Codex V10: Zero sessionStorage. Usar KB.saveNode() para persistencia.',
            enabled: true,
        },
    ];

    // ══════════════════════════════════════════════════════════════════════════
    //  check — valida un action contra las gates
    //
    //  Devuelve:
    //    { blocked: false, level: 'pass' }                    — sin violaciones
    //    { blocked: true,  level: 'block', reason, gate }     — gate de bloqueo
    //    { blocked: false, level: 'warn',  reason, gate }     — gate de aviso
    // ══════════════════════════════════════════════════════════════════════════
    static check(action, gates) {
        const serialized = _serialize(action);
        const activeGates = (gates || GateEngine.DEFAULT_GATES).filter(g => g.enabled);

        for (const gate of activeGates) {
            if (serialized.includes(gate.pattern)) {
                const blocked = gate.level === 'block';
                return {
                    blocked,
                    level:  blocked ? 'block' : 'warn',
                    reason: gate.message,
                    gate:   { name: gate.name, pattern: gate.pattern, level: gate.level },
                };
            }
        }

        return { blocked: false, level: 'pass' };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  wrap — devuelve un dispatch seguro que pasa por check() antes de ejecutar
    //
    //  options.onBlocked(action, result)  — callback cuando se bloquea
    //  options.onWarn(action, result)     — callback cuando hay warning
    // ══════════════════════════════════════════════════════════════════════════
    static wrap(dispatch, gates, options = {}) {
        const { onBlocked, onWarn } = options;
        const activeGates = gates || GateEngine.DEFAULT_GATES;

        return async function safeDispatch(action) {
            const result = GateEngine.check(action, activeGates);

            if (result.blocked) {
                // Emitir evento en browser si está disponible
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('sos:gate-blocked', {
                        detail: { action, result }
                    }));
                }
                if (typeof onBlocked === 'function') onBlocked(action, result);
                // No ejecutar el dispatch original
                return null;
            }

            if (result.level === 'warn') {
                console.warn(`[GateEngine] ⚠️ ${result.reason}`, action);
                if (typeof onWarn === 'function') onWarn(action, result);
            }

            // Pasar al dispatch original
            return dispatch(action);
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  promote — añade una gate a DEFAULT_GATES (idempotente por nombre)
    //  Usado por @kaos_tester para promover vulnerabilidades detectadas.
    // ══════════════════════════════════════════════════════════════════════════
    static promote(gate) {
        // Idempotente: no duplicar si ya existe por nombre
        const exists = GateEngine.DEFAULT_GATES.some(g => g.name === gate.name);
        if (!exists) {
            GateEngine.DEFAULT_GATES.push({ ...gate });
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  loadGates — fusiona gates custom con DEFAULT_GATES
    //  Útil para cargar gates desde KB (gates_sos.json)
    // ══════════════════════════════════════════════════════════════════════════
    static loadGates(customGates = []) {
        customGates.forEach(gate => GateEngine.promote(gate));
        return GateEngine.DEFAULT_GATES;
    }
}
