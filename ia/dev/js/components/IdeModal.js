// =============================================================================
// TEAMTOWERS SOS V10.1 — IDE MODAL COMPONENT
// Ruta: ia/dev/js/components/IdeModal.js
// IDE universal · Modal con contexto adaptable por tipo de nodo
// Integrable en cualquier vista via: IdeModal.open({ type, id, context })
// =============================================================================

import { store }       from '../core/store.js';
import { KB }          from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';
import { EvalEngine }  from '../core/EvalEngine.js';

// ── Tipos de nodo soportados ──────────────────────────────────────────────────
const NODE_TYPES = {
    project:    { icon: '🗼', label: 'Ecosistema',   color: '#00e676' },
    role:       { icon: '🪑', label: 'Rol',          color: '#6366f1' },
    work_order: { icon: '📋', label: 'Work Order',   color: '#ff9100' },
    skill:      { icon: '⚡', label: 'Skill',        color: '#ffd740' },
    agent:      { icon: '🤖', label: 'Agente',       color: '#e040fb' },
    exchange:   { icon: '🔄', label: 'Exchange',     color: '#00b0ff' },
    eval:       { icon: '📐', label: 'Eval/SOC',     color: '#ff5252' },
    vna_node:   { icon: '🕸️', label: 'Nodo VNA',    color: '#6366f1' },
};

export class IdeModal {

    static _instance = null;
    static _mountId  = 'sos-ide-modal-root';

    // ══════════════════════════════════════════════════════════════
    //  open — abre el IDE modal con el contexto dado
    //  context: { type, id, projectId, rawNode, title, onSave }
    // ══════════════════════════════════════════════════════════════
    static async open(context = {}) {
        // Crear mount point si no existe
        let root = document.getElementById(this._mountId);
        if (!root) {
            root = document.createElement('div');
            root.id = this._mountId;
            document.body.appendChild(root);
        }

        // Destruir instancia anterior si existe
        if (this._instance) this._instance._destroy();

        this._instance = new IdeModal(root, context);
        await this._instance._render();
        return this._instance;
    }

    static close() {
        this._instance?._destroy();
        this._instance = null;
    }

    constructor(mountEl, context) {
        this.mount   = mountEl;
        this.context = context;
        this.dom     = {};
        this._dirty  = false;
    }

    // ══════════════════════════════════════════════════════════════
    //  _render — construye el modal completo
    // ══════════════════════════════════════════════════════════════
    async _render() {
        const { type = 'project', id, projectId, rawNode, title, onSave } = this.context;
        const nodeDef = NODE_TYPES[type] || NODE_TYPES.project;

        // Cargar datos del nodo desde store/KB
        const nodeData = rawNode || await this._loadNodeData(type, id, projectId);
        const nodeTitle = title || nodeData?.label || nodeData?.nombre || nodeData?.name || nodeData?.title || id || 'Sin nombre';

        // Construir paneles según tipo
        const panels = await this._buildPanels(type, nodeData, projectId);

        this.mount.innerHTML = `
        <style>
            #sos-ide-overlay {
                position:fixed; inset:0; z-index:9000;
                background:rgba(0,0,0,0.75); backdrop-filter:blur(12px);
                display:flex; align-items:center; justify-content:center;
                padding:1rem; animation:ideIn 0.2s ease;
            }
            @keyframes ideIn { from{opacity:0;transform:scale(0.97);}to{opacity:1;transform:scale(1);} }

            #sos-ide-modal {
                width:100%; max-width:920px; max-height:90vh;
                background:linear-gradient(145deg,rgba(14,14,20,0.99),rgba(8,8,12,0.99));
                border:1px solid rgba(255,255,255,0.08); border-radius:20px;
                display:flex; flex-direction:column; overflow:hidden;
                box-shadow:0 30px 80px rgba(0,0,0,0.9);
                border-top:3px solid ${nodeDef.color};
            }

            /* Header */
            .ide-header {
                display:flex; align-items:center; gap:12px; padding:14px 20px;
                border-bottom:1px solid rgba(255,255,255,0.05);
                background:rgba(0,0,0,0.3); flex-shrink:0;
            }
            .ide-node-icon { font-size:1.4rem; }
            .ide-node-type { font-size:0.62rem; color:${nodeDef.color}; font-family:var(--font-mono);
                text-transform:uppercase; font-weight:bold; letter-spacing:1px; }
            .ide-node-title { font-size:1rem; font-weight:900; color:white; flex:1;
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            .ide-dirty-dot { width:7px; height:7px; border-radius:50%; background:#ff9100;
                display:none; flex-shrink:0; }
            .ide-dirty-dot.visible { display:block; }
            .ide-close { background:transparent; border:none; color:#444; cursor:pointer;
                font-size:1.2rem; padding:4px; border-radius:6px; transition:0.2s; flex-shrink:0; }
            .ide-close:hover { color:white; background:rgba(255,255,255,0.06); }

            /* Tabs */
            .ide-tabs { display:flex; gap:2px; padding:8px 16px 0;
                background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(255,255,255,0.05);
                overflow-x:auto; scrollbar-width:none; flex-shrink:0; }
            .ide-tabs::-webkit-scrollbar { display:none; }
            .ide-tab { padding:6px 14px; border-radius:7px 7px 0 0; border:none;
                background:transparent; color:#555; font-size:0.76rem; font-weight:bold;
                cursor:pointer; transition:0.15s; white-space:nowrap; font-family:var(--font-main); }
            .ide-tab:hover { color:#888; }
            .ide-tab.active { background:rgba(255,255,255,0.06); color:white; }

            /* Body */
            .ide-body { flex:1; overflow-y:auto; padding:16px 20px; display:flex;
                flex-direction:column; gap:14px; }

            /* Panels */
            .ide-panel { background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.05);
                border-radius:12px; overflow:hidden; }
            .ide-panel-header { padding:10px 14px; display:flex; align-items:center;
                justify-content:space-between; gap:8px;
                background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(255,255,255,0.04); }
            .ide-panel-title { font-size:0.68rem; font-weight:900; color:#555;
                text-transform:uppercase; letter-spacing:1.5px; }
            .ide-panel-body { padding:12px 14px; }

            /* Inputs */
            .ide-input { width:100%; background:rgba(0,0,0,0.4); border:1px solid #1a1a1a;
                color:#ccc; padding:8px 11px; border-radius:8px; font-size:0.82rem;
                outline:none; transition:0.2s; box-sizing:border-box; font-family:var(--font-main); }
            .ide-input:focus { border-color:${nodeDef.color}55; color:white; }
            .ide-textarea { resize:vertical; min-height:80px; line-height:1.5;
                font-family:var(--font-mono); font-size:0.76rem; }
            .ide-label { font-size:0.62rem; color:#444; text-transform:uppercase;
                font-weight:bold; letter-spacing:1px; margin-bottom:4px; display:block; }

            /* Eval pills */
            .eval-pill { display:flex; align-items:center; gap:8px; padding:7px 10px;
                background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05);
                border-radius:8px; margin-bottom:5px; }
            .eval-status { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
            .eval-criteria { font-size:0.76rem; color:#888; flex:1; }
            .eval-level { font-size:0.6rem; color:#444; font-family:var(--font-mono); }
            .btn-eval-pass { background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.2);
                color:#00e676; padding:2px 8px; border-radius:5px; cursor:pointer;
                font-size:0.65rem; font-weight:bold; transition:0.15s; }
            .btn-eval-pass:hover { background:rgba(0,230,118,0.15); }
            .btn-eval-fail { background:rgba(255,82,82,0.08); border:1px solid rgba(255,82,82,0.2);
                color:#ff5252; padding:2px 8px; border-radius:5px; cursor:pointer;
                font-size:0.65rem; font-weight:bold; transition:0.15s; }

            /* AI actions */
            .ide-ai-btn { padding:7px 14px; border-radius:8px; font-size:0.74rem;
                font-weight:bold; cursor:pointer; border:none; transition:0.2s;
                display:inline-flex; align-items:center; gap:6px; }
            .ide-ai-btn:hover { filter:brightness(1.2); }
            .ide-ai-btn:disabled { opacity:0.35; cursor:not-allowed; }

            /* Footer */
            .ide-footer { display:flex; align-items:center; justify-content:space-between;
                gap:10px; padding:12px 20px; border-top:1px solid rgba(255,255,255,0.05);
                background:rgba(0,0,0,0.3); flex-shrink:0; }
            .ide-btn-save { background:linear-gradient(135deg,${nodeDef.color}88,${nodeDef.color}55);
                border:none; color:white; padding:9px 20px; border-radius:9px;
                font-weight:900; font-size:0.82rem; cursor:pointer; transition:0.2s; }
            .ide-btn-save:hover { filter:brightness(1.2); transform:translateY(-1px); }
            .ide-btn-cancel { background:transparent; border:1px solid rgba(255,255,255,0.08);
                color:#555; padding:9px 16px; border-radius:9px; cursor:pointer;
                font-size:0.82rem; transition:0.2s; }
            .ide-btn-cancel:hover { color:#888; }

            @media (max-width:768px) {
                #sos-ide-modal { max-height:100vh; border-radius:0; }
                #sos-ide-overlay { padding:0; align-items:flex-end; }
            }
        </style>

        <div id="sos-ide-overlay">
            <div id="sos-ide-modal">
                <!-- Header -->
                <div class="ide-header">
                    <span class="ide-node-icon">${nodeDef.icon}</span>
                    <div style="flex:1;min-width:0;">
                        <div class="ide-node-type">${nodeDef.label}</div>
                        <div class="ide-node-title">${nodeTitle}</div>
                    </div>
                    <div class="ide-dirty-dot" id="ideDirtyDot"></div>
                    <button class="ide-close" id="ideClose">✕</button>
                </div>

                <!-- Tabs -->
                <div class="ide-tabs" id="ideTabs">
                    ${panels.map((p, i) => `
                    <button class="ide-tab ${i===0?'active':''}" data-tab="${i}">${p.label}</button>
                    `).join('')}
                </div>

                <!-- Body -->
                <div class="ide-body" id="ideBody">
                    ${panels[0]?.html || ''}
                </div>

                <!-- Footer -->
                <div class="ide-footer">
                    <div style="font-size:0.68rem;color:#333;font-family:var(--font-mono);">
                        ${type} · ${id || 'nuevo'} · ${projectId || 'global'}
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="ide-btn-cancel" id="ideCancel">Cancelar</button>
                        <button class="ide-btn-save" id="ideSave">💾 Guardar</button>
                    </div>
                </div>
            </div>
        </div>`;

        // Guardar referencias
        this.dom = {
            overlay:  this.mount.querySelector('#sos-ide-overlay'),
            modal:    this.mount.querySelector('#sos-ide-modal'),
            tabs:     this.mount.querySelector('#ideTabs'),
            body:     this.mount.querySelector('#ideBody'),
            save:     this.mount.querySelector('#ideSave'),
            cancel:   this.mount.querySelector('#ideCancel'),
            close:    this.mount.querySelector('#ideClose'),
            dirtyDot: this.mount.querySelector('#ideDirtyDot'),
        };

        this._panels  = panels;
        this._nodeData = nodeData;
        this._onSave  = onSave;

        this._attachEvents();
        this._attachPanelEvents(type, nodeData, projectId);
    }

    // ══════════════════════════════════════════════════════════════
    //  _buildPanels — construye los paneles según el tipo de nodo
    // ══════════════════════════════════════════════════════════════
    async _buildPanels(type, node, projectId) {
        const panels = [];
        const state  = store.getState();

        // ── Panel INFO — siempre presente ─────────────────────────
        panels.push({
            label: '📋 Info',
            html:  this._infoPanel(type, node, state, projectId)
        });

        // ── Panel EVALS — para roles, WOs, skills, exchanges ──────
        if (['role', 'work_order', 'skill', 'vna_node', 'exchange'].includes(type)) {
            const evals = node?.id
                ? (state.projects.find(p=>p.id===projectId)?.evals||[]).filter(e=>e.parentId===node.id)
                : [];
            panels.push({
                label: `📐 SOCs/Evals (${evals.length})`,
                html:  this._evalsPanel(evals, node, projectId)
            });
        }

        // ── Panel IA — acción contextual ──────────────────────────
        panels.push({
            label: '✨ IA',
            html:  this._aiPanel(type, node, projectId)
        });

        // ── Panel LINKS — nodos relacionados ──────────────────────
        if (type !== 'eval') {
            panels.push({
                label: '🔗 Links',
                html:  this._linksPanel(type, node, state, projectId)
            });
        }

        return panels;
    }

    // ── Panel INFO ────────────────────────────────────────────────
    _infoPanel(type, node, state, projectId) {
        const fields = this._getFields(type, node, state, projectId);
        return `
        <div class="ide-panel">
            <div class="ide-panel-header">
                <span class="ide-panel-title">Propiedades</span>
            </div>
            <div class="ide-panel-body">
                ${fields.map(f => `
                <div style="margin-bottom:10px;">
                    <label class="ide-label">${f.label}</label>
                    ${f.type === 'textarea'
                        ? `<textarea class="ide-input ide-textarea" data-field="${f.key}" id="ideField_${f.key}">${f.value || ''}</textarea>`
                        : f.type === 'select'
                        ? `<select class="ide-input" data-field="${f.key}" id="ideField_${f.key}">
                            ${(f.options||[]).map(o=>`<option value="${o.value}" ${o.value==f.value?'selected':''}>${o.label}</option>`).join('')}
                           </select>`
                        : `<input type="${f.type||'text'}" class="ide-input" data-field="${f.key}" id="ideField_${f.key}" value="${f.value||''}" placeholder="${f.placeholder||''}">`
                    }
                </div>`).join('')}
            </div>
        </div>`;
    }

    _getFields(type, node, state, projectId) {
        switch(type) {
            case 'project': return [
                { key:'nombre',      label:'Nombre',       type:'text',     value: node?.nombre      },
                { key:'sector',      label:'Sector',       type:'text',     value: node?.sector      },
                { key:'vna_description', label:'Misión',   type:'textarea', value: node?.vna_description },
            ];
            case 'role': return [
                { key:'name',       label:'Nombre del Rol', type:'text',   value: node?.name    },
                { key:'levelId',    label:'Nivel Casteller',type:'select', value: node?.levelId,
                  options: ['@anxaneta','@aixecador','@dosos','@baixos','@pinya'].map(l=>({value:l,label:l})) },
                { key:'fmv',        label:'FMV (€/hora)',  type:'number',  value: node?.fmv     },
                { key:'multiplier', label:'Multiplicador', type:'number',  value: node?.multiplier },
                { key:'description',label:'Descripción',   type:'textarea',value: node?.description },
            ];
            case 'work_order': return [
                { key:'entregable', label:'Entregable',    type:'text',    value: node?.entregable || node?.template },
                { key:'status',     label:'Estado',        type:'select',  value: node?.status,
                  options: ['theoretical','pinged','reported','consolidated'].map(s=>({value:s,label:s})) },
                { key:'realHours',  label:'Horas reales',  type:'number',  value: node?.realHours },
                { key:'comentario', label:'Comentario',    type:'textarea',value: node?.comentario },
            ];
            case 'skill':
            case 'skill_antigravity': return [
                { key:'title',       label:'Título',        type:'text',    value: node?.title       },
                { key:'description', label:'Descripción',   type:'textarea',value: node?.description },
                { key:'content',     label:'Contenido SOP', type:'textarea',value: typeof node?.content==='string'?node.content:'' },
            ];
            case 'agent': return [
                { key:'name',   label:'Nombre',  type:'text', value: node?.name },
                { key:'globalRole', label:'Rol global', type:'select', value: node?.globalRole,
                  options: ['ai-agent','orchestrator','network-user','ecosystem-owner'].map(r=>({value:r,label:r})) },
            ];
            case 'exchange':
            case 'vna_node': return [
                { key:'label',    label:'Nombre',       type:'text',    value: node?.label || node?.name },
                { key:'role',     label:'Tipo de rol',  type:'select',  value: node?.role,
                  options: ['human','agent','organization','resource','process'].map(r=>({value:r,label:r})) },
                { key:'fmv',      label:'FMV',          type:'number',  value: node?.fmv },
            ];
            default: return [
                { key:'title',   label:'Título',     type:'text',     value: node?.title   },
                { key:'content', label:'Contenido',  type:'textarea', value: typeof node?.content==='string'?node.content:'' },
            ];
        }
    }

    // ── Panel EVALS ───────────────────────────────────────────────
    _evalsPanel(evals, node, projectId) {
        const evalHtml = evals.length ? evals.map(e => {
            const color = e.status==='passed'?'#00e676':e.status==='failed'?'#ff5252':e.status==='active'?'#ff9100':'#333';
            return `
            <div class="eval-pill" data-eval-id="${e.id}">
                <div class="eval-status" style="background:${color};"></div>
                <div class="eval-criteria">${e.criteria}</div>
                <div class="eval-level">L${e.level||0}</div>
                ${e.status !== 'passed' ? `<button class="btn-eval-pass" data-eval-id="${e.id}">✓ Pass</button>` : ''}
                ${e.status !== 'failed' && e.status !== 'passed' ? `<button class="btn-eval-fail" data-eval-id="${e.id}">✗ Fail</button>` : ''}
            </div>`;
        }).join('') : '<div style="color:#333;font-size:0.76rem;padding:8px 0;">Sin evals — usa IA para generarlos.</div>';

        return `
        <div class="ide-panel">
            <div class="ide-panel-header">
                <span class="ide-panel-title">SOCs / Evals TDD</span>
                <button class="ide-ai-btn" id="btnAddEval"
                    style="background:rgba(255,82,82,0.1);border:1px solid rgba(255,82,82,0.2);color:#ff5252;padding:4px 10px;font-size:0.68rem;">
                    + Añadir SOC
                </button>
            </div>
            <div class="ide-panel-body" id="evalList">
                ${evalHtml}
            </div>
        </div>
        <div id="newEvalForm" style="display:none;background:rgba(0,0,0,0.3);border:1px dashed rgba(255,82,82,0.2);border-radius:10px;padding:12px;">
            <label class="ide-label">Criterio del SOC</label>
            <textarea id="newEvalCriteria" class="ide-input ide-textarea" rows="2" placeholder="El entregable demuestra que..."></textarea>
            <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
                <select id="newEvalLevel" class="ide-input" style="flex:0 0 auto;width:auto;">
                    ${[0,1,2,3,4].map(l=>`<option value="${l}">Nivel ${l}</option>`).join('')}
                </select>
                <button id="btnConfirmEval" style="flex:1;background:rgba(255,82,82,0.15);border:1px solid rgba(255,82,82,0.3);color:#ff5252;padding:7px;border-radius:7px;cursor:pointer;font-weight:bold;font-size:0.76rem;">✓ Crear SOC</button>
                <button id="btnCancelEval" style="background:transparent;border:1px solid #1a1a1a;color:#444;padding:7px 10px;border-radius:7px;cursor:pointer;font-size:0.76rem;">✕</button>
            </div>
        </div>`;
    }

    // ── Panel IA ──────────────────────────────────────────────────
    _aiPanel(type, node, projectId) {
        const actions = this._getAiActions(type);
        return `
        <div class="ide-panel">
            <div class="ide-panel-header">
                <span class="ide-panel-title">Acciones IA · Anthropic</span>
            </div>
            <div class="ide-panel-body" style="display:flex;flex-direction:column;gap:8px;">
                ${actions.map(a => `
                <button class="ide-ai-btn" data-ai-action="${a.id}"
                    style="background:${a.bg};border:1px solid ${a.border};color:${a.color};">
                    ${a.icon} ${a.label}
                    <span style="font-size:0.6rem;color:${a.color}55;margin-left:auto;">~${a.tokens}t</span>
                </button>`).join('')}
                <div id="ideAiOutput" style="display:none;background:rgba(0,0,0,0.4);border:1px solid #1a1a1a;border-radius:8px;padding:10px;font-family:var(--font-mono);font-size:0.72rem;color:#aaa;line-height:1.6;max-height:200px;overflow-y:auto;white-space:pre-wrap;"></div>
            </div>
        </div>`;
    }

    _getAiActions(type) {
        const base = [
            { id:'describe', icon:'📝', label:'Describir nodo',         tokens:200, bg:'rgba(99,102,241,0.08)', border:'rgba(99,102,241,0.2)', color:'#6366f1' },
            { id:'socs',     icon:'📐', label:'Generar SOCs/Evals',     tokens:300, bg:'rgba(255,82,82,0.08)',   border:'rgba(255,82,82,0.2)',   color:'#ff5252' },
        ];
        const byType = {
            role:       [{ id:'agent_md', icon:'🧠', label:'Generar AGENT.md', tokens:400, bg:'rgba(224,64,251,0.08)', border:'rgba(224,64,251,0.2)', color:'#e040fb' }],
            skill:      [{ id:'antigravity', icon:'⚡', label:'Compilar Antigravity', tokens:250, bg:'rgba(255,215,64,0.08)', border:'rgba(255,215,64,0.2)', color:'#ffd740' }],
            project:    [{ id:'vna',  icon:'🕸️', label:'Re-mapear VNA',       tokens:600, bg:'rgba(0,230,118,0.08)', border:'rgba(0,230,118,0.2)', color:'#00e676' }],
            work_order: [{ id:'report', icon:'📤', label:'Redactar reporte',   tokens:300, bg:'rgba(255,145,0,0.08)', border:'rgba(255,145,0,0.2)', color:'#ff9100' }],
        };
        return [...base, ...(byType[type] || [])];
    }

    // ── Panel LINKS ───────────────────────────────────────────────
    _linksPanel(type, node, state, projectId) {
        const project = state.projects.find(p => p.id === projectId);
        const links   = [];

        if (type === 'role' && project) {
            const wos = (project.work_orders||[]).filter(w => w.from === node?.id || w.to === node?.id);
            wos.forEach(w => links.push({ icon:'📋', label: w.entregable||w.template||w.hash, sub: w.status, color:'#ff9100' }));
        }
        if (type === 'project') {
            const roles = (project?.roles||project?.vna_nodes||[]);
            roles.slice(0,5).forEach(r => links.push({ icon:'🪑', label: r.name||r.label, sub: r.levelId, color:'#6366f1' }));
        }
        if (type === 'agent') {
            const skills = (node?.profile?.active_skills||[]).slice(0,5);
            skills.forEach(sid => {
                const s = state.globalUsers; // referencia rápida
                links.push({ icon:'⚡', label: sid, sub:'skill', color:'#ffd740' });
            });
        }

        return `
        <div class="ide-panel">
            <div class="ide-panel-header">
                <span class="ide-panel-title">Nodos relacionados</span>
            </div>
            <div class="ide-panel-body">
                ${links.length ? links.map(l => `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
                    <span>${l.icon}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.78rem;color:#ccc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${l.label}</div>
                        <div style="font-size:0.62rem;color:${l.color};">${l.sub}</div>
                    </div>
                </div>`).join('')
                : '<div style="color:#333;font-size:0.76rem;">Sin nodos relacionados detectados.</div>'}
            </div>
        </div>`;
    }

    // ══════════════════════════════════════════════════════════════
    //  _attachEvents — eventos del modal
    // ══════════════════════════════════════════════════════════════
    _attachEvents() {
        // Cerrar
        this.dom.close?.addEventListener('click',  () => IdeModal.close());
        this.dom.cancel?.addEventListener('click', () => IdeModal.close());
        this.dom.overlay?.addEventListener('click', e => {
            if (e.target === this.dom.overlay) IdeModal.close();
        });

        // Esc para cerrar
        this._escHandler = (e) => { if (e.key === 'Escape') IdeModal.close(); };
        document.addEventListener('keydown', this._escHandler);

        // Tabs
        this.mount.querySelectorAll('.ide-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.mount.querySelectorAll('.ide-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const idx = parseInt(tab.dataset.tab);
                this.dom.body.innerHTML = this._panels[idx]?.html || '';
                this._attachPanelEvents(this.context.type, this._nodeData, this.context.projectId);
            });
        });

        // Dirty tracking
        this.mount.querySelectorAll('[data-field]').forEach(inp => {
            inp.addEventListener('input', () => {
                this._dirty = true;
                this.dom.dirtyDot?.classList.add('visible');
            });
        });

        // Guardar
        this.dom.save?.addEventListener('click', async () => {
            await this._save();
        });
    }

    _attachPanelEvents(type, node, projectId) {
        // Evals: pass/fail
        this.mount.querySelectorAll('.btn-eval-pass').forEach(btn => {
            btn.addEventListener('click', async () => {
                const state = store.getState();
                const pid   = projectId || state.session.activeProjectId;
                await EvalEngine.passEval({ projectId: pid, evalId: btn.dataset.evalId, auditedBy: state.session.activeUserId, result: 'Aprobado via IDE' });
                btn.closest('.eval-pill').querySelector('.eval-status').style.background = '#00e676';
                btn.remove();
                window.dispatchEvent(new CustomEvent('sos:eval-updated'));
            });
        });

        this.mount.querySelectorAll('.btn-eval-fail').forEach(btn => {
            btn.addEventListener('click', async () => {
                const state = store.getState();
                await EvalEngine.failEval({ projectId, evalId: btn.dataset.evalId, auditedBy: state.session.activeUserId, result: 'Rechazado via IDE' });
                btn.closest('.eval-pill').querySelector('.eval-status').style.background = '#ff5252';
            });
        });

        // Añadir eval
        this.mount.querySelector('#btnAddEval')?.addEventListener('click', () => {
            const form = this.mount.querySelector('#newEvalForm');
            if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });

        this.mount.querySelector('#btnCancelEval')?.addEventListener('click', () => {
            const form = this.mount.querySelector('#newEvalForm');
            if (form) form.style.display = 'none';
        });

        this.mount.querySelector('#btnConfirmEval')?.addEventListener('click', async () => {
            const criteria = this.mount.querySelector('#newEvalCriteria')?.value.trim();
            const level    = parseInt(this.mount.querySelector('#newEvalLevel')?.value) || 0;
            if (!criteria) return;
            const state = store.getState();
            const pid   = projectId || state.projects[0]?.id;
            await EvalEngine.createEval({ projectId: pid, parentId: node?.id || pid, parentType: type, criteria, level });
            window.dispatchEvent(new CustomEvent('sos:eval-updated'));
            this.mount.querySelector('#newEvalForm').style.display = 'none';
            this.mount.querySelector('#newEvalCriteria').value = '';
        });

        // Acciones IA
        this.mount.querySelectorAll('[data-ai-action]').forEach(btn => {
            btn.addEventListener('click', async () => {
                await this._runAiAction(btn.dataset.aiAction, type, node, projectId, btn);
            });
        });
    }

    // ── Acciones IA ───────────────────────────────────────────────
    async _runAiAction(action, type, node, projectId, btn) {
        const output = this.mount.querySelector('#ideAiOutput');
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Procesando…';
        if (output) { output.style.display = 'block'; output.textContent = '…'; }

        try {
            let result = '';
            const nodeCtx = JSON.stringify(node || {}).substring(0, 800);

            if (action === 'describe') {
                const r = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt: `Eres un experto en Value Network Analysis. Describe este nodo SOS de forma concisa y útil.`,
                    userPrompt: `Tipo: ${type}\nDatos: ${nodeCtx}`,
                    responseFormat: 'text', temperature: 0.4
                });
                result = r.content;
            }
            else if (action === 'socs') {
                const r = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt: `Genera 3 SOCs (criterios de calidad) verificables para este nodo. Devuelve JSON: {"socs":["SOC 1","SOC 2","SOC 3"]}`,
                    userPrompt: `Tipo: ${type}\nDatos: ${nodeCtx}`,
                    responseFormat: 'json_object', temperature: 0.3
                });
                result = (r.content?.socs || []).join('\n');
            }
            else if (action === 'agent_md') {
                const r = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt: `Genera un AGENT.md completo para este rol. Incluye: Misión, SOPs principales, SOCs de auditoría. Texto plano, sin JSON.`,
                    userPrompt: `Rol: ${node?.name}\nDescripción: ${node?.description||''}\nNivel: ${node?.levelId||''}`,
                    responseFormat: 'text', temperature: 0.35
                });
                result = r.content;
                // Rellenar el textarea de content si existe
                const promptField = this.mount.querySelector('#ideField_content');
                if (promptField) promptField.value = result;
            }
            else if (action === 'antigravity') {
                const { SkillAntigravity } = await import('../core/SkillAntigravity.js');
                const ag = await SkillAntigravity.getOrCompile(node?.id, projectId);
                result = SkillAntigravity.buildPromptForAgent(ag);
            }
            else if (action === 'vna') {
                result = 'Usa el botón 👑 Reina TDD en /map para re-mapear el VNA completo.';
            }
            else if (action === 'report') {
                const r = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt: `Redacta un reporte conciso de esta Work Order para el auditor.`,
                    userPrompt: `WO: ${nodeCtx}`,
                    responseFormat: 'text', temperature: 0.4
                });
                result = r.content;
                const comentField = this.mount.querySelector('#ideField_comentario');
                if (comentField) comentField.value = result;
            }

            if (output) output.textContent = result || 'Sin resultado.';
        } catch(err) {
            if (output) output.textContent = `❌ Error: ${err.message}`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // ── Guardar ───────────────────────────────────────────────────
    async _save() {
        const { type, id, projectId, onSave } = this.context;
        const updates = {};

        this.mount.querySelectorAll('[data-field]').forEach(inp => {
            updates[inp.dataset.field] = inp.value;
        });

        try {
            if (type === 'project') {
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: id, updates } });
            }
            else if (type === 'skill' || type === 'skill_antigravity') {
                await KB.init();
                const existing = await KB.getNode(id);
                if (existing) await KB.saveNode({ ...existing, ...updates });
            }
            else if (type === 'role') {
                const state   = store.getState();
                const project = state.projects.find(p => p.id === projectId);
                const roles   = (project?.roles || []).map(r => r.id === id ? { ...r, ...updates } : r);
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: { roles } } });
            }
            else if (type === 'work_order') {
                await store.dispatch({ type: 'UPDATE_WO_STATUS', payload: { projectId, hash: this._nodeData?.hash, status: updates.status } });
                if (updates.realHours || updates.comentario) {
                    await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId, woHash: this._nodeData?.hash, realHours: parseFloat(updates.realHours)||0, comentario: updates.comentario||'' } });
                }
            }

            onSave?.(updates);
            this.dom.save.textContent = '✅ Guardado';
            this.dom.dirtyDot?.classList.remove('visible');
            this._dirty = false;
            setTimeout(() => {
                if (this.dom.save) this.dom.save.textContent = '💾 Guardar';
            }, 1500);
            window.dispatchEvent(new CustomEvent('sos:node-updated', { detail: { type, id, updates } }));

        } catch(err) {
            this.dom.save.textContent = '❌ Error';
            setTimeout(() => { if (this.dom.save) this.dom.save.textContent = '💾 Guardar'; }, 2000);
        }
    }

    // ── Cargar datos del nodo ─────────────────────────────────────
    async _loadNodeData(type, id, projectId) {
        const state   = store.getState();
        const project = state.projects.find(p => p.id === (projectId || id));

        if (type === 'project') return project;
        if (type === 'role')    return (project?.roles||project?.vna_nodes||[]).find(r=>r.id===id);
        if (type === 'work_order') return (project?.work_orders||project?.workOrders||[]).find(w=>w.hash===id||w.id===id);
        if (type === 'agent')   return state.globalUsers.find(u=>u.id===id);
        if (type === 'vna_node') return (project?.vna_nodes||[]).find(n=>n.id===id);

        // KB para skills y evals
        await KB.init();
        return await KB.getNode(id);
    }

    // ── Destruir ──────────────────────────────────────────────────
    _destroy() {
        document.removeEventListener('keydown', this._escHandler);
        this.mount.innerHTML = '';
    }
}

// ── API global para abrir el IDE desde cualquier evento ──────────────────────
window.addEventListener('sos:open-ide', async (e) => {
    await IdeModal.open(e.detail || {});
});

// Alias para compatibilidad con eventos legacy
window.addEventListener('open-forge-modal', async (e) => {
    const nodeId = e.detail?.nodeId;
    if (!nodeId) return;
    await KB.init();
    const node = await KB.getNode(nodeId);
    await IdeModal.open({
        type:      node?.type || 'skill',
        id:        nodeId,
        projectId: node?.projectId || 'global',
        rawNode:   node,
        title:     node?.title || nodeId
    });
});
