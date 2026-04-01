// =============================================================================
// TEAMTOWERS SOS V10.1 — EVAL ENGINE
// Ruta: ia/dev/js/core/EvalEngine.js
// Motor TDD Inverso · EvalNodes como ciudadanos de primera clase
// Un nodo sube de nivel cuando pasa todos sus evals del nivel inferior
// =============================================================================

import { KB }    from './kb.js';
import { store } from './store.js';

// ── Schema de un EvalNode ─────────────────────────────────────────────────────
// {
//   id:            'eval_xxx',
//   type:          'eval',
//   parentId:      'role_xxx | skill_xxx | exchange_xxx | wo_xxx',
//   parentType:    'role | skill | exchange | work_order | vna_node | user',
//   projectId:     'proj_xxx',
//   criteria:      'El output cumple el template definido',
//   level:         0,           // nivel TDD al que pertenece este eval
//   status:        'draft | active | passed | failed',
//   archetype:     'sage | hero | ...',
//   weight:        1.0,         // peso relativo en el nivel
//   passThreshold: 0.8,         // % de evals del nivel que deben pasar para promover
//   result:        null,        // output del auditor al evaluar
//   auditedBy:     null,        // id del auditor (agente o humano)
//   linkedEvals:   [],          // evals dependientes
//   createdAt:     timestamp,
//   updatedAt:     timestamp
// }

export class EvalEngine {

    // ══════════════════════════════════════════════════════════════
    //  createEval — crea un EvalNode en KB y en el store
    // ══════════════════════════════════════════════════════════════
    static async createEval({ projectId, parentId, parentType, criteria, level = 0, archetype = null, weight = 1.0, passThreshold = 0.8, linkedEvals = [] }) {
        if (!projectId || !parentId || !criteria) throw new Error('EvalEngine.createEval: projectId, parentId y criteria son obligatorios');

        const id = `eval_${Date.now()}_${Math.random().toString(36).substr(2,6)}`;
        const evalNode = {
            id, type: 'eval', parentId, parentType: parentType || 'role',
            projectId, criteria, level, status: 'draft',
            archetype, weight, passThreshold, linkedEvals,
            result: null, auditedBy: null,
            createdAt: Date.now(), updatedAt: Date.now()
        };

        // Persistir en KB
        await KB.init();
        await KB.saveNode(evalNode);

        // Registrar en el store del proyecto
        await store.dispatch({ type: 'EVAL_CREATE', payload: { projectId, eval: evalNode } });

        return evalNode;
    }

    // ══════════════════════════════════════════════════════════════
    //  passEval — marca un eval como passed y comprueba promoción
    // ══════════════════════════════════════════════════════════════
    static async passEval({ projectId, evalId, auditedBy, result = '' }) {
        await KB.init();
        const evalNode = await KB.getNode(evalId);
        if (!evalNode) throw new Error(`EvalEngine: eval ${evalId} no encontrado en KB`);

        const updated = { ...evalNode, status: 'passed', result, auditedBy, updatedAt: Date.now() };
        await KB.saveNode(updated);
        await store.dispatch({ type: 'EVAL_UPDATE', payload: { projectId, evalId, updates: { status: 'passed', result, auditedBy } } });

        // Comprobar si el nodo padre debe ser promovido
        await this._checkPromotion(projectId, evalNode.parentId, evalNode.parentType, evalNode.level);

        return updated;
    }

    // ══════════════════════════════════════════════════════════════
    //  failEval — marca un eval como failed
    // ══════════════════════════════════════════════════════════════
    static async failEval({ projectId, evalId, auditedBy, result = '' }) {
        await KB.init();
        const evalNode = await KB.getNode(evalId);
        if (!evalNode) throw new Error(`EvalEngine: eval ${evalId} no encontrado en KB`);

        const updated = { ...evalNode, status: 'failed', result, auditedBy, updatedAt: Date.now() };
        await KB.saveNode(updated);
        await store.dispatch({ type: 'EVAL_UPDATE', payload: { projectId, evalId, updates: { status: 'failed', result, auditedBy } } });

        return updated;
    }

    // ══════════════════════════════════════════════════════════════
    //  activateEval — draft → active (cuando el nodo empieza a trabajar)
    // ══════════════════════════════════════════════════════════════
    static async activateEval({ projectId, evalId }) {
        await KB.init();
        const evalNode = await KB.getNode(evalId);
        if (!evalNode || evalNode.status !== 'draft') return;

        const updated = { ...evalNode, status: 'active', updatedAt: Date.now() };
        await KB.saveNode(updated);
        await store.dispatch({ type: 'EVAL_UPDATE', payload: { projectId, evalId, updates: { status: 'active' } } });

        return updated;
    }

    // ══════════════════════════════════════════════════════════════
    //  getEvalsForNode — obtiene todos los evals de un nodo padre
    // ══════════════════════════════════════════════════════════════
    static async getEvalsForNode(parentId, projectId = null) {
        await KB.init();
        const all = await KB.getAllNodes();
        return all.filter(n =>
            n.type === 'eval' &&
            n.parentId === parentId &&
            (!projectId || n.projectId === projectId)
        ).sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
    }

    // ══════════════════════════════════════════════════════════════
    //  getEvalsByLevel — obtiene evals de un nodo en un nivel concreto
    // ══════════════════════════════════════════════════════════════
    static async getEvalsByLevel(parentId, level, projectId = null) {
        const all = await this.getEvalsForNode(parentId, projectId);
        return all.filter(e => (e.level ?? 0) === level);
    }

    // ══════════════════════════════════════════════════════════════
    //  getMaturityScore — calcula el score de madurez de un nodo (0-1)
    // ══════════════════════════════════════════════════════════════
    static async getMaturityScore(parentId, projectId = null) {
        const evals = await this.getEvalsForNode(parentId, projectId);
        if (!evals.length) return { score: 0, passed: 0, total: 0, level: 0, gaps: [] };

        const passed = evals.filter(e => e.status === 'passed');
        const score  = passed.length / evals.length;

        // Nivel actual = nivel más alto donde todos los evals pasaron
        const levels = [...new Set(evals.map(e => e.level ?? 0))].sort((a,b) => a-b);
        let currentLevel = 0;
        for (const lv of levels) {
            const lvEvals  = evals.filter(e => (e.level ?? 0) === lv);
            const lvPassed = lvEvals.filter(e => e.status === 'passed');
            const threshold = lvEvals[0]?.passThreshold ?? 0.8;
            if (lvPassed.length / lvEvals.length >= threshold) currentLevel = lv + 1;
            else break;
        }

        // Gaps = evals activos o fallados
        const gaps = evals.filter(e => e.status === 'active' || e.status === 'failed')
                          .map(e => ({ id: e.id, criteria: e.criteria, level: e.level, status: e.status }));

        return {
            score:   Number(score.toFixed(3)),
            passed:  passed.length,
            total:   evals.length,
            level:   currentLevel,
            gaps,
            maturity: this._scoreToMaturity(score)
        };
    }

    // ══════════════════════════════════════════════════════════════
    //  validateProjectForge — validación TDD del ProjectForge
    //  Devuelve { errors: [], warnings: [] }
    // ══════════════════════════════════════════════════════════════
    static validateProjectForge(project) {
        const errors   = [];
        const warnings = [];
        const roles    = project.roles || project.vna_nodes || [];
        const flows    = [...(project.vna_flows || []), ...(project.vna_exchanges || [])];

        roles.forEach(role => {
            const roleId    = role.id;
            const roleName  = role.label || role.name || roleId;

            // ── Error bloqueante: rol sin ninguna transacción ─────
            const hasFlow = flows.some(f => f.from === roleId || f.to === roleId);
            if (!hasFlow) {
                errors.push({
                    type:    'NO_TRANSACTIONS',
                    nodeId:  roleId,
                    message: `"${roleName}" no tiene ninguna transacción activa ni proyectada. Un rol sin flujo de valor no aporta al ecosistema.`
                });
            }

            // ── Warning: rol sin evals ────────────────────────────
            const projectEvals = project.evals || [];
            const roleEvals    = projectEvals.filter(e => e.parentId === roleId);
            if (!roleEvals.length) {
                warnings.push({
                    type:    'NO_EVALS',
                    nodeId:  roleId,
                    message: `"${roleName}" no tiene SOCs/Evals definidos. Sin criterios de calidad, la madurez TDD no puede avanzar.`
                });
            }

            // ── Warning: rol en draft sin asignar ─────────────────
            const maturity = role.maturity || 'draft';
            if (maturity === 'draft' && !role.assignee) {
                warnings.push({
                    type:    'DRAFT_UNASSIGNED',
                    nodeId:  roleId,
                    message: `"${roleName}" está en draft y sin asignar. Considera asignar un Casteller o marcar como proyectado.`
                });
            }
        });

        // ── Error: proyecto sin ningún rol ────────────────────────
        if (!roles.length) {
            errors.push({
                type:    'NO_ROLES',
                nodeId:  null,
                message: 'El ecosistema no tiene roles definidos. Define al menos un rol antes de lanzar.'
            });
        }

        return { errors, warnings, isValid: errors.length === 0 };
    }

    // ══════════════════════════════════════════════════════════════
    //  seedEvalsForRole — genera evals por defecto para un rol
    //  Útil al crear un rol nuevo desde el ProjectForge
    // ══════════════════════════════════════════════════════════════
    static async seedEvalsForRole({ projectId, roleId, roleName, levelId, guardian }) {
        const baseEvals = this._defaultEvalsForRole(roleName, levelId, guardian);
        const created   = [];

        for (const e of baseEvals) {
            const evalNode = await this.createEval({
                projectId,
                parentId:   roleId,
                parentType: 'role',
                criteria:   e.criteria,
                level:      e.level,
                archetype:  guardian || null,
                weight:     e.weight || 1.0
            });
            created.push(evalNode);
        }

        return created;
    }

    // ── Privados ──────────────────────────────────────────────────

    static async _checkPromotion(projectId, parentId, parentType, evalLevel) {
        const levelEvals = await this.getEvalsByLevel(parentId, evalLevel, projectId);
        if (!levelEvals.length) return;

        const passed    = levelEvals.filter(e => e.status === 'passed');
        const threshold = levelEvals[0]?.passThreshold ?? 0.8;
        const ratio     = passed.length / levelEvals.length;

        if (ratio >= threshold) {
            // Todos los evals del nivel N han pasado — promover al nivel N+1
            const maturityMap = { 0: 'validated', 1: 'production', 2: 'production' };
            await store.dispatch({
                type: 'NODE_PROMOTE',
                payload: {
                    projectId, nodeId: parentId, nodeType: parentType,
                    newLevel:    evalLevel + 1,
                    newMaturity: maturityMap[evalLevel] || 'production'
                }
            });
        }
    }

    static _scoreToMaturity(score) {
        if (score >= 0.9) return 'production';
        if (score >= 0.6) return 'validated';
        if (score >  0)   return 'draft';
        return 'draft';
    }

    static _defaultEvalsForRole(roleName, levelId, guardian) {
        // Nivel 0 — evals básicos para cualquier rol
        const base = [
            { criteria: `El rol "${roleName}" tiene al menos una transacción de valor definida`,      level: 0, weight: 1.5 },
            { criteria: `El rol "${roleName}" tiene un System Prompt (AGENT.md) documentado`,         level: 0, weight: 1.0 },
            { criteria: `El rol "${roleName}" ha completado al menos una Work Order en el proyecto`,  level: 1, weight: 1.0 },
        ];

        // Evals adicionales según el nivel Casteller
        const levelEvals = {
            '@anxaneta':  [{ criteria: `${roleName} demuestra visión estratégica y capacidad de decisión autónoma`,     level: 1, weight: 1.5 }],
            '@aixecador': [{ criteria: `${roleName} coordina con éxito al menos dos roles del nivel inferior`,          level: 1, weight: 1.2 }],
            '@dosos':     [{ criteria: `${roleName} entrega work orders con calidad SOC >= 80% en 3 iteraciones`,       level: 1, weight: 1.0 }],
            '@baixos':    [{ criteria: `${roleName} completa sus SOPs en tiempo estimado ± 20%`,                        level: 0, weight: 0.8 }],
            '@pinya':     [{ criteria: `${roleName} mantiene disponibilidad y respuesta dentro del SLA definido`,       level: 0, weight: 0.8 }],
        };

        return [...base, ...(levelEvals[levelId] || [])];
    }
}
