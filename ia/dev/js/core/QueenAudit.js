// =============================================================================
// TEAMTOWERS SOS V10.1 — QUEEN AUDIT
// Ruta: /ia/dev/js/core/QueenAudit.js
//
// Ciclo de mejora continua del Swarm. Se dispara post-CONSOLIDATE_WORK_ORDER.
// analyze()      → detecta patrones de baja calidad e idle_roles
// proposeFixes() → propone cambios concretos al VNA
// applyFixes()   → aplica fixes devolviendo una nueva red (sin mutar la original)
// =============================================================================

export class QueenAudit {

    // ══════════════════════════════════════════════════════════════════════════
    //  analyze — analiza un proyecto y devuelve un informe de calidad
    //
    //  Detecta:
    //   - idle_roles: roles sin ninguna WO consolidada
    //   - quality_patterns: roles con avg_score < 0.8 en sus WOs consolidadas
    //
    //  Devuelve: { idle_roles, quality_patterns, health_score, recommendation_count }
    // ══════════════════════════════════════════════════════════════════════════
    static analyze(project) {
        const roles       = project.roles       || [];
        const workOrders  = project.work_orders || [];
        const vnaFlows    = project.vna_flows   || [];

        // ── Idle roles: roles sin ninguna WO consolidada ──────────────────────
        const consolidatedWOs = workOrders.filter(wo =>
            wo.status === 'consolidated' && wo.evalsResult
        );

        // Roles que aparecen en al menos una WO consolidada
        const activeRoleIds = new Set(consolidatedWOs.map(wo => wo.from).filter(Boolean));

        const idleRoles = roles.filter(r => !activeRoleIds.has(r.id)).map(r => ({
            roleId:   r.id,
            roleName: r.name || r.id,
            levelId:  r.levelId || null,
        }));

        // ── Quality patterns: roles con avg_score < 0.8 ───────────────────────
        const scoresByRole = {};
        consolidatedWOs.forEach(wo => {
            const roleId = wo.from;
            if (!roleId) return;
            const score = wo.evalsResult?.score || 1.0;
            if (!scoresByRole[roleId]) scoresByRole[roleId] = [];
            scoresByRole[roleId].push(score);
        });

        const qualityPatterns = [];
        Object.entries(scoresByRole).forEach(([roleId, scores]) => {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            if (avg < 0.8) {
                const role = roles.find(r => r.id === roleId);
                qualityPatterns.push({
                    roleId,
                    roleName:   role?.name || roleId,
                    avg_score:  Number(avg.toFixed(3)),
                    wo_count:   scores.length,
                    suggestion: `Revisar la definición de SOCs para el rol ${roleId}`,
                });
            }
        });

        // ── health_score ──────────────────────────────────────────────────────
        const health = QueenAudit._calcHealth(project, idleRoles, qualityPatterns);

        const recommendation_count = idleRoles.length + qualityPatterns.length;

        return {
            idle_roles:         idleRoles,
            quality_patterns:   qualityPatterns,
            health_score:       health,
            recommendation_count,
            analyzed_at:        Date.now(),
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  proposeFixes — genera fixes accionables a partir del informe
    //  Devuelve: Fix[]  { type, targetId, suggestion, priority }
    // ══════════════════════════════════════════════════════════════════════════
    static proposeFixes(report, vnaNetwork) {
        const fixes = [];
        const nodes = (vnaNetwork?.nodes || []);

        // ── Fixes para idle_roles ─────────────────────────────────────────────
        report.idle_roles.forEach(idle => {
            // Si el nodo existe en el VNA, sugerir añadir transacción
            const nodeExists = nodes.some(n => n.id === idle.roleId || n.label === idle.roleName);
            fixes.push({
                type:       nodeExists ? 'add_transaction' : 'assign_agent',
                targetId:   idle.roleId,
                suggestion: nodeExists
                    ? `Añadir al menos una transacción saliente desde el rol '${idle.roleName}' para que aporte valor medible`
                    : `Asignar un agente del Swarm al rol '${idle.roleName}' y crear su primera WO`,
                priority:   'high',
            });
        });

        // ── Fixes para quality_patterns ───────────────────────────────────────
        report.quality_patterns.forEach(pattern => {
            fixes.push({
                type:       'add_eval',
                targetId:   pattern.roleId,
                suggestion: `avg_score=${pattern.avg_score} — Revisar y refinar los SOCs del rol '${pattern.roleName}'. ` +
                            `Considerar reducir el scope de cada WO para facilitar la evaluación`,
                priority:   pattern.avg_score < 0.6 ? 'high' : 'medium',
            });
        });

        // Si no hay nada que fijar pero el health_score es bajo, sugerir revisión general
        if (fixes.length === 0 && report.health_score < 0.7) {
            fixes.push({
                type:       'add_transaction',
                targetId:   'vna_network',
                suggestion: 'El VNA tiene health_score bajo. Revisar la reciprocidad de flujos y añadir más transacciones',
                priority:   'medium',
            });
        }

        return fixes;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  applyFixes — aplica los fixes al VnaNetwork devolviendo una copia nueva
    //  NUNCA muta la red original.
    // ══════════════════════════════════════════════════════════════════════════
    static applyFixes(vnaNetwork, fixes) {
        // Deep copy — inmutabilidad garantizada
        const net = JSON.parse(JSON.stringify(vnaNetwork));

        if (!fixes || fixes.length === 0) return net;

        fixes.forEach(fix => {
            switch (fix.type) {
                case 'add_transaction': {
                    // Añadir un exchange placeholder al VNA
                    const newExchange = {
                        id:           `ex_fix_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                        from:         fix.targetId,
                        to:           'vna_network',
                        type:         'tangible',
                        category:     'deliverable',
                        label:        fix.suggestion.substring(0, 50),
                        automatable:  false,
                        _fix_applied: true,
                        _fix_type:    fix.type,
                    };
                    if (!net.exchanges) net.exchanges = [];
                    net.exchanges.push(newExchange);
                    break;
                }
                case 'add_eval': {
                    // Marcar el nodo con flag de revisión de SOCs
                    if (net.nodes) {
                        const node = net.nodes.find(n => n.id === fix.targetId);
                        if (node) {
                            node._needs_soc_review = true;
                            node._fix_suggestion   = fix.suggestion;
                        }
                    }
                    break;
                }
                case 'assign_agent': {
                    // Añadir sugerencia de agente al nodo
                    if (net.nodes) {
                        const node = net.nodes.find(n => n.id === fix.targetId);
                        if (node) node._suggested_agent = fix.suggestion;
                    }
                    break;
                }
                default:
                    break;
            }
        });

        return net;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _calcHealth — score 0.0–1.0 de la calidad del proyecto
    // ══════════════════════════════════════════════════════════════════════════
    static _calcHealth(project, idleRoles, qualityPatterns) {
        let score = 1.0;
        const roles      = project.roles       || [];
        const workOrders = project.work_orders || [];

        // Sin roles ni WOs → puntuación base neutra
        if (roles.length === 0 && workOrders.length === 0) return 0.75;

        // Penalizar idle_roles (-0.15 por rol aislado, máx -0.45)
        score -= Math.min(idleRoles.length * 0.15, 0.45);

        // Penalizar quality_patterns (-0.10 por patrón, máx -0.30)
        score -= Math.min(qualityPatterns.length * 0.10, 0.30);

        // Bonus si hay WOs consolidadas con score >= 0.8
        const goodWOs = (project.work_orders || []).filter(wo =>
            wo.status === 'consolidated' && (wo.evalsResult?.score || 0) >= 0.8
        );
        if (goodWOs.length > 0 && roles.length > 0) {
            score += Math.min(goodWOs.length * 0.05, 0.2);
        }

        return Number(Math.max(0, Math.min(1, score)).toFixed(3));
    }
}
