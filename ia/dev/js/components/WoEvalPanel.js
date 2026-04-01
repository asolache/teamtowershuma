// =============================================================================
// TEAMTOWERS SOS V10.1 — WO EVAL PANEL
// Ruta: ia/dev/js/components/WoEvalPanel.js
// Panel inline de evaluación/reporte de Work Orders.
// Reemplaza el flujo antiguo de OmniPaper.
//
// Flujo completo:
//   1. Abre modal con la WO
//   2. Si faltan SOCs → genera con IA (o permite rellenar manualmente)
//   3. WOs IA → auto-evalúa contra SOCs y consolida
//   4. WOs humanas → formulario de reporte (horas, comentario, proof)
//      luego auto-evalúa y consolida
//   5. Emite sos:wo-consolidated cuando termina
// =============================================================================

import { store }        from '../core/store.js';
import { Orchestrator } from '../core/Orchestrator.js';
import { WoAutoCloser } from '../core/WoAutoCloser.js';

// ── Estilos del panel ─────────────────────────────────────────────────────────
const PANEL_STYLES = `
    .wep-overlay {
        position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:9000;
        display:flex; align-items:center; justify-content:center;
        backdrop-filter:blur(6px); animation:wepFadeIn 0.2s ease;
    }
    @keyframes wepFadeIn { from{opacity:0;} to{opacity:1;} }

    .wep-panel {
        background:linear-gradient(180deg,#13131a 0%,#0d0d12 100%);
        border:1px solid rgba(255,255,255,0.1); border-radius:18px;
        width:min(680px,95vw); max-height:88vh; overflow-y:auto;
        box-shadow:0 30px 80px rgba(0,0,0,0.8); display:flex; flex-direction:column; gap:0;
    }
    .wep-header {
        padding:20px 24px 16px; border-bottom:1px solid rgba(255,255,255,0.07);
        display:flex; justify-content:space-between; align-items:flex-start; gap:12px;
    }
    .wep-title  { font-size:1.05rem; font-weight:900; color:white; line-height:1.3; }
    .wep-sub    { font-size:0.75rem; color:#666; margin-top:3px; font-family:var(--font-mono,'monospace'); }
    .wep-close  { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
                  color:#888; width:32px; height:32px; border-radius:8px; cursor:pointer;
                  font-size:1rem; flex-shrink:0; transition:0.2s; }
    .wep-close:hover { background:rgba(255,82,82,0.2); color:var(--accent-red,#ff5252); border-color:var(--accent-red,#ff5252); }

    .wep-body   { padding:20px 24px; display:flex; flex-direction:column; gap:20px; }

    /* SOC section */
    .wep-soc-header { display:flex; justify-content:space-between; align-items:center; }
    .wep-label  { font-size:0.72rem; color:#888; text-transform:uppercase; letter-spacing:1px; font-weight:bold; }
    .wep-soc-list { display:flex; flex-direction:column; gap:8px; }
    .wep-soc-item {
        display:flex; align-items:flex-start; gap:10px; padding:10px 12px;
        background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.15);
        border-radius:10px; font-size:0.82rem; color:#ccc; line-height:1.4;
    }
    .wep-soc-item.passed { border-color:rgba(0,230,118,0.3); background:rgba(0,230,118,0.05); }
    .wep-soc-item.failed { border-color:rgba(255,82,82,0.3);  background:rgba(255,82,82,0.05); }
    .wep-soc-icon { font-size:0.9rem; flex-shrink:0; margin-top:1px; }
    .wep-soc-text { flex:1; }
    .wep-soc-feedback { font-size:0.72rem; color:#666; margin-top:4px; font-style:italic; }

    .wep-empty-soc {
        padding:16px; text-align:center; color:#555; font-size:0.82rem;
        border:1px dashed rgba(255,255,255,0.1); border-radius:10px;
    }
    .wep-gen-soc-btn {
        background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.2));
        border:1px solid var(--accent-indigo,#6366f1); color:var(--accent-indigo,#6366f1);
        padding:9px 16px; border-radius:9px; cursor:pointer; font-weight:900;
        font-size:0.82rem; transition:0.2s; width:100%;
    }
    .wep-gen-soc-btn:hover { background:var(--accent-indigo,#6366f1); color:white; }

    /* Cuestionario de preguntas */
    .wep-questions { display:flex; flex-direction:column; gap:12px; }
    .wep-q-item { display:flex; flex-direction:column; gap:6px; }
    .wep-q-label { font-size:0.8rem; color:#aaa; font-weight:600; }
    .wep-q-input {
        background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
        color:white; padding:10px 12px; border-radius:9px; font-size:0.85rem;
        resize:vertical; min-height:52px; font-family:inherit; width:100%; box-sizing:border-box;
    }
    .wep-q-input:focus { outline:none; border-color:var(--accent-indigo,#6366f1); }

    /* Report form (WOs humanas) */
    .wep-report-form { display:flex; flex-direction:column; gap:14px; }
    .wep-field { display:flex; flex-direction:column; gap:5px; }
    .wep-field label { font-size:0.75rem; color:#888; text-transform:uppercase; letter-spacing:0.8px; font-weight:bold; }
    .wep-field input, .wep-field textarea {
        background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
        color:white; padding:10px 13px; border-radius:9px; font-size:0.87rem;
        font-family:inherit; width:100%; box-sizing:border-box;
    }
    .wep-field input:focus, .wep-field textarea:focus { outline:none; border-color:var(--accent-indigo,#6366f1); }
    .wep-field textarea { min-height:80px; resize:vertical; }
    .wep-hours-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

    /* Score badge */
    .wep-score-badge {
        display:flex; align-items:center; gap:12px; padding:14px 16px;
        background:rgba(0,0,0,0.4); border-radius:12px;
        border:1px solid rgba(255,255,255,0.07);
    }
    .wep-score-ring {
        width:52px; height:52px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-weight:900; font-size:1rem; font-family:var(--font-mono,'monospace');
        flex-shrink:0; border:3px solid;
    }
    .wep-score-info { flex:1; }
    .wep-score-value { font-size:1.1rem; font-weight:900; }
    .wep-score-label { font-size:0.75rem; color:#777; margin-top:2px; }
    .wep-feedback-text { font-size:0.82rem; color:#bbb; line-height:1.5; }

    /* Status banner */
    .wep-status-banner {
        padding:12px 16px; border-radius:10px; font-size:0.85rem;
        font-weight:700; text-align:center; display:flex; align-items:center; justify-content:center; gap:8px;
    }
    .wep-status-banner.processing { background:rgba(224,64,251,0.1); color:#e040fb; border:1px solid rgba(224,64,251,0.3); animation:wepPulse 2s infinite; }
    .wep-status-banner.success    { background:rgba(0,230,118,0.1);  color:var(--accent-green,#00e676); border:1px solid rgba(0,230,118,0.3); }
    .wep-status-banner.error      { background:rgba(255,82,82,0.1);  color:var(--accent-red,#ff5252);   border:1px solid rgba(255,82,82,0.3); }
    @keyframes wepPulse { 0%,100%{opacity:0.8;}50%{opacity:1;} }

    /* Footer actions */
    .wep-footer { padding:16px 24px; border-top:1px solid rgba(255,255,255,0.07); display:flex; gap:10px; }
    .wep-btn-primary {
        flex:1; background:var(--accent-indigo,#6366f1); color:white;
        border:none; padding:12px; border-radius:10px; font-weight:900;
        font-size:0.88rem; cursor:pointer; transition:0.2s;
    }
    .wep-btn-primary:hover  { opacity:0.85; transform:scale(1.01); }
    .wep-btn-primary:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
    .wep-btn-secondary {
        background:transparent; color:#888; border:1px solid rgba(255,255,255,0.1);
        padding:12px 18px; border-radius:10px; cursor:pointer; transition:0.2s; font-size:0.85rem;
    }
    .wep-btn-secondary:hover { border-color:#888; color:white; }

    .wep-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.2); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; vertical-align:middle; margin-right:6px; }
    @keyframes spin { to{transform:rotate(360deg);} }
`;

// =============================================================================
//  WoEvalPanel — clase estática · abre un modal, gestiona el flujo completo
// =============================================================================
export class WoEvalPanel {

    // ══════════════════════════════════════════════════════════════════════════
    //  open — punto de entrada principal
    //  Detecta automáticamente si la WO es IA o humana y muestra el flujo correcto
    // ══════════════════════════════════════════════════════════════════════════
    static async open({ projectId, woHash, isLegacy = false }) {
        const state   = store.getState();
        const project = state.projects?.find(p => p.id === projectId);
        if (!project) return console.error('[WoEvalPanel] Proyecto no encontrado:', projectId);

        const woArr = project.work_orders || project.workOrders || project.transactions || [];
        const wo    = woArr.find(w => (w.hash || w.id) === woHash);
        if (!wo) return console.error('[WoEvalPanel] WO no encontrada:', woHash);

        // Determinar si es WO de agente IA o humana
        const isAiWo = wo.proofLink === 'Agent_Auto_Report'
            || wo.proofLink === 'Usenet_Thread'
            || (wo.assigneeId && wo.assigneeId.startsWith('@') && wo.assigneeId !== '@alvaro')
            || wo.automation === 'auto';

        // Crear overlay + panel
        const overlay = document.createElement('div');
        overlay.className = 'wep-overlay';
        overlay.innerHTML = `<style>${PANEL_STYLES}</style><div class="wep-panel" id="wep-inner"></div>`;
        document.body.appendChild(overlay);

        // Cerrar al click fuera del panel
        overlay.addEventListener('click', e => { if (e.target === overlay) WoEvalPanel._close(overlay); });

        const panel = overlay.querySelector('#wep-inner');

        if (isAiWo) {
            await WoEvalPanel._flowAi(panel, overlay, project, wo, projectId);
        } else {
            await WoEvalPanel._flowHuman(panel, overlay, project, wo, projectId, woHash);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _flowAi — flujo para WOs de agente IA
    //  1. Muestra SOCs existentes (o genera si faltan)
    //  2. Auto-evalúa el proof of work
    //  3. Auto-consolida si score ≥ 0.8
    // ══════════════════════════════════════════════════════════════════════════
    static async _flowAi(panel, overlay, project, wo, projectId) {
        const socs = WoEvalPanel._getSocs(wo, project);
        const title = wo.entregable || wo.template || 'Work Order';

        WoEvalPanel._renderHeader(panel, title, `IA · ${wo.assigneeId || 'Agente'}`, overlay);

        const body = document.createElement('div');
        body.className = 'wep-body';
        panel.appendChild(body);

        // Si no hay SOCs → generar primero
        if (!socs.length) {
            WoEvalPanel._renderEmptySocs(body);
            WoEvalPanel._renderGenerateSocsBtn(body, panel, overlay, project, wo, projectId, 'ai');
            return;
        }

        WoEvalPanel._renderSocList(body, socs, 'Criterios de Calidad (SOCs)');
        WoEvalPanel._renderProofOfWork(body, wo);

        const footer = WoEvalPanel._renderFooter(panel);
        const evalBtn = WoEvalPanel._addPrimaryBtn(footer, '⚡ Evaluar y Consolidar Automáticamente');

        evalBtn.addEventListener('click', async () => {
            await WoEvalPanel._runEvalAndClose(panel, overlay, body, footer, evalBtn, project, wo, projectId, false);
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _flowHuman — flujo para WOs humanas / manuales
    //  1. Muestra SOCs existentes (o genera si faltan)
    //  2. Cuestionario de preguntas de contexto
    //  3. Formulario: horas reales, comentario, proof link
    //  4. Evalúa comentario + entregable contra SOCs → consolida
    // ══════════════════════════════════════════════════════════════════════════
    static async _flowHuman(panel, overlay, project, wo, projectId, woHash) {
        const socs  = WoEvalPanel._getSocs(wo, project);
        const title = wo.entregable || wo.template || 'Reportar Trabajo';

        WoEvalPanel._renderHeader(panel, title, `Humano · ${wo.from || '—'}`, overlay);

        const body = document.createElement('div');
        body.className = 'wep-body';
        panel.appendChild(body);

        // Si no hay SOCs → generar primero
        if (!socs.length) {
            WoEvalPanel._renderEmptySocs(body);
            WoEvalPanel._renderGenerateSocsBtn(body, panel, overlay, project, wo, projectId, 'human');
            return;
        }

        WoEvalPanel._renderSocList(body, socs, 'Criterios que debes cumplir');

        // Preguntas de contexto (generadas por IA)
        const questionsSection = document.createElement('div');
        questionsSection.innerHTML = `<div class="wep-label" style="margin-bottom:8px;">Preguntas de contexto</div>
            <div class="wep-status-banner processing"><span class="wep-spinner"></span>Generando preguntas...</div>`;
        body.appendChild(questionsSection);

        const questions = await WoEvalPanel._generateContextQuestions(wo, socs);
        questionsSection.innerHTML = '';
        WoEvalPanel._renderQuestions(questionsSection, questions);
        body.appendChild(questionsSection);

        // Formulario de reporte
        const reportSection = document.createElement('div');
        reportSection.innerHTML = `
            <div class="wep-label" style="margin-bottom:10px;">Reporte de Trabajo</div>
            <div class="wep-report-form">
                <div class="wep-hours-row">
                    <div class="wep-field">
                        <label>Horas Reales</label>
                        <input type="number" id="wep-hours" min="0.1" step="0.1"
                               value="${wo.estimatedHours || 1}" placeholder="ej. 2.5">
                    </div>
                    <div class="wep-field">
                        <label>Proof Link (opcional)</label>
                        <input type="text" id="wep-proof" placeholder="URL, PR, doc...">
                    </div>
                </div>
                <div class="wep-field">
                    <label>Descripción del Entregable</label>
                    <textarea id="wep-comentario" rows="4"
                        placeholder="Describe qué has hecho, qué entregaste y cómo cumple los SOCs..."></textarea>
                </div>
            </div>`;
        body.appendChild(reportSection);

        const footer  = WoEvalPanel._renderFooter(panel);
        const evalBtn = WoEvalPanel._addPrimaryBtn(footer, '📤 Reportar y Evaluar');
        WoEvalPanel._addSecondaryBtn(footer, 'Cancelar', () => WoEvalPanel._close(overlay));

        evalBtn.addEventListener('click', async () => {
            const realHours  = parseFloat(panel.querySelector('#wep-hours')?.value) || 1;
            const proofLink  = panel.querySelector('#wep-proof')?.value?.trim() || '';
            const comentario = panel.querySelector('#wep-comentario')?.value?.trim() || '';

            // Recoger respuestas a las preguntas de contexto
            const answers = [];
            panel.querySelectorAll('.wep-q-input').forEach((el, i) => {
                if (el.value.trim()) answers.push(`${questions[i]?.q || 'Contexto'}: ${el.value.trim()}`);
            });
            const fullEntregable = [comentario, ...answers].filter(Boolean).join('\n\n');

            if (!comentario) {
                WoEvalPanel._showBanner(body, 'error', '⚠️ Escribe una descripción del entregable antes de reportar.');
                return;
            }

            // Dispatch REPORT primero
            await store.dispatch({
                type: 'REPORT_WORK_ORDER',
                payload: { projectId, woHash: wo.hash || wo.id, realHours, comentario, proofLink }
            });

            await WoEvalPanel._runEvalAndClose(panel, overlay, body, footer, evalBtn, project,
                { ...wo, comentario, proofLink, realHours }, projectId, false, fullEntregable);
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _runEvalAndClose — ejecuta WoAutoCloser y actualiza la UI
    // ══════════════════════════════════════════════════════════════════════════
    static async _runEvalAndClose(panel, overlay, body, footer, btn, project, wo, projectId, autoApprove, overrideEntregable = null) {
        btn.disabled = true;
        btn.innerHTML = '<span class="wep-spinner"></span>Evaluando…';

        WoEvalPanel._showBanner(body, 'processing', '🤖 Evaluando entregable contra SOCs…');

        try {
            const entregable = overrideEntregable || wo.comentario || `WO completada: ${wo.entregable || wo.template}`;
            const result = await WoAutoCloser.tryClose({
                projectId,
                woHash:     wo.hash || wo.id,
                entregable,
                reportedBy: store.getState().session?.activeUserId || '@alvaro'
            });

            // Mostrar resultado
            const socList = body.querySelector('.wep-soc-list');
            if (socList && result.evalResult) {
                WoEvalPanel._updateSocResults(socList, result.evalResult);
            }

            if (result.status === 'consolidated') {
                WoEvalPanel._showBanner(body, 'success', `✅ Consolidada · Score: ${Math.round((result.score||0)*100)}%`);
                WoEvalPanel._renderScoreBadge(body, result.score, result.evalResult?.feedback);
                footer.innerHTML = '';
                WoEvalPanel._addPrimaryBtn(footer, '🎉 Cerrar').addEventListener('click', () => WoEvalPanel._close(overlay));

            } else if (result.status === 'needs_approval') {
                WoEvalPanel._showBanner(body, 'error',
                    `⚠️ ${result.score < 0.8 ? `Score ${Math.round((result.score||0)*100)}% < 80% mínimo` : 'Alto consumo de tokens'} · Requiere aprobación PO`);
                WoEvalPanel._renderScoreBadge(body, result.score, result.evalResult?.feedback);
                footer.innerHTML = '';
                WoEvalPanel._addPrimaryBtn(footer, '✅ Aprobar y Consolidar Manualmente').addEventListener('click', async () => {
                    await WoAutoCloser.approveAndClose({ projectId, woHash: wo.hash || wo.id, approvedBy: store.getState().session?.activeUserId });
                    WoEvalPanel._close(overlay);
                });
                WoEvalPanel._addSecondaryBtn(footer, 'Cerrar', () => WoEvalPanel._close(overlay));

            } else {
                WoEvalPanel._showBanner(body, 'error', `Estado inesperado: ${result.status}`);
                btn.disabled = false;
                btn.innerHTML = '⟳ Reintentar';
            }

        } catch (err) {
            console.error('[WoEvalPanel]', err);
            WoEvalPanel._showBanner(body, 'error', `❌ Error: ${err.message}`);
            btn.disabled = false;
            btn.innerHTML = '⟳ Reintentar';
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _generateSocs — genera SOCs con IA y recarga el flujo
    // ══════════════════════════════════════════════════════════════════════════
    static async _generateSocs(panel, overlay, project, wo, projectId, mode) {
        const body = panel.querySelector('.wep-body');
        body.innerHTML = '';
        WoEvalPanel._showBanner(body, 'processing', '🤖 Generando criterios de calidad (SOCs) con IA…');

        try {
            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt: `Eres @agent_tdd_auditor del SOS V10. Genera exactamente 3 SOCs (criterios de calidad) verificables para esta Work Order.
Devuelve SOLO JSON: {"socs":[{"id":"soc_1","label":"Criterio verificable en 1 frase clara","isChecked":false},{"id":"soc_2","label":"...","isChecked":false},{"id":"soc_3","label":"...","isChecked":false}]}
Los SOCs deben ser verificables por un tercero sin ambigüedad. Usa lenguaje activo ("El entregable X...").`,
                userPrompt: `WO: ${wo.entregable || wo.template || wo.hash}
Tipo: ${wo.woType || wo.tipo || 'tangible'}
Categoría: ${wo.category || 'deliverable'}
Contexto: ${wo.context || wo.descripcionContexto || ''}`,
                responseFormat: 'json_object',
                temperature: 0.3
            });

            const newSocs = (response.content?.socs || []).map((s, i) => ({
                id:        s.id || `soc_ai_${Date.now()}_${i}`,
                label:     s.label || s.criteria || s.text,
                isChecked: false
            }));

            if (!newSocs.length) throw new Error('La IA no devolvió SOCs válidos.');

            // Persistir en la WO dentro del store
            const woArr = project.work_orders || project.workOrders || project.transactions || [];
            const woIdx = woArr.findIndex(w => (w.hash || w.id) === (wo.hash || wo.id));
            if (woIdx > -1) {
                const updatedWos = [...woArr];
                updatedWos[woIdx] = { ...updatedWos[woIdx], soc_checklist: newSocs };
                await store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: { projectId, updates: { work_orders: updatedWos } }
                });
            }

            // Recargar el flujo con los nuevos SOCs
            const updatedWo = { ...(woArr[woIdx] || wo), soc_checklist: newSocs };
            body.innerHTML = '';
            if (mode === 'ai') {
                await WoEvalPanel._flowAi(panel, overlay, project, updatedWo, projectId);
            } else {
                await WoEvalPanel._flowHuman(panel, overlay, project, updatedWo, projectId, wo.hash || wo.id);
            }

        } catch (err) {
            WoEvalPanel._showBanner(body, 'error', `❌ Error generando SOCs: ${err.message}`);
            WoEvalPanel._renderGenerateSocsBtn(body, panel, overlay, project, wo, projectId, mode);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _generateContextQuestions — genera preguntas de contexto para WOs humanas
    // ══════════════════════════════════════════════════════════════════════════
    static async _generateContextQuestions(wo, socs) {
        try {
            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt: `Eres un auditor de calidad TDD. Genera 2-3 preguntas breves para que el ejecutor de esta Work Order
aporte contexto útil para verificar los SOCs. Las preguntas deben ser directas, en español, sin numeración.
Devuelve SOLO JSON: {"questions":[{"q":"¿Pregunta 1?"},{"q":"¿Pregunta 2?"}]}`,
                userPrompt: `WO: ${wo.entregable || wo.template}
SOCs: ${socs.map(s => s.label).join(' | ')}`,
                responseFormat: 'json_object',
                temperature: 0.4
            });
            return response.content?.questions || [];
        } catch {
            return [
                { q: '¿Qué fue lo más difícil de esta tarea y cómo lo resolviste?' },
                { q: '¿El entregable cumple exactamente lo acordado? ¿Hay alguna variación?' }
            ];
        }
    }

    // ── Helpers de renderizado ────────────────────────────────────────────────

    static _getSocs(wo, project) {
        const wfData = project.vna_flows?.find(f => f.id === wo.flowId) || {};
        return wo.soc_checklist || wfData.soc_checklist || [];
    }

    static _renderHeader(panel, title, subtitle, overlay) {
        const header = document.createElement('div');
        header.className = 'wep-header';
        header.innerHTML = `
            <div>
                <div class="wep-title">${title}</div>
                <div class="wep-sub">${subtitle}</div>
            </div>
            <button class="wep-close" id="wep-x">✕</button>`;
        panel.appendChild(header);
        header.querySelector('#wep-x').addEventListener('click', () => WoEvalPanel._close(overlay));
    }

    static _renderFooter(panel) {
        const footer = document.createElement('div');
        footer.className = 'wep-footer';
        panel.appendChild(footer);
        return footer;
    }

    static _addPrimaryBtn(footer, label) {
        const btn = document.createElement('button');
        btn.className = 'wep-btn-primary';
        btn.textContent = label;
        footer.appendChild(btn);
        return btn;
    }

    static _addSecondaryBtn(footer, label, onClick) {
        const btn = document.createElement('button');
        btn.className = 'wep-btn-secondary';
        btn.textContent = label;
        btn.addEventListener('click', onClick);
        footer.appendChild(btn);
        return btn;
    }

    static _renderSocList(container, socs, titleLabel = 'SOCs') {
        const section = document.createElement('div');
        section.innerHTML = `<div class="wep-soc-header"><div class="wep-label">${titleLabel}</div><span style="font-size:0.75rem;color:#555;">${socs.length} criterios</span></div>`;
        const list = document.createElement('div');
        list.className = 'wep-soc-list';
        socs.forEach(s => {
            const item = document.createElement('div');
            item.className = 'wep-soc-item';
            item.dataset.socId = s.id;
            item.innerHTML = `<span class="wep-soc-icon">${s.isChecked ? '✅' : '⬜'}</span>
                <div class="wep-soc-text">${s.label || s.criteria || s.text}</div>`;
            list.appendChild(item);
        });
        section.appendChild(list);
        container.appendChild(section);
    }

    static _renderEmptySocs(container) {
        const el = document.createElement('div');
        el.className = 'wep-empty-soc';
        el.innerHTML = `<div style="font-size:1.5rem;margin-bottom:8px;">🎯</div>
            <div style="color:#aaa;margin-bottom:4px;">Esta WO no tiene criterios de calidad (SOCs).</div>
            <div style="color:#555;font-size:0.75rem;">Sin SOCs no se puede evaluar automáticamente el entregable.</div>`;
        container.appendChild(el);
    }

    static _renderGenerateSocsBtn(container, panel, overlay, project, wo, projectId, mode) {
        const btn = document.createElement('button');
        btn.className = 'wep-gen-soc-btn';
        btn.textContent = '🤖 Generar SOCs automáticamente con IA';
        btn.addEventListener('click', () => WoEvalPanel._generateSocs(panel, overlay, project, wo, projectId, mode));
        container.appendChild(btn);

        // También ofrecer rellenar manualmente
        const manualEl = document.createElement('div');
        manualEl.style.cssText = 'text-align:center;font-size:0.75rem;color:#555;margin-top:4px;';
        manualEl.textContent = '— o define los SOCs en el editor de proyecto antes de evaluar —';
        container.appendChild(manualEl);
    }

    static _renderProofOfWork(container, wo) {
        if (!wo.comentario) return;
        const el = document.createElement('div');
        el.innerHTML = `<div class="wep-label" style="margin-bottom:6px;">Proof of Work</div>
            <div style="background:rgba(224,64,251,0.05);border:1px solid rgba(224,64,251,0.2);
                        padding:12px;border-radius:10px;font-size:0.82rem;color:#ddd;line-height:1.5;
                        max-height:120px;overflow-y:auto;">
                ${(wo.comentario).replace(/\n/g,'<br>')}
            </div>`;
        container.appendChild(el);
    }

    static _renderQuestions(container, questions) {
        if (!questions.length) return;
        const section = document.createElement('div');
        section.innerHTML = `<div class="wep-label" style="margin-bottom:8px;">Preguntas de contexto</div>`;
        const list = document.createElement('div');
        list.className = 'wep-questions';
        questions.forEach((q, i) => {
            list.innerHTML += `
                <div class="wep-q-item">
                    <div class="wep-q-label">${q.q}</div>
                    <textarea class="wep-q-input" placeholder="Tu respuesta..." rows="2"></textarea>
                </div>`;
        });
        section.appendChild(list);
        container.appendChild(section);
    }

    static _renderScoreBadge(container, score, feedback) {
        const pct   = Math.round((score || 0) * 100);
        const color = pct >= 80 ? 'var(--accent-green,#00e676)' : pct >= 50 ? 'var(--accent-orange,#ffab40)' : 'var(--accent-red,#ff5252)';
        const el    = document.createElement('div');
        el.className = 'wep-score-badge';
        el.innerHTML = `
            <div class="wep-score-ring" style="border-color:${color};color:${color};">${pct}%</div>
            <div class="wep-score-info">
                <div class="wep-score-value" style="color:${color};">Score: ${pct}/100</div>
                <div class="wep-score-label">${pct >= 80 ? 'Aprobado · Consolidando...' : 'Revisar criterios fallados'}</div>
                ${feedback ? `<div class="wep-feedback-text" style="margin-top:6px;">${feedback}</div>` : ''}
            </div>`;
        container.appendChild(el);
    }

    static _updateSocResults(socListEl, evalResult) {
        const passed = new Set(evalResult.passedSocs || []);
        const failed = new Set(evalResult.failedSocs || []);
        socListEl.querySelectorAll('.wep-soc-item').forEach(item => {
            const label = item.querySelector('.wep-soc-text')?.textContent || '';
            const inPassed = [...passed].some(p => label.includes(p.substring(0, 20)));
            const inFailed = [...failed].some(f => label.includes(f.substring(0, 20)));
            if (inPassed) {
                item.classList.add('passed');
                item.querySelector('.wep-soc-icon').textContent = '✅';
            } else if (inFailed) {
                item.classList.add('failed');
                item.querySelector('.wep-soc-icon').textContent = '❌';
            }
        });
    }

    static _showBanner(container, type, message) {
        // Eliminar banners previos del mismo tipo
        container.querySelectorAll('.wep-status-banner').forEach(b => b.remove());
        const el = document.createElement('div');
        el.className = `wep-status-banner ${type}`;
        el.innerHTML = message;
        container.appendChild(el);
    }

    static _close(overlay) {
        overlay.remove();
        // Refrescar el Kanban
        window.dispatchEvent(new CustomEvent('kanban-refresh'));
    }
}
