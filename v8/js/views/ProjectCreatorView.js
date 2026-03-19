// v8/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Orchestrator } from '../core/Orchestrator.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';
import { MapRenderer } from '../components/MapRenderer.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Instanciar Red | TeamTowers V15.5";
        this.currentStep = 1;
        this.draftRoles = [];
        this.draftTxs = [];
        this.draftPresentation = ""; 
        this.draftTags = []; 
        this.draftNewMemes = []; 
        this.sectorsFromKB = {}; 
        
        this.guardians = [
            { id: 'creator', label: '🎨 Creador' }, { id: 'caregiver', label: '❤️ Cuidador' },
            { id: 'ruler', label: '👑 Gobernante' }, { id: 'jester', label: '🃏 Bufón' },
            { id: 'everyman', label: '🤝 Ciudadano' }, { id: 'lover', label: '🔥 Amante' },
            { id: 'hero', label: '⚔️ Héroe' }, { id: 'outlaw', label: '🏴‍☠️ Rebelde' },
            { id: 'magician', label: '✨ Mago' }, { id: 'innocent', label: '🕊️ Inocente' },
            { id: 'explorer', label: '🧭 Explorador' }, { id: 'sage', label: '🦉 Sabio' }
        ];

        this.mapVis = null;
    }

    async getHtml() {
        await KB.init();
        this.sectorsFromKB = await KB.getAvailableSectors();

        const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        let savedKey = '';
        if (savedProvider === 'deepseek') savedKey = localStorage.getItem('tt_key_deepseek') || '';
        if (savedProvider === 'openai') savedKey = localStorage.getItem('tt_key_openai') || '';
        if (savedProvider === 'gemini') savedKey = localStorage.getItem('tt_key_gemini') || '';

        const hasKey = savedKey.length > 5;
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedSector = urlParams.get('sector') || '';

        let sectorOptions = `<optgroup label="📦 Catálogo del Knowledge Base (V15.5)">`;
        Object.keys(this.sectorsFromKB).forEach(k => {
            const sectorLabel = this.sectorsFromKB[k].label;
            sectorOptions += `<option value="${k}" ${preselectedSector === k ? 'selected' : ''}>${sectorLabel}</option>`;
        });
        sectorOptions += `</optgroup>`;

        return `
            <style>
                ${MapRenderer.getStyles()}

                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .wizard-workspace { flex: 1; padding: 3rem; overflow-y: auto; overflow-x: hidden; display: flex; justify-content: center; align-items: flex-start; background: radial-gradient(circle at center, #111116 0%, #050505 100%); width: 100%; box-sizing: border-box;}
                
                .wizard-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; width: 100%; max-width: 900px; padding: 3rem; position: relative; overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(15px); box-sizing: border-box;}
                
                .wizard-header { text-align: center; margin-bottom: 2.5rem; }
                .wizard-header h1 { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; font-weight: 900; }
                .wizard-header p { color: var(--text-muted); margin-top: 10px; font-size: 1.1rem; }
                
                .step-indicator { display: flex; justify-content: center; gap: 12px; margin-bottom: 2rem; }
                .dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.3s; }
                .dot.active { background: var(--accent-blue); box-shadow: 0 0 15px var(--accent-blue); transform: scale(1.3); }

                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px; }
                .lux-input { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px 18px; border-radius: 12px; font-family: inherit; font-size: 1rem; outline: none; width: 100%; transition: all 0.3s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3); box-sizing: border-box;}
                .lux-input:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.1); }
                .vision-box { min-height: 140px; resize: vertical; line-height: 1.5; }
                
                .ai-config-panel { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px dashed #444; display: flex; flex-direction: column; gap: 15px; margin-bottom: 2rem; margin-top: 10px;}
                .ai-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 15px;}
                
                .ai-loading { display: none; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 0; animation: pulse 2s infinite; }
                .ai-loading span { font-size: 4rem; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0,176,255,0.5); }
                .ai-loading p { color: var(--accent-blue); font-family: var(--font-mono); font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-size: 1.2rem;}

                .tdd-error-panel { display: none; background: rgba(255,82,82,0.1); border: 1px solid var(--accent-red); border-radius: 12px; padding: 20px; margin-bottom: 2rem; animation: slideDown 0.3s ease-out;}
                .tdd-error-title { color: var(--accent-red); font-weight: 900; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;}
                .tdd-error-list { margin: 0; padding-left: 20px; color: white; font-family: var(--font-mono); font-size: 0.85rem;}

                .role-draft-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 2rem; max-height: 400px; overflow-y: auto; padding-right: 10px;}
                .role-draft-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; gap: 15px; transition: transform 0.2s;}
                .role-draft-item:hover { background: rgba(255,255,255,0.04); border-color: #444; }
                
                .role-inputs { display: flex; gap: 12px; flex: 1; align-items: center; flex-wrap: wrap;}
                .inp-role-level, .inp-role-guardian { background: #050505; border: 1px solid #333; border-radius: 8px; padding: 8px 10px; font-size: 0.8rem; font-weight: bold; outline: none; cursor: pointer; transition: border-color 0.2s; color: white;}
                .inp-role-level:focus, .inp-role-guardian:focus { border-color: var(--accent-blue); }
                
                .role-inputs input.inp-role-name { background: transparent; border: none; color: white; font-size: 1rem; border-bottom: 1px solid #444; padding: 8px 5px; flex: 1; min-width: 180px; font-weight: bold; transition:0.3s;}
                .role-inputs input.inp-role-name:focus { border-bottom-color: var(--accent-blue); outline: none; }
                .role-inputs .fmv-input { width: 70px; min-width: 70px; text-align: center; color: var(--accent-green); font-family: var(--font-mono); background: transparent; border: none; border-bottom: 1px solid #444; font-size: 1rem; font-weight: bold; transition:0.3s;}
                
                .btn-del-role { background: transparent; border: none; color: var(--accent-red); cursor: pointer; font-size: 1.5rem; padding: 5px 10px; transition: transform 0.2s; border-radius: 8px;}
                .btn-del-role:hover { transform: scale(1.1); background: rgba(255,82,82,0.1); }

                /* MINI MAP CONTAINER */
                .mini-map-container { width: 100%; height: 400px; position: relative; margin-bottom: 2rem; border-radius:16px; border:1px solid #333; overflow:hidden;}

                .tx-feedback-box { background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); padding: 15px 20px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;}
                .tx-feedback-box:hover { background: rgba(0, 230, 118, 0.1); border-color: rgba(0, 230, 118, 0.4); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,230,118,0.1);}
                
                .tx-preview-list { display: none; margin-bottom: 2rem; background: rgba(0,0,0,0.4); border: 1px solid #333; border-radius: 12px; padding: 20px; max-height: 400px; overflow-y: auto;}
                .tx-preview-item { font-size: 0.85rem; color: #ccc; padding: 15px 10px; border-bottom: 1px dashed #333; display: flex; flex-direction: column; gap: 10px;}
                .tx-preview-item:last-child { border-bottom: none; }

                .actions-row { display: flex; gap: 15px; flex-wrap: wrap; justify-content: flex-end; margin-top: 1.5rem; }
                
                .btn-lux { padding: 14px 24px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; transition: all 0.3s; border: none;}
                .btn-lux-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; box-shadow: 0 5px 15px rgba(0,176,255,0.2);}
                .btn-lux-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,176,255,0.4); filter: brightness(1.1);}
                .btn-lux-success { background: var(--accent-green); color: black; box-shadow: 0 5px 15px rgba(0,230,118,0.2);}
                .btn-lux-success:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,230,118,0.4);}
                .btn-lux-outline { background: transparent; border: 1px solid #555; color: white;}
                .btn-lux-outline:hover { border-color: white; background: rgba(255,255,255,0.05);}
                .btn-lux:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .wizard-workspace { padding: 80px 1rem 2rem 1rem; }
                    .wizard-card { padding: 1.5rem; border-radius: 16px; }
                    .role-inputs { flex-direction: column; align-items: stretch; }
                    .btn-del-role { align-self: stretch; background: rgba(255, 82, 82, 0.1); border-radius: 8px; padding: 10px; margin-top: 5px; width: 100%; border: 1px solid rgba(255,82,82,0.3);}
                    .actions-row { flex-direction: column; }
                    .actions-row .btn-lux { width: 100%; justify-content: center; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/create')}

                <main class="wizard-workspace">
                    <div class="wizard-card">
                        <div class="step-indicator">
                            <div class="dot active" id="dot1"></div>
                            <div class="dot" id="dot2"></div>
                        </div>

                        <div id="step1">
                            <div class="wizard-header">
                                <h1>Instanciar Ecosistema</h1>
                                <p>Genera una red neuronal de valor extrayendo el ADN del LMS.</p>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 2rem;">
                                <div class="form-group" style="margin: 0;">
                                    <label>Nombre de la Red</label>
                                    <input type="text" id="inpName" class="lux-input" placeholder="Ej: Protocolo DeFi Nexus">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label>Arquetipo Legal / Flow</label>
                                    <select id="inpArchetype" class="lux-input" style="color:var(--accent-blue); font-weight:bold;">
                                        <option value="startup">🚀 Startup (Agilidad)</option>
                                        <option value="corp">🏢 Empresa (Jerarquía)</option>
                                        <option value="dao">🤖 DAO (Descentralizada)</option>
                                        <option value="incubator">🏭 Incubadora (Venture)</option>
                                        <option value="sos">🆘 Red S.O.S (Comunidad)</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label>Genoma (Plantilla LMS)</label>
                                    <select id="inpSector" class="lux-input">
                                        ${sectorOptions}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Input Cognitivo (Propósito y Entregable Core)</label>
                                <textarea id="inpVision" class="lux-input vision-box" placeholder="Describe la visión. El Orquestador usará este input para generar los SOPs, y el sistema lo forjará como el Meme Core del proyecto..."></textarea>
                            </div>

                            <details style="margin-bottom: 2rem;" ${!hasKey ? 'open' : ''}>
                                <summary style="color: var(--accent-purple); font-size: 0.85rem; font-weight: bold; cursor: pointer; margin-bottom: 10px; padding: 10px; background: rgba(224,64,251,0.1); border-radius: 8px; display:inline-block;">✨ Configurar Orquestador IA (API Key)</summary>
                                <div class="ai-config-panel">
                                    <div class="ai-grid">
                                        <div>
                                            <label style="font-size: 0.75rem; color:#aaa;">Motor Neuronal</label>
                                            <select id="inpAiProvider" class="lux-input" style="padding: 10px;">
                                                <option value="deepseek" ${savedProvider === 'deepseek' ? 'selected' : ''}>DeepSeek</option>
                                                <option value="gemini" ${savedProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
                                                <option value="openai" ${savedProvider === 'openai' ? 'selected' : ''}>OpenAI</option>
                                                <option value="custom" ${savedProvider === 'custom' ? 'selected' : ''}>Local Custom API</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="font-size: 0.75rem; color:#aaa;">Bearer Token / API Key</label>
                                            <input type="password" id="inpApiKey" class="lux-input" style="padding: 10px;" placeholder="sk-..." value="${savedKey}">
                                        </div>
                                    </div>
                                    <div id="customEndpointBox" style="display: ${savedProvider === 'custom' ? 'block' : 'none'}; margin-top: 10px;">
                                        <label style="font-size: 0.75rem; color:#aaa;">URL del Endpoint Custom</label>
                                        <input type="text" id="inpCustomUrl" class="lux-input" style="padding: 10px;" placeholder="http://localhost:1234/v1/chat/completions">
                                    </div>
                                </div>
                            </details>

                            <div class="tdd-error-panel" id="tddErrorPanel">
                                <h3 class="tdd-error-title">⛔ Auditoría Cognitiva Fallida</h3>
                                <ul class="tdd-error-list" id="tddErrorList"></ul>
                                <div style="margin-top: 10px; font-size: 0.8rem; color: #888;">Por seguridad de la red, la inyección del JSON ha sido bloqueada. Adapta la visión o intenta regenerar.</div>
                            </div>

                            <div class="actions-row">
                                <button class="btn-lux btn-lux-outline" id="btnStartBlank">📄 Lienzo en Blanco</button>
                                <button class="btn-lux btn-lux-outline" id="btnLoadTemplate">🏗️ Clonar Plantilla Rápida</button>
                                <button class="btn-lux btn-lux-primary" id="btnGenerateAI">🧠 Diseñar Topología con IA</button>
                            </div>
                        </div>

                        <div id="aiLoading" class="ai-loading">
                            <span>🪐</span>
                            <p id="loadingMsg">Conectando con Orquestador Cognitivo...</p>
                            <div style="font-size: 0.9rem; color: #888; margin-top: 10px;" id="loadingSubMsg">Generando VNA y Memes LMS...</div>
                        </div>

                        <div id="step2" style="display: none;">
                            <div class="wizard-header" style="margin-bottom: 2rem;">
                                <h1>Validación de Arquitectura</h1>
                                <p>Revisa el mapeo de valor antes de inyectarlo en el Kernel.</p>
                            </div>

                            <div class="map-container mini-map-container" id="miniMapContainer" style="display: none;">
                                <div class="map-canvas map-svg-layer" id="miniMapCanvas">
                                    <svg id="miniMapSvg">
                                        <defs>
                                            <marker id="arrow-tangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#00e676"/></marker>
                                            <marker id="arrow-intangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#e040fb"/></marker>
                                        </defs>
                                        <g id="miniMapPaths"></g>
                                    </svg>
                                </div>
                            </div>

                            <div id="aiTxFeedback" class="tx-feedback-box" style="display: none;" title="Haz clic para ver un adelanto de las tuberías y el Pitch">
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--accent-green); font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">⚡ Tuberías VNA Certificadas</div>
                                    <div style="color: var(--text-muted); font-size: 0.9rem;">Se han validado <strong id="txCount" style="color: white; font-size: 1.2rem; font-family: monospace;">0</strong> SOPs secuenciales (Clic para ver).</div>
                                </div>
                                <div style="font-size: 1.8rem; opacity: 0.5;">&darr;</div>
                            </div>
                            
                            <div id="txPreviewList" class="tx-preview-list"></div>

                            <div class="role-draft-list" id="draftRolesContainer"></div>
                            
                            <button class="btn-lux btn-lux-outline" id="btnAddCustomRole" style="width: 100%; margin-bottom: 2rem; border-style: dashed;">➕ Instanciar Silla Adicional</button>

                            <div class="actions-row" style="border-top: 1px solid var(--glass-border); padding-top: 2rem;">
                                <button class="btn-lux btn-lux-outline" id="btnBack">&larr; Volver</button>
                                <button class="btn-lux btn-lux-success" id="btnLaunch" disabled>🚀 Inyectar Red y Memes al Kernel</button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        this.dom = {
            step1: document.getElementById('step1'),
            loading: document.getElementById('aiLoading'),
            loadingMsg: document.getElementById('loadingMsg'),
            loadingSubMsg: document.getElementById('loadingSubMsg'),
            step2: document.getElementById('step2'),
            dot1: document.getElementById('dot1'),
            dot2: document.getElementById('dot2'),
            btnStartBlank: document.getElementById('btnStartBlank'),
            btnLoadTemplate: document.getElementById('btnLoadTemplate'),
            btnGenerateAI: document.getElementById('btnGenerateAI'),
            btnBack: document.getElementById('btnBack'),
            btnLaunch: document.getElementById('btnLaunch'),
            btnAddCustom: document.getElementById('btnAddCustomRole'),
            container: document.getElementById('draftRolesContainer'),
            inpName: document.getElementById('inpName'),
            inpSector: document.getElementById('inpSector'),
            inpArchetype: document.getElementById('inpArchetype'),
            inpVision: document.getElementById('inpVision'),
            inpApiKey: document.getElementById('inpApiKey'),
            inpAiProvider: document.getElementById('inpAiProvider'),
            inpCustomUrl: document.getElementById('inpCustomUrl'),
            customEndpointBox: document.getElementById('customEndpointBox'),
            aiTxFeedback: document.getElementById('aiTxFeedback'),
            txCount: document.getElementById('txCount'),
            txPreviewList: document.getElementById('txPreviewList'),
            tddErrorPanel: document.getElementById('tddErrorPanel'),
            tddErrorList: document.getElementById('tddErrorList'),
            miniMapContainer: document.getElementById('miniMapContainer'),
            miniMapCanvas: document.getElementById('miniMapCanvas'),
            miniMapPaths: document.getElementById('miniMapPaths')
        };

        Sidebar.initListeners();

        if (this.dom.miniMapCanvas && this.dom.miniMapPaths) {
            this.mapVis = new MapRenderer(this.dom.miniMapCanvas, this.dom.miniMapPaths, {
                isEditMode: false,
                isHeatmap: false,
                markerSuffix: 'vis',
                trimSize: 35, 
                spreadBadges: false 
            });
        }

        this.dom.inpAiProvider.addEventListener('change', (e) => {
            this.dom.customEndpointBox.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });

        this.dom.aiTxFeedback.addEventListener('click', () => {
            this.dom.txPreviewList.style.display = this.dom.txPreviewList.style.display === 'block' ? 'none' : 'block';
        });

        this.dom.btnStartBlank.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre de la Red es obligatorio.");
            this.resetDrafts();
            this.draftPresentation = this.dom.inpVision.value.trim();
            this.dom.btnLaunch.disabled = false; 
            this.dom.btnLaunch.innerText = '🚀 Inyectar Red en el Kernel';
            this.goToStep2();
        });

        this.dom.btnLoadTemplate.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre de la Red es obligatorio.");
            
            const sectorVal = this.dom.inpSector.value; 
            let sectorData = this.sectorsFromKB[sectorVal];

            this.resetDrafts();
            this.draftTags = [sectorVal, this.dom.inpArchetype.value];
            this.draftPresentation = this.dom.inpVision.value.trim() || `Red instanciada con genoma LMS: ${sectorData ? sectorData.label : 'Vacío'}.`;
            
            if (sectorData && sectorData.roles) {
                const roleKeys = Object.keys(sectorData.roles);
                roleKeys.forEach(levelKey => {
                    const data = sectorData.roles[levelKey];
                    const m = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                    
                    this.draftRoles.push({
                        id: 'draft_' + Math.random().toString(36).substr(2, 9),
                        levelId: levelKey, name: data.name || levelKey, fmv: 50, multiplier: m[levelKey] || 1.0,
                        guardian: data.guardian || 'everyman', ai_prompt: data.content || '' 
                    });

                    if (data.deliverables) {
                        data.deliverables.forEach((deliv, idx) => {
                            let toLevel = deliv.to && deliv.to !== '?' ? deliv.to : (levelKey === '@baixos' ? '@dosos' : (levelKey === '@dosos' ? '@anxaneta' : '@baixos'));
                            this.draftTxs.push({
                                id: `tx_base_${levelKey}_${idx}`, phase: "Kickoff", step_order: idx + 1, depends_on: [],
                                fromLevel: levelKey, toLevel: toLevel, tipo: deliv.tipo || 'tangible', template: deliv.name, horas: deliv.estimatedHours || 4,
                                soc_checklist: [{text:"Cumple calidad estándar W3C"}], resources: [], required_skills: deliv.required_skills || []
                            });
                        });
                    }
                });
            }
            this.dom.btnLaunch.disabled = false;
            this.dom.btnLaunch.innerText = '🚀 Inyectar Red en el Kernel';
            this.goToStep2();
        });

        this.dom.btnGenerateAI.addEventListener('click', () => this.generateWithAI());

        this.dom.btnBack.addEventListener('click', () => {
            this.dom.step2.style.display = 'none';
            this.dom.step1.style.display = 'block';
            this.dom.dot2.classList.remove('active');
            this.dom.dot1.classList.add('active');
            this.dom.txPreviewList.style.display = 'none'; 
        });

        this.dom.btnAddCustom.addEventListener('click', () => {
            this.draftRoles.push({
                id: 'draft_' + Math.random().toString(36).substr(2, 9),
                levelId: '@baixos', name: 'Nueva Actividad', fmv: 40, multiplier: 1.2, guardian: 'everyman', ai_prompt: ''
            });
            this.renderDraftRoles();
        });

        this.dom.btnLaunch.addEventListener('click', () => this.finalizeProject());
    }

    resetDrafts() {
        this.draftRoles = []; this.draftTxs = []; this.draftTags = []; this.draftNewMemes = []; this.draftPresentation = "";
        this.dom.tddErrorPanel.style.display = 'none';
    }

    runCognitiveTDD(parsedData) {
        let errors = [];

        const expectedPhases = ['Kickoff', 'Growth', 'Scale', 'Harvest', 'Cierre'];
        const generatedPhases = [...new Set(parsedData.transactions.map(t => t.phase))];
        const missingPhases = expectedPhases.filter(p => !generatedPhases.includes(p));
        if (missingPhases.length > 0) {
            errors.push(`Fallo Estructural: Faltan las eras de Verna Allee (${missingPhases.join(', ')}).`);
        }

        const allTxIds = parsedData.transactions.map(t => t.id);
        parsedData.transactions.forEach(tx => {
            if (!tx.id) errors.push(`Transacción sin ID detectada (Template: ${tx.template}).`);
            if (tx.phase !== 'Kickoff' && (!tx.depends_on || tx.depends_on.length === 0)) {
                errors.push(`Camino Crítico Roto: El SOP [${tx.template}] en la fase ${tx.phase} no tiene dependencias (SOP huérfano).`);
            }
            if (tx.depends_on) {
                tx.depends_on.forEach(depId => {
                    if (!allTxIds.includes(depId)) errors.push(`Alucinación DAG: El SOP [${tx.template}] depende del ID [${depId}] que no existe.`);
                });
            }
            
            if (!tx.required_skills || tx.required_skills.length < 3) {
                errors.push(`Tríada Rota: El SOP [${tx.template}] tiene menos de 3 skills asignados.`);
            }

            if (!tx.soc_checklist || tx.soc_checklist.length === 0) {
                errors.push(`TDD Ausente: El SOP [${tx.template}] no tiene matriz SOC (Criterios de auditoría nulos).`);
            }
        });

        if (parsedData.transactions.length < 15) {
            errors.push(`VNA Insuficiente: La IA solo ha mapeado ${parsedData.transactions.length} transacciones. Se requieren al menos 15 para modelar un ecosistema real.`);
        }

        const hasIntangible = parsedData.transactions.some(t => t.tipo === 'intangible');
        if (!hasIntangible) {
            errors.push(`VNA Incompleto: No se han detectado transacciones 'intangible'. El modelo de valor exige flujos de conocimiento o feedback.`);
        }

        return errors;
    }

    async generateWithAI() {
        const name = this.dom.inpName.value.trim();
        const visionRaw = this.dom.inpVision.value.trim();
        const provider = this.dom.inpAiProvider.value;
        const apiKey = this.dom.inpApiKey.value.trim();
        const archetypeText = this.dom.inpArchetype.options[this.dom.inpArchetype.selectedIndex].text;
        const sectorVal = this.dom.inpSector.value;

        if (!name) return alert("Debes darle un nombre a la red.");
        if (!visionRaw) return alert("Escribe tu visión en bruto para que el Agente la procese.");
        if (provider !== 'custom' && !apiKey) return alert("Falta la API Key del proveedor.");

        if (provider === 'deepseek') localStorage.setItem('tt_key_deepseek', apiKey);
        if (provider === 'openai') localStorage.setItem('tt_key_openai', apiKey);
        if (provider === 'gemini') localStorage.setItem('tt_key_gemini', apiKey);
        localStorage.setItem('tt_ai_provider', provider);

        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'flex';
        this.dom.loadingMsg.innerText = `Sintetizando Red VNA Fractal con ${provider.toUpperCase()}...`;
        this.dom.tddErrorPanel.style.display = 'none';

        try {
            await KB.init();
            
            // 🔥 RAG LOCAL (TEORÍA Y CONTEXTO)
            let theoryContext = "";
            const globalDocs = await KB.getAllNodes();
            const memes = globalDocs.filter(d => d.type === 'meme' || d.type === 'ontology');
            
            if (memes.length > 0) {
                theoryContext = "\n\n--- TEORÍA VNA Y MEMES W3C GLOBALES (Aplica esto obligatoriamente) ---\n";
                theoryContext += memes.map(m => `[${m.category || 'REGLA'}] ${m.title}: ${m.content}`).join('\n');
            }

            let sectorData = this.sectorsFromKB[sectorVal];
            if (sectorData && sectorData.roles) {
                theoryContext += `\n\n--- GENOMA DEL SECTOR SELECCIONADO: ${sectorData.label} ---\n`;
                theoryContext += JSON.stringify(sectorData.roles);
            }

            const enhancedVision = `
                VISIÓN DEL USUARIO: ${visionRaw}
                ${theoryContext}
            `;

            const parsedData = await Orchestrator.designEcosystemVNA(name, archetypeText, enhancedVision, provider, apiKey);
            const tddErrors = this.runCognitiveTDD(parsedData);
            
            if (tddErrors.length > 0) {
                this.dom.tddErrorPanel.style.display = 'block';
                this.dom.tddErrorList.innerHTML = tddErrors.map(e => `<li>${e}</li>`).join('');
                this.dom.loading.style.display = 'none';
                this.dom.step1.style.display = 'block';
                return;
            }

            this.draftPresentation = parsedData.presentacion || visionRaw;
            this.draftTags = parsedData.tags || [];
            this.draftNewMemes = parsedData.new_memes || []; 
            
            this.draftRoles = parsedData.roles.map((r, i) => ({
                id: r.id || ('draft_role_' + i + '_' + Math.random().toString(36).substr(2, 5)),
                levelId: r.levelId, name: r.name, fmv: r.fmv || 50, multiplier: r.multiplier || 1.0, guardian: r.guardian || 'everyman', ai_prompt: r.ai_prompt || ''
            }));
            
            this.draftTxs = (parsedData.transactions || []).map((tx, i) => {
                const rFrom = this.draftRoles.find(r => r.levelId === tx.fromLevel || r.name === tx.fromLevel) || this.draftRoles[0];
                const rTo = this.draftRoles.find(r => r.levelId === tx.toLevel || r.name === tx.toLevel) || this.draftRoles[this.draftRoles.length - 1];

                return {
                    id: tx.id || `tx_${i}`,
                    phase: tx.phase || 'Kickoff',
                    step_order: tx.step_order || 1,
                    depends_on: tx.depends_on || [],
                    fromLevel: tx.fromLevel, 
                    toLevel: tx.toLevel,
                    from: rFrom ? rFrom.id : null,
                    to: rTo ? rTo.id : null,
                    tipo: tx.tipo, 
                    template: tx.template || tx.entregable, 
                    horas: tx.horas,
                    soc_checklist: (tx.soc_checklist || []).map((soc, i) => ({ id: `soc_${i}_${Date.now()}`, text: soc.text, isChecked: false })),
                    resources: tx.resources || [],
                    required_skills: tx.required_skills || []
                };
            });
            
            this.dom.btnLaunch.disabled = false;
            this.dom.btnLaunch.innerText = '🚀 Inyectar Red VNA (100% SOC)';
            this.goToStep2();

        } catch (error) {
            console.error("💥 Fallo Orquestador:", error);
            alert(`Fallo en la comunicación con el Orquestador o API: ${error.message}`);
            this.dom.loading.style.display = 'none';
            this.dom.step1.style.display = 'block';
        }
    }

    goToStep2() {
        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'none';
        this.dom.step2.style.display = 'block';
        this.dom.dot1.classList.remove('active');
        this.dom.dot2.classList.add('active');
        
        if (this.draftTxs.length > 0 || this.draftPresentation.length > 0) {
            this.dom.aiTxFeedback.style.display = 'flex';
            this.dom.txCount.innerText = this.draftTxs.length;
            
            const tagsHtml = this.draftTags.length > 0 ? `<div style="margin-bottom:15px;">${this.draftTags.map(t => `<span style="background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:12px; font-size:0.75rem; margin-right:8px; font-family:var(--font-mono);">#${t}</span>`).join('')}</div>` : '';

            const newMemesHtml = this.draftNewMemes && this.draftNewMemes.length > 0 ? `
                <div style="background: rgba(224,64,251,0.1); border: 1px solid var(--accent-purple); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong style="color: var(--accent-purple); font-size: 0.9rem; text-transform:uppercase; display:block; margin-bottom:8px;">🧠 Memética W3C Sintetizada:</strong>
                    <ul style="margin:0; padding-left:15px; font-size:0.8rem; color:#ccc;">
                        ${this.draftNewMemes.map(m => `<li><strong>${m.title}</strong>: ${m.content.substring(0,60)}...</li>`).join('')}
                    </ul>
                </div>
            ` : '';

            const phases = ['Kickoff', 'Growth', 'Scale', 'Harvest', 'Cierre'];
            let listHtml = '';
            
            phases.forEach(p => {
                const txsInPhase = this.draftTxs.filter(t => t.phase === p).sort((a,b) => a.step_order - b.step_order);
                if (txsInPhase.length > 0) {
                    listHtml += `<div style="margin-top: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; color: white; font-weight: 900; font-size: 1.1rem; text-transform: uppercase;">🌐 ERA: ${p}</div>`;
                    
                    listHtml += txsInPhase.map((tx) => {
                        const deps = tx.depends_on.length > 0 ? `<span style="color:#888; font-size:0.7rem; font-family:var(--font-mono); margin-left:10px;">↪ Depende de: [${tx.depends_on.join(', ')}]</span>` : '';
                        
                        return `
                        <div class="tx-preview-item">
                            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                                <div style="flex:1;">
                                    <span style="color:${tx.tipo==='intangible'?'var(--accent-purple)':'var(--accent-green)'}; font-weight:bold; font-family:var(--font-mono);">[ID: ${tx.id}]</span> 
                                    <span style="color:#aaa; font-size:0.8rem;">${tx.fromLevel} &rarr; ${tx.toLevel}</span>
                                    <div style="color:white; font-weight:bold; font-size:1rem; margin-top:5px;">${tx.template} <span style="color:var(--accent-blue); font-family:var(--font-mono);">(${tx.horas}h)</span></div>
                                    ${deps}
                                </div>
                            </div>
                            <div style="width:100%; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; border-left:2px solid #555;">
                                <strong style="color:#888; font-size:0.7rem; display:block; margin-bottom:5px;">✅ MATRIZ SOCs:</strong>
                                <ul style="margin:0; padding-left:15px; font-size:0.75rem; color:#bbb;">
                                    ${tx.soc_checklist.map(soc => `<li>${soc.text}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `}).join('');
                }
            });
            
            this.dom.txPreviewList.innerHTML = `
                ${tagsHtml}
                <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 10px; border-left: 3px solid var(--accent-blue); margin-bottom: 20px;">
                    <strong style="color: white; font-size: 0.9rem; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px;">📖 Misión Instanciada:</strong>
                    <span style="color:#ccc; font-style:italic; line-height:1.5;">${this.draftPresentation.replace(/\n/g, '<br>')}</span>
                </div>
                ${newMemesHtml}
                ${listHtml}
                <div style="text-align:center; margin-top:20px; font-size:0.8rem; color:var(--accent-orange); font-weight:bold; background:rgba(255,171,64,0.1); padding:10px; border-radius:8px;">El DAG ha superado la validación TDD Local al 100%. Listo para inyectar.</div>
            `;
        } else {
            this.dom.aiTxFeedback.style.display = 'none';
            this.dom.txPreviewList.style.display = 'none';
        }
        
        this.renderDraftRoles();
    }

    renderDraftRoles() {
        this.dom.container.innerHTML = '';
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        
        const levels = [
            { id: '@anxaneta', label: '@anxaneta (Dirección)' }, { id: '@aixecador', label: '@aixecador (Táctica)' }, { id: '@dosos', label: '@dosos (Auditoría)' }, { id: '@baixos', label: '@baixos (Operativa)' }, { id: '@pinya', label: '@pinya (Soporte)' }
        ];

        this.draftRoles.forEach((role, index) => {
            const color = colors[role.levelId] || '#fff';
            const row = document.createElement('div');
            row.className = 'role-draft-item';
            
            let selectLevel = `<select class="inp-role-level" data-idx="${index}" style="color: ${color}; border-color: ${color};">`;
            levels.forEach(l => { selectLevel += `<option value="${l.id}" ${role.levelId === l.id ? 'selected' : ''}>${l.label}</option>`; });
            selectLevel += `</select>`;

            let selectGuardian = `<select class="inp-role-guardian" data-idx="${index}" title="Asignar Arquetipo Intangible">`;
            this.guardians.forEach(g => { selectGuardian += `<option value="${g.id}" ${role.guardian === g.id ? 'selected' : ''}>${g.label}</option>`; });
            selectGuardian += `</select>`;

            row.innerHTML = `
                <div class="role-inputs">
                    ${selectLevel}
                    ${selectGuardian}
                    <input type="text" value="${role.name}" class="inp-role-name" data-idx="${index}" title="Actividad del Rol">
                    <div style="display:flex; align-items:center; gap: 5px;">
                        <span style="color: var(--text-muted); font-size: 0.75rem; font-weight:bold;">FMV:</span>
                        <input type="number" value="${role.fmv}" class="fmv-input inp-role-fmv" data-idx="${index}" title="Valor Mercado €/h">
                        <span style="color: var(--text-muted); font-size: 0.75rem; font-weight:bold;">€/h</span>
                    </div>
                </div>
                <button class="btn-del-role" data-idx="${index}" title="Eliminar Rol">&times;</button>
            `;
            this.dom.container.appendChild(row);
        });

        this.dom.container.querySelectorAll('.inp-role-level').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const idx = e.target.dataset.idx;
                const newLevel = e.target.value;
                this.draftRoles[idx].levelId = newLevel;
                const multipliers = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                this.draftRoles[idx].multiplier = multipliers[newLevel];
                this.renderDraftRoles();
            });
        });
        this.dom.container.querySelectorAll('.inp-role-guardian').forEach(sel => {
            sel.addEventListener('change', (e) => this.draftRoles[e.target.dataset.idx].guardian = e.target.value);
        });
        this.dom.container.querySelectorAll('.inp-role-name').forEach(inp => {
            inp.addEventListener('input', (e) => this.draftRoles[e.target.dataset.idx].name = e.target.value);
        });
        this.dom.container.querySelectorAll('.inp-role-fmv').forEach(inp => {
            inp.addEventListener('input', (e) => this.draftRoles[e.target.dataset.idx].fmv = parseFloat(e.target.value) || 0);
        });
        this.dom.container.querySelectorAll('.btn-del-role').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.draftRoles.splice(e.target.dataset.idx, 1);
                this.renderDraftRoles();
            });
        });

        if (this.draftRoles.length > 0 && this.mapVis) {
            this.dom.miniMapContainer.style.display = 'block';
            this.mapVis.setData(this.draftRoles, this.draftTxs);
        } else {
            this.dom.miniMapContainer.style.display = 'none';
        }
    }

    // ==============================================================
    // 🔥 EL MOTOR DE INYECCIÓN (CONEXIÓN CON EL LMS Y REDUX)
    // ==============================================================
    async finalizeProject() {
        const projectId = 'proj_' + Math.random().toString(36).substr(2, 9);
        const visionText = this.dom.inpVision.value.trim() || this.draftPresentation;
        const arch = this.dom.inpArchetype.value; 
        const name = this.dom.inpName.value.trim() || 'Nueva Red';
        
        this.dom.btnLaunch.disabled = true;
        this.dom.btnLaunch.innerText = 'Instanciando Matriz y LMS...';

        // 1. Guardar en Redux
        await store.dispatch({ 
            type: 'CREATE_PROJECT', 
            payload: {
                id: projectId, nombre: name, sector: this.dom.inpSector.value,
                prompt: visionText, archetype: arch, roles: this.draftRoles, vna_flows: [], work_orders: []
            } 
        });

        await store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId: projectId, updates: { presentation: this.draftPresentation, tags: this.draftTags } }
        });

        await KB.init();

        // 2. Inyectar MEME DEL PROYECTO (El Core Context)
        await KB.saveNode({
            id: `meme_project_${projectId}`,
            type: 'meme',
            category: 'project_core',
            projectId: projectId,
            targetId: 'global',
            title: `Misión: ${name}`,
            content: `VISIÓN DEL PROYECTO: ${visionText}\n\nARQUETIPO: ${arch}\n\nEste ecosistema ha sido forjado. El objetivo de los agentes A2A es trazar tuberías y ejecutar SOCs respetando el Genoma LMS.`,
            keywords: ['#ecosystem', projectId, name]
        });

        // 3. Inyectar ROLES y PROMPTS en el LMS
        if (this.draftRoles.length > 0) {
            for (const rol of this.draftRoles) {
                // Generar un Meme de Skill automático para cada Rol creado
                await KB.saveNode({
                    id: `meme_skill_${projectId}_${rol.id}`,
                    type: 'meme',
                    category: 'skill',
                    projectId: projectId,
                    targetId: 'global',
                    title: `Skill: ${rol.name}`,
                    content: `Competencia requerida para ejercer como ${rol.name} en el nivel ${rol.levelId}. Regido por el arquetipo ${rol.guardian}.`,
                    keywords: [rol.levelId, rol.guardian, projectId]
                });

                if (rol.ai_prompt && rol.ai_prompt.length > 10) {
                    await KB.saveNode({
                        id: `prompt_${projectId}_${rol.id}`, type: 'prompt_a2a',
                        projectId: projectId, targetId: rol.id, roleTarget: rol.levelId,
                        title: `Prompt A2A: ${rol.name}`, content: rol.ai_prompt
                    });
                }
            }
        }

        // 4. Inyectar MEMES generados por la IA en el LMS
        if (this.draftNewMemes && this.draftNewMemes.length > 0) {
            for (const meme of this.draftNewMemes) {
                await KB.saveNode({
                    id: meme.id, type: 'meme', category: meme.category || 'skill',
                    title: meme.title, content: meme.content, keywords: meme.keywords || [],
                    projectId: projectId, targetId: 'global' // Ahora pertenecen al proyecto, no globales
                });
            }
        }

        // 5. Procesar las Tuberías (SOPs) generadas
        const p = store.getState().projects.find(x => x.id === projectId);
        if (p && this.draftTxs && this.draftTxs.length > 0) {
            for (const aiTx of this.draftTxs) {
                const roleFrom = p.roles.find(r => r.id === aiTx.from);
                const roleTo = p.roles.find(r => r.id === aiTx.to);
                
                if (roleFrom && roleTo) {
                    const flowId = 'flow_' + aiTx.id; 
                    const templateName = aiTx.template || 'Entregable Core';
                    
                    await store.dispatch({
                        type: 'ADD_FLOW',
                        payload: {
                            projectId: projectId,
                            flow: { 
                                id: flowId, from: roleFrom.id, to: roleTo.id, estimatedHours: aiTx.horas || 4, 
                                template: templateName, tipo: aiTx.tipo || 'tangible', phase: aiTx.phase, step_order: aiTx.step_order, depends_on: aiTx.depends_on,
                                soc_checklist: aiTx.soc_checklist || [], resources: aiTx.resources || [], required_skills: aiTx.required_skills || [] 
                            }
                        }
                    });

                    // Si es fase Kickoff, spawnear Work Order automáticamente
                    if (aiTx.phase === 'Kickoff' || aiTx.depends_on.length === 0) {
                        let kickoffComment = `SOP: Ejecutar [${templateName}].`;
                        if (aiTx.soc_checklist && aiTx.soc_checklist.length > 0) kickoffComment += ` | SOCs: ` + aiTx.soc_checklist.map(s => `✔️ ${s.text}`).join(' ');

                        const woHash = 'wo_kickoff_' + Math.random().toString(36).substr(2, 9);
                        await store.dispatch({
                            type: 'SPAWN_WORK_ORDER',
                            payload: {
                                projectId: projectId,
                                workOrder: {
                                    hash: woHash, flowId: flowId, status: 'theoretical', realHours: 0,
                                    sprintId: p.activeSprintId, comentario: kickoffComment,
                                    soc_checklist: aiTx.soc_checklist || [], resources: aiTx.resources || []
                                }
                            }
                        });
                    }
                }
            }
        }
        
        localStorage.setItem('tt_active_project', projectId);
        window.location.href = '/v8/dashboard';
    }
}
