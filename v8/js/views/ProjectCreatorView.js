// v8/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Instanciar Red | TeamTowers V8";
        this.currentStep = 1;
        this.draftRoles = [];
        this.draftTxs = [];
        this.draftPresentation = ""; 
        this.draftTags = []; 
        this.sectorsFromKB = {}; 
        
        this.guardians = [
            { id: 'creator', label: '🎨 Creador' }, { id: 'caregiver', label: '❤️ Cuidador' },
            { id: 'ruler', label: '👑 Gobernante' }, { id: 'jester', label: '🃏 Bufón' },
            { id: 'everyman', label: '🤝 Ciudadano' }, { id: 'lover', label: '🔥 Amante' },
            { id: 'hero', label: '⚔️ Héroe' }, { id: 'outlaw', label: '🏴‍☠️ Rebelde' },
            { id: 'magician', label: '✨ Mago' }, { id: 'innocent', label: '🕊️ Inocente' },
            { id: 'explorer', label: '🧭 Explorador' }, { id: 'sage', label: '🦉 Sabio' }
        ];
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

        let sectorOptions = `<optgroup label="📦 Catálogo del Knowledge Base (V8)">`;
        Object.keys(this.sectorsFromKB).forEach(k => {
            const sectorLabel = this.sectorsFromKB[k].label;
            sectorOptions += `<option value="${k}" ${preselectedSector === k ? 'selected' : ''}>${sectorLabel}</option>`;
        });
        sectorOptions += `</optgroup>`;

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .wizard-workspace { flex: 1; padding: 3rem; overflow-y: auto; overflow-x: hidden; display: flex; justify-content: center; align-items: flex-start; background: radial-gradient(circle at center, #111116 0%, #050505 100%); width: 100%; box-sizing: border-box;}
                
                .wizard-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; width: 100%; max-width: 900px; padding: 3rem; position: relative; overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(15px); box-sizing: border-box;}
                
                .wizard-header { text-align: center; margin-bottom: 2.5rem; }
                .wizard-header h1 { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; font-weight: 900; }
                .wizard-header p { color: var(--text-muted); margin-top: 10px; font-size: 1.1rem; }
                
                .step-indicator { display: flex; justify-content: center; gap: 12px; margin-bottom: 2rem; }
                .dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.3s; }
                .dot.active { background: var(--accent-blue); box-shadow: 0 0 15px var(--accent-blue); transform: scale(1.3); }

                /* FORMS LUXURY */
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

                .educational-legend { background: rgba(0, 176, 255, 0.05); border: 1px solid rgba(0, 176, 255, 0.2); border-radius: 12px; padding: 15px; margin-bottom: 2rem; font-size: 0.8rem; color: #ccc; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
                .legend-item { display: flex; align-items: flex-start; gap: 8px; font-weight: bold;}

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

                .mini-map-container { width: 100%; height: 400px; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 20px 20px; border: 1px solid var(--glass-border); border-radius: 16px; position: relative; margin-bottom: 2rem; overflow: hidden; background-color: rgba(0,0,0,0.3);}
                .mini-node { position: absolute; width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; background: rgba(10,10,15,0.9); backdrop-filter: blur(10px); border: 2px solid; transform: translate(-50%, -50%); font-size: 1.3rem; z-index: 5; box-shadow: 0 5px 15px rgba(0,0,0,0.5); cursor: help;}

                .tx-feedback-box { background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); padding: 15px 20px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;}
                .tx-feedback-box:hover { background: rgba(0, 230, 118, 0.1); border-color: rgba(0, 230, 118, 0.4); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,230,118,0.1);}
                
                .tx-preview-list { display: none; margin-bottom: 2rem; background: rgba(0,0,0,0.4); border: 1px solid #333; border-radius: 12px; padding: 20px; max-height: 350px; overflow-y: auto;}
                .tx-preview-item { font-size: 0.85rem; color: #ccc; padding: 10px 0; border-bottom: 1px dashed #222; display: flex; justify-content: space-between; align-items: center; gap: 10px;}
                .tx-preview-item:last-child { border-bottom: none; }

                .actions-row { display: flex; gap: 15px; flex-wrap: wrap; justify-content: flex-end; margin-top: 1.5rem; }
                
                .btn-lux { padding: 14px 24px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; transition: all 0.3s; border: none;}
                .btn-lux-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; box-shadow: 0 5px 15px rgba(0,176,255,0.2);}
                .btn-lux-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,176,255,0.4); filter: brightness(1.1);}
                .btn-lux-success { background: var(--accent-green); color: black; box-shadow: 0 5px 15px rgba(0,230,118,0.2);}
                .btn-lux-success:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,230,118,0.4);}
                .btn-lux-outline { background: transparent; border: 1px solid #555; color: white;}
                .btn-lux-outline:hover { border-color: white; background: rgba(255,255,255,0.05);}

                @keyframes pulse { 0% { opacity: 0.6; transform: scale(0.98);} 50% { opacity: 1; transform: scale(1.02);} 100% { opacity: 0.6; transform: scale(0.98);} }

                @media (max-width: 768px) {
                    .wizard-workspace { padding: 80px 1rem 2rem 1rem; }
                    .wizard-card { padding: 1.5rem; border-radius: 16px; }
                    .role-draft-item { flex-direction: column; align-items: stretch; }
                    .role-inputs { flex-direction: column; align-items: stretch; }
                    .btn-del-role { align-self: stretch; background: rgba(255, 82, 82, 0.1); border-radius: 8px; padding: 10px; margin-top: 5px; width: 100%; border: 1px solid rgba(255,82,82,0.3);}
                    .actions-row { flex-direction: column; }
                    .actions-row .btn-lux { width: 100%; justify-content: center; }
                    .tx-preview-item { flex-direction: column; align-items: flex-start; gap: 8px; }
                    .ai-grid { grid-template-columns: 1fr; }
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
                                <h1>Instanciar Castell V8</h1>
                                <p>Genera una red neuronal de valor extrayendo el ADN del Knowledge Base.</p>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 2rem;">
                                <div class="form-group" style="margin: 0;">
                                    <label>Nombre de la Red</label>
                                    <input type="text" id="inpName" class="lux-input" placeholder="Ej: Cooperativa Solar">
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
                                    <label>Genoma (LMS Data)</label>
                                    <select id="inpSector" class="lux-input">
                                        ${sectorOptions}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Input Cognitivo (Visión Bruta para la IA)</label>
                                <textarea id="inpVision" class="lux-input vision-box" placeholder="Describe brevemente la idea. El Orquestador IA deducirá los roles necesarios y trazará las tuberías de valor..."></textarea>
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

                            <div class="actions-row">
                                <button class="btn-lux btn-lux-outline" id="btnStartBlank">📄 Lienzo en Blanco</button>
                                <button class="btn-lux btn-lux-outline" id="btnLoadTemplate">🏗️ Inyectar Genoma (Offline)</button>
                                <button class="btn-lux btn-lux-primary" id="btnGenerateAI">🧠 Diseñar Topología con IA</button>
                            </div>
                        </div>

                        <div id="aiLoading" class="ai-loading">
                            <span>🪐</span>
                            <p id="loadingMsg">Conectando con Orquestador Cognitivo...</p>
                            <div style="font-size: 0.9rem; color: #888; margin-top: 10px;" id="loadingSubMsg">Mapeando Ecosistema VNA...</div>
                        </div>

                        <div id="step2" style="display: none;">
                            <div class="wizard-header" style="margin-bottom: 2rem;">
                                <h1>Validación de Arquitectura</h1>
                                <p>Ajusta los nodos o revisa el mapa visual antes de inyectarlo en el Kernel.</p>
                            </div>

                            <div id="miniMapContainer" class="mini-map-container" style="display: none;"></div>

                            <div id="aiTxFeedback" class="tx-feedback-box" style="display: none;" title="Haz clic para ver un adelanto de las tuberías y el Pitch">
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--accent-green); font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">⚡ Tuberías V8 y Pitch Generados</div>
                                    <div style="color: var(--text-muted); font-size: 0.9rem;">El Orquestador ha trazado <strong id="txCount" style="color: white; font-size: 1.2rem; font-family: monospace;">0</strong> flujos base (Clic para previsualizar).</div>
                                </div>
                                <div style="font-size: 1.8rem; opacity: 0.5;">&darr;</div>
                            </div>
                            
                            <div id="txPreviewList" class="tx-preview-list"></div>

                            <div class="educational-legend">
                                <div class="legend-item"><span style="color:var(--accent-red);">👑 @anxaneta:</span> Visión (x3)</div>
                                <div class="legend-item"><span style="color:#ff4081;">🧭 @aixecador:</span> Táctica (x2)</div>
                                <div class="legend-item"><span style="color:var(--accent-purple);">👁️ @dosos:</span> Auditoría (x1.5)</div>
                                <div class="legend-item"><span style="color:var(--accent-indigo);">⚙️ @baixos:</span> Producción (x1.2)</div>
                                <div class="legend-item"><span style="color:var(--accent-blue);">🤝 @pinya:</span> Soporte (x1)</div>
                            </div>

                            <div class="role-draft-list" id="draftRolesContainer"></div>
                            
                            <button class="btn-lux btn-lux-outline" id="btnAddCustomRole" style="width: 100%; margin-bottom: 2rem; border-style: dashed;">➕ Instanciar Silla Adicional</button>

                            <div class="actions-row" style="border-top: 1px solid var(--glass-border); padding-top: 2rem;">
                                <button class="btn-lux btn-lux-outline" id="btnBack">&larr; Volver</button>
                                <button class="btn-lux btn-lux-success" id="btnLaunch">🚀 Inyectar Red en el Kernel</button>
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
            txPreviewList: document.getElementById('txPreviewList')
        };

        Sidebar.initListeners();

        this.dom.inpAiProvider.addEventListener('change', (e) => {
            this.dom.customEndpointBox.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });

        this.dom.aiTxFeedback.addEventListener('click', () => {
            if (this.dom.txPreviewList.style.display === 'block') {
                this.dom.txPreviewList.style.display = 'none';
            } else {
                this.dom.txPreviewList.style.display = 'block';
            }
        });

        this.dom.btnStartBlank.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre de la Red es obligatorio.");
            this.draftRoles = [];
            this.draftTxs = [];
            this.draftPresentation = this.dom.inpVision.value.trim(); 
            this.draftTags = [];
            this.goToStep2();
        });

        this.dom.btnLoadTemplate.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre de la Red es obligatorio.");
            
            const sectorVal = this.dom.inpSector.value; 
            let sectorData = this.sectorsFromKB[sectorVal];

            this.draftRoles = [];
            this.draftTxs = []; 
            this.draftTags = [sectorVal, this.dom.inpArchetype.value];
            
            this.draftPresentation = this.dom.inpVision.value.trim() || `Red instanciada con genoma LMS: ${sectorData ? sectorData.label : 'Vacío'}.`;
            
            if (sectorData && sectorData.roles) {
                const roleKeys = Object.keys(sectorData.roles);

                roleKeys.forEach(levelKey => {
                    const data = sectorData.roles[levelKey];
                    const level = levelKey; 
                    
                    const m = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                    
                    this.draftRoles.push({
                        id: 'draft_' + Math.random().toString(36).substr(2, 9),
                        levelId: level,
                        name: data.name || level,
                        fmv: 50,
                        multiplier: m[level] || 1.0,
                        guardian: 'everyman',
                        ai_prompt: data.content || '' 
                    });

                    if (data.deliverables) {
                        data.deliverables.forEach(deliv => {
                            let toLevel = deliv.to && deliv.to !== '?' ? deliv.to : (level === '@baixos' ? '@dosos' : (level === '@dosos' ? '@anxaneta' : '@baixos'));
                            this.draftTxs.push({
                                fromLevel: level, toLevel: toLevel, tipo: deliv.tipo || 'tangible', template: deliv.name, horas: deliv.estimatedHours || 4
                            });
                        });
                    }
                });
            } else {
                alert("Error cargando plantilla. Empieza en blanco o usa la IA.");
                return;
            }
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

            const listHtml = this.draftTxs.map((tx, i) => `
                <div class="tx-preview-item">
                    <span>
                        <span style="color:${tx.tipo==='intangible'?'var(--accent-purple)':'var(--accent-green)'}; font-weight:bold; font-family:var(--font-mono);">[${i+1}]</span> 
                        <span style="color:#888;">${tx.fromLevel} &rarr; ${tx.toLevel}</span>
                    </span>
                    <span style="color:white; font-weight:bold; font-size:0.95rem;">${tx.template || tx.entregable} <span style="color:var(--accent-blue); font-family:var(--font-mono);">(${tx.horas}h)</span></span>
                </div>
            `).join('');
            
            this.dom.txPreviewList.innerHTML = `
                ${tagsHtml}
                <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 10px; border-left: 3px solid var(--accent-blue); margin-bottom: 20px;">
                    <strong style="color: white; font-size: 0.9rem; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px;">📖 Misión Instanciada:</strong>
                    <span style="color:#ccc; font-style:italic; line-height:1.5;">${this.draftPresentation.replace(/\n/g, '<br>')}</span>
                </div>
                ${listHtml}
                <div style="text-align:center; margin-top:20px; font-size:0.8rem; color:var(--accent-orange); font-weight:bold; background:rgba(255,171,64,0.1); padding:10px; border-radius:8px;">Podrás editar la topología visualmente en el Mapa VNA después de instanciar.</div>
            `;
        } else {
            this.dom.aiTxFeedback.style.display = 'none';
            this.dom.txPreviewList.style.display = 'none';
        }
        
        this.renderDraftRoles();
    }

    async generateWithAI() {
        const name = this.dom.inpName.value.trim();
        const vision = this.dom.inpVision.value.trim();
        const provider = this.dom.inpAiProvider.value;
        const apiKey = this.dom.inpApiKey.value.trim();
        const archetypeText = this.dom.inpArchetype.options[this.dom.inpArchetype.selectedIndex].text;

        if (!name) return alert("Debes darle un nombre a la red.");
        if (!vision) return alert("Escribe tu visión en bruto para que el Agente la procese.");
        if (provider !== 'custom' && !apiKey) return alert("Falta la API Key del proveedor.");

        if (provider === 'deepseek') localStorage.setItem('tt_key_deepseek', apiKey);
        if (provider === 'openai') localStorage.setItem('tt_key_openai', apiKey);
        if (provider === 'gemini') localStorage.setItem('tt_key_gemini', apiKey);
        localStorage.setItem('tt_ai_provider', provider);

        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'flex';
        this.dom.loadingMsg.innerText = `Conectando con ${provider.toUpperCase()}...`;

        // LECTURA DEL CEREBRO SEMÁNTICO A2A (VNA & PANTHEON)
        await KB.init();
        const globalDocs = await KB.getAllDocuments('global');
        const vnaMeta = globalDocs.find(d => d.id === 'meta_vna_core')?.jsonLd?.text || 'Aplica metodología Value Network Analysis.';
        const pantheonMeta = globalDocs.find(d => d.id === 'meta_pantheon_core')?.jsonLd?.text || 'Aplica los 12 arquetipos Pantheon a cada rol.';

        const systemPrompt = `
            Actúa como Master Ecosystem Architect (Agent-to-Agent Prompt Compiler).
            Misión: Instanciar una DAO para "${name}" (Arquetipo: "${archetypeText}").

            BASE TEÓRICA CRÍTICA (Value Network Analysis):
            ${vnaMeta}

            MODELO PANTHEON (12 Guardianes):
            ${pantheonMeta}

            INSTRUCCIONES DE DENSIDAD Y A2A: 
            Crea roles distribuidos en: @anxaneta (Visión), @aixecador (Táctica), @dosos (Auditoría), @baixos (Producción), @pinya (Soporte). 
            Genera 6-8 transacciones base. 
            CRUCIAL: Asigna el ID del guardián adecuado a cada rol en base a su función. NO asignes "magician" a todos.
            AGENT-TO-AGENT: En la propiedad "ai_prompt", debes escribir INSTRUCCIONES ESPECÍFICAS PARA ESE ROL. Ese campo será leído por la IA que ejecute las Work Orders. El prompt debe ser denso y contextual al proyecto y sus entregables.
            
            ESTRUCTURA OBLIGATORIA (Devuelve SOLO JSON Válido sin marcadores markdown):
            {
                "presentacion": "Pitch institucional atractivo...",
                "tags": ["Sector", "ModeloNegocio"],
                "roles": [
                    { "levelId": "@nivel", "name": "Nombre Actividad", "fmv": 60, "multiplier": 2.0, "guardian": "id_del_guardian", "ai_prompt": "Instrucción de calibración para el agente (A2A)..." }
                ],
                "transactions": [
                    { "fromLevel": "@origen", "toLevel": "@destino", "tipo": "tangible|intangible", "template": "Sustantivo (Ej: Informe de métricas)", "horas": 4 }
                ]
            }
        `;

        try {
            let textResponse = "";

            if (provider === 'gemini') {
                const targetModel = 'gemini-1.5-flash';
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = `Compilando red semántica con ${targetModel}...`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nVISIÓN EN BRUTO: ${vision}` }] }] })
                });
                if (!response.ok) throw new Error("Google Gemini Error");
                const data = await response.json();
                textResponse = data.candidates[0].content.parts[0].text;
            
            } else if (provider === 'openai') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Mapeando ecosistema VNA con GPT-4o...";
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: vision }], response_format: { type: "json_object" } })
                });
                if (!response.ok) throw new Error("OpenAI Error");
                const data = await response.json();
                textResponse = data.choices[0].message.content;
            
            } else if (provider === 'deepseek') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Tejiendo transacciones A2A con DeepSeek...";
                const response = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: vision }], response_format: { type: "json_object" } })
                });
                if (!response.ok) throw new Error("DeepSeek Error");
                const data = await response.json();
                textResponse = data.choices[0].message.content;
            }

            textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = textResponse.indexOf('{');
            const lastBrace = textResponse.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) textResponse = textResponse.substring(firstBrace, lastBrace + 1);

            const parsedData = JSON.parse(textResponse);

            this.draftPresentation = parsedData.presentacion || vision;
            this.draftTags = parsedData.tags || [];
            this.draftRoles = parsedData.roles.map(r => ({
                id: 'draft_' + Math.random().toString(36).substr(2, 9),
                levelId: r.levelId, name: r.name, fmv: r.fmv || 50, multiplier: r.multiplier || 1.0, guardian: r.guardian || 'everyman', ai_prompt: r.ai_prompt || ''
            }));
            this.draftTxs = (parsedData.transactions || []).map(tx => ({
                fromLevel: tx.fromLevel, toLevel: tx.toLevel, tipo: tx.tipo, template: tx.template || tx.entregable, horas: tx.horas
            }));
            
            this.goToStep2();

        } catch (error) {
            console.error("💥 Fallo Motor Cognitivo:", error);
            alert(`Fallo en el Motor Cognitivo.\nRevisa tu API Key o usa la plantilla en blanco.`);
            this.dom.loading.style.display = 'none';
            this.dom.step1.style.display = 'block';
        }
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

        this.renderMiniMap();
    }

    renderMiniMap() {
        const container = document.getElementById('miniMapContainer');
        if (!container) return;

        container.innerHTML = '<svg id="mini-svg" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none;"></svg>';
        const svg = document.getElementById('mini-svg');

        if (this.draftRoles.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';

        // LÓGICA DE DISTRIBUCIÓN AUTOMÁTICA EN MINIMAPA
        const levelY = { '@anxaneta': 20, '@aixecador': 40, '@dosos': 60, '@baixos': 80, '@pinya': 90 };
        const levelCounts = {};

        this.draftRoles.forEach((rol, i) => {
            const level = rol.levelId || '@baixos';
            if (!levelCounts[level]) levelCounts[level] = 0;
            
            const totalInLvl = this.draftRoles.filter(r => r.levelId === level).length;
            
            // Repartir en X
            let x = 50;
            if (totalInLvl > 1) {
                x = 20 + (60 / (totalInLvl - 1)) * levelCounts[level];
            }
            
            let y = levelY[level] || 50;
            // Vibración en Y para evitar rectas perfectas tapadas
            y += (levelCounts[level] % 2 === 0 ? -3 : 3);

            // Guardamos las coordenadas generadas para pasarlas al Kernel al instanciar
            rol.x = x;
            rol.y = y;

            levelCounts[level]++;

            const el = document.createElement('div');
            el.className = 'mini-node';
            el.dataset.idx = i;
            el.style.left = `${x}%`; el.style.top = `${y}%`;
            el.style.borderColor = this.getColor(level);
            el.innerHTML = this.getIcon(level);
            el.title = rol.name;
            container.appendChild(el);
        });

        setTimeout(() => {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            defs.innerHTML = `
                <marker id="mini-arrow-tangible" markerWidth="8" markerHeight="6" refX="22" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--accent-green)"/></marker>
                <marker id="mini-arrow-intangible" markerWidth="8" markerHeight="6" refX="22" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--accent-purple)"/></marker>
            `;
            svg.appendChild(defs);

            const pairCounts = {};
            this.draftTxs.forEach((tx, i) => {
                const fromIdx = this.draftRoles.findIndex(r => r.levelId === tx.fromLevel);
                const toIdx = this.draftRoles.findIndex(r => r.levelId === tx.toLevel);
                if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
                    const key = fromIdx < toIdx ? `${fromIdx}-${toIdx}` : `${toIdx}-${fromIdx}`;
                    if (!pairCounts[key]) pairCounts[key] = [];
                    pairCounts[key].push({ tx, fromIdx, toIdx, i });
                }
            });

            const canvRect = container.getBoundingClientRect();
            Object.keys(pairCounts).forEach(key => {
                const edges = pairCounts[key];
                edges.forEach((edge, multiIdx) => {
                    const dom1 = container.querySelector(`.mini-node[data-idx="${edge.fromIdx}"]`);
                    const dom2 = container.querySelector(`.mini-node[data-idx="${edge.toIdx}"]`);
                    if (!dom1 || !dom2) return;

                    const r1 = dom1.getBoundingClientRect(); const r2 = dom2.getBoundingClientRect();
                    const x1 = r1.left + r1.width/2 - canvRect.left; const y1 = r1.top + r1.height/2 - canvRect.top;
                    const x2 = r2.left + r2.width/2 - canvRect.left; const y2 = r2.top + r2.height/2 - canvRect.top;
                    const dx = x2 - x1, dy = y2 - y1;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const nx = -dy / dist, ny = dx / dist;

                    let offset = 0;
                    if (edges.length > 1) offset = (multiIdx % 2 !== 0 ? 1 : -1) * Math.ceil(multiIdx / 2) * 15;

                    const cx = (x1 + x2) / 2 + nx * offset; const cy = (y1 + y2) / 2 + ny * offset;

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
                    path.setAttribute('marker-end', edge.tx.tipo === 'tangible' ? 'url(#mini-arrow-tangible)' : 'url(#mini-arrow-intangible)');
                    path.style.fill = 'none'; path.style.stroke = edge.tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)'; path.style.strokeWidth = '2';
                    if(edge.tx.tipo === 'intangible') path.style.strokeDasharray = '4,4';
                    svg.appendChild(path);
                });
            });
        }, 150);
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColor(l) { return { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }

    async finalizeProject() {
        const projectId = 'proj_' + Math.random().toString(36).substr(2, 9);
        const visionText = this.dom.inpVision.value.trim();
        const arch = this.dom.inpArchetype.value; 
        
        this.dom.btnLaunch.disabled = true;
        this.dom.btnLaunch.innerText = 'Instanciando Matriz V8...';

        await store.dispatch({ 
            type: 'CREATE_PROJECT', 
            payload: {
                id: projectId, nombre: this.dom.inpName.value.trim() || 'Nueva Red', sector: this.dom.inpSector.value,
                prompt: visionText, archetype: arch, roles: this.draftRoles, vna_flows: [], work_orders: []
            } 
        });

        await store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId: projectId, updates: { presentation: this.draftPresentation, tags: this.draftTags } }
        });

        // 3. LMS HOOK A2A: Guardar los Prompts específicos de los roles en la Base de Conocimiento local
        if (this.draftRoles.length > 0) {
            for (const rol of this.draftRoles) {
                if (rol.ai_prompt && rol.ai_prompt.length > 10) {
                    await KB.saveDocument({
                        id: `onto_${projectId}_${rol.id}`,
                        type: 'ontology',
                        projectId: projectId,
                        sector: this.dom.inpSector.value,
                        roleTarget: rol.id,
                        title: `Prompt A2A: ${rol.name} (${projectId})`,
                        content: rol.ai_prompt
                    });
                }
            }
        }

        const p = store.getState().projects.find(x => x.id === projectId);
        if (p && this.draftTxs && this.draftTxs.length > 0) {
            for (const aiTx of this.draftTxs) {
                const roleFrom = p.roles.find(r => r.levelId === aiTx.fromLevel);
                const roleTo = p.roles.find(r => r.levelId === aiTx.toLevel);
                if (roleFrom && roleTo) {
                    await store.dispatch({
                        type: 'ADD_FLOW',
                        payload: {
                            projectId: projectId,
                            flow: { from: roleFrom.id, to: roleTo.id, estimatedHours: aiTx.horas || 2, template: aiTx.template || aiTx.entregable || 'Flow', tipo: aiTx.tipo || 'tangible' }
                        }
                    });
                }
            }
        }
        localStorage.setItem('tt_active_project', projectId);
        window.location.href = '/v8/project';
    }
}
