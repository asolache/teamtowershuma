// =============================================================================
// TEAMTOWERS SOS V10.1 — WO AUTO CLOSER
// Ruta: ia/dev/js/core/WoAutoCloser.js
// Cierre automático de WOs via Evals · Aprobación humana para alto coste
// Emite eventos sos:wo-needs-approval y sos:wo-consolidated
// =============================================================================

import { store }       from './store.js';
import { KB }          from './kb.js';
import { Orchestrator } from './Orchestrator.js';
import { EvalEngine }  from './EvalEngine.js';
import { QueenAudit }  from './QueenAudit.js';

// Umbral de tokens para pedir aprobación humana antes de continuar
const HIGH_TOKEN_THRESHOLD = 2000;
// Umbral de evaluación para auto-aprobar (0-1)
const AUTO_APPROVE_THRESHOLD = 0.8;

export class WoAutoCloser {

    // ══════════════════════════════════════════════════════════════
    //  tryClose — intenta cerrar una WO automáticamente
    //  1. Comprueba evals existentes
    //  2. Si no hay evals, los genera con IA
    //  3. Evalúa el entregable contra los SOCs
    //  4. Si score >= 0.8 → consolida automáticamente
    //  5. Si coste > umbral → pide aprobación humana primero
    // ══════════════════════════════════════════════════════════════
    static async tryClose({ projectId, woHash, entregable, reportedBy }) {
        const state   = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) throw new Error('Proyecto no encontrado');

        const wo = (project.work_orders || project.workOrders || [])
            .find(w => w.hash === woHash);
        if (!wo) throw new Error('WO no encontrada');

        // Ya consolidada
        if (wo.status === 'consolidated') return { status: 'already_closed' };

        // ── PASO 1: Obtener evals asociados a esta WO ─────────────
        const projectEvals = project.evals || [];
        let woEvals = projectEvals.filter(e =>
            e.parentId === woHash ||
            e.parentId === wo.from ||
            e.parentId === (wo.roleId || wo.assigneeId)
        );

        // ── PASO 2: Si no hay evals, generarlos ahora ─────────────
        if (!woEvals.length) {
            woEvals = await this._generateEvals(projectId, wo);
        }

        // ── PASO 3: Evaluar el entregable con IA ──────────────────
        const evalResult = await this._evaluateDeliverable({
            wo, woEvals, entregable, projectId
        });

        // ── PASO 4: Decidir si auto-cerrar o pedir aprobación ─────
        const score      = evalResult.score;
        const tokensUsed = evalResult.tokensUsed || 0;
        const needsApproval = tokensUsed > HIGH_TOKEN_THRESHOLD || score < AUTO_APPROVE_THRESHOLD;

        if (needsApproval) {
            // Emitir evento para que el Chat/Kanban muestre el panel de aprobación
            window.dispatchEvent(new CustomEvent('sos:wo-needs-approval', {
                detail: {
                    projectId, woHash,
                    score:       score,
                    tokensUsed:  tokensUsed,
                    evalResult,
                    reason:      score < AUTO_APPROVE_THRESHOLD
                        ? `Score insuficiente: ${(score*100).toFixed(0)}% (mínimo 80%)`
                        : `Alto consumo de tokens: ${tokensUsed} (umbral: ${HIGH_TOKEN_THRESHOLD})`,
                    wo
                }
            }));
            return { status: 'needs_approval', score, tokensUsed, evalResult };
        }

        // ── PASO 5: Auto-consolidar ───────────────────────────────
        return await this._consolidate({ projectId, wo, woHash, evalResult, autoApproved: true, reportedBy });
    }

    // ── Aprobar manualmente una WO pendiente de aprobación ───────
    static async approveAndClose({ projectId, woHash, approvedBy }) {
        const state   = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        const wo      = (project?.work_orders || project?.workOrders || []).find(w => w.hash === woHash);
        if (!wo) throw new Error('WO no encontrada');

        // Evaluar el entregable (rápido, sin IA si ya hay resultado previo)
        const evalResult = wo._lastEvalResult || { score: 1.0, passedSocs: [], failedSocs: [] };
        return await this._consolidate({ projectId, wo, woHash, evalResult, autoApproved: false, reportedBy: approvedBy });
    }

    // ── _generateEvals — genera SOCs para una WO sin evals ───────
    static async _generateEvals(projectId, wo) {
        try {
            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt: `Eres el Cap de Troncs del enjambre SOS.
Genera 3 SOCs verificables para esta Work Order.
Devuelve SOLO JSON: {"evals":[{"criteria":"...","soc":"criterio verificable en 1 frase","level":2}]}`,
                userPrompt: `WO: ${wo.entregable || wo.template || wo.hash}
Descripción: ${wo.descripcion || ''}
Tipo: ${wo.tipo || 'tangible'}`,
                responseFormat: 'json_object',
                temperature: 0.2
            });

            const evals = response.content?.evals || [];
            const created = [];
            for (const e of evals) {
                const evalNode = await EvalEngine.createEval({
                    projectId,
                    parentId:   wo.hash,
                    parentType: 'work_order',
                    criteria:   e.criteria,
                    level:      e.level || 2,
                    archetype:  null
                });
                created.push(evalNode);
            }
            return created;
        } catch (_) {
            // Si falla la IA, crear un eval básico manual
            return [{
                id:       `eval_auto_${wo.hash}`,
                criteria: `El entregable "${wo.entregable || wo.template}" está completado y entregado`,
                soc:      'El receptor confirma que el entregable cumple con lo acordado',
                level:    1,
                status:   'draft'
            }];
        }
    }

    // ── _evaluateDeliverable — puntúa el entregable contra SOCs ──
    static async _evaluateDeliverable({ wo, woEvals, entregable, projectId }) {
        if (!woEvals.length) return { score: 0.5, passedSocs: [], failedSocs: [], tokensUsed: 0 };

        const socList = woEvals.map((e, i) =>
            `SOC ${i+1}: ${e.criteria || e.soc || e.text}`
        ).join('\n');

        const deliverableText = entregable
            || wo.comentario
            || `WO completada: ${wo.entregable || wo.template}`;

        try {
            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt: `Eres un auditor TDD del enjambre SOS. Evalúa si el entregable pasa cada SOC.
Sé estricto pero justo. Devuelve SOLO JSON:
{
  "score": 0.0-1.0,
  "passed": ["SOC 1", "SOC 3"],
  "failed": ["SOC 2"],
  "feedback": "retroalimentación concisa para el agente"
}`,
                userPrompt: `ENTREGABLE:\n${deliverableText}\n\nSOCs A VERIFICAR:\n${socList}`,
                responseFormat: 'json_object',
                temperature: 0.1
            });

            const result      = response.content;
            const tokensUsed  = response.telemetry?.prompt_tokens || 0;

            // Actualizar status de evals en el store
            for (const eval_ of woEvals) {
                const socText    = eval_.criteria || eval_.soc || '';
                const isPassed   = (result.passed || []).some(p => p.includes(socText.substring(0, 30)));
                const newStatus  = isPassed ? 'passed' : 'failed';
                if (eval_.id && eval_.status !== 'passed') {
                    await store.dispatch({
                        type: 'EVAL_UPDATE',
                        payload: {
                            projectId,
                            evalId:  eval_.id,
                            updates: { status: newStatus, result: result.feedback }
                        }
                    });
                }
            }

            return {
                score:      result.score || 0,
                passedSocs: result.passed || [],
                failedSocs: result.failed || [],
                feedback:   result.feedback || '',
                tokensUsed
            };
        } catch (_) {
            return { score: 0.5, passedSocs: [], failedSocs: [], tokensUsed: 0, feedback: 'Error en evaluación automática' };
        }
    }

    // ── _consolidate — cierra la WO y registra en el Ledger ──────
    static async _consolidate({ projectId, wo, woHash, evalResult, autoApproved, reportedBy }) {
        const state   = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        const role    = (project?.roles || project?.vna_nodes || [])
            .find(r => r.id === wo.from || r.id === wo.roleId);

        await store.dispatch({
            type: 'CONSOLIDATE_WORK_ORDER',
            payload: {
                projectId,
                woHash,
                evalsResult:  evalResult,
                autoApproved,
                fmv:          role?.fmv || 40,
                multiplier:   role?.multiplier || 1.0
            }
        });

        // Emitir evento de consolidación para actualizar el Kanban y el Chat
        window.dispatchEvent(new CustomEvent('sos:wo-consolidated', {
            detail: {
                projectId, woHash,
                wo:           { ...wo, status: 'consolidated' },
                evalResult,
                autoApproved,
                reportedBy,
                slices:       ((wo.realHours || 0) * (role?.fmv || 40) * (role?.multiplier || 1.0)).toFixed(3)
            }
        }));

        // ── QueenAudit: ciclo de mejora continua post-consolidación ────────────
        // Analiza el proyecto actualizado y propone mejoras al VNA si procede.
        try {
            const updatedState   = store.getState();
            const updatedProject = updatedState.projects.find(p => p.id === projectId);
            if (updatedProject) {
                const auditReport = QueenAudit.analyze(updatedProject);

                // Solo emitir si hay recomendaciones concretas
                if (auditReport.recommendation_count > 0) {
                    const vnaNetwork = {
                        nodes:     updatedProject.vna_nodes     || [],
                        exchanges: updatedProject.vna_exchanges || []
                    };
                    const fixes = QueenAudit.proposeFixes(auditReport, vnaNetwork);

                    window.dispatchEvent(new CustomEvent('sos:queen-audit', {
                        detail: {
                            projectId,
                            woHash,
                            triggerScore:       evalResult.score,
                            report:             auditReport,
                            fixes,
                            health_score:       auditReport.health_score,
                            recommendation_count: auditReport.recommendation_count
                        }
                    }));

                    console.log(
                        `[QueenAudit] 🔍 ${auditReport.recommendation_count} recomendaciones ` +
                        `· health=${auditReport.health_score} · fixes=${fixes.length}`
                    );
                }
            }
        } catch (auditErr) {
            console.warn('[WoAutoCloser] QueenAudit falló:', auditErr.message);
        }

        return {
            status:      'consolidated',
            score:       evalResult.score,
            autoApproved,
            feedback:    evalResult.feedback
        };
    }

    // ── reportHuman — reportar una WO desde el humano ────────────
    // Equivalente al botón de reportar que no funcionaba
    static async reportHuman({ projectId, woHash, realHours, comentario, proofLink, reportedBy }) {
        // Primero marcar como reported
        await store.dispatch({
            type:    'REPORT_WORK_ORDER',
            payload: { projectId, woHash, realHours, comentario, proofLink }
        });

        // Luego intentar cierre automático con los evals
        const result = await this.tryClose({
            projectId,
            woHash,
            entregable: comentario || '',
            reportedBy
        });

        window.dispatchEvent(new CustomEvent('sos:wo-reported', {
            detail: { projectId, woHash, result }
        }));

        return result;
    }
}

// ── API global para usar desde el Chat ───────────────────────────────────────
window.WoAutoCloser = WoAutoCloser;
