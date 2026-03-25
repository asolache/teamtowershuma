// v9/js/components/ProjectForge.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Orchestrator } from '../core/Orchestrator.js';
import { MapRenderer } from './MapRenderer.js';

export class ProjectForge {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.draftRoles = [];
        this.draftTxs = [];
        this.draftPresentation = ""; 
        this.draftTags = []; 
        this.draftNewMemes = []; 
        this.sectorsFromKB = {}; 
        this.enrichedVision = ""; // 🔥 Almacenará la visión + respuestas del usuario
        
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

    async render() {
        if (!this.container) return;
        await KB.init();
        this.sectorsFromKB = await KB.getAvailableSectors();

        const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedSector = urlParams.get('sector') || '';

        let sectorOptions = `<optgroup label="📦 Catálogo del Knowledge Base">`;
        Object.keys(this.sectorsFromKB).forEach(k => {
            sectorOptions += `<option value="${k}" ${preselectedSector === k ? 'selected' : ''}>${this.sectorsFromKB[k].label}</option>`;
        });
        sectorOptions += `</optgroup>`;

        this.container.innerHTML = `
            <style>
                .pf-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; width: 100%; max-width: 900px; padding: 3rem; position: relative; overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(15px); box-sizing: border-box; margin: 0 auto;}
                .pf-header { text-align: center; margin-bottom: 2.5rem; }
                .pf-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; font-weight: 900; }
                .pf-header p { color: var(--text-muted); margin-top: 10px; font-size: 1rem; }
                
                .step-indicator { display: flex; justify-content: center; gap: 12px; margin-bottom: 2rem; }
                .dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.3s; }
                .dot.active { background: var(--accent-blue); box-shadow: 0 0 15px var(--accent-blue); transform: scale(1.3); }

                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px; }
                .lux-input { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px 18px; border-radius: 12px; font-family: inherit; font-size: 1rem; outline: none; width: 100%; transition: all 0.3s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3); box-sizing: border-box;}
                .lux-input:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.1); }
                .vision-box { min-height: 80px; resize: vertical; line-height: 1.5; font-family: 'Georgia', serif;}
                
                .ai-loading { display: none; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 0; animation: pulse 2s infinite; }
                .ai-loading span { font-size: 4rem; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0,176,255,0.5); }
                .ai-loading p { color: var(--accent-blue); font-family: var(--font-mono); font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-size: 1.2rem;}

                .tdd-error-panel { display: none; background: rgba(255,82,82,0.1); border: 1px solid var(--accent-red); border-radius: 12px; padding: 20px; margin-bottom: 2rem; animation: slideDown 0.3s ease-out;}
                .tdd-error-title { color: var(--accent-red); font-weight: 900; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;}
                .tdd-error-list { margin: 0; padding-left: 20px; color: white; font-family: var(--font-mono); font-size: 0.85rem;}

                /* 🔥 TERMINAL MAYÉUTICA */
                .maieutic-panel { display: none; background: rgba(224,64,251,0.05); border: 1px solid var(--accent-purple); border-radius: 16px; padding: 20px; margin-bottom: 2rem; animation: slideDown 0.4s ease-out;}
                .maieutic-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; color: var(--accent-purple); font-weight: 900; font-size: 1.1rem;}
                .maieutic-q { color: white; font-weight: bold; margin-bottom: 8px; font-size: 0.95rem; line-height: 1.4;}
                .maieutic-a { background: rgba(0,0,0,0.6); border: 1px solid #444; color: var(--accent-blue); padding: 12px; border-radius: 8px; font-family: 'Georgia', serif; width: 100%; box-sizing: border-box; margin-bottom: 15px; outline: none; resize: vertical;}
                .maieutic-a:focus { border-color: var(--accent-blue); }

                .role-draft-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 2rem; max-height: 400px; overflow-y: auto; padding-right: 10px;}
                .role-draft-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; gap: 15px; transition: transform 0.2s;}
                
                .role-inputs { display: flex; gap: 12px; flex: 1; align-items: center; flex-wrap: wrap;}
                .inp-role-level, .inp-role-guardian { background: #050505; border: 1px solid #333; border-radius: 8px; padding: 8px 10px; font-size: 0.8rem; font-weight: bold; outline: none; cursor: pointer; color: white;}
                .inp-role-name { background: transparent; border: none; color: white; font-size: 1rem; border-bottom: 1px solid #444; padding: 8px 5px; flex: 1; min-width: 150px; font-weight: bold;}
                .inp-role-name:focus { border-bottom-color: var(--accent-blue); outline: none; }
                .fmv-input { width: 70px; min-width: 70px; text-align: center; color: var(--accent-green); font-family: var(--font-mono); background: transparent; border: none; border-bottom: 1px solid #444; font-size: 1rem; font-weight: bold;}
                
                .btn-del-role { background: transparent; border: none; color: var(--accent-red); cursor: pointer; font-size: 1.5rem; padding: 5px 10px; border-radius: 8px;}
                .btn-del-role:hover { background: rgba(255,82,82,0.1); }

                .mini-map-container { width: 100%; height: 350px; position: relative; margin-bottom: 2rem; border-radius:16px; border:1px solid #333; overflow:hidden;}
                
                .tx-preview-list { display: none; margin-bottom: 2rem; background: rgba(0,0,0,0.4); border: 1px solid #333; border-radius: 12px; padding: 20px; max-height: 400px; overflow-y: auto;}
                .tx-preview-item { font-size: 0.85rem; color: #ccc; padding: 15px 10px; border-bottom: 1px dashed #333; display: flex; flex-direction: column; gap: 10px;}
                
                .cascade-toggle-box { background: rgba(0, 176, 255, 0.05); border: 1px dashed var(--accent-blue); padding: 15px 20px; border-radius: 12px; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; gap: 15px;}
                .cascade-toggle-box label { color: white; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 10px; cursor: pointer;}
                .cascade-toggle-box input[type="checkbox"] { width: 20px; height: 20px; accent-color: var(--accent-blue); cursor: pointer; }

                .actions-row { display: flex; gap: 15px; flex-wrap: wrap; justify-content: flex-end; margin-top: 1.5rem; align-items: center;}
                .btn-lux { padding: 14px 24px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; transition: all 0.3s; border: none;}
                .btn-lux-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; box-shadow: 0 5px 15px rgba(0,176,255,0.2);}
                .btn-lux-success { background: var(--accent-green); color: black; box-shadow: 0 5px 15px rgba(0,230,118,0.2);}
                .btn-lux-outline { background: transparent; border: 1px solid #555; color: white;}
                .btn-lux:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0% { opacity:0.8; transform:scale(0.95); } 50% { opacity:1; transform:scale(1.05); } 100% { opacity:0.8; transform:scale(0.95); } }

                @media (max-width: 768px) {
                    .pf-card { padding: 1.5rem; border-radius: 16px; }
                    .role-inputs { flex-direction: column; align-items: stretch; }
                    .actions-row { flex-direction: column; }
                    .actions-row .btn-lux { width: 100%; justify-content: center; }
                    .cascade-toggle-box { flex-direction: column; align-items: flex-start; }
                }
            </style>

            <div class="pf-card">
                <div class="step-indicator">
                    <div class="dot active" id="pf-dot1"></div>
                    <div class="dot" id="pf-dot2"></div>
                </div>

                <div id="pf-step1">
                    <div class="pf-header">
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
                                <option value="sos">🆘 Red S.O.S (Comunidad)</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label>Genoma (Plantilla LMS)</label>
                            <select id="inpSector" class="lux-input">${sectorOptions}</select>
                        </div>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); border: 1px solid #333; padding: 20px; border-radius: 16px; margin-bottom: 2rem;">
                        <h3 style="color:white; margin:0 0 15px 0; font-size:1.1rem;">Estructura de Propósito (Ikigai Core)</h3>
                        <div class="form-group">
                            <label>Misión Principal (Qué hacemos y por qué)</label>
                            <textarea id="inpMission" class="lux-input vision-box" placeholder="Ej: Revolucionar la gestión de conocimiento usando Web3..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Público Objetivo (A quién servimos)</label>
                            <input type="text" id="inpTarget" class="lux-input" placeholder="Ej: Creadores de contenido, Daos, Startups tech...">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label>Criterios de Éxito (Cómo medimos el valor)</label>
                            <input type="text" id="inpSuccess" class="lux-input" placeholder="Ej: Reducción de costes en un 40%, automatización TDD...">
                        </div>
                    </div>

                    <div class="tdd-error-panel" id="tddErrorPanel">
                        <h3 class="tdd-error-title">⛔ Auditoría Cognitiva Fallida</h3>
                        <ul class="tdd-error-list" id="tddErrorList"></ul>
                        <div style="margin-top: 10px; font-size: 0.8rem; color: #888;">El Orquestador ha devuelto una topología inválida. Revisa los inputs y vuelve a intentar.</div>
                    </div>

                    <div class="maieutic-panel" id="maieuticPanel">
                        <div class="maieutic-header"><span>🤖</span> @genesi_ai requiere más contexto:</div>
                        <p style="color:#ccc; font-size:0.9rem; margin-top:0;">La visión actual es ambigua para un Análisis VNA estricto. Por favor, aclara estos puntos para forjar un mapa de valor perfecto:</p>
                        <div id="maieuticQuestionsList"></div>
                        <div style="text-align: right; margin-top: 15px;">
                            <button class="btn-lux btn-lux-success" id="btnAnswerAndForge">✨ Confirmar y Forjar Ecosistema</button>
                        </div>
                    </div>

                    <div class="actions-row" id="initialActionsRow">
                        <select id="inpForgeEngine" class="lux-input" style="width:auto; min-width:150px; font-weight:bold; color:var(--accent-blue);">
                            <option value="">🧠 Motor Óptimo (Auto)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                            <option value="openai">OpenAI (GPT-4o)</option>
                            <option value="deepseek">DeepSeek (Coder)</option>
                            <option value="gemini">Google Gemini</option>
                        </select>
                        <button class="btn-lux btn-lux-outline" id="btnLoadTemplate">🏗️ Clonar Plantilla Base</button>
                        <button class="btn-lux btn-lux-primary" id="btnEvaluateAI">🧠 Diseñar Topología VNA</button>
                    </div>
                </div>

                <div id="pf-loading" class="ai-loading">
                    <span>🪐</span>
                    <p id="pf-loading-text">Conectando con Orquestador Cognitivo...</p>
                    <div style="font-size: 0.9rem; color: #888; margin-top: 10px;">Forjando Ikigais y Tuberías VNA...</div>
                </div>

                <div id="pf-step2" style="display: none;">
                    <div class="pf-header" style="margin-bottom: 2rem;">
                        <h1>Alineación de Equipo</h1>
                        <p>Audita la estructura y asigna Humanos o IAs a las sillas antes de inyectar en el Kernel.</p>
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

                    <div style="margin-bottom: 10px; font-weight:bold; color:white; display:flex; justify-content:space-between;">
                        <span>Asignación de Sillas (Roles)</span>
                        <span style="color:var(--accent-blue); font-size:0.8rem; cursor:pointer;" id="btnViewTxs">👁️ Ver Tuberías Generadas</span>
                    </div>
                    
                    <div id="txPreviewList" class="tx-preview-list"></div>

                    <div class="role-draft-list" id="draftRolesContainer"></div>
                    <button class="btn-lux btn-lux-outline" id="btnAddCustomRole" style="width: 100%; margin-bottom: 2rem; border-style: dashed;">➕ Instanciar Silla Adicional</button>

                    <div class="cascade-toggle-box">
                        <label>
                            <input type="checkbox" id="inpSpawnCascade" checked>
                            <span>🌊 Inyectar Cascada de Tareas en el Kanban</span>
                        </label>
                        <span style="color:#888; font-size:0.8rem; text-align:right;">Llena el Sprint 1 con Work Orders listas para ejecutar (PULL).</span>
                    </div>

                    <div class="actions-row" style="border-top: 1px solid var(--glass-border); padding-top: 2rem;">
                        <button class="btn-lux btn-lux-outline" id="btnBack">&larr; Volver</button>
                        <button class="btn-lux btn-lux-success" id="btnLaunch">🚀 Inyectar Ecosistema V9</button>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        this.dom = {
            step1: this.container.querySelector('#pf-step1'),
            loading: this.container.querySelector('#pf-loading'),
            loadingText: this.container.querySelector('#pf-loading-text'),
            step2: this.container.querySelector('#pf-step2'),
            dot1: this.container.querySelector('#pf-dot1'),
            dot2: this.container.querySelector('#pf-dot2'),
            btnLoadTemplate: this.container.querySelector('#btnLoadTemplate'),
            btnEvaluateAI: this.container.querySelector('#btnEvaluateAI'),
            btnAnswerAndForge: this.container.querySelector('#btnAnswerAndForge'),
            btnBack: this.container.querySelector('#btnBack'),
            btnLaunch: this.container.querySelector('#btnLaunch'),
            btnAddCustom: this.container.querySelector('#btnAddCustomRole'),
            rolesContainer: this.container.querySelector('#draftRolesContainer'),
            inpName: this.container.querySelector('#inpName'),
            inpSector: this.container.querySelector('#inpSector'),
            inpArchetype: this.container.querySelector('#inpArchetype'),
            inpMission: this.container.querySelector('#inpMission'),
            inpTarget: this.container.querySelector('#inpTarget'),
            inpSuccess: this.container.querySelector('#inpSuccess'),
            inpForgeEngine: this.container.querySelector('#inpForgeEngine'),
            txPreviewList: this.container.querySelector('#txPreviewList'),
            tddErrorPanel: this.container.querySelector('#tddErrorPanel'),
            tddErrorList: this.container.querySelector('#tddErrorList'),
            maieuticPanel: this.container.querySelector('#maieuticPanel'),
            maieuticQuestionsList: this.container.querySelector('#maieuticQuestionsList'),
            initialActionsRow: this.container.querySelector('#initialActionsRow'),
            miniMapContainer: this.container.querySelector('#miniMapContainer'),
            miniMapCanvas: this.container.querySelector('#miniMapCanvas'),
            miniMapPaths: this.container.querySelector('#miniMapPaths'),
            inpSpawnCascade: this.container.querySelector('#inpSpawnCascade'),
            btnViewTxs: this.container.querySelector('#btnViewTxs')
        };

        if (this.dom.miniMapCanvas && this.dom.miniMapPaths) {
            this.mapVis = new MapRenderer(this.dom.miniMapCanvas, this.dom.miniMapPaths, {
                isEditMode: false, isHeatmap: false, markerSuffix: 'vis', trimSize: 35, spreadBadges: false 
            });
        }

        this.dom.btnViewTxs.addEventListener('click', () => {
            this.dom.txPreviewList.style.display = this.dom.txPreviewList.style.display === 'block' ? 'none' : 'block';
        });

        this.dom.btnLoadTemplate.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre de la Red es obligatorio.");
            const sectorVal = this.dom.inpSector.value; 
            let sectorData = this.sectorsFromKB[sectorVal];

            this.draftRoles = []; this.draftTxs = [];
            this.draftTags = [sectorVal, this.dom.inpArchetype.value];
            this.draftPresentation = `Misión: ${this.dom.inpMission.value}\nPúblico: ${this.dom.inpTarget.value}`;
            
            if (sectorData && sectorData.roles) {
                Object.keys(sectorData.roles).forEach(levelKey => {
                    const data = sectorData.roles[levelKey];
                    const m = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                    this.draftRoles.push({
                        id: 'draft_' + Math.random().toString(36).substr(2, 9),
                        levelId: levelKey, name: data.name || levelKey, fmv: 50, multiplier: m[levelKey] || 1.0,
                        guardian: data.guardian || 'everyman', ai_prompt: data.content || '', assignee: '' 
                    });

                    if (data.deliverables) {
                        data.deliverables.forEach((deliv, idx) => {
                            let toLevel = deliv.to && deliv.to !== '?' ? deliv.to : (levelKey === '@baixos' ? '@dosos' : '@baixos');
                            this.draftTxs.push({
                                id: `tx_base_${levelKey}_${idx}`, phase: "Kickoff", step_order: idx + 1, depends_on: [],
                                fromLevel: levelKey, toLevel: toLevel, tipo: deliv.tipo || 'tangible', template: deliv.name, horas: deliv.estimatedHours || 4,
                                soc_checklist: [{text:"Cumple calidad estándar W3C", isChecked: false}], resources: [], required_skills: deliv.required_skills || []
                            });
                        });
                    }
                });
            }
            this.goToStep2();
        });

        // 🔥 FLUJO MAYÉUTICO: Evaluación en dos pasos
        this.dom.btnEvaluateAI.addEventListener('click', () => this.evaluateVisionWithAI());
        this.dom.btnAnswerAndForge.addEventListener('click', () => this.executeFinalForgeWithAI());

        this.dom.btnBack.addEventListener('click', () => {
            this.dom.step2.style.display = 'none';
            this.dom.step1.style.display = 'block';
            this.dom.dot2.classList.remove('active');
            this.dom.dot1.classList.add('active');
        });

        this.dom.btnAddCustom.addEventListener('click', () => {
            this.draftRoles.push({
                id: 'draft_' + Math.random().toString(36).substr(2, 9),
                levelId: '@baixos', name: 'Nueva Actividad', fmv: 40, multiplier: 1.2, guardian: 'everyman', ai_prompt: '', assignee: ''
            });
            this.renderDraftRoles();
        });

        this.dom.btnLaunch.addEventListener('click', () => this.finalizeProject());
    }

    runCognitiveTDD(parsedData) {
        let errors = [];
        if (!parsedData.transactions || parsedData.transactions.length < 3) {
            errors.push(`Red demasiado pequeña (${parsedData.transactions ? parsedData.transactions.length : 0} SOPs). El Ecosistema debe tener un flujo mínimo viable.`);
        } else {
            const txsWithoutSocs = parsedData.transactions.filter(t => !t.soc_checklist || t.soc_checklist.length === 0);
            if (txsWithoutSocs.length > 0) {
                errors.push(`Vulnerabilidad TDD: Se detectaron ${txsWithoutSocs.length} transacciones sin Criterios de Aceptación (soc_checklist). La calidad de la red peligra.`);
            }
        }
        return errors;
    }

    // 🔥 PASO 1: EVALUACIÓN MAYÉUTICA
    async evaluateVisionWithAI() {
        const name = this.dom.inpName.value.trim();
        const mission = this.dom.inpMission.value.trim();
        if (!name || !mission) return alert("Nombre y Misión son obligatorios para el Orquestador.");

        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'flex';
        this.dom.loadingText.innerText = "Evaluando Viabilidad del Ecosistema...";
        this.dom.tddErrorPanel.style.display = 'none';
        this.dom.maieuticPanel.style.display = 'none';

        try {
            const selectedEngine = this.dom.inpForgeEngine.value || null;
            const target = this.dom.inpTarget.value.trim();
            const success = this.dom.inpSuccess.value.trim();
            
            // Guardamos la visión base
            this.enrichedVision = `MISIÓN: ${mission}\nPÚBLICO: ${target}\nKPIs: ${success}`;

            // Llamamos a la sonda del Orquestador
            const evaluation = await Orchestrator.evaluateContextForVNA(name, this.dom.inpArchetype.options[this.dom.inpArchetype.selectedIndex].text, this.enrichedVision, selectedEngine);

            if (evaluation.isReady || !evaluation.questions || evaluation.questions.length === 0) {
                // Si la IA dice que está lista, saltamos directamente a forjar el ecosistema
                await this.executeFinalForgeWithAI();
            } else {
                // Si no está lista, pintamos las preguntas en la UI
                this.dom.maieuticQuestionsList.innerHTML = evaluation.questions.map((q, idx) => `
                    <div style="margin-bottom:10px;">
                        <div class="maieutic-q">${idx + 1}. ${q}</div>
                        <textarea class="maieutic-a q-answer" data-q="${q}" placeholder="Respuesta..."></textarea>
                    </div>
                `).join('');
                
                this.dom.loading.style.display = 'none';
                this.dom.step1.style.display = 'block';
                this.dom.initialActionsRow.style.display = 'none'; // Ocultamos el botón original
                this.dom.maieuticPanel.style.display = 'block'; // Mostramos el panel de preguntas
            }

        } catch (error) {
            alert(`Fallo en la pre-evaluación: ${error.message}`);
            this.dom.loading.style.display = 'none';
            this.dom.step1.style.display = 'block';
        }
    }

    // 🔥 PASO 2: EJECUCIÓN DEFINITIVA
    async executeFinalForgeWithAI() {
        const name = this.dom.inpName.value.trim();
        const selectedEngine = this.dom.inpForgeEngine.value || null;

        // Recopilamos las respuestas si el panel estaba abierto
        if (this.dom.maieuticPanel.style.display === 'block') {
            const answers = this.dom.maieuticQuestionsList.querySelectorAll('.q-answer');
            let qaText = "\n\n--- RESPUESTAS ADICIONALES DEL ARQUITECTO ---\n";
            answers.forEach(a => {
                if (a.value.trim()) qaText += `Q: ${a.dataset.q}\nA: ${a.value.trim()}\n\n`;
            });
            this.enrichedVision += qaText;
        }

        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'flex';
        this.dom.loadingText.innerText = "Forjando Topología VNA y Skills...";

        try {
            await KB.init();
            
            const enhancedVision = `
                =====================================
                CÓDIGO DE INYECCIÓN VNA (IKIGAI MODE):
                =====================================
                - Nombre Ecosistema: ${name}
                - Arquetipo: ${this.dom.inpArchetype.options[this.dom.inpArchetype.selectedIndex].text}
                ${this.enrichedVision}
                
                NOTA IKIGAI: Para cada "role" que generes, debes rellenar el campo "ai_prompt" redactando su "Ikigai" (Propósito vital).
            `;
            
            const parsedData = await Orchestrator.designEcosystemVNA(name, "Agile Setup", enhancedVision, selectedEngine);
            const tddErrors = this.runCognitiveTDD(parsedData);
            
            if (tddErrors.length > 0) {
                this.dom.tddErrorPanel.style.display = 'block';
                this.dom.tddErrorList.innerHTML = tddErrors.map(e => `<li>${e}</li>`).join('');
                this.dom.loading.style.display = 'none';
                this.dom.step1.style.display = 'block';
                return;
            }

            this.draftPresentation = parsedData.presentacion || `Visión Enriquecida...`;
            this.draftTags = parsedData.tags || [];
            this.draftNewMemes = parsedData.new_memes || []; 
            
            this.draftRoles = parsedData.roles.map((r, i) => ({
                id: r.id || ('draft_role_' + i + '_' + Math.random().toString(36).substr(2, 5)),
                levelId: r.levelId, name: r.name, fmv: r.fmv || 50, multiplier: r.multiplier || 1.0, 
                guardian: r.guardian || 'everyman', ai_prompt: r.ai_prompt || '', assignee: '' 
            }));
            
            this.draftTxs = (parsedData.transactions || []).map((tx, i) => {
                const rFrom = this.draftRoles.find(r => r.levelId === tx.fromLevel || r.name === tx.fromLevel) || this.draftRoles[0];
                const rTo = this.draftRoles.find(r => r.levelId === tx.toLevel || r.name === tx.toLevel) || this.draftRoles[this.draftRoles.length - 1];
                return {
                    id: tx.id || `tx_${i}`, phase: tx.phase || 'Fase Activa', step_order: tx.step_order || 1, depends_on: tx.depends_on || [],
                    fromLevel: tx.fromLevel, toLevel: tx.toLevel, from: rFrom ? rFrom.id : null, to: rTo ? rTo.id : null,
                    tipo: tx.tipo, template: tx.template || tx.entregable, horas: tx.horas,
                    soc_checklist: (tx.soc_checklist || []).map((soc, i) => ({ id: `soc_${i}_${Date.now()}`, text: soc.text, isChecked: false })),
                    resources: tx.resources || [], required_skills: tx.required_skills || []
                };
            });
            
            this.goToStep2();

        } catch (error) {
            alert(`Fallo en la forja final: ${error.message}`);
            this.dom.loading.style.display = 'none';
            this.dom.step1.style.display = 'block';
            this.dom.initialActionsRow.style.display = 'flex';
            this.dom.maieuticPanel.style.display = 'none';
        }
    }

    goToStep2() {
        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'none';
        this.dom.step2.style.display = 'block';
        this.dom.dot1.classList.remove('active');
        this.dom.dot2.classList.add('active');
        
        if (this.draftTxs.length > 0) {
            let listHtml = '';
            const generatedPhases = [...new Set(this.draftTxs.map(t => t.phase))];
            
            generatedPhases.forEach(p => {
                const txsInPhase = this.draftTxs.filter(t => t.phase === p).sort((a,b) => a.step_order - b.step_order);
                if (txsInPhase.length > 0) {
                    listHtml += `<div style="margin-top: 15px; border-bottom: 1px solid #333; padding-bottom: 5px; color: var(--accent-blue); font-weight: bold; text-transform: uppercase;">🌐 ERA: ${p}</div>`;
                    listHtml += txsInPhase.map((tx) => `
                        <div class="tx-preview-item">
                            <span style="color:#aaa; font-size:0.8rem;">${tx.fromLevel} &rarr; ${tx.toLevel}</span>
                            <div style="color:white; font-weight:bold;">${tx.template} (${tx.horas}h)</div>
                        </div>
                    `).join('');
                }
            });
            this.dom.txPreviewList.innerHTML = listHtml;
        }
        
        this.renderDraftRoles();
    }

    renderDraftRoles() {
        this.dom.rolesContainer.innerHTML = '';
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-blue)', '@pinya': 'var(--accent-green)' };
        const levels = [ { id: '@anxaneta', label: '@anxaneta (Dirección)' }, { id: '@aixecador', label: '@aixecador (Táctica)' }, { id: '@dosos', label: '@dosos (Auditoría)' }, { id: '@baixos', label: '@baixos (Operativa)' }, { id: '@pinya', label: '@pinya (Soporte)' } ];
        
        const state = store.getState();
        const systemUsers = state.globalUsers || [];
        let userOptions = `<option value="">-- Sin asignar (Mercado Libre) --</option>`;
        systemUsers.forEach(u => {
            const icon = u.profile?.isAi ? '🤖' : '👤';
            userOptions += `<option value="${u.id}">${icon} ${u.name}</option>`;
        });

        this.draftRoles.forEach((role, index) => {
            const color = colors[role.levelId] || '#fff';
            const row = document.createElement('div');
            row.className = 'role-draft-item';
            
            let selectLevel = `<select class="inp-role-level" data-idx="${index}" style="color: ${color}; border-color: ${color};">`;
            levels.forEach(l => { selectLevel += `<option value="${l.id}" ${role.levelId === l.id ? 'selected' : ''}>${l.label}</option>`; });
            selectLevel += `</select>`;

            let selectUser = `<select class="inp-role-guardian inp-role-assignee" data-idx="${index}" style="border-color: var(--accent-purple); color:var(--accent-purple);" title="Pre-asignar Humano o IA">
                ${userOptions.replace(`value="${role.assignee}"`, `value="${role.assignee}" selected`)}
            </select>`;

            row.innerHTML = `
                <div class="role-inputs">
                    ${selectLevel}
                    <input type="text" value="${role.name}" class="inp-role-name" data-idx="${index}" title="Actividad del Rol">
                    <div style="display:flex; align-items:center; gap: 5px;">
                        <span style="color: var(--text-muted); font-size: 0.75rem; font-weight:bold;">FMV:</span>
                        <input type="number" value="${role.fmv}" class="fmv-input inp-role-fmv" data-idx="${index}">
                        <span style="color: var(--text-muted); font-size: 0.75rem; font-weight:bold;">€/h</span>
                    </div>
                    ${selectUser}
                </div>
                <button class="btn-del-role" data-idx="${index}" title="Eliminar Rol">&times;</button>
            `;
            this.dom.rolesContainer.appendChild(row);
        });

        this.dom.rolesContainer.querySelectorAll('.inp-role-level').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const idx = e.target.dataset.idx;
                const newLevel = e.target.value;
                this.draftRoles[idx].levelId = newLevel;
                const multipliers = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                this.draftRoles[idx].multiplier = multipliers[newLevel];
                this.renderDraftRoles();
            });
        });
        this.dom.rolesContainer.querySelectorAll('.inp-role-name').forEach(inp => {
            inp.addEventListener('input', (e) => this.draftRoles[e.target.dataset.idx].name = e.target.value);
        });
        this.dom.rolesContainer.querySelectorAll('.inp-role-fmv').forEach(inp => {
            inp.addEventListener('input', (e) => this.draftRoles[e.target.dataset.idx].fmv = parseFloat(e.target.value) || 0);
        });
        this.dom.rolesContainer.querySelectorAll('.inp-role-assignee').forEach(sel => {
            sel.addEventListener('change', (e) => {
                this.draftRoles[e.target.dataset.idx].assignee = e.target.value;
            });
        });
        this.dom.rolesContainer.querySelectorAll('.btn-del-role').forEach(btn => {
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

    async finalizeProject() {
        const projectId = 'proj_' + Math.random().toString(36).substr(2, 9);
        const name = this.dom.inpName.value.trim() || 'Nueva Red';
        const arch = this.dom.inpArchetype.value; 
        const triggerCascade = this.dom.inpSpawnCascade.checked;
        
        this.dom.btnLaunch.disabled = true;
        this.dom.btnLaunch.innerText = 'Instanciando Matriz y LMS...';

        await store.dispatch({ 
            type: 'CREATE_PROJECT', 
            payload: {
                id: projectId, nombre: name, sector: this.dom.inpSector.value,
                prompt: this.draftPresentation, archetype: arch, roles: this.draftRoles, vna_flows: [], work_orders: [],
                usuarios: [] 
            } 
        });

        await store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId: projectId, updates: { presentation: this.draftPresentation, tags: this.draftTags } }
        });

        await KB.init();

        const uniqueAssignees = new Set();
        if (this.draftRoles.length > 0) {
            for (const rol of this.draftRoles) {
                if (rol.assignee) uniqueAssignees.add(rol.assignee);
                
                await KB.saveNode({
                    id: `meme_skill_${projectId}_${rol.id}`, type: 'meme', category: 'skill', projectId: projectId, targetId: 'global',
                    title: `Skill: ${rol.name}`, content: `Competencia para ${rol.name} (${rol.levelId}).`, keywords: [rol.levelId, projectId]
                });

                if (rol.ai_prompt && rol.ai_prompt.length > 10) {
                    await KB.saveNode({
                        id: `prompt_${projectId}_${rol.id}`, type: 'prompt_a2a', projectId: projectId, targetId: rol.id, roleTarget: rol.levelId,
                        title: `Ikigai Prompt: ${rol.name}`, content: rol.ai_prompt
                    });
                }
            }
        }

        const state = store.getState();
        const pCurrent = state.projects.find(p => p.id === projectId);
        if (pCurrent) {
            pCurrent.usuarios = Array.from(uniqueAssignees).map(uId => ({ id: uId, permissions: { canCreateWO: true } }));
            pCurrent.asignaciones = this.draftRoles.filter(r => r.assignee).map(r => ({ roleId: r.id, userId: r.assignee }));
        }

        if (pCurrent && this.draftTxs && this.draftTxs.length > 0) {
            for (const aiTx of this.draftTxs) {
                const roleFrom = pCurrent.roles.find(r => r.id === aiTx.from);
                const roleTo = pCurrent.roles.find(r => r.id === aiTx.to);
                
                if (roleFrom && roleTo) {
                    const flowId = 'flow_' + aiTx.id; 
                    
                    await store.dispatch({
                        type: 'ADD_FLOW',
                        payload: {
                            projectId: projectId,
                            flow: { 
                                id: flowId, from: roleFrom.id, to: roleTo.id, estimatedHours: aiTx.horas || 4, 
                                template: aiTx.template, tipo: aiTx.tipo || 'tangible', phase: aiTx.phase, step_order: aiTx.step_order, depends_on: aiTx.depends_on,
                                soc_checklist: aiTx.soc_checklist || [], resources: aiTx.resources || [], required_skills: aiTx.required_skills || [] 
                            }
                        }
                    });

                    if (triggerCascade) {
                        const woHash = 'wo_cascade_' + Math.random().toString(36).substr(2, 9);
                        
                        let woStatus = 'theoretical';
                        let assigneeId = null;
                        if (roleFrom.assignee) {
                            woStatus = 'pinged'; 
                            assigneeId = roleFrom.assignee;
                        }

                        await store.dispatch({
                            type: 'SPAWN_WORK_ORDER',
                            payload: {
                                projectId: projectId,
                                workOrder: {
                                    hash: woHash, flowId: flowId, status: woStatus, realHours: 0,
                                    sprintId: pCurrent.activeSprintId, comentario: `SOP: Ejecutar [${aiTx.template}].`,
                                    soc_checklist: aiTx.soc_checklist || [], resources: aiTx.resources || [],
                                    assigneeId: assigneeId
                                }
                            }
                        });
                    }
                }
            }
        }
        
        store.persistState().then(() => {
            localStorage.setItem('tt_active_project', projectId);
            window.location.href = '/v9/dashboard';
        });
    }
}
