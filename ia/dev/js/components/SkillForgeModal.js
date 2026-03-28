// =============================================================================
// TEAMTOWERS SOS V10 — SKILL FORGE MODAL
// Ruta: ia/dev/js/components/SkillForgeModal.js
// Editor universal de nodos KB — Skills, References, Evals, Scripts
// Motor: Anthropic via Orchestrator (zero localStorage)
// =============================================================================

import { KB }           from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';

const TAXONOMY_OPTIONS = `
    <optgroup label="Agentes y Nodos">
        <option value="agent">🤖 Agente IA / Persona</option>
        <option value="role">🪑 Silla / Rol VNA</option>
    </optgroup>
    <optgroup label="Skills del Panteón">
        <option value="skill">🎒 Skill (General)</option>
        <option value="core.architecture">🌌 Arquitectura &amp; VNA</option>
        <option value="core.economy">⚖️ Economía &amp; Ledger</option>
        <option value="core.cognition">🧠 Cognición &amp; Ontología</option>
        <option value="core.execution">⚡ Ejecución &amp; Código</option>
        <option value="core.culture">🎭 Cultura &amp; Caos</option>
    </optgroup>
    <optgroup label="Recursos">
        <option value="reference">📚 Referencia (Teoría/Docs)</option>
        <option value="eval">📋 Eval (Test Case)</option>
        <option value="script">⚡ Script (Ejecutable)</option>
    </optgroup>
`;

export class SkillForgeModal {

    constructor(mountPointId) {
        this.container     = document.getElementById(mountPointId);
        this.draftMemory   = null;
        this.allNodesCache = [];
        this.linkedState   = { references: [], evals: [], scripts: [] };
        this.dom           = {};
        this._initGlobalListener();
    }

    _initGlobalListener() {
        document.body.addEventListener('click', (e) => {
            const badge = e.target.closest('.universal-skill-badge');
            if (badge?.dataset.skillId) {
                window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: badge.dataset.skillId } }));
            }
        });
    }

    async render() {
        if (!this.container) return;

        this.container.innerHTML = `
        <style>
            .sfm-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(5,5,8,0.88); backdrop-filter:blur(15px); z-index:6000; display:none; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s; }
            .sfm-overlay.active { display:flex; opacity:1; }
            .sfm-card { background:linear-gradient(145deg,rgba(20,20,25,0.97),rgba(10,10,15,0.99)); border:1px solid var(--accent-indigo,#6366f1); border-radius:22px; width:92%; max-width:1100px; padding:2.5rem; box-shadow:0 30px 60px rgba(0,0,0,0.9),inset 0 1px 0 rgba(255,255,255,0.05); transform:translateY(20px); transition:transform 0.3s cubic-bezier(0.2,0.8,0.2,1); max-height:93vh; overflow-y:auto; display:flex; flex-direction:column; box-sizing:border-box; }
            .sfm-overlay.active .sfm-card { transform:translateY(0); }

            .sfm-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:1.5rem; }
            .sfm-header h2 { margin:0; color:white; font-size:1.6rem; font-weight:900; letter-spacing:-0.5px; display:flex; align-items:center; gap:10px; }
            .sfm-btn-close { background:transparent; border:none; color:#888; font-size:2.2rem; cursor:pointer; transition:0.2s; line-height:1; }
            .sfm-btn-close:hover { color:var(--accent-red); }

            .sfm-body-grid { display:grid; grid-template-columns:1.8fr 1.2fr; gap:28px; flex:1; }

            .sfm-form-group { display:flex; flex-direction:column; gap:7px; margin-bottom:18px; }
            .sfm-form-group label { color:var(--accent-indigo,#6366f1); font-size:0.78rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; display:flex; justify-content:space-between; }
            .sfm-form-control { background:rgba(0,0,0,0.5); border:1px solid #444; color:white; padding:13px 15px; border-radius:11px; font-family:var(--font-main); font-size:0.95rem; outline:none; transition:0.2s; box-sizing:border-box; }
            .sfm-form-control:focus { border-color:var(--accent-indigo,#6366f1); box-shadow:0 0 15px rgba(99,102,241,0.15); }
            .sfm-textarea { min-height:320px; resize:vertical; font-family:var(--font-mono); line-height:1.6; font-size:0.88rem; background:#050508; }
            select.sfm-form-control optgroup,
            select.sfm-form-control option { background:#0a0a0a; color:white; font-family:var(--font-main); }

            /* Smart Inputs */
            .sfm-smart-input-box { background:rgba(0,0,0,0.5); border:1px solid #444; border-radius:11px; padding:8px; display:flex; flex-wrap:wrap; gap:7px; align-items:center; position:relative; transition:0.2s; }
            .sfm-smart-input-box:focus-within { border-color:var(--accent-purple); box-shadow:0 0 15px rgba(224,64,251,0.1); }
            .sfm-smart-input { background:transparent; border:none; color:white; outline:none; font-family:var(--font-mono); font-size:0.83rem; flex:1; min-width:140px; padding:4px; }
            .sfm-dropdown { position:absolute; top:100%; left:0; width:100%; background:rgba(15,15,20,0.97); backdrop-filter:blur(20px); border:1px solid var(--accent-purple); border-radius:11px; margin-top:4px; z-index:100; max-height:220px; overflow-y:auto; display:none; box-shadow:0 10px 30px rgba(0,0,0,0.8); }
            .sfm-dd-item { padding:11px 14px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer; display:flex; flex-direction:column; gap:3px; transition:0.15s; }
            .sfm-dd-item:hover { background:rgba(224,64,251,0.1); }
            .sfm-dd-title { color:white; font-weight:bold; font-size:0.88rem; }
            .sfm-dd-meta  { color:#888; font-size:0.72rem; font-family:var(--font-mono); }
            .sfm-dd-create { color:var(--accent-green); font-weight:bold; padding:11px 14px; cursor:pointer; text-align:center; border-top:1px dashed var(--accent-green); background:rgba(0,230,118,0.05); }
            .sfm-dd-create:hover { background:var(--accent-green); color:black; }

            .sfm-badge       { padding:4px 10px; border-radius:7px; font-size:0.72rem; cursor:pointer; transition:0.2s; font-weight:bold; font-family:var(--font-mono); display:flex; align-items:center; gap:5px; }
            .sfm-badge:hover { filter:brightness(1.2); }
            .sfm-badge .del  { font-size:0.9rem; cursor:pointer; opacity:0.7; }
            .sfm-badge .del:hover { opacity:1; }
            .badge-ref    { background:rgba(0,176,255,0.1);   border:1px solid var(--accent-blue,#00b0ff); color:var(--accent-blue,#00b0ff); }
            .badge-eval   { background:rgba(255,171,64,0.1);  border:1px solid var(--accent-orange);       color:var(--accent-orange); }
            .badge-script { background:rgba(0,230,118,0.1);   border:1px solid var(--accent-green);        color:var(--accent-green); }

            /* Chat Evolver */
            .sfm-chat-box { background:rgba(99,102,241,0.05); border:1px dashed var(--accent-indigo,#6366f1); padding:18px; border-radius:14px; margin-bottom:22px; transition:0.3s; }
            .sfm-chat-box:focus-within { border-style:solid; background:rgba(99,102,241,0.08); box-shadow:0 0 20px rgba(99,102,241,0.1); }
            .sfm-chat-box label { color:var(--accent-indigo,#6366f1); font-weight:900; font-size:0.82rem; margin-bottom:10px; display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:1px; }

            /* Draft Banner */
            .sfm-draft-banner { display:none; background:rgba(255,145,0,0.08); border:1px solid var(--accent-orange); border-radius:14px; padding:18px; margin-bottom:20px; }
            .sfm-draft-banner.active { display:block; animation:fadeIn 0.3s; }
            .sfm-draft-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
            .sfm-draft-title  { font-weight:900; color:var(--accent-orange); font-size:1.1rem; }

            /* Actions */
            .sfm-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:12px; margin-top:2rem; border-top:1px dashed rgba(255,255,255,0.1); padding-top:2rem; }
            .sfm-btn { padding:13px 26px; border-radius:11px; font-weight:900; font-size:0.95rem; cursor:pointer; transition:0.3s; border:none; }
            .sfm-btn-save   { background:linear-gradient(135deg,var(--accent-indigo,#6366f1),var(--accent-purple)); color:white; box-shadow:0 5px 20px rgba(99,102,241,0.3); }
            .sfm-btn-save:hover   { transform:translateY(-2px); box-shadow:0 8px 25px rgba(224,64,251,0.5); filter:brightness(1.1); }
            .sfm-btn-danger { background:transparent; border:1px solid var(--accent-red); color:var(--accent-red); }
            .sfm-btn-danger:hover { background:rgba(255,82,82,0.1); transform:translateY(-2px); }
            .sfm-btn-expand { background:linear-gradient(135deg,var(--accent-orange),#ff3d00); color:white; box-shadow:0 5px 15px rgba(255,145,0,0.3); }
            .sfm-btn-expand:hover { transform:translateY(-2px); filter:brightness(1.1); }
            .sfm-btn-export { background:transparent; border:1px dashed #888; color:#ccc; }
            .sfm-btn-export:hover { background:rgba(255,255,255,0.05); color:white; border-style:solid; }

            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
            @media (max-width:900px) { .sfm-body-grid { grid-template-columns:1fr; } .sfm-actions { flex-direction:column; } .sfm-btn { width:100%; } }
        </style>

        <div class="sfm-overlay" id="editModal">
            <div class="sfm-card">
                <div class="sfm-header">
                    <h2 id="sfmHeaderTitle">🧠 Forja de Entidad</h2>
                    <button class="sfm-btn-close" id="btnCloseModal">&times;</button>
                </div>

                <input type="hidden" id="editNodeId">
                <input type="hidden" id="editNodeProjectId">

                <!-- Draft Banner -->
                <div class="sfm-draft-banner" id="draftBanner">
                    <div class="sfm-draft-header">
                        <span class="sfm-draft-title">✨ Mutación Propuesta por @agent_skill_crafter</span>
                        <div style="display:flex; gap:10px;">
                            <button class="sfm-btn sfm-btn-danger" id="btnDiscardDraft" style="padding:8px 14px; font-size:0.82rem;">Descartar</button>
                            <button class="sfm-btn" id="btnApplyDraft" style="padding:8px 14px; font-size:0.82rem; background:var(--accent-green); color:black;">✅ Aceptar Mutación</button>
                        </div>
                    </div>
                    <div style="font-size:0.9rem; line-height:1.5; color:#ccc;">Revisa los cambios propuestos por la IA antes de sellar en KB.</div>
                </div>

                <div class="sfm-body-grid">
                    <!-- Columna Izquierda: Datos del nodo -->
                    <div>
                        <div class="sfm-form-group">
                            <label>Categoría Ontológica</label>
                            <select id="editNodeCat" class="sfm-form-control">${TAXONOMY_OPTIONS}</select>
                        </div>
                        <div class="sfm-form-group">
                            <label id="lblNodeTitle">Nombre del Nodo</label>
                            <input type="text" id="editNodeTitle" class="sfm-form-control" placeholder="Título descriptivo…">
                        </div>
                        <div class="sfm-form-group">
                            <label>Descripción Corta (max 300 chars)</label>
                            <input type="text" id="editNodeDesc" class="sfm-form-control" maxlength="300" placeholder="Resumen para el Meta-Grafo…">
                        </div>
                        <div class="sfm-form-group">
                            <label id="lblNodeContent">Códice Operativo (VNA / SOP / SOC)</label>
                            <textarea id="editNodeContent" class="sfm-form-control sfm-textarea" placeholder="[VNA_NODE]&#10;...&#10;[SOP]&#10;...&#10;[SOC]&#10;..."></textarea>
                        </div>
                        <div class="sfm-form-group">
                            <label style="color:var(--accent-purple);">🏷️ Tags (Gravedad 3D / Comas)</label>
                            <input type="text" id="editNodeKeywords" class="sfm-form-control" style="font-family:var(--font-mono); font-size:0.85rem;" placeholder="#tag1, #tag2">
                        </div>
                    </div>

                    <!-- Columna Derecha: Relaciones + IA -->
                    <div style="display:flex; flex-direction:column; gap:18px;">
                        <!-- Chat Evolver IA -->
                        <div class="sfm-chat-box" id="chatEvolutionBox">
                            <label>🌱 Directiva al @agent_skill_crafter (IA)</label>
                            <textarea id="aiEvolutionPrompt" class="sfm-form-control" rows="3"
                                      style="background:transparent; border:none; padding:0; font-size:0.88rem; resize:none; outline:none;"
                                      placeholder="Ej: Añade SOCs TDD estrictos y secciones de Arquitectura Hexagonal…"></textarea>
                            <div id="synthStatus" style="font-size:0.7rem; color:var(--accent-purple); font-weight:bold; display:none; animation:pulse 1.5s infinite;">🤖 Sintetizando…</div>
                        </div>

                        <!-- Smart Inputs de Dependencias -->
                        <div class="sfm-form-group" style="margin:0;">
                            <label style="color:var(--accent-blue,#00b0ff);">📚 Referencias (Teoría &amp; Docs)</label>
                            <div class="sfm-smart-input-box" id="box-references">
                                <div id="tags-references" style="display:flex; flex-wrap:wrap; gap:5px;"></div>
                                <input type="text" class="sfm-smart-input" data-type="reference" placeholder="Buscar o crear ref…">
                                <div class="sfm-dropdown"></div>
                            </div>
                        </div>
                        <div class="sfm-form-group" style="margin:0;">
                            <label style="color:var(--accent-orange);">📋 Evals (Test Cases TDD)</label>
                            <div class="sfm-smart-input-box" id="box-evals">
                                <div id="tags-evals" style="display:flex; flex-wrap:wrap; gap:5px;"></div>
                                <input type="text" class="sfm-smart-input" data-type="eval" placeholder="Buscar o crear eval…">
                                <div class="sfm-dropdown"></div>
                            </div>
                        </div>
                        <div class="sfm-form-group" style="margin:0;">
                            <label style="color:var(--accent-green);">⚡ Scripts Ejecutables</label>
                            <div class="sfm-smart-input-box" id="box-scripts">
                                <div id="tags-scripts" style="display:flex; flex-wrap:wrap; gap:5px;"></div>
                                <input type="text" class="sfm-smart-input" data-type="script" placeholder="Buscar o crear script…">
                                <div class="sfm-dropdown"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Acciones -->
                <div class="sfm-actions">
                    <button class="sfm-btn sfm-btn-danger" id="btnDeleteNode" style="display:none;">🗑️ Purgar Entidad</button>
                    <button class="sfm-btn sfm-btn-export" id="btnExportSkill">📦 Exportar ZIP</button>
                    <button class="sfm-btn sfm-btn-expand" id="btnExpandNode">🌱 Evolucionar / Generar</button>
                    <div style="flex:1;"></div>
                    <button class="sfm-btn sfm-btn-save" id="btnSaveNode">💾 Sellar Mutación Definitiva</button>
                </div>
            </div>
        </div>`;

        this.dom = {
            modal:          this.container.querySelector('#editModal'),
            btnClose:       this.container.querySelector('#btnCloseModal'),
            btnSave:        this.container.querySelector('#btnSaveNode'),
            btnDelete:      this.container.querySelector('#btnDeleteNode'),
            btnExpand:      this.container.querySelector('#btnExpandNode'),
            btnExport:      this.container.querySelector('#btnExportSkill'),
            headerTitle:    this.container.querySelector('#sfmHeaderTitle'),
            lblTitle:       this.container.querySelector('#lblNodeTitle'),
            lblContent:     this.container.querySelector('#lblNodeContent'),
            inpId:          this.container.querySelector('#editNodeId'),
            inpProjId:      this.container.querySelector('#editNodeProjectId'),
            inpCat:         this.container.querySelector('#editNodeCat'),
            inpTitle:       this.container.querySelector('#editNodeTitle'),
            inpDesc:        this.container.querySelector('#editNodeDesc'),
            inpContent:     this.container.querySelector('#editNodeContent'),
            inpKeywords:    this.container.querySelector('#editNodeKeywords'),
            draftBanner:    this.container.querySelector('#draftBanner'),
            btnApplyDraft:  this.container.querySelector('#btnApplyDraft'),
            btnDiscardDraft: this.container.querySelector('#btnDiscardDraft'),
            chatInput:      this.container.querySelector('#aiEvolutionPrompt'),
            chatBox:        this.container.querySelector('#chatEvolutionBox'),
            synthStatus:    this.container.querySelector('#synthStatus')
        };

        this._setupEvents();
        this._setupSmartInputs();
    }

    // ── openEditor ────────────────────────────────────────────────
    async openEditor(nodeId) {
        await KB.init();
        this.allNodesCache = await KB.getAllNodes();
        this.draftMemory   = null;
        this.dom.draftBanner.classList.remove('active');
        this.dom.chatBox.style.display = 'block';
        this.dom.chatInput.value       = '';
        this.linkedState = { references: [], evals: [], scripts: [] };

        if (!nodeId) {
            this.dom.inpId.value      = '';
            this.dom.inpProjId.value  = 'global';
            this.dom.inpCat.value     = 'skill';
            this.dom.inpTitle.value   = '';
            this.dom.inpDesc.value    = '';
            this.dom.inpContent.value = '';
            this.dom.inpKeywords.value = '';
            this._updateLabels('skill');
            ['reference','eval','script'].forEach(t => this._renderSmartTags(t));
            this.dom.btnDelete.style.display = 'none';
        } else {
            const node = this.allNodesCache.find(n => n.id === nodeId);
            if (!node) return;

            this.dom.inpId.value      = node.id;
            this.dom.inpProjId.value  = node.projectId || 'global';
            const catMatch = Array.from(this.dom.inpCat.options).find(o => o.value === node.category);
            this.dom.inpCat.value     = catMatch ? node.category : 'skill';
            this.dom.inpTitle.value   = node.title       || '';
            this.dom.inpDesc.value    = node.description || '';
            this.dom.inpContent.value = node.content     || '';
            this.dom.inpKeywords.value = Array.isArray(node.keywords) ? node.keywords.join(', ') : (node.keywords || '');

            this.linkedState.references = Array.isArray(node.references) ? node.references : [];
            this.linkedState.evals      = Array.isArray(node.evals)      ? node.evals      : [];
            this.linkedState.scripts    = Array.isArray(node.scripts)    ? node.scripts    : [];

            ['reference','eval','script'].forEach(t => this._renderSmartTags(t));
            this._updateLabels(this.dom.inpCat.value);

            const isKernel = this.dom.inpKeywords.value.includes('#core_sos');
            this.dom.btnDelete.style.display = isKernel ? 'none' : 'block';
        }

        this.dom.modal.classList.add('active');
    }

    openWithPreloadedData(data) {
        this.openEditor(null).then(() => {
            if (data.title)       this.dom.inpTitle.value   = data.title;
            if (data.description) this.dom.inpDesc.value    = data.description;
            if (data.content)     this.dom.inpContent.value = data.content;
            if (data.entity_type) this.dom.inpCat.value     = data.entity_type;
            this._updateLabels(this.dom.inpCat.value);
        });
    }

    closeEditor() {
        this.dom.modal.classList.remove('active');
        this.draftMemory = null;
        this.dom.draftBanner.classList.remove('active');
    }

    // ── _updateLabels ─────────────────────────────────────────────
    _updateLabels(category) {
        const isAgent    = category === 'agent' || category === 'role';
        const isResource = category === 'reference' || category === 'eval' || category === 'script';
        this.dom.headerTitle.innerHTML = isAgent ? '🧠 Forja de Agente/Rol' : (isResource ? '🛠️ Forja de Recurso' : '🎒 Forja de Skill');
        this.dom.lblTitle.innerText   = isAgent ? 'Nombre de la Entidad' : 'Nombre del Nodo';
        this.dom.lblContent.innerText = isAgent ? 'System Prompt (AGENT.md)' : (isResource ? 'Contenido Bruto (Markdown/Code)' : 'Códice Operativo (VNA / SOP / SOC)');
    }

    // ── _setupEvents ──────────────────────────────────────────────
    _setupEvents() {
        window.addEventListener('open-forge-modal', (e) => {
            document.querySelectorAll('.profile-modal-overlay').forEach(m => m.style.display = 'none');
            this.openEditor(e.detail.nodeId);
        });

        this.dom.btnClose.addEventListener('click',  () => this.closeEditor());
        this.dom.modal.addEventListener('click', (e) => { if (e.target === this.dom.modal) this.closeEditor(); });
        this.dom.inpCat.addEventListener('change', (e) => this._updateLabels(e.target.value));

        // ── Guardar ────────────────────────────────────────────────
        this.dom.btnSave.addEventListener('click', async () => {
            const title = this.dom.inpTitle.value.trim();
            if (!title) return alert('El título es obligatorio.');

            const btn = this.dom.btnSave;
            btn.disabled  = true;
            btn.innerText = '⏳ Sellando…';

            const rawId   = this.dom.inpId.value.trim();
            const nodeId  = rawId || `${this.dom.inpCat.value.replace('.','_')}_${Date.now()}`;
            const rawTags = this.dom.inpKeywords.value;
            const keywords = rawTags ? rawTags.split(',').map(k => k.trim().replace('#','')).filter(Boolean) : [];

            try {
                await KB.init();
                await KB.saveNode({
                    id:          nodeId,
                    type:        this.dom.inpCat.value,
                    category:    this.dom.inpCat.value,
                    projectId:   this.dom.inpProjId.value || 'global',
                    targetId:    'global',
                    title,
                    description: this.dom.inpDesc.value.trim(),
                    content:     this.dom.inpContent.value.trim(),
                    keywords,
                    references:  this.linkedState.references,
                    evals:       this.linkedState.evals,
                    scripts:     this.linkedState.scripts,
                    lastUpdated: Date.now()
                });
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                this.closeEditor();
            } catch (err) {
                alert('Error al guardar: ' + err.message);
            } finally {
                btn.disabled  = false;
                btn.innerText = '💾 Sellar Mutación Definitiva';
            }
        });

        // ── Eliminar ───────────────────────────────────────────────
        this.dom.btnDelete.addEventListener('click', async () => {
            const id = this.dom.inpId.value;
            if (!id) return;
            if (!confirm('⚠️ ¿Purgar este nodo de la red para siempre?')) return;
            this.dom.btnDelete.disabled = true;
            try {
                await KB.init();
                await KB.deleteNode(id);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                this.closeEditor();
            } catch (err) {
                alert(`Error: ${err.message}`);
            } finally {
                this.dom.btnDelete.disabled = false;
            }
        });

        // ── Expandir / Evolucionar con IA ──────────────────────────
        this.dom.btnExpand.addEventListener('click', async () => {
            const title        = this.dom.inpTitle.value.trim();
            const rawContent   = this.dom.inpContent.value.trim();
            const cat          = this.dom.inpCat.value;
            const tags         = this.dom.inpKeywords.value.trim();
            const aiInstruction = this.dom.chatInput.value.trim();

            if (!title) return alert('Se necesita un título para que la IA sepa qué desarrollar.');

            let contentToAI = rawContent;
            if (aiInstruction) contentToAI += `\n\n[DIRECTIVA]:\n${aiInstruction}`;

            this.draftMemory = { title, desc: this.dom.inpDesc.value, content: rawContent, keywords: tags, linked: JSON.parse(JSON.stringify(this.linkedState)) };

            this.dom.btnExpand.disabled  = true;
            this.dom.btnExpand.innerHTML = '⏳ Córtex Evolucionando…';
            this.dom.chatInput.disabled  = true;
            if (this.dom.synthStatus) this.dom.synthStatus.style.display = 'block';

            try {
                // expandNodeSemantics via Orchestrator (zero localStorage)
                const systemPrompt = `Eres @agent_skill_crafter del Swarm SOS V10.
Tu misión es EXPANDIR y OPTIMIZAR un nodo de conocimiento de tipo "${cat}".
Genera contenido con estructura VNA: [VNA_NODE], [SOP] paso a paso, [SOC] criterios TDD.
Si es una Skill compleja, genera también reference_docs de teoría.
Devuelve SOLO un JSON válido con esta estructura exacta:
{
  "title": "Título optimizado",
  "description": "Resumen max 300 chars",
  "content": "Contenido completo con estructura VNA/SOP/SOC",
  "keywords": ["tag1","tag2"],
  "reference_docs": [ { "title": "...", "description": "...", "content": "..." } ]
}`;

                const response = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt,
                    userPrompt:     `TÍTULO: ${title}\nCATEGORÍA: ${cat}\nTAGS: ${tags}\nCONTENIDO ACTUAL:\n${contentToAI}`,
                    responseFormat: 'json_object',
                    temperature:    0.4
                });

                const optimized = response.content;

                this.dom.inpTitle.value    = optimized.title       || title;
                this.dom.inpDesc.value     = optimized.description || '';
                this.dom.inpContent.value  = optimized.content     || rawContent;
                this.dom.inpKeywords.value = Array.isArray(optimized.keywords) ? optimized.keywords.join(', ') : tags;

                // Guardar reference_docs como nodos hijos
                if (optimized.reference_docs?.length > 0) {
                    await KB.init();
                    for (const refDoc of optimized.reference_docs) {
                        const cleanName = refDoc.title.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase().substring(0,20);
                        const newRefId  = `ref_draft_${cleanName}_${Math.random().toString(36).substr(2,4)}`;
                        await KB.saveNode({
                            id: newRefId, type: 'reference', category: 'reference',
                            projectId: 'global', targetId: 'global',
                            title: refDoc.title, description: refDoc.description || '',
                            content: refDoc.content || '', keywords: ['#ai_draft_ref']
                        });
                        this._addSmartTag('reference', newRefId);
                    }
                }

                this.dom.chatBox.style.display = 'none';
                this.dom.draftBanner.classList.add('active');

            } catch (err) {
                alert('Fallo en la evolución: ' + err.message);
                this.draftMemory = null;
            } finally {
                this.dom.btnExpand.disabled  = false;
                this.dom.btnExpand.innerHTML = '🌱 Evolucionar / Generar';
                this.dom.chatInput.disabled  = false;
                if (this.dom.synthStatus) this.dom.synthStatus.style.display = 'none';
            }
        });

        // ── Draft: Aceptar / Descartar ─────────────────────────────
        this.dom.btnApplyDraft.addEventListener('click', () => {
            this.draftMemory = null;
            this.dom.draftBanner.classList.remove('active');
            this.dom.chatBox.style.display = 'block';
        });

        this.dom.btnDiscardDraft.addEventListener('click', () => {
            if (!this.draftMemory) return;
            this.dom.inpTitle.value    = this.draftMemory.title;
            this.dom.inpDesc.value     = this.draftMemory.desc;
            this.dom.inpContent.value  = this.draftMemory.content;
            this.dom.inpKeywords.value = this.draftMemory.keywords;
            this.linkedState           = JSON.parse(JSON.stringify(this.draftMemory.linked));
            ['reference','eval','script'].forEach(t => this._renderSmartTags(t));
            this.draftMemory = null;
            this.dom.draftBanner.classList.remove('active');
            this.dom.chatBox.style.display = 'block';
        });

        // ── Exportar ZIP ───────────────────────────────────────────
        this.dom.btnExport.addEventListener('click', async () => this._exportZip());
    }

    // ── Smart Inputs ──────────────────────────────────────────────
    _setupSmartInputs() {
        this.container.querySelectorAll('.sfm-smart-input').forEach(input => {
            const type     = input.dataset.type;
            const box      = input.closest('.sfm-smart-input-box');
            const dropdown = box.querySelector('.sfm-dropdown');

            input.addEventListener('input', () => {
                const val = input.value.toLowerCase().trim();
                dropdown.innerHTML = '';
                if (!val) { dropdown.style.display = 'none'; return; }

                const matches = this.allNodesCache.filter(n =>
                    (n.type === type || n.category === type) &&
                    (n.title?.toLowerCase().includes(val) || n.id.toLowerCase().includes(val))
                );

                const renderItem = (n) =>
                    `<div class="sfm-dd-item" data-id="${n.id}">
                        <div class="sfm-dd-title">${this._getIconForType(type)} ${n.title || n.id}</div>
                        <div class="sfm-dd-meta">${n.description?.substring(0,60) || n.id}</div>
                    </div>`;

                dropdown.innerHTML = matches.map(renderItem).join('') +
                    `<div class="sfm-dd-create" data-create="${val}">➕ Crear nuevo "${val}"</div>`;
                dropdown.style.display = 'block';

                dropdown.querySelectorAll('.sfm-dd-item').forEach(item => {
                    item.addEventListener('click', () => {
                        this._addSmartTag(type, item.dataset.id);
                        input.value        = '';
                        dropdown.innerHTML = '';
                        dropdown.style.display = 'none';
                    });
                });

                dropdown.querySelector('.sfm-dd-create')?.addEventListener('click', async () => {
                    const newId      = `${type}_${Date.now()}`;
                    const newTitle   = input.value.trim();
                    const newContent = type === 'eval'
                        ? JSON.stringify([{ prompt: newTitle, expected_output: 'Defínelo.' }])
                        : `# ${newTitle}\n\nContenido por definir.`;

                    await KB.init();
                    const saved = await KB.saveNode({
                        id: newId, type, category: type,
                        projectId: 'global', targetId: 'global',
                        title: newTitle, content: newContent, keywords: [`#new_${type}`]
                    });
                    this.allNodesCache.push(saved);
                    this._addSmartTag(type, newId);
                    input.value        = '';
                    dropdown.innerHTML = '';
                    dropdown.style.display = 'none';
                });
            });

            document.addEventListener('click', (e) => {
                if (!box.contains(e.target)) { dropdown.innerHTML = ''; dropdown.style.display = 'none'; }
            });
        });
    }

    _addSmartTag(type, id) {
        if (this.linkedState[type + 's'].includes(id)) return;
        this.linkedState[type + 's'].push(id);
        this._renderSmartTags(type);
    }

    removeSmartTag(type, id) {
        this.linkedState[type + 's'] = this.linkedState[type + 's'].filter(x => x !== id);
        this._renderSmartTags(type);
    }

    _renderSmartTags(type) {
        const container = this.container.querySelector(`#tags-${type}s`);
        if (!container) return;
        const colorClass = type === 'reference' ? 'badge-ref' : (type === 'eval' ? 'badge-eval' : 'badge-script');
        const icon       = this._getIconForType(type);

        container.innerHTML = this.linkedState[type + 's'].map(id => {
            const node  = this.allNodesCache.find(n => n.id === id);
            const title = node?.title || id;
            return `
            <span class="sfm-badge ${colorClass}">
                <span title="Inspeccionar" style="cursor:pointer;" onclick="window.dispatchEvent(new CustomEvent('open-forge-modal',{detail:{nodeId:'${id}'}}))">
                    ${icon} ${title}
                </span>
                <span class="del" data-type="${type}" data-id="${id}">&times;</span>
            </span>`;
        }).join('');

        container.querySelectorAll('.del').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this.removeSmartTag(e.currentTarget.dataset.type, e.currentTarget.dataset.id); });
        });
    }

    _getIconForType(type) {
        return type === 'reference' ? '📚' : (type === 'eval' ? '📋' : '⚡');
    }

    // ── Export ZIP ────────────────────────────────────────────────
    async _exportZip() {
        if (!window.JSZip) await this._loadJSZip();
        const zip        = new window.JSZip();
        const title      = this.dom.inpTitle.value.trim()   || 'Custom_Skill';
        const desc       = this.dom.inpDesc.value.trim()    || 'Skill generada por TeamTowers V10';
        const content    = this.dom.inpContent.value.trim();
        const safeTitle  = title.replace(/[^a-zA-Z0-9_-]/g,'_');
        const rootFolder = zip.folder(safeTitle);

        rootFolder.file('SKILL.md', `---\nname: ${title}\ndescription: ${desc}\n---\n\n${content}`);

        await KB.init();

        if (this.linkedState.references?.length > 0) {
            const folder = rootFolder.folder('references');
            for (const refId of this.linkedState.references) {
                const node = await KB.getNode(refId);
                if (node) {
                    const safe = (node.title || node.id).replace(/[^a-zA-Z0-9_-]/g,'_').toLowerCase();
                    folder.file(`${safe}.md`, `---\nname: ${node.title}\ndescription: ${node.description || ''}\n---\n\n${node.content}`);
                }
            }
        }

        if (this.linkedState.evals?.length > 0) {
            const folder     = rootFolder.folder('evals');
            let allEvalsJson = [];
            for (const evalId of this.linkedState.evals) {
                const node = await KB.getNode(evalId);
                if (node) {
                    try {
                        const parsed = JSON.parse(node.content);
                        if (Array.isArray(parsed)) allEvalsJson.push(...parsed); else allEvalsJson.push(parsed);
                    } catch { allEvalsJson.push({ id: node.id, prompt: node.title }); }
                }
            }
            if (allEvalsJson.length > 0) folder.file('evals.json', JSON.stringify({ skill_name: safeTitle, evals: allEvalsJson }, null, 2));
        }

        if (this.linkedState.scripts?.length > 0) {
            const folder = rootFolder.folder('scripts');
            for (const scriptId of this.linkedState.scripts) {
                const node = await KB.getNode(scriptId);
                if (node) {
                    const sName = node.title.includes('.') ? node.title : `${node.title}.js`;
                    folder.file(sName.replace(/[^a-zA-Z0-9_.-]/g,'_'), node.content);
                }
            }
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${safeTitle}.skill`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async parseZipSkillFile(file, dropzoneElement = null) {
        if (!window.JSZip) await this._loadJSZip();
        try {
            if (dropzoneElement) dropzoneElement.innerHTML = `<span style="font-size:2rem; animation:pulse 1s infinite;">⏳</span><br>Desempaquetando Entidad…`;

            const zip      = new window.JSZip();
            const contents = await zip.loadAsync(file);
            const skillKey = Object.keys(contents.files).find(k => k.endsWith('SKILL.md'));
            if (!skillKey) throw new Error('No es una skill válida. Falta SKILL.md');

            const skillText = await contents.files[skillKey].async('text');
            const nameMatch = skillText.match(/name:\s*(.+)/);
            const descMatch = skillText.match(/description:\s*(.+)/);
            const title     = nameMatch ? nameMatch[1].trim() : file.name.replace('.skill','');
            const desc      = descMatch ? descMatch[1].trim() : 'Skill inyectada.';
            const content   = skillText.replace(/^---\n[\s\S]*?\n---\n/, '').trim();

            const newId      = `skill_imported_${Date.now()}`;
            const linkedRefs = [], linkedEvals = [], linkedScripts = [];
            await KB.init();

            for (const rKey of Object.keys(contents.files).filter(k => k.includes('references/') && k.endsWith('.md'))) {
                const rText  = await contents.files[rKey].async('text');
                const rName  = rText.match(/name:\s*(.+)/)?.[1].trim() || rKey.split('/').pop();
                const rCont  = rText.replace(/^---\n[\s\S]*?\n---\n/,'').trim();
                const rId    = `ref_imp_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                await KB.saveNode({ id:rId, type:'reference', category:'reference', projectId:'global', targetId:'global', title:rName, content:rCont });
                linkedRefs.push(rId);
            }

            for (const eKey of Object.keys(contents.files).filter(k => k.includes('evals/') && k.endsWith('.json'))) {
                const eText   = await contents.files[eKey].async('text');
                const eParsed = JSON.parse(eText);
                const eId     = `eval_imp_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                await KB.saveNode({ id:eId, type:'eval', category:'eval', projectId:'global', targetId:'global', title:`Evals para ${title}`, content: JSON.stringify(eParsed.evals || eParsed) });
                linkedEvals.push(eId);
            }

            for (const sKey of Object.keys(contents.files).filter(k => k.includes('scripts/') && !k.endsWith('/'))) {
                const sText  = await contents.files[sKey].async('text');
                const sTitle = sKey.split('/').pop();
                const sId    = `script_imp_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                await KB.saveNode({ id:sId, type:'script', category:'script', projectId:'global', targetId:'global', title:sTitle, content:sText });
                linkedScripts.push(sId);
            }

            await KB.saveNode({
                id: newId, type:'skill', category:'skill',
                projectId:'global', targetId:'global',
                title, description:desc, content,
                references:linkedRefs, evals:linkedEvals, scripts:linkedScripts,
                keywords:['#imported_skill']
            });

            if (dropzoneElement) {
                dropzoneElement.innerHTML = `<span style="font-size:2rem; color:var(--accent-green);">✅</span><br>¡Entidad <b>${title}</b> inyectada en el Córtex!`;
                setTimeout(() => { dropzoneElement.innerHTML = `<span style="font-size:1.5rem;">📥</span><span>Arrastra un <b>.skill</b> o <b>.zip</b> aquí.</span>`; }, 3000);
            }
            return newId;

        } catch (err) {
            console.error(err);
            if (dropzoneElement) {
                dropzoneElement.innerHTML = `<span style="font-size:2rem; color:var(--accent-red);">❌</span><br>Error: ${err.message}`;
                setTimeout(() => { dropzoneElement.innerHTML = `<span style="font-size:1.5rem;">📥</span><span>Arrastra un <b>.skill</b> o <b>.zip</b> aquí.</span>`; }, 3000);
            }
            alert('Fallo inyectando paquete: ' + err.message);
            return null;
        }
    }

    _loadJSZip() {
        return new Promise((resolve) => {
            if (window.JSZip) return resolve();
            const s   = document.createElement('script');
            s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            s.onload  = resolve;
            document.head.appendChild(s);
        });
    }
}
