// =============================================================================
// TEAMTOWERS SOS V10.1 — PRIMER ENGINE
// Ruta: /ia/dev/js/core/PrimerEngine.js
//
// Memoria entre sesiones — Recall Stack Layer 2+4.
// Al final de cada sesión, @synaptic_weaver llama save() para persistir
// un session_summary en KB. Al arrancar la Reina, buildContext() inyecta
// el contexto de las últimas N sesiones en el systemPrompt.
//
// Métodos estáticos:
//   save(payload, deps)             → persiste session_summary en KB
//   load(projectId, deps, options)  → recupera los últimos N summaries
//   buildContext(summaries, projectId) → string para inyectar en systemPrompt
// =============================================================================

// ─── Clave de tipo KB para session summaries ──────────────────────────────────
const SESSION_SUMMARY_TYPE = 'session_summary';

export class PrimerEngine {

    // ══════════════════════════════════════════════════════════════════════════
    //  save — persiste un session_summary en KB al final de la sesión
    //
    //  Entrada:
    //    payload.project    — proyecto activo
    //    payload.sessionId  — ID de la sesión (string)
    //  deps.kb              — instancia de KB
    //
    //  Salida: session_summary node guardado en KB
    // ══════════════════════════════════════════════════════════════════════════
    static async save(payload, deps) {
        const { project, sessionId } = payload;
        const { kb } = deps;

        const workOrders = project.work_orders || [];

        // Clasificar WOs
        const completedWOs = workOrders
            .filter(wo => wo.status === 'consolidated')
            .map(wo => wo.hash);

        const pendingWOs = workOrders
            .filter(wo => wo.status !== 'consolidated' && wo.status !== 'reported')
            .map(wo => wo.hash);

        // Detectar blockers: WOs con score bajo repetido
        const blockers = [];
        const scoresByWO = {};
        workOrders.forEach(wo => {
            const score = wo.evalsResult?.score;
            if (score !== undefined && score < 0.8) {
                blockers.push(`WO ${wo.hash}: score=${score}`);
            }
        });

        // Calcular health_score de la sesión
        const total = workOrders.length;
        const good  = workOrders.filter(wo =>
            wo.status === 'consolidated' && (wo.evalsResult?.score || 0) >= 0.8
        ).length;
        const health_score = total > 0 ? Number((good / total).toFixed(3)) : 0.75;

        const id = `session_summary_${project.id}_${Date.now()}`;

        const summary = {
            id,
            type:          SESSION_SUMMARY_TYPE,
            projectId:     project.id,
            projectName:   project.nombre || project.id,
            sessionId:     sessionId || `sess_${Date.now()}`,
            completed_wos: completedWOs,
            pending_wos:   pendingWOs,
            health_score,
            blockers,
            timestamp:     Date.now(),
        };

        await kb.saveNode(summary);
        return summary;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  load — recupera los últimos N session_summaries de un proyecto
    //  Ordenados por timestamp descendente (más reciente primero).
    //  options.limit: número máximo de summaries a devolver (default 3)
    // ══════════════════════════════════════════════════════════════════════════
    static async load(projectId, deps, options = {}) {
        const { kb }  = deps;
        const limit   = options.limit || 3;

        // Obtener todos los session_summary del KB
        const all = await kb.getNodesByType(SESSION_SUMMARY_TYPE);

        return all
            .filter(n => n.projectId === projectId)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, limit);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  buildContext — genera el string de contexto para el systemPrompt
    //  La Reina lo recibe al arrancar para no empezar desde cero.
    //
    //  Entrada: summaries[] (de load()), projectId
    //  Salida:  string de contexto (puede ser vacío si no hay summaries)
    // ══════════════════════════════════════════════════════════════════════════
    static buildContext(summaries, projectId) {
        if (!summaries || summaries.length === 0) return '';

        const lines = [
            `CONTEXTO DE SESIONES ANTERIORES (proyecto: ${projectId}):`,
        ];

        summaries.forEach((s, i) => {
            const date = new Date(s.timestamp).toLocaleDateString('es-ES');
            lines.push(`\n[Sesión ${i + 1} — ${date}]`);
            lines.push(`  health_score: ${s.health_score}`);

            if (s.completed_wos && s.completed_wos.length > 0) {
                lines.push(`  WOs completadas (${s.completed_wos.length}): ${s.completed_wos.slice(0, 3).join(', ')}${s.completed_wos.length > 3 ? '...' : ''}`);
            }
            if (s.pending_wos && s.pending_wos.length > 0) {
                lines.push(`  WOs pendientes (${s.pending_wos.length}): ${s.pending_wos.slice(0, 3).join(', ')}${s.pending_wos.length > 3 ? '...' : ''}`);
            }
            if (s.blockers && s.blockers.length > 0) {
                lines.push(`  Blockers detectados: ${s.blockers.join(' | ')}`);
            }
        });

        lines.push('\nTen en cuenta este contexto al generar el VNA y las WOs del ciclo actual.');
        return lines.join('\n');
    }
}
