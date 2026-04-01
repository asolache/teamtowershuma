// =============================================================================
// TEAMTOWERS SOS V10 — PROJECT FORGE
// Ruta: ia/dev/js/components/ProjectForge.js
// Genesis de Ecosistemas VNA · IA Architect · Roles & Flows auto-diseñados
// V10: inicializa vna_nodes, vna_exchanges, skills, settings.automation_level
// =============================================================================

import { store }        from '../core/store.js';
import { KB }           from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';
import { EvalEngine }   from '../core/EvalEngine.js';

export class ProjectForge {

    constructor(containerId) {
        this.container          = document.getElementById(containerId);
        this.draftRoles         = [];
        this.draftTxs           = [];
        this.draftPresentation  = '';
        this.draftTags          = [];
        this.draftNewMemes      = [];
        this.sectorsFromKB      = {};
        this.enrichedVision     = '';
        this.dom                = {};
        this._pendingResponse   = null;

        this.guardians = [
            { id:'creator',   label:'🎨 Creador'     }, { id:'caregiver', label:'❤️ Cuidador'   },
            { id:'ruler',     label:'👑 Gobernante'   }, { id:'jester',    label:'🃏 Bufón'       },
            { id:'everyman',  label:'🤝 Ciudadano'    }, { id:'lover',     label:'🔥 Amante'      },
            { id:'hero',      label:'⚔️ Héroe'        }, { id:'outlaw',    label:'🏴‍☠️ Rebelde'   },
            { id:'magician',  label:'✨ Mago'          }, { id:'innocent',  label:'🕊️ Inocente'   },
            { id:'explorer',  label:'🧭 Explorador'   }, { id:'sage',      label:'🦉 Sabio'       }
        ];
    }

    async render() {
        if (!this.container) return;
        await KB.init();
        this.sectorsFromKB = (typeof KB.getAvailableSectors === 'function')
                ? await KB.getAvailableSectors()
                : {};

        const urlParams         = new URLSearchParams(window.location.search);
        const preselectedSector = urlParams.get('sector') || '';

        let sectorOptions = `<optgroup label="📦 Catálogo del Knowledge Base">`;
        Object.keys(this.sectorsFromKB).forEach(k => {
            sectorOptions += `<option value="${k}" ${preselectedSector === k ? 'selected' : ''}>${this.sectorsFromKB[k].label}</option>`;
        });
        sectorOptions += `</optgroup><option value="blank_canvas">🌌 Lienzo en Blanco (VNA Puro)</option>`;

        this.container.innerHTML = `
        <style>
            .pf-card { background:linear-gradient(145deg,rgba(20,20,25,0.8),rgba(10,10,15,0.9)); border:1px solid var(--glass-border); border-radius:22px; width:100%; max-width:960px; padding:3rem; position:relative; overflow:hidden; box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 20px 50px rgba(0,0,0,0.5); backdrop-filter:blur(15px); box-sizing:border-box; margin:0 auto; }
            .pf-header { text-align:center; margin-bottom:2.5rem; }
            .pf-header h1 { font-size:2rem; color:white; margin:0; letter-spacing:-1px; font-weight:900; }
            .pf-header p  { color:var(--text-muted); margin-top:8px; font-size:0.95rem; }

            .step-indicator { display:flex; justify-content:center; gap:12px; margin-bottom:2rem; }
            .dot { width:12px; height:12px; border-radius:50%; background:rgba(255,255,255,0.1); transition:all 0.3s; }
            .dot.active { background:var(--accent-indigo,#6366f1); box-shadow:0 0 15px var(--accent-indigo,#6366f1); transform:scale(1.3); }

            .form-group { margin-bottom:18px; }
            .form-group label { display:block; font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:7px; font-weight:bold; letter-spacing:1px; }
            .lux-input { background:rgba(0,0,0,0.5); border:1px solid #333; color:white; padding:13px 16px; border-radius:11px; font-family:inherit; font-size:0.95rem; outline:none; width:100%; transition:all 0.3s; box-sizing:border-box; }
            .lux-input:focus { border-color:var(--accent-indigo,#6366f1); box-shadow:0 0 15px rgba(99,102,241,0.1); }
            .vision-box { min-height:75px; resize:vertical; line-height:1.5; font-family:'Georgia',serif; }

            .ai-loading { display:none; flex-direction:column; align-items:center; justify-content:center; padding:4rem 0; animation:pulse 2s infinite; }
            .ai-loading span { font-size:4rem; margin-bottom:1.5rem; }
            .ai-loading p { color:var(--accent-indigo,#6366f1); font-weight:bold; font-size:1.1rem; margin:0; }

            .step2-grid { display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-bottom:2rem; }
            .role-draft-list { display:flex; flex-direction:column; gap:10px; margin-bottom:1rem; max-height:400px; overflow-y:auto; padding-right:5px; }
            .role-draft-item { background:rgba(0,0,0,0.4); border:1px solid #333; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:10px; }
            .role-draft-item input,.role-draft-item select { background:rgba(0,0,0,0.5); border:1px solid #333; color:white; padding:8px 10px; border-radius:8px; font-size:0.85rem; outline:none; font-family:inherit; width:100%; box-sizing:border-box; }

            .tx-preview-list { display:flex; flex-direction:column; gap:8px; max-height:300px; overflow-y:auto; }

            /* ── Automation selector V10 ─────────────────────── */
            .auto-selector { background:rgba(99,102,241,0.04); border:1px solid rgba(99,102,241,0.15); border-radius:14px; padding:16px; margin-bottom:1.5rem; }
            .auto-selector-title { font-size:0.72rem; font-weight:900; color:#666; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; }
            .auto-option { display:flex; align-items:center; gap:10px; cursor:pointer; padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); margin-bottom:5px; transition:0.2s; }
            .auto-option:hover { background:rgba(255,255,255,0.02); }
            .auto-option.selected { border-color:rgba(99,102,241,0.35); background:rgba(99,102,241,0.06); }
            .auto-option input[type="radio"] { accent-color:var(--accent-indigo,#6366f1); }
            .auto-option-label { font-size:0.82rem; font-weight:bold; color:white; }
            .auto-option-desc  { font-size:0.65rem; color:#555; margin-top:1px; }

            .cascade-toggle-box { background:rgba(99,102,241,0.05); border:1px dashed rgba(99,102,241,0.3); border-radius:12px; padding:16px; margin-bottom:1.5rem; display:flex; align-items:center; justify-content:space-between; gap:15px; }
            .cascade-toggle-box label { color:white; font-weight:bold; font-size:0.95rem; display:flex; align-items:center; gap:10px; cursor:pointer; }

            .tdd-error-panel { background:rgba(255,82,82,0.1); border:1px solid var(--accent-red); border-radius:12px; padding:18px; margin-bottom:1.5rem; display:none; }
            .maieutic-panel  { background:rgba(99,102,241,0.05); border:1px dashed rgba(99,102,241,0.3); border-radius:12px; padding:18px; margin-bottom:1.5rem; display:none; }
            .maieutic-header { font-weight:900; color:var(--accent-indigo,#6366f1); margin-bottom:8px; display:flex; align-items:center; gap:8px; }
            .maieutic-q { margin:8px 0; }
            .maieutic-q input { width:100%; background:rgba(0,0,0,0.5); border:1px solid rgba(99,102,241,0.3); color:white; padding:10px 12px; border-radius:8px; font-size:0.9rem; outline:none; box-sizing:border-box; }

            .actions-row { display:flex; gap:12px; flex-wrap:wrap; justify-content:flex-end; margin-top:1.5rem; align-items:center; }
            .btn-lux { padding:13px 22px; border-radius:11px; font-weight:900; font-size:0.95rem; cursor:pointer; transition:all 0.3s; border:none; }
            .btn-lux-primary { background:linear-gradient(135deg,var(--accent-indigo,#6366f1),var(--accent-purple)); color:white; box-shadow:0 5px 15px rgba(99,102,241,0.2); }
            .btn-lux-primary:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(99,102,241,0.4); }
            .btn-lux-success { background:var(--accent-green); color:black; box-shadow:0 5px 15px rgba(0,230,118,0.2); }
            .btn-lux-outline { background:transparent; border:1px solid #555; color:white; }
            .btn-lux:disabled { opacity:0.5; cursor:not-allowed; pointer-events:none; }

            .modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); z-index:5000; display:none; justify-content:center; align-items:center; }
            .modal-overlay.active { display:flex; }
            .modal-card { background:linear-gradient(145deg,#111,#050505); border:1px solid var(--accent-purple); border-radius:18px; width:100%; max-width:800px; padding:2rem; box-shadow:0 20px 50px rgba(0,0,0,0.9); max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; }
            .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px dashed #333; padding-bottom:1rem; }
            .modal-header h2 { margin:0; color:white; font-size:1.3rem; font-weight:900; }
            .btn-close-modal { background:transparent; border:none; color:#888; font-size:1.4rem; cursor:pointer; }
            .btn-close-modal:hover { color:var(--accent-red); }

            @keyframes pulse { 0%{opacity:0.8;transform:scale(0.95);} 50%{opacity:1;transform:scale(1.05);} 100%{opacity:0.8;transform:scale(0.95);} }
            @media (max-width:768px) { .pf-card{padding:1.5rem;} .step2-grid{grid-template-columns:1fr;} .actions-row{flex-direction:column;} .actions-row .btn-lux{width:100%;} }
        </style>

        <div class="pf-card">
            <div class="step-indicator">
                <div class="dot active" id="pf-dot1"></div>
                <div class="dot"        id="pf-dot2"></div>
            </div>

            <!-- STEP 1 ─────────────────────────────────────── -->
            <div id="pf-step1">
                <div class="pf-header">
                    <h1>Instanciar Ecosistema V10</h1>
                    <p>Genera una red neuronal de valor extrayendo el ADN del LMS Antigravity.</p>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:18px; margin-bottom:1.5rem;">
                    <div class="form-group" style="margin:0;">
                        <label>Nombre de la Red</label>
                        <input type="text" id="inpName" class="lux-input" placeholder="Ej: Protocolo DeFi Nexus">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label>Arquetipo Legal / Flow</label>
                        <select id="inpArchetype" class="lux-input" style="color:var(--accent-indigo,#6366f1);font-weight:bold;">
                            <option value="startup">🚀 Startup (Agilidad)</option>
                            <option value="corp">🏢 Empresa (Gobernanza)</option>
                            <option value="dao">🌐 DAO (Descentralización)</option>
                            <option value="colectivo">🎭 Colectivo Creativo</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label>Sector Ontológico</label>
                        <select id="inpSector" class="lux-input" style="color:var(--accent-purple);font-weight:bold;">
                            ${sectorOptions}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Visión / Ikigai del Ecosistema</label>
                    <textarea id="inpMission" class="lux-input vision-box" placeholder="¿Cuál es el propósito profundo de esta red? ¿Qué problema resuelve? ¿Para quién?"></textarea>
                </div>
                <div class="form-group">
                    <label>Público Objetivo / Mercado</label>
                    <input type="text" id="inpTarget" class="lux-input" placeholder="Ej: startups de fintech en el sur de Europa buscando tokenizar equity">
                </div>

                <div id="tddErrorPanel" class="tdd-error-panel">
                    <h4 style="color:var(--accent-red);margin:0 0 8px 0;">⚠️ TDD Cognitivo: Errores detectados</h4>
                    <ul id="tddErrorList" style="color:#ccc; padding-left:1.5rem; margin:0;"></ul>
                </div>

                <div id="maieuticPanel" class="maieutic-panel">
                    <div class="maieutic-header"><span>🤖</span> @agent_genesis_architect requiere más contexto:</div>
                    <p style="color:#ccc; font-size:0.88rem; margin:0 0 12px 0;">La visión actual es ambigua para un análisis VNA estricto. Aclara estos puntos:</p>
                    <div id="maieuticQuestionsList"></div>
                    <div style="text-align:right; margin-top:12px;">
                        <button class="btn-lux btn-lux-success" id="btnAnswerAndForge">✨ Confirmar y Forjar Ecosistema</button>
                    </div>
                </div>

                <div class="actions-row" id="initialActionsRow">
                    <select id="inpForgeEngine" class="lux-input" style="width:auto;min-width:160px;font-weight:bold;color:var(--accent-indigo,#6366f1);">
                        <option value="">🦉 Motor Óptimo (Anthropic)</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="openai">OpenAI (GPT-4o)</option>
                        <option value="deepseek">DeepSeek (Coder)</option>
                        <option value="gemini">Google Gemini</option>
                    </select>
                    <button class="btn-lux btn-lux-outline" id="btnLoadTemplate">🏗️ Clonar Plantilla Base</button>
                    <button class="btn-lux btn-lux-primary" id="btnEvaluateAI">🧠 Diseñar Topología VNA</button>
                </div>
            </div>

            <!-- LOADING ─────────────────────────────────────── -->
            <div id="pf-loading" class="ai-loading">
                <span>🪐</span>
                <p id="pf-loading-text">Conectando con Orquestador Cognitivo V10…</p>
                <div style="font-size:0.88rem; color:#888; margin-top:10px;">Forjando Ikigais y Tuberías VNA…</div>
            </div>

            <!-- STEP 2 ─────────────────────────────────────── -->
            <div id="pf-step2" style="display:none;">
                <div class="pf-header" style="margin-bottom:2rem;">
                    <h1>Alineación de Equipo</h1>
                    <p>Audita la estructura, configura la automatización y forja el cerebro de las IAs antes de lanzar.</p>
                </div>

                <div class="step2-grid">
                    <div>
                        <h3 style="color:white; margin-top:0;">1. Nodos de la Red (Sillas)</h3>
                        <div class="role-draft-list" id="draftRolesContainer"></div>
                        <button class="btn-lux btn-lux-outline" id="btnAddCustomRole" style="width:100%; border-style:dashed; padding:10px;">➕ Instanciar Silla Adicional</button>
                    </div>
                    <div>
                        <h3 style="color:white; margin-top:0; display:flex; align-items:center; justify-content:space-between;">
                            2. Tuberías VNA
                            <button id="btnAiGenTxs" style="background:linear-gradient(135deg,rgba(99,102,241,0.6),rgba(224,64,251,0.6));border:none;color:white;padding:5px 12px;border-radius:7px;font-size:0.75rem;font-weight:bold;cursor:pointer;">✨ IA genera</button>
                        </h3>
                        <div class="tx-preview-list" id="txPreviewList"></div>
                        <div id="txAddForm" style="margin-top:10px;background:rgba(0,0,0,0.3);border:1px dashed rgba(99,102,241,0.3);border-radius:10px;padding:12px;display:none;">
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
                                <div>
                                    <label style="font-size:0.65rem;color:#666;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:4px;">Desde (Rol)</label>
                                    <select id="txFromRole" style="width:100%;background:rgba(0,0,0,0.5);border:1px solid #333;color:white;padding:7px;border-radius:7px;font-size:0.8rem;outline:none;"></select>
                                </div>
                                <div>
                                    <label style="font-size:0.65rem;color:#666;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:4px;">Hacia (Rol)</label>
                                    <select id="txToRole" style="width:100%;background:rgba(0,0,0,0.5);border:1px solid #333;color:white;padding:7px;border-radius:7px;font-size:0.8rem;outline:none;"></select>
                                </div>
                            </div>
                            <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;margin-bottom:8px;">
                                <div>
                                    <label style="font-size:0.65rem;color:#666;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:4px;">Entregable</label>
                                    <input type="text" id="txTemplate" style="width:100%;background:rgba(0,0,0,0.5);border:1px solid #333;color:white;padding:7px;border-radius:7px;font-size:0.8rem;outline:none;box-sizing:border-box;" placeholder="Ej: Informe semanal">
                                </div>
                                <div>
                                    <label style="font-size:0.65rem;color:#666;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:4px;">Tipo</label>
                                    <select id="txTipo" style="width:100%;background:rgba(0,0,0,0.5);border:1px solid #333;color:white;padding:7px;border-radius:7px;font-size:0.8rem;outline:none;">
                                        <option value="tangible">Tangible</option>
                                        <option value="intangible">Intangible</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size:0.65rem;color:#666;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:4px;">Horas est.</label>
                                    <input type="number" id="txHoras" value="8" min="1" style="width:100%;background:rgba(0,0,0,0.5);border:1px solid #333;color:white;padding:7px;border-radius:7px;font-size:0.8rem;outline:none;box-sizing:border-box;">
                                </div>
                            </div>
                            <div style="display:flex;gap:8px;">
                                <button id="btnConfirmAddTx" style="flex:1;background:rgba(0,230,118,0.1);border:1px solid rgba(0,230,118,0.3);color:var(--accent-green,#00e676);padding:7px;border-radius:7px;font-weight:bold;cursor:pointer;font-size:0.8rem;">✓ Añadir</button>
                                <button id="btnCancelAddTx" style="background:transparent;border:1px solid #333;color:#555;padding:7px 12px;border-radius:7px;cursor:pointer;font-size:0.8rem;">✕</button>
                            </div>
                        </div>
                        <button id="btnShowTxForm" style="width:100%;margin-top:8px;background:transparent;border:1px dashed rgba(255,255,255,0.1);color:#555;padding:8px;border-radius:8px;cursor:pointer;font-size:0.78rem;transition:0.2s;">➕ Añadir transacción manualmente</button>
                    </div>
                </div>

                <!-- ── Automatización V10 ─────────────────────── -->
                <div class="auto-selector">
                    <div class="auto-selector-title">⚙️ Nivel de automatización del Swarm</div>
                    ${[
                        { value:'full_auto',    icon:'⚡', label:'Full Auto', desc:'Work Orders → Swarm directo, sin confirmación' },
                        { value:'review_first', icon:'👁️', label:'Review First', desc:'WOs generadas pero esperan confirmación humana' },
                        { value:'human_only',   icon:'👤', label:'Human Only', desc:'WOs visibles pero sin asignación IA automática' }
                    ].map(opt => `
                    <label class="auto-option ${opt.value === 'review_first' ? 'selected' : ''}" id="autoOpt_${opt.value}">
                        <input type="radio" name="pfAutoLevel" value="${opt.value}" ${opt.value === 'review_first' ? 'checked' : ''}>
                        <div>
                            <div class="auto-option-label">${opt.icon} ${opt.label}</div>
                            <div class="auto-option-desc">${opt.desc}</div>
                        </div>
                    </label>`).join('')}
                </div>

                <div class="cascade-toggle-box">
                    <label for="inpSpawnCascade">
                        <input type="checkbox" id="inpSpawnCascade" checked>
                        ⚡ Modo Cascade: Auto-activar Agentes IA asignados al lanzar
                    </label>
                </div>

                <div class="actions-row">
                    <button class="btn-lux btn-lux-outline" id="btnBack">← Rediseñar</button>
                    <div style="flex:1;"></div>
                    <button class="btn-lux btn-lux-success" id="btnLaunch">🚀 Lanzar Ecosistema V10</button>
                </div>
            </div>
        </div>

        <!-- Modal Agent Studio ──────────────────────────── -->
        <div class="modal-overlay" id="agentStudioModal">
            <div class="modal-card">
                <div class="modal-header">
                    <h2>🧠 Agent Studio — Forja de Cerebro</h2>
                    <button class="btn-close-modal" id="btnCloseStudio">✖</button>
                </div>
                <input type="hidden" id="asRoleId">
                <div class="form-group">
                    <label>Rol / Alias</label>
                    <input type="text" id="asRoleName" class="lux-input" readonly>
                </div>
                <div class="form-group">
                    <label>Descripción del Rol</label>
                    <textarea id="asRoleDesc" class="lux-input" rows="2" placeholder="¿Qué hace este rol?"></textarea>
                </div>
                <div class="form-group">
                    <label>System Prompt (AGENT.md)</label>
                    <textarea id="asRolePrompt" class="lux-input" rows="6" placeholder="Eres un agente especializado en..."></textarea>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:18px;">
                    <div class="form-group" style="margin:0;"><label>IDs Referencias (,)</label><input type="text" id="asRoleRefs" class="lux-input" style="font-size:0.8rem;" placeholder="ref_vna_core..."></div>
                    <div class="form-group" style="margin:0;"><label>IDs Evals (,)</label><input type="text" id="asRoleEvals" class="lux-input" style="font-size:0.8rem;" placeholder="eval_soc_1..."></div>
                    <div class="form-group" style="margin:0;"><label>IDs Scripts (,)</label><input type="text" id="asRoleScripts" class="lux-input" style="font-size:0.8rem;" placeholder="script_api_1..."></div>
                </div>
                <div class="actions-row" style="margin-top:0;">
                    <button class="btn-lux" id="btnAiAgentForger" style="background:linear-gradient(135deg,var(--accent-orange),#ff3d00);color:white;border:none;width:auto;font-size:0.9rem;">🌱 IA Agent Forger</button>
                    <div style="flex:1;"></div>
                    <button class="btn-lux btn-lux-primary" id="btnSaveAgentBrain" style="font-size:0.9rem;">💾 Guardar Cerebro</button>
                </div>
            </div>
        </div>`;

        this._attachEvents();
    }

    _attachEvents() {
        this.dom = {
            step1:             this.container.querySelector('#pf-step1'),
            loading:           this.container.querySelector('#pf-loading'),
            loadingText:       this.container.querySelector('#pf-loading-text'),
            step2:             this.container.querySelector('#pf-step2'),
            dot1:              this.container.querySelector('#pf-dot1'),
            dot2:              this.container.querySelector('#pf-dot2'),
            btnLoadTemplate:   this.container.querySelector('#btnLoadTemplate'),
            btnEvaluateAI:     this.container.querySelector('#btnEvaluateAI'),
            btnAnswerAndForge: this.container.querySelector('#btnAnswerAndForge'),
            btnBack:           this.container.querySelector('#btnBack'),
            btnLaunch:         this.container.querySelector('#btnLaunch'),
            btnAddCustom:      this.container.querySelector('#btnAddCustomRole'),
            rolesContainer:    this.container.querySelector('#draftRolesContainer'),
            txPreviewList:     this.container.querySelector('#txPreviewList'),
            tddErrorPanel:     this.container.querySelector('#tddErrorPanel'),
            tddErrorList:      this.container.querySelector('#tddErrorList'),
            maieuticPanel:     this.container.querySelector('#maieuticPanel'),
            maieuticQList:     this.container.querySelector('#maieuticQuestionsList'),
            inpName:           this.container.querySelector('#inpName'),
            inpSector:         this.container.querySelector('#inpSector'),
            inpArchetype:      this.container.querySelector('#inpArchetype'),
            inpMission:        this.container.querySelector('#inpMission'),
            inpTarget:         this.container.querySelector('#inpTarget'),
            inpForgeEngine:    this.container.querySelector('#inpForgeEngine'),
            inpSpawnCascade:   this.container.querySelector('#inpSpawnCascade'),
            agentModal:        this.container.querySelector('#agentStudioModal'),
            btnCloseStudio:    this.container.querySelector('#btnCloseStudio'),
            btnSaveStudio:     this.container.querySelector('#btnSaveAgentBrain'),
            btnAiForger:       this.container.querySelector('#btnAiAgentForger'),
            asRoleId:          this.container.querySelector('#asRoleId'),
            asRoleName:        this.container.querySelector('#asRoleName'),
            asRoleDesc:        this.container.querySelector('#asRoleDesc'),
            asRolePrompt:      this.container.querySelector('#asRolePrompt'),
            asRoleRefs:        this.container.querySelector('#asRoleRefs'),
            asRoleEvals:       this.container.querySelector('#asRoleEvals'),
            asRoleScripts:     this.container.querySelector('#asRoleScripts'),
        };

        // ── Automation selector ───────────────────────────────────
        this.container.querySelectorAll('[name="pfAutoLevel"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.container.querySelectorAll('.auto-option').forEach(opt => opt.classList.remove('selected'));
                this.container.querySelector(`#autoOpt_${e.target.value}`)?.classList.add('selected');
            });
        });

        // ── Clonar plantilla ──────────────────────────────────────
        this.dom.btnLoadTemplate.addEventListener('click', () => {
            const sectorVal = this.dom.inpSector.value;
            this.draftRoles = [];
            this.draftTxs   = [];
            this.draftTags  = [sectorVal, this.dom.inpArchetype.value];
            this.draftPresentation = `Misión: ${this.dom.inpMission.value}\nPúblico: ${this.dom.inpTarget.value}`;
            if (sectorVal === 'blank_canvas') { alert('🌌 Modo Lienzo en Blanco. Pulsa "Diseñar Topología VNA" para continuar.'); return; }
            const sectorData = this.sectorsFromKB[sectorVal];
            if (sectorData?.roles) {
                const mult = { '@anxaneta':3.0,'@aixecador':2.0,'@dosos':1.5,'@baixos':1.2,'@pinya':1.0 };
                Object.keys(sectorData.roles).forEach(levelKey => {
                    const data = sectorData.roles[levelKey];
                    this.draftRoles.push({ id:'draft_'+Math.random().toString(36).substr(2,9), levelId:levelKey, name:data.name||levelKey, fmv:50, multiplier:mult[levelKey]||1.0, guardian:data.guardian||'everyman', ai_prompt:data.content||'', assignee:'', description:'', references:[], evals:[], scripts:[] });
                });
            }
            this._goToStep2();
        });

        // ── IA Genesis ────────────────────────────────────────────
        this.dom.btnEvaluateAI.addEventListener('click',     () => this._evaluateVisionWithAI());
        this.dom.btnAnswerAndForge.addEventListener('click', () => this._executeFinalForgeWithAI());

        this.dom.btnBack.addEventListener('click', () => {
            this.dom.step2.style.display   = 'none';
            this.dom.step1.style.display   = 'block';
            this.dom.dot2.classList.remove('active');
            this.dom.dot1.classList.add('active');
        });

        this.dom.btnAddCustom.addEventListener('click', () => {
            this.draftRoles.push({ id:'draft_'+Math.random().toString(36).substr(2,9), levelId:'@baixos', name:'Nueva Actividad', fmv:40, multiplier:1.2, guardian:'everyman', ai_prompt:'', assignee:'', description:'', references:[], evals:[], scripts:[] });
            this._renderDraftRoles();
        });

        this.dom.btnLaunch.addEventListener('click', () => this._finalizeProject());

        // ── Transacciones — formulario manual ────────────────────
        const btnShowForm   = this.container.querySelector('#btnShowTxForm');
        const txAddForm     = this.container.querySelector('#txAddForm');
        const btnConfirmTx  = this.container.querySelector('#btnConfirmAddTx');
        const btnCancelTx   = this.container.querySelector('#btnCancelAddTx');

        btnShowForm?.addEventListener('click', () => {
            txAddForm.style.display = 'block';
            btnShowForm.style.display = 'none';
            this._populateTxRoleSelectors();
        });

        btnCancelTx?.addEventListener('click', () => {
            txAddForm.style.display = 'none';
            btnShowForm.style.display = 'block';
        });

        btnConfirmTx?.addEventListener('click', () => {
            const fromId   = this.container.querySelector('#txFromRole')?.value;
            const toId     = this.container.querySelector('#txToRole')?.value;
            const template = this.container.querySelector('#txTemplate')?.value.trim();
            const tipo     = this.container.querySelector('#txTipo')?.value || 'tangible';
            const horas    = parseFloat(this.container.querySelector('#txHoras')?.value) || 8;

            if (!fromId || !toId || !template) return alert('Completa todos los campos.');
            if (fromId === toId) return alert('El origen y destino no pueden ser el mismo rol.');

            const fromRole = this.draftRoles.find(r => r.id === fromId);
            const toRole   = this.draftRoles.find(r => r.id === toId);

            this.draftTxs.push({
                id:          'tx_' + Math.random().toString(36).substr(2,9),
                from:        fromId,
                to:          toId,
                fromLevel:   fromRole?.levelId || '',
                toLevel:     toRole?.levelId   || '',
                tipo,
                template,
                horas,
                soc_checklist: [
                    { id: 'soc_1', text: `${template} entregado según criterios acordados`, isChecked: false },
                    { id: 'soc_2', text: `${template} revisado y validado por el receptor`,  isChecked: false }
                ]
            });

            this._renderTxPreview();
            // Resetear formulario
            this.container.querySelector('#txTemplate').value = '';
            this.container.querySelector('#txHoras').value    = '8';
            txAddForm.style.display = 'none';
            btnShowForm.style.display = 'block';
        });

        // ── IA genera transacciones ───────────────────────────────
        this.container.querySelector('#btnAiGenTxs')?.addEventListener('click', async () => {
            const btn = this.container.querySelector('#btnAiGenTxs');
            if (!this.draftRoles.length) return alert('Primero define los roles.');
            btn.disabled  = true;
            btn.innerText = '⏳ Generando…';

            try {
                const rolesCtx = this.draftRoles.map(r =>
                    `{ id: "${r.id}", levelId: "${r.levelId}", name: "${r.name}" }`
                ).join(', ');

                const response = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt: `Eres @agent_genesis_architect experto en VNA. Genera transacciones de valor realistas entre los roles dados.
Para cada transacción devuelve:
- fromId: id del rol origen
- toId: id del rol destino
- template: nombre del entregable (concreto y accionable)
- tipo: "tangible" o "intangible"
- horas: horas estimadas (número)
- soc_checklist: array de 2 SOCs verificables para este entregable

Reglas:
- Cada rol debe tener al menos una transacción entrante o saliente
- Los intangibles son conocimiento, feedback, aprobaciones
- Los tangibles son entregables concretos: documentos, código, diseños, reportes
- Devuelve SOLO JSON: { "transactions": [...] }`,
                    userPrompt: `Roles: [${rolesCtx}]\nMisión del proyecto: ${this.dom.inpMission?.value || ''}`,
                    responseFormat: 'json_object',
                    temperature: 0.35
                });

                const txs = response.content?.transactions || [];
                txs.forEach(tx => {
                    if (!tx.fromId || !tx.toId || !tx.template) return;
                    const fromRole = this.draftRoles.find(r => r.id === tx.fromId);
                    const toRole   = this.draftRoles.find(r => r.id === tx.toId);
                    if (!fromRole || !toRole) return;
                    this.draftTxs.push({
                        id:           'tx_' + Math.random().toString(36).substr(2,9),
                        from:         tx.fromId,
                        to:           tx.toId,
                        fromLevel:    fromRole.levelId,
                        toLevel:      toRole.levelId,
                        tipo:         tx.tipo || 'tangible',
                        template:     tx.template,
                        horas:        tx.horas || 8,
                        soc_checklist: tx.soc_checklist || [
                            { id:'soc_1', text:`${tx.template} entregado según criterios`, isChecked: false },
                            { id:'soc_2', text:`${tx.template} validado por el receptor`,   isChecked: false }
                        ]
                    });
                });

                this._renderTxPreview();
                btn.innerText = `✅ ${txs.length} transacciones generadas`;
                setTimeout(() => { btn.disabled = false; btn.innerText = '✨ IA genera'; }, 2000);

            } catch (err) {
                alert('Error IA: ' + err.message);
                btn.disabled  = false;
                btn.innerText = '✨ IA genera';
            }
        });

        // ── Agent Studio ──────────────────────────────────────────
        this.dom.btnCloseStudio.addEventListener('click', () => this.dom.agentModal.classList.remove('active'));

        this.dom.btnSaveStudio.addEventListener('click', () => {
            const roleId = this.dom.asRoleId.value;
            const rIdx   = this.draftRoles.findIndex(r => r.id === roleId);
            if (rIdx > -1) {
                this.draftRoles[rIdx].description = this.dom.asRoleDesc.value.trim();
                this.draftRoles[rIdx].ai_prompt   = this.dom.asRolePrompt.value.trim();
                this.draftRoles[rIdx].references  = this.dom.asRoleRefs.value.split(',').map(s=>s.trim()).filter(Boolean);
                this.draftRoles[rIdx].evals       = this.dom.asRoleEvals.value.split(',').map(s=>s.trim()).filter(Boolean);
                this.draftRoles[rIdx].scripts     = this.dom.asRoleScripts.value.split(',').map(s=>s.trim()).filter(Boolean);
                this.dom.agentModal.classList.remove('active');
                this._renderDraftRoles();
            }
        });

        this.dom.btnAiForger.addEventListener('click', async () => {
            const roleName      = this.dom.asRoleName.value;
            const currentPrompt = this.dom.asRolePrompt.value.trim();
            this.dom.btnAiForger.disabled  = true;
            this.dom.btnAiForger.innerText = '⏳ Forjando…';
            try {
                const response = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt: `Eres @agent_skill_crafter. Genera un System Prompt completo (AGENT.md) para el rol "${roleName}" en un ecosistema VNA. El prompt debe incluir: Misión, SOPs principales, SOCs de auditoría. Devuelve SOLO JSON: { "description": "...", "content": "..." }`,
                    userPrompt:   `Rol: ${roleName}\nContexto actual: ${currentPrompt || 'Sin definir'}`,
                    responseFormat: 'json_object', temperature: 0.4
                });
                const data = response.content;
                if (data.description) this.dom.asRoleDesc.value   = data.description;
                if (data.content)     this.dom.asRolePrompt.value = data.content;
            } catch (err) { alert('Error AI Forger: ' + err.message); }
            finally { this.dom.btnAiForger.disabled = false; this.dom.btnAiForger.innerText = '🌱 IA Agent Forger'; }
        });
    }

    async _evaluateVisionWithAI() {
        const name    = this.dom.inpName.value.trim();
        const mission = this.dom.inpMission.value.trim();
        const target  = this.dom.inpTarget.value.trim();
        const engine  = this.dom.inpForgeEngine.value || 'anthropic';
        const sector  = this.dom.inpSector.value;

        if (!name || !mission) return alert('El nombre y la visión son obligatorios.');

        // Contador de rondas — máximo 1 ronda de preguntas
        this._maieuticRound = (this._maieuticRound || 0) + 1;
        const forceGenerate = this._maieuticRound >= 2;

        this.dom.step1.style.display   = 'none';
        this.dom.loading.style.display = 'flex';

        try {
            await KB.init();
            const skillNode    = await KB.getNode('skill_vna_architect');
            const skillContext = skillNode
                ? `Tienes la Skill [${skillNode.title}]. SOP resumido:\n${(skillNode.content||'').substring(0,400)}\n\n`
                : '';

            // Si es la segunda ronda → forzar generación directa, sin más preguntas
            const forceDirective = forceGenerate
                ? `IMPORTANTE: Ya tienes suficiente contexto. DEBES generar el ecosistema ahora.
NO devuelvas más preguntas. Genera el mejor borrador posible con la info disponible.
Si falta algo, inventa valores razonables para el sector "${sector}". El usuario puede editarlo después.\n\n`
                : '';

            const systemPrompt = `Eres @agent_genesis_architect, experto en VNA y ecosistemas Slicing Pie.
${skillContext}${forceDirective}
PROTOCOLO:
- Si la visión es suficientemente clara → genera el ecosistema DIRECTAMENTE (Opción B)
- Si falta información crítica para el VNA → haz máximo 3 preguntas (Opción A)
- Nunca hagas más de 3 preguntas. Con 3 respuestas debes poder generar el borrador.

OPCIÓN A — Solo si faltan datos críticos (máx 3 preguntas enfocadas en VNA):
{
  "requires_clarification": true,
  "questions": [
    "¿Quién paga? (rol que genera ingresos)",
    "¿Qué entrega concreto recibe el cliente?",
    "¿Quién ejecuta el trabajo principal?"
  ]
}

OPCIÓN B — Ecosistema VNA completo (siempre si tienes contexto mínimo):
{
  "requires_clarification": false,
  "presentacion": "Visión del ecosistema en 2-3 frases",
  "tags": ["tag1","tag2"],
  "roles": [
    { "levelId": "@anxaneta|@aixecador|@dosos|@baixos|@pinya",
      "name": "Nombre del rol", "fmv": 60, "multiplier": 2.0,
      "guardian": "archetype",
      "ai_prompt": "System prompt del rol en 1 frase" }
  ],
  "transactions": [
    { "fromLevel": "@baixos", "toLevel": "@dosos",
      "tipo": "tangible|intangible", "template": "Entregable concreto",
      "horas": 8,
      "soc_checklist": [
        {"text":"El entregable cumple criterio X","isChecked":false},
        {"text":"El receptor confirma recepción","isChecked":false}
      ]
    }
  ]
}`;

            if (this.dom.loadingText) this.dom.loadingText.innerText = forceGenerate
                ? 'Generando borrador VNA con el contexto disponible…'
                : 'Analizando visión con @agent_genesis_architect…';

            const response = await Orchestrator.callLLM({
                preferredEngine: engine || 'anthropic',
                systemPrompt,
                userPrompt: `Nombre: ${name}
Sector: ${sector}
Arquetipo: ${this.dom.inpArchetype?.value || ''}
Misión/Visión: ${mission}
Público Objetivo: ${target || 'Por definir'}`,
                responseFormat: 'json_object',
                temperature: forceGenerate ? 0.4 : 0.3
            });

            this.dom.loading.style.display = 'none';
            const parsed = response.content;

            // Si pide clarificación Y no hemos llegado al límite → mostrar preguntas (máx 3)
            if (parsed.requires_clarification && parsed.questions?.length > 0 && !forceGenerate) {
                const qs = parsed.questions.slice(0, 3); // máximo 3 preguntas
                this.dom.maieuticQList.innerHTML = qs.map((q, i) => `
                    <div class="maieutic-q">
                        <label style="color:#aaa;font-size:0.82rem;margin-bottom:4px;display:block;">
                            <span style="color:#6366f1;font-weight:bold;margin-right:6px;">${i+1}.</span>${q}
                        </label>
                        <input type="text" class="maieutic-answer" data-idx="${i}"
                               placeholder="Tu respuesta…"
                               style="background:rgba(0,0,0,0.5);border:1px solid rgba(99,102,241,0.3);
                                      color:white;padding:9px 12px;border-radius:8px;font-size:0.85rem;
                                      outline:none;width:100%;box-sizing:border-box;">
                    </div>`).join('');

                // Mostrar hint de que es la única ronda
                const hint = document.createElement('div');
                hint.style.cssText = 'font-size:0.7rem;color:#444;margin-top:10px;font-style:italic;';
                hint.textContent   = `Responde estas ${qs.length} preguntas y el sistema generará el borrador automáticamente.`;
                this.dom.maieuticQList.appendChild(hint);

                this.dom.maieuticPanel.style.display = 'block';
                this.dom.step1.style.display         = 'block';
                this._pendingResponse = parsed;
                return;
            }

            // En cualquier otro caso (borrador directo o segunda ronda) → generar
            this._maieuticRound = 0; // reset para próximo proyecto
            this._applyParsedEcosystem(parsed);
            this._goToStep2();

        } catch (err) {
            this.dom.loading.style.display = 'none';
            this.dom.step1.style.display   = 'block';
            this._maieuticRound = 0;
            alert('Error en el Orquestador Cognitivo: ' + err.message);
        }
    }

    async _executeFinalForgeWithAI() {
        const answers  = Array.from(this.container.querySelectorAll('.maieutic-answer'))
            .map(i => i.value.trim()).filter(Boolean);
        const mission  = this.dom.inpMission.value.trim();

        // Enriquecer la misión con las respuestas — sin volver a preguntar
        if (answers.length) {
            this.dom.inpMission.value = mission + '\n\nContexto adicional:\n' + answers.map(a => `- ${a}`).join('\n');
        }
        this.dom.maieuticPanel.style.display = 'none';

        // _evaluateVisionWithAI detectará que _maieuticRound >= 2 y forzará la generación
        await this._evaluateVisionWithAI();
    }

    _applyParsedEcosystem(parsed) {
        this.draftPresentation = parsed.presentacion || '';
        this.draftTags         = parsed.tags         || [];
        this.draftNewMemes     = parsed.new_memes    || [];

        this.draftRoles = (parsed.roles || []).map((r, i) => ({
            id:          'draft_role_' + i + '_' + Math.random().toString(36).substr(2,5),
            levelId:     r.levelId,
            name:        r.name,
            fmv:         r.fmv        || 50,
            multiplier:  r.multiplier || 1.0,
            guardian:    r.guardian   || 'everyman',
            ai_prompt:   r.ai_prompt  || '',
            assignee:    '',
            description: '',
            references:  [],
            evals:       [],
            scripts:     []
        }));

        this.draftTxs = (parsed.transactions || []).map((tx, i) => {
            const rFrom = this.draftRoles.find(r => r.levelId === tx.fromLevel) || this.draftRoles[0];
            const rTo   = this.draftRoles.find(r => r.levelId === tx.toLevel)   || this.draftRoles.at(-1);
            return {
                id:            tx.id || `tx_${i}`,
                fromLevel:     tx.fromLevel,
                toLevel:       tx.toLevel,
                from:          rFrom?.id || null,
                to:            rTo?.id   || null,
                tipo:          tx.tipo     || 'tangible',
                template:      tx.template || 'Entregable',
                horas:         tx.horas    || 4,
                soc_checklist: tx.soc_checklist || []
            };
        });
    }

    _runCognitiveTDD(data) {
        const errors = [];
        if (!data.roles?.length)        errors.push('El ecosistema no tiene roles definidos.');
        if (data.roles?.length > 12)    errors.push('Demasiados roles (máx 12 por red VNA).');
        if (!data.transactions?.length) errors.push('Sin tuberías VNA — el valor no puede fluir.');
        return errors;
    }

    _goToStep2() {
        const tddErrors = this._runCognitiveTDD({ roles: this.draftRoles, transactions: this.draftTxs });
        if (tddErrors.length > 0) {
            this.dom.tddErrorPanel.style.display = 'block';
            this.dom.tddErrorList.innerHTML      = tddErrors.map(e => `<li>${e}</li>`).join('');
            return;
        }
        this.dom.tddErrorPanel.style.display = 'none';
        this.dom.step1.style.display          = 'none';
        this.dom.loading.style.display        = 'none';
        this.dom.step2.style.display          = 'block';
        this.dom.dot1.classList.remove('active');
        this.dom.dot2.classList.add('active');
        this._renderDraftRoles();
        this._renderTxPreview();
    }

    _renderDraftRoles() {
        const colors = { '@anxaneta':'var(--accent-red)','@aixecador':'#ff4081','@dosos':'var(--accent-purple)','@baixos':'var(--accent-indigo,#6366f1)','@pinya':'var(--accent-green)' };
        const levels = [
            { id:'@anxaneta',label:'@anxaneta (Dirección)' },{ id:'@aixecador',label:'@aixecador (Táctica)' },
            { id:'@dosos',   label:'@dosos (Auditoría)'   },{ id:'@baixos',   label:'@baixos (Operativa)'  },
            { id:'@pinya',   label:'@pinya (Soporte)'     }
        ];
        const state = store.getState();
        const users = state.globalUsers || [];

        let userOptions = `<option value="">-- Sin asignar --</option>`;
        users.forEach(u => { userOptions += `<option value="${u.id}">${u.profile?.isAi?'🤖':'👤'} ${u.name}</option>`; });

        this.dom.rolesContainer.innerHTML = '';
        this.draftRoles.forEach((role, index) => {
            const color = colors[role.levelId] || '#fff';
            const row   = document.createElement('div');
            row.className = 'role-draft-item';

            let selLevel = `<select class="inp-role-level" data-idx="${index}" style="color:${color};border-color:${color};">`;
            levels.forEach(l => { selLevel += `<option value="${l.id}" ${role.levelId===l.id?'selected':''}>${l.label}</option>`; });
            selLevel += `</select>`;

            let selUser = `<select class="inp-role-assignee" data-idx="${index}" style="border-color:var(--accent-purple);color:var(--accent-purple);">${userOptions.replace(`value="${role.assignee}"`,`value="${role.assignee}" selected`)}</select>`;

            const hasBrain = role.ai_prompt?.length > 5;
            row.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${selLevel}
                    <input type="text" class="inp-role-name" data-idx="${index}" value="${role.name}" placeholder="Nombre del Rol">
                </div>
                <div style="display:grid;grid-template-columns:80px 80px 1fr;gap:8px;align-items:center;">
                    <input type="number" class="inp-role-fmv"  data-idx="${index}" value="${role.fmv}"        placeholder="FMV €/h">
                    <input type="number" class="inp-role-mult" data-idx="${index}" value="${role.multiplier}" step="0.1" placeholder="Mult.">
                    ${selUser}
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn-agent-studio" data-roleid="${role.id}" style="flex:1;background:${hasBrain?'rgba(0,230,118,0.1)':'rgba(99,102,241,0.1)'};border:1px solid ${hasBrain?'var(--accent-green)':'var(--accent-indigo,#6366f1)'};color:${hasBrain?'var(--accent-green)':'var(--accent-indigo,#6366f1)'};padding:7px;border-radius:8px;cursor:pointer;font-size:0.78rem;font-weight:bold;transition:0.2s;">${hasBrain?'🧠 Cerebro ✓':'🧠 Forjar Cerebro'}</button>
                    <button class="btn-del-role" data-idx="${index}" style="background:transparent;border:1px solid var(--accent-red);color:var(--accent-red);padding:7px 11px;border-radius:8px;cursor:pointer;font-weight:bold;">✕</button>
                </div>`;
            this.dom.rolesContainer.appendChild(row);
        });

        this.dom.rolesContainer.querySelectorAll('.inp-role-level').forEach(s    => s.addEventListener('change', e => { this.draftRoles[e.target.dataset.idx].levelId    = e.target.value;               this._renderDraftRoles(); }));
        this.dom.rolesContainer.querySelectorAll('.inp-role-name').forEach(i     => i.addEventListener('input',  e => { this.draftRoles[e.target.dataset.idx].name        = e.target.value; }));
        this.dom.rolesContainer.querySelectorAll('.inp-role-fmv').forEach(i      => i.addEventListener('input',  e => { this.draftRoles[e.target.dataset.idx].fmv         = parseFloat(e.target.value)||0; }));
        this.dom.rolesContainer.querySelectorAll('.inp-role-mult').forEach(i     => i.addEventListener('input',  e => { this.draftRoles[e.target.dataset.idx].multiplier  = parseFloat(e.target.value)||1; }));
        this.dom.rolesContainer.querySelectorAll('.inp-role-assignee').forEach(s => s.addEventListener('change', e => { this.draftRoles[e.target.dataset.idx].assignee    = e.target.value; }));
        this.dom.rolesContainer.querySelectorAll('.btn-del-role').forEach(btn    => btn.addEventListener('click', e => { this.draftRoles.splice(parseInt(e.currentTarget.dataset.idx), 1); this._renderDraftRoles(); }));
        this.dom.rolesContainer.querySelectorAll('.btn-agent-studio').forEach(btn => btn.addEventListener('click', e => this._openAgentStudio(e.currentTarget.dataset.roleid)));
    }

    _populateTxRoleSelectors() {
        const fromSel = this.container.querySelector('#txFromRole');
        const toSel   = this.container.querySelector('#txToRole');
        if (!fromSel || !toSel) return;
        const opts = this.draftRoles.map(r =>
            `<option value="${r.id}">${r.name} (${r.levelId})</option>`
        ).join('');
        fromSel.innerHTML = opts;
        toSel.innerHTML   = opts;
        if (this.draftRoles.length > 1) toSel.selectedIndex = 1;
    }

    _renderTxPreview() {
        if (!this.dom.txPreviewList) return;
        this.dom.txPreviewList.innerHTML = this.draftTxs.length === 0
            ? `<div style="color:#555;font-style:italic;font-size:0.82rem;padding:0.75rem;text-align:center;">Sin tuberías VNA definidas.<br><span style="font-size:0.72rem;color:#444;">Usa "IA genera" o añade manualmente.</span></div>`
            : this.draftTxs.map((tx, idx) => {
                const fromRole = this.draftRoles.find(r => r.id === tx.from);
                const toRole   = this.draftRoles.find(r => r.id === tx.to);
                const color    = tx.tipo === 'intangible' ? 'var(--accent-purple,#e040fb)' : 'var(--accent-green,#00e676)';
                const socCount = (tx.soc_checklist || []).length;
                return `
                <div style="background:rgba(0,0,0,0.3);border:1px solid #222;border-radius:9px;padding:9px 12px;margin-bottom:6px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;">
                        <div style="display:flex;align-items:center;gap:6px;font-size:0.78rem;overflow:hidden;">
                            <span style="color:#666;font-size:0.68rem;font-family:var(--font-mono);white-space:nowrap;">${fromRole?.name || tx.fromLevel || '?'}</span>
                            <span style="color:${color};">→</span>
                            <span style="color:#666;font-size:0.68rem;font-family:var(--font-mono);white-space:nowrap;">${toRole?.name || tx.toLevel || '?'}</span>
                        </div>
                        <button data-tx-idx="${idx}" class="btn-del-tx" style="background:transparent;border:none;color:#333;cursor:pointer;font-size:0.78rem;flex-shrink:0;transition:0.2s;" title="Eliminar">✕</button>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span style="color:white;font-weight:bold;font-size:0.84rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${tx.template}</span>
                        <span style="font-size:0.62rem;padding:1px 6px;border-radius:4px;font-weight:bold;background:rgba(0,0,0,0.3);color:${color};border:1px solid ${color}33;flex-shrink:0;">${tx.tipo}</span>
                        <span style="font-size:0.62rem;color:#555;font-family:var(--font-mono);flex-shrink:0;">${tx.horas}h</span>
                        ${socCount > 0 ? `<span style="font-size:0.62rem;color:var(--accent-orange,#ff9100);flex-shrink:0;" title="${socCount} SOCs">📋${socCount}</span>` : ''}
                    </div>
                </div>`;
            }).join('');

        // Eventos eliminar
        this.dom.txPreviewList.querySelectorAll('.btn-del-tx').forEach(btn => {
            btn.addEventListener('mouseenter', () => { btn.style.color = 'var(--accent-red,#ff5252)'; });
            btn.addEventListener('mouseleave', () => { btn.style.color = '#333'; });
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.txIdx);
                this.draftTxs.splice(idx, 1);
                this._renderTxPreview();
            });
        });
    }

    _openAgentStudio(roleId) {
        const role = this.draftRoles.find(r => r.id === roleId);
        if (!role) return;
        this.dom.asRoleId.value      = role.id;
        this.dom.asRoleName.value    = role.name;
        this.dom.asRoleDesc.value    = role.description || '';
        this.dom.asRolePrompt.value  = role.ai_prompt   || '';
        this.dom.asRoleRefs.value    = (role.references || []).join(', ');
        this.dom.asRoleEvals.value   = (role.evals      || []).join(', ');
        this.dom.asRoleScripts.value = (role.scripts    || []).join(', ');
        this.dom.agentModal.classList.add('active');
    }

    // ══════════════════════════════════════════════════════════════
    //  _finalizeProject — crea el proyecto con todos los campos V10
    // ══════════════════════════════════════════════════════════════
    async _finalizeProject() {
        const projectId      = 'proj_' + Math.random().toString(36).substr(2,9);
        const name           = this.dom.inpName.value.trim() || 'Nueva Red';
        const arch           = this.dom.inpArchetype.value;
        const missionText    = this.dom.inpMission.value.trim();
        const automationLevel = this.container.querySelector('[name="pfAutoLevel"]:checked')?.value || 'review_first';

        // ── Validación TDD antes de lanzar ────────────────────────
        const draftProject = {
            roles:        this.draftRoles,
            vna_nodes:    this.draftRoles,
            vna_flows:    this.draftTxs,
            vna_exchanges: this.draftTxs,
            evals:        []
        };
        const { errors, warnings, isValid } = EvalEngine.validateProjectForge(draftProject);

        if (!isValid) {
            const errorList = errors.map(e => `❌ ${e.message}`).join('\n');
            alert(`⚠️ No se puede lanzar el ecosistema:\n\n${errorList}\n\nCorrige los errores antes de continuar.`);
            return;
        }

        if (warnings.length) {
            const warnList  = warnings.map(w => `⚠️ ${w.message}`).join('\n');
            const proceed   = confirm(`Advertencias TDD detectadas:\n\n${warnList}\n\n¿Continuar de todas formas?`);
            if (!proceed) return;
        }

        this.dom.btnLaunch.disabled  = true;
        this.dom.btnLaunch.innerText = 'Instanciando Matriz V10…';

        // Mapear roles con IDs definitivos
        const finalRoles = this.draftRoles.map(r => ({
            id:          'role_' + Math.random().toString(36).substr(2,9),
            levelId:     r.levelId,
            name:        r.name,
            fmv:         r.fmv,
            multiplier:  r.multiplier,
            guardian:    r.guardian,
            ai_prompt:   r.ai_prompt,
            description: r.description,
            references:  r.references,
            evals:       r.evals,
            scripts:     r.scripts,
            _draftId:    r.id
        }));

        const idMap = {};
        this.draftRoles.forEach((dr, i) => { if (finalRoles[i]) idMap[dr.id] = finalRoles[i].id; });

        const finalFlows = this.draftTxs.map(tx => ({
            id:             'flow_' + Math.random().toString(36).substr(2,9),
            from:           idMap[tx.from]  || (finalRoles.find(r => r.levelId === tx.fromLevel)?.id || ''),
            to:             idMap[tx.to]    || (finalRoles.find(r => r.levelId === tx.toLevel)?.id   || ''),
            tipo:           tx.tipo,
            template:       tx.template,
            horas:          tx.horas,
            estimatedHours: tx.horas,
            soc_checklist:  tx.soc_checklist || []
        }));

        // ── Convertir draftRoles → vna_nodes V10 ─────────────────
        const tierByLevel = { '@anxaneta':0, '@aixecador':1, '@dosos':2, '@baixos':3, '@pinya':3 };
        const roleByLevel = { '@anxaneta':'human', '@aixecador':'human', '@dosos':'agent', '@baixos':'human', '@pinya':'human' };

        const vnaNodes = finalRoles.map(r => ({
            id:    r.id,
            label: r.name,
            role:  r.assignee ? 'human' : (roleByLevel[r.levelId] || 'process'),
            tier:  tierByLevel[r.levelId] ?? 2,
            skills: [],
            fmv:   r.fmv || 50,
            slices: 0.000,
            levelId: r.levelId
        }));

        // ── Convertir draftTxs → vna_exchanges V10 ───────────────
        const vnaExchanges = finalFlows.map((f, i) => ({
            id:          f.id,
            from:        f.from,
            to:          f.to,
            type:        f.tipo || 'tangible',
            category:    f.tipo === 'intangible' ? 'knowledge' : 'deliverable',
            label:       f.template || f.entregable || `Entregable ${i+1}`,
            trigger:     'on-demand',
            frequency:   'recurring',
            automatable: automationLevel !== 'human_only'
        }));

        // ── VnaNetwork JSON-LD completo ───────────────────────────
        const vnaNetwork = {
            '@context': 'https://teamtowers.io/sos/v10/vna',
            '@type':    'VnaNetwork',
            id:         `vna-${projectId}`,
            mission:    missionText,
            vision:     this.draftPresentation,
            nodes:      vnaNodes,
            exchanges:  vnaExchanges,
            meta:       { health_score: 0.7 }
        };

        // ── CREATE_PROJECT con campos V10 completos ───────────────
        await store.dispatch({
            type: 'CREATE_PROJECT',
            payload: {
                id:              projectId,
                nombre:          name,
                sector:          this.dom.inpSector.value,
                prompt:          this.draftPresentation,
                archetype:       arch,
                roles:           finalRoles,
                vna_flows:       finalFlows,
                // ── V10: pre-poblados desde el Forge ────────────
                vna_nodes:       vnaNodes,
                vna_exchanges:   vnaExchanges,
                skills:          [],
                logs:            [],
                work_orders:     [],
                usuarios:        [],
                vna_description: missionText,
                settings: {
                    automation_level: automationLevel,
                    cascade_mode:     this.dom.inpSpawnCascade?.checked ?? true
                }
            }
        });

        // Persistir VnaNetwork en KB para que /map lo cargue
        await KB.init();
        await KB.saveNode({
            id:        `vna-network-${projectId}`,
            type:      'vna-network',
            projectId,
            ...vnaNetwork
        });

        await store.dispatch({
            type:    'UPDATE_PROJECT_INFO',
            payload: { projectId, updates: { presentation: this.draftPresentation, tags: this.draftTags } }
        });

        localStorage.setItem('tt_active_project', projectId);

        await KB.init();

        // Guardar cerebros de agentes en KB
        for (const rol of finalRoles) {
            if (rol.ai_prompt?.length > 5) {
                const promptId = `prompt_global_role_${rol.id}`;
                await KB.saveNode({
                    id:          promptId,
                    type:        'prompt_a2a',
                    category:    'meta_prompt',
                    projectId,
                    targetId:    rol.id,
                    title:       `AGENT.md: ${rol.name}`,
                    content:     rol.ai_prompt,
                    dependencies: [],
                    keywords:    ['ai_agent', projectId]
                });
            }
        }

        // ── Seed de evals por defecto para cada rol ───────────────
        for (const rol of finalRoles) {
            try {
                await EvalEngine.seedEvalsForRole({
                    projectId,
                    roleId:   rol.id,
                    roleName: rol.name,
                    levelId:  rol.levelId,
                    guardian: rol.guardian
                });
            } catch (_) { /* no bloquea el lanzamiento */ }
        }

        // Guardar new_memes de la IA
        for (const meme of this.draftNewMemes) {
            if (meme.id) await KB.saveNode({ ...meme, projectId, targetId: projectId });
        }

        this.dom.btnLaunch.innerText = '✅ Ecosistema Lanzado';

        // Redirigir a /map para mapear VNA directamente
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') window.navigateTo('/map');
            else window.location.href = '/map';
        }, 800);
    }
}
