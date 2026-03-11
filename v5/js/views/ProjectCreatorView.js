// v5/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Instanciador Agnóstico | TeamTowers SOS";
        this.currentStep = 1;
        this.draftRoles = [];
        this.draftTxs = [];
        this.draftPresentation = ""; 
        this.draftTags = []; 
        
        // Los 12 Arquetipos de Guardianes (Pantheon.work)
        this.guardians = [
            { id: 'creator', label: '🎨 Creador (Innovación)' },
            { id: 'caregiver', label: '❤️ Cuidador (Soporte)' },
            { id: 'ruler', label: '👑 Gobernante (Estructura)' },
            { id: 'jester', label: '🃏 Bufón (Disrupción)' },
            { id: 'everyman', label: '🤝 Ciudadano (Realismo)' },
            { id: 'lover', label: '🔥 Amante (Pasión)' },
            { id: 'hero', label: '⚔️ Héroe (Ejecución)' },
            { id: 'outlaw', label: '🏴‍☠️ Rebelde (Cambio)' },
            { id: 'magician', label: '✨ Mago (Transformación)' },
            { id: 'innocent', label: '🕊️ Inocente (Ética)' },
            { id: 'explorer', label: '🧭 Explorador (Búsqueda)' },
            { id: 'sage', label: '🦉 Sabio (Verdad)' }
        ];
    }

    async getHtml() {
        const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        let savedKey = '';
        if (savedProvider === 'deepseek') savedKey = localStorage.getItem('tt_key_deepseek') || '';
        if (savedProvider === 'openai') savedKey = localStorage.getItem('tt_key_openai') || '';
        if (savedProvider === 'gemini') savedKey = localStorage.getItem('tt_key_gemini') || '';

        const hasKey = savedKey.length > 5;
        
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedSector = urlParams.get('sector') || '';

        const state = store.getState();
        const customSectores = state.ontology?.sectores || {};
        
        let sectorOptions = `<optgroup label="🌟 Tus Plantillas Custom">`;
        Object.keys(customSectores).forEach(k => {
            sectorOptions += `<option value="custom_${k}" ${preselectedSector === k ? 'selected' : ''}>[Custom] ${k.toUpperCase()}</option>`;
        });
        sectorOptions += `</optgroup><optgroup label="📦 Plantillas Nativas">`;
        Object.keys(GLOBAL_ONTOLOGY).forEach(k => {
            sectorOptions += `<option value="native_${k}" ${preselectedSector === k ? 'selected' : ''}>[Nativa] ${k.toUpperCase().replace(/_/g, ' ')}</option>`;
        });
        sectorOptions += `</optgroup>`;

        return `
            <style>
                .wizard-workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; justify-content: center; align-items: flex-start; }
                .wizard-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); width: 100%; max-width: 900px; padding: 3rem; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);}
                .wizard-header { text-align: center; margin-bottom: 2rem; }
                .wizard-header h1 { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; }
                .wizard-header p { color: var(--text-muted); margin-top: 10px; }
                
                .step-indicator { display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; }
                .dot { width: 12px; height: 12px; border-radius: 50%; background: #333; transition: all 0.3s; }
                .dot.active { background: var(--accent-blue); box-shadow: 0 0 10px var(--accent-blue); transform: scale(1.2); }

                .vision-box { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 15px; color: white; font-size: 1.1rem; width: 100%; min-height: 120px; font-family: inherit; resize: vertical; margin-bottom: 1rem;}
                .vision-box:focus { border-color: var(--accent-blue); outline: none; box-shadow: 0 0 15px rgba(0, 176, 255, 0.2); }
                
                .ai-config-panel { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px dashed #333; display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem;}
                .ai-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 10px;}
                
                .ai-loading { display: none; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; animation: pulse 2s infinite; }
                .ai-loading span { font-size: 3rem; margin-bottom: 1rem; }
                .ai-loading p { color: var(--accent-blue); font-family: var(--font-mono); font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;}

                .educational-legend { background: rgba(0, 176, 255, 0.05); border: 1px solid rgba(0, 176, 255, 0.2); border-radius: var(--border-radius-sm); padding: 15px; margin-bottom: 2rem; font-size: 0.8rem; color: #ccc; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
                .legend-item { display: flex; align-items: flex-start; gap: 8px; }

                .role-draft-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem; max-height: 350px; overflow-y: auto; padding-right: 10px;}
                .role-draft-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 12px 15px; border-radius: var(--border-radius-sm); gap: 15px;}
                
                .role-inputs { display: flex; gap: 10px; flex: 1; align-items: center; flex-wrap: wrap;}
                .inp-role-level, .inp-role-guardian { background: #050505; border: 1px solid #333; border-radius: 6px; padding: 6px; font-size: 0.75rem; font-weight: bold; outline: none; cursor: pointer; transition: border-color 0.2s; color: white;}
                .inp-role-level:focus, .inp-role-guardian:focus { border-color: var(--accent-blue); }
                
                .role-inputs input.inp-role-name { background: transparent; border: none; color: white; font-size: 0.9rem; border-bottom: 1px solid #333; padding: 5px; flex: 1; min-width: 150px;}
                .role-inputs input.inp-role-name:focus { border-bottom-color: var(--accent-blue); outline: none; }
                .role-inputs .fmv-input { width: 60px; min-width: 60px; text-align: center; color: var(--accent-green); font-family: var(--font-mono); background: transparent; border: none; border-bottom: 1px solid #333;}
                
                .btn-del-role { background: transparent; border: none; color: var(--accent-red); cursor: pointer; font-size: 1.2rem; padding: 5px; transition: transform 0.2s; }
                .btn-del-role:hover { transform: scale(1.2); }

                .mini-map-container { width: 100%; height: 350px; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 20px 20px; border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); position: relative; margin-bottom: 2rem; overflow: hidden; background-color: rgba(0,0,0,0.2);}
                .mini-node { position: absolute; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 2px solid; transform: translate(-50%, -50%); font-size: 1.2rem; z-index: 5; box-shadow: 0 4px 10px rgba(0,0,0,0.5); cursor: help;}

                .tx-feedback-box { background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;}
                .tx-feedback-box:hover { background: rgba(0, 230, 118, 0.1); border-color: rgba(0, 230, 118, 0.4); transform: translateY(-2px);}
                
                .tx-preview-list { display: none; margin-bottom: 2rem; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 8px; padding: 15px; max-height: 300px; overflow-y: auto;}
                .tx-preview-item { font-size: 0.8rem; color: #ccc; padding: 8px 0; border-bottom: 1px dashed #222; display: flex; justify-content: space-between; align-items: center; gap: 10px;}
                .tx-preview-item:last-child { border-bottom: none; }

                .actions-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; margin-top: 1rem; }

                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

                @media (max-width: 768px) {
                    .wizard-workspace { padding: 1rem; }
                    .wizard-card { padding: 1.5rem; }
                    .role-draft-item { flex-direction: column; align-items: stretch; }
                    .role-inputs { flex-direction: column; align-items: stretch; }
                    .btn-del-role { align-self: flex-end; }
                    .educational-legend { grid-template-columns: 1fr; }
                    .actions-row { flex-direction: column; }
                    .actions-row .btn { width: 100%; }
                    .tx-preview-item { flex-direction: column; align-items: flex-start; gap: 4px; }
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
                                <h1>Instanciador de Red VNA</h1>
                                <p>Diseña ecosistemas de valor inmutables.</p>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 1.5rem;">
                                <div class="form-group" style="margin: 0;">
                                    <label>Nombre del Castell (Proyecto)</label>
                                    <input type="text" id="inpName" class="form-control" placeholder="Ej: Cooperativa Solar">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label>Arquetipo de Gobernanza</label>
                                    <select id="inpArchetype" class="form-control">
                                        <option value="startup">🚀 Startup (Agilidad/Equidad)</option>
                                        <option value="corp">🏢 Empresa (Jerarquía Clásica)</option>
                                        <option value="dao">🤖 IA-DAO (Humanos + Agentes IA)</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label>Plantilla Base (ADN)</label>
                                    <select id="inpSector" class="form-control">
                                        ${sectorOptions}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Visión Bruta / Input Cognitivo</label>
                                <textarea id="inpVision" class="vision-box" placeholder="Describe brevemente la idea. El Orquestador IA aplicará el modelo de Verna Allee y Pantheon para crear el mapa..."></textarea>
                            </div>

                            <details style="margin-bottom: 2rem;" ${!hasKey ? 'open' : ''}>
                                <summary style="color: var(--accent-purple); font-size: 0.85rem; font-weight: bold; cursor: pointer; margin-bottom: 10px;">✨ Configurar Llave IA Manualmente</summary>
                                <div class="ai-config-panel">
                                    <div class="ai-grid">
                                        <div>
                                            <label style="font-size: 0.7rem; color:#888;">Proveedor IA</label>
                                            <select id="inpAiProvider" class="form-control">
                                                <option value="deepseek" ${savedProvider === 'deepseek' ? 'selected' : ''}>DeepSeek (API Abierta)</option>
                                                <option value="gemini" ${savedProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
                                                <option value="openai" ${savedProvider === 'openai' ? 'selected' : ''}>OpenAI (ChatGPT)</option>
                                                <option value="custom" ${savedProvider === 'custom' ? 'selected' : ''}>Agente Corporativo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="font-size: 0.7rem; color:#888;">API Key / Bearer Token</label>
                                            <input type="password" id="inpApiKey" class="form-control" placeholder="sk-..." value="${savedKey}">
                                        </div>
                                    </div>
                                    <div id="customEndpointBox" style="display: ${savedProvider === 'custom' ? 'block' : 'none'}; margin-top: 10px;">
                                        <label style="font-size: 0.7rem; color:#888;">URL del Endpoint Custom</label>
                                        <input type="text" id="inpCustomUrl" class="form-control" placeholder="https://mi-empresa.com/api/agent/architect">
                                    </div>
                                </div>
                            </details>

                            <div class="actions-row">
                                <button class="btn btn-outline" id="btnStartBlank">📄 Empezar en Blanco</button>
                                <button class="btn btn-outline" id="btnLoadTemplate">🏗️ Cargar Plantilla Seleccionada</button>
                                <button class="btn btn-primary" id="btnGenerateAI" style="background: linear-gradient(45deg, var(--accent-purple), var(--accent-blue)); border:none;">🧠 Diseñar con IA (VNA)</button>
                            </div>
                        </div>

                        <div id="aiLoading" class="ai-loading">
                            <span>🔌</span>
                            <p id="loadingMsg">Conectando con Orquestador Cognitivo...</p>
                            <div style="font-size: 0.75rem; color: #666; margin-top: 10px;" id="loadingSubMsg">Mapeando Ecosistema VNA e Ikigai...</div>
                        </div>

                        <div id="step2" style="display: none;">
                            <div class="wizard-header" style="margin-bottom: 1.5rem;">
                                <h1>Validación de Arquitectura</h1>
                                <p>Ajusta los nodos funcionales o revisa el mapa visual antes de registrarlo.</p>
                            </div>

                            <div id="miniMapContainer" class="mini-map-container" style="display: none;"></div>

                            <div id="aiTxFeedback" class="tx-feedback-box" style="display: none;" title="Haz clic para ver un adelanto de los flujos de valor y el Pitch">
                                <div>
                                    <div style="font-size: 0.8rem; color: var(--accent-green); font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">⚡ Red de Valor y Pitch Generados</div>
                                    <div style="color: var(--text-muted); font-size: 0.85rem;">Se ha redactado la presentación y <strong id="txCount" style="color: white; font-size: 1.1rem; font-family: monospace;">0</strong> entregables clave (Clic para previsualizar).</div>
                                </div>
                                <div style="font-size: 1.5rem; opacity: 0.5;">&darr;</div>
                            </div>
                            
                            <div id="txPreviewList" class="tx-preview-list"></div>

                            <div class="educational-legend">
                                <div class="legend-item"><span style="color:var(--accent-red);">👑 @anxaneta:</span> Estrategia/Visión (x3)</div>
                                <div class="legend-item"><span style="color:#ff4081;">🧭 @aixecador:</span> Táctica/Conexión (x2)</div>
                                <div class="legend-item"><span style="color:var(--accent-purple);">👁️ @dosos:</span> Auditoría/QA (x1.5)</div>
                                <div class="legend-item"><span style="color:var(--accent-indigo);">⚙️ @baixos:</span> Producción (x1.2)</div>
                                <div class="legend-item"><span style="color:var(--accent-blue);">🤝 @pinya:</span> Soporte Base (x1)</div>
                            </div>

                            <div class="role-draft-list" id="draftRolesContainer"></div>
                            
                            <button class="btn btn-outline" id="btnAddCustomRole" style="width: 100%; margin-bottom: 2rem; border-style: dashed;">+ Instanciar Nuevo Nodo Funcional</button>

                            <div class="actions" style="border-top: 1px solid var(--glass-border); padding-top: 2rem; margin-top: 1rem; display: flex; justify-content: space-between;">
                                <button class="btn btn-outline" id="btnBack">&larr; Volver</button>
                                <button class="btn btn-success" id="btnLaunch" style="background: var(--accent-green); color: black;">🚀 Firmar y Registrar Ecosistema</button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

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
            if (!this.dom.inpName.value.trim()) return alert("El nombre es obligatorio.");
            this.draftRoles = [];
            this.draftTxs = [];
            this.draftPresentation = this.dom.inpVision.value.trim(); 
            this.draftTags = [];
            this.goToStep2();
        });

        this.dom.btnLoadTemplate.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre es obligatorio.");
            
            const sectorVal = this.dom.inpSector.value; 
            const state = store.getState();
            let sectorData = null;

            if (sectorVal.startsWith('custom_')) {
                const key = sectorVal.replace('custom_', '');
                sectorData = state.ontology?.sectores[key];
            } else {
                const key = sectorVal.replace('native_', '');
                sectorData = GLOBAL_ONTOLOGY[key];
            }

            this.draftRoles = [];
            this.draftTxs = [];
            this.draftTags = [sectorVal.split('_')[1], this.dom.inpArchetype.value];
            // Si la plantilla no tiene presentación, usamos el prompt del usuario
            this.draftPresentation = this.dom.inpVision.value.trim() || `Ecosistema basado en plantilla: ${this.dom.inpSector.options[this.dom.inpSector.selectedIndex].text}.`;
            
            if (sectorData) {
                const rolesObj = sectorData.roles || sectorData;

                Object.entries(rolesObj).forEach(([levelKey, data]) => {
                    const level = data.levelId || levelKey; 
                    
                    this.draftRoles.push({
                        id: 'draft_' + Math.random().toString(36).substr(2, 9),
                        levelId: level,
                        name: data.name || level,
                        fmv: data.fmv || 50,
                        multiplier: data.multiplier || 1.0,
                        guardian: data.guardian || 'everyman'
                    });

                    if (data.standard_deliverables) {
                        data.standard_deliverables.forEach(deliv => {
                            let toLevel = deliv.to && deliv.to !== '?' ? deliv.to : (level === '@baixos' ? '@dosos' : (level === '@dosos' ? '@anxaneta' : '@baixos'));
                            let tipo = deliv.tipo || 'tangible';

                            this.draftTxs.push({
                                fromLevel: level,
                                toLevel: toLevel,
                                tipo: tipo,
                                entregable: deliv.name,
                                horas: deliv.estimatedHours || 2
                            });
                        });
                    }
                });
            } else {
                alert("La plantilla seleccionada está vacía o no existe.");
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
                levelId: '@baixos',
                name: 'Nueva Actividad',
                fmv: 40,
                multiplier: 1.2,
                guardian: 'everyman'
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
            
            const tagsHtml = this.draftTags.length > 0 ? `<div style="margin-bottom:10px;">${this.draftTags.map(t => `<span style="background:#333; padding:2px 8px; border-radius:12px; font-size:0.7rem; margin-right:5px;">#${t}</span>`).join('')}</div>` : '';

            const listHtml = this.draftTxs.map((tx, i) => `
                <div class="tx-preview-item">
                    <span>
                        <span style="color:${tx.tipo==='intangible'?'var(--accent-purple)':'var(--accent-green)'}; font-weight:bold; font-family:var(--font-mono);">[${i+1}]</span> 
                        <span style="color:#888;">${tx.fromLevel} &rarr; ${tx.toLevel}</span>
                    </span>
                    <span style="color:white; font-weight:bold;">${tx.entregable} <span style="color:var(--accent-blue); font-family:var(--font-mono);">(${tx.horas}h)</span></span>
                </div>
            `).join('');
            
            this.dom.txPreviewList.innerHTML = `
                ${tagsHtml}
                <div style="color: white; font-size: 0.9rem; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                    <strong>📖 Presentación Estratégica (Pitch):</strong><br>
                    <span style="color:#aaa; font-style:italic;">${this.draftPresentation.replace(/\n/g, '<br>')}</span>
                </div>
                ${listHtml}
                <div style="text-align:center; margin-top:15px; font-size:0.75rem; color:var(--accent-orange); font-weight:bold;">Podrás editar la presentación en el Dashboard, y los flujos en el Mapa de Valor.</div>
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
        if (provider !== 'custom' && !apiKey) return alert("Falta la API Key del proveedor. Guárdala en Configuración o ponla aquí.");

        if (provider === 'deepseek') localStorage.setItem('tt_key_deepseek', apiKey);
        if (provider === 'openai') localStorage.setItem('tt_key_openai', apiKey);
        if (provider === 'gemini') localStorage.setItem('tt_key_gemini', apiKey);
        localStorage.setItem('tt_ai_provider', provider);

        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'flex';
        this.dom.loadingMsg.innerText = `Conectando con ${provider.toUpperCase()}...`;

        // Motor de memoria contextual
        const state = store.getState();
        const customSectores = Object.keys(state.ontology?.sectores || {}).join(", ");
        const contextMemoria = customSectores.length > 0 
            ? `Tu ecosistema ya domina los patrones de: ${customSectores}. Inspírate en su densidad para diseñar esta nueva red.` 
            : "";

        // --- MASTER PROMPT VNA (Verna Allee + Pantheon Work + Pitch Inversores) ---
        const systemPrompt = `
            Actúa como Master Ecosystem Architect, experto en Value Network Analysis (Verna Allee) y Pantheon Work.
            Misión: Instanciar una DAO de valor para "${name}" (Arquetipo: "${archetypeText}").
            ${contextMemoria}

            BASE TEÓRICA CRÍTICA (VNA & PANTHEON):
            1. ROLES = ACTIVIDADES: En la metodología de Verna Allee, los roles NO son puestos de trabajo (Job Titles) ni un organigrama jerárquico. Son "nodos de actividad" que generan entregables. Una persona puede ocupar múltiples roles.
            2. TRANSACCIONES = ENTREGABLES: El valor fluye a través de entregables (siempre descritos como SUSTANTIVOS, no verbos). 
               - TANGIBLES (MUST): Entregables contractuales, exigibles, productos, código, informes, dinero.
               - INTANGIBLES (EXTRA): Conocimiento, mentoría, favores, validación, decisiones, influencia, soporte emocional. El pegamento de la red.
            3. GUARDIANES (Pantheon Work): Asigna uno de los 12 arquetipos (creator, caregiver, ruler, jester, everyman, lover, hero, outlaw, magician, innocent, explorer, sage) a cada rol según la misión o "alma" de esa actividad.

            ANÁLISIS ESTRATÉGICO:
            Antes de listar los nodos, analiza el sector y modelo de negocio para que las transacciones reflejen el intercambio real de valor económico y social.

            REGLAS DE DENSIDAD Y FLUJO:
            1. INTERDEPENDENCIA: Cada rol DEBE tener al menos 1 transacción de entrada y 1 de salida. No hay nodos aislados. El valor debe circular.
            2. COBERTURA HUMA: Crea roles distribuidos en: @anxaneta (Estrategia/Visión), @aixecador (Coordinación/Táctica), @dosos (Auditoría/QA/Control), @baixos (Ejecución/Producción), @pinya (Soporte/Base).
            3. RED DENSA: Genera un mínimo de 10 a 12 transacciones. 
            
            PRESENTACIÓN / PITCH (ENFOQUE STAKEHOLDERS E INVERSORES):
            La "presentacion" debe estar redactada en 3 párrafos orientados a cautivar a stakeholders, usuarios e inversores:
            - Párrafo 1: El Propósito fundacional y la oportunidad de mercado/problema que resuelve de forma única.
            - Párrafo 2: El Modelo de Negocio, escalabilidad y cómo fluye el valor a través de la red VNA para asegurar la ejecución.
            - Párrafo 3: El Ikigai (razón de ser) y la cultura de los Guardianes que garantizan el éxito a largo plazo.
            
            ESTRUCTURA OBLIGATORIA (Devuelve SOLO JSON Válido, sin formato markdown extra como \`\`\`json):
            {
                "presentacion": "Pitch institucional (3 párrafos) atractivo para stakeholders, usuarios e inversores...",
                "tags": ["Sector", "ModeloNegocio", "Tag3"],
                "roles": [
                    { "levelId": "@nivel", "name": "Nombre Actividad", "fmv": 60, "multiplier": 2.0, "guardian": "magician" }
                ],
                "transactions": [
                    { "fromLevel": "@origen", "toLevel": "@destino", "tipo": "tangible|intangible", "entregable": "Sustantivo (Ej: Informe de métricas)", "horas": 4 }
                ]
            }
        `;

        try {
            let textResponse = "";

            if (provider === 'gemini') {
                const targetModel = 'gemini-1.5-flash';
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = `Diseñando topología VNA con ${targetModel}...`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${systemPrompt}\n\nVISIÓN EN BRUTO: ${vision}` }] }]
                    })
                });

                if (!response.ok) throw new Error("Google Gemini Error");
                const data = await response.json();
                textResponse = data.candidates[0].content.parts[0].text;
            
            } else if (provider === 'openai') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Mapeando ecosistema VNA con GPT-4o-mini...";
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: vision }],
                        response_format: { type: "json_object" }
                    })
                });
                if (!response.ok) throw new Error("OpenAI Error");
                const data = await response.json();
                textResponse = data.choices[0].message.content;
            
            } else if (provider === 'deepseek') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Tejiendo transacciones e intangibles con DeepSeek Coder...";
                const response = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: vision }],
                        response_format: { type: "json_object" }
                    })
                });
                if (!response.ok) throw new Error("DeepSeek Error");
                const data = await response.json();
                textResponse = data.choices[0].message.content;
            } else if (provider === 'custom') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Llamando a Agente DAO Interno...";
                const customUrl = this.dom.inpCustomUrl.value.trim();
                const response = await fetch(customUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ prompt: systemPrompt, vision: vision })
                });
                if (!response.ok) throw new Error("Error de conexión con el Endpoint Custom.");
                const data = await response.json();
                textResponse = typeof data === 'string' ? data : JSON.stringify(data);
            }

            textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = textResponse.indexOf('{');
            const lastBrace = textResponse.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) textResponse = textResponse.substring(firstBrace, lastBrace + 1);

            const parsedData = JSON.parse(textResponse);

            if (!parsedData.roles) throw new Error("La IA no devolvió roles funcionales.");

            this.draftPresentation = parsedData.presentacion || vision;
            this.draftTags = parsedData.tags || [];

            this.draftRoles = parsedData.roles.map(r => ({
                id: 'draft_' + Math.random().toString(36).substr(2, 9),
                levelId: r.levelId,
                name: r.name,
                fmv: r.fmv || 50,
                multiplier: r.multiplier || 1.0,
                guardian: r.guardian || 'everyman'
            }));

            this.draftTxs = parsedData.transactions || [];
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
            { id: '@anxaneta', label: '@anxaneta (Dirección)' },
            { id: '@aixecador', label: '@aixecador (Coordinador)' },
            { id: '@dosos', label: '@dosos (Auditor)' },
            { id: '@baixos', label: '@baixos (Técnico)' },
            { id: '@pinya', label: '@pinya (Operaciones)' }
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
                        <span style="color: var(--text-muted); font-size: 0.7rem;">FMV:</span>
                        <input type="number" value="${role.fmv}" class="fmv-input inp-role-fmv" data-idx="${index}" title="Valor Mercado €/h">
                        <span style="color: var(--text-muted); font-size: 0.7rem;">€/h</span>
                    </div>
                </div>
                <button class="btn-del-role" data-idx="${index}" title="Eliminar Rol">×</button>
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

        const layout = { '@anxaneta': {x: 50, y: 20}, '@aixecador': {x: 50, y: 40}, '@dosos': {x: 35, y: 60}, '@baixos': {x: 65, y: 60}, '@pinya': {x: 50, y: 80} };
        const levelCounts = {};

        this.draftRoles.forEach((rol, i) => {
            const level = rol.levelId || '@baixos';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
            
            const pos = { ...(layout[level] || {x:50, y:50}) };
            if (levelCounts[level] > 1) pos.x += (levelCounts[level] - 1) * 20 - 10;

            const el = document.createElement('div');
            el.className = 'mini-node';
            el.dataset.idx = i;
            el.style.left = `${pos.x}%`; el.style.top = `${pos.y}%`;
            el.style.borderColor = this.getColor(level);
            el.innerHTML = this.getIcon(level);
            el.title = `${rol.name} (${this.guardians.find(g => g.id === rol.guardian)?.label || ''})`;
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

                    const r1 = dom1.getBoundingClientRect();
                    const r2 = dom2.getBoundingClientRect();

                    const x1 = r1.left + r1.width/2 - canvRect.left;
                    const y1 = r1.top + r1.height/2 - canvRect.top;
                    const x2 = r2.left + r2.width/2 - canvRect.left;
                    const y2 = r2.top + r2.height/2 - canvRect.top;

                    const dx = x2 - x1, dy = y2 - y1;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const nx = -dy / dist, ny = dx / dist;

                    let offset = 0;
                    if (edges.length > 1) {
                        const step = 20; 
                        offset = (multiIdx % 2 !== 0 ? 1 : -1) * Math.ceil(multiIdx / 2) * step;
                    }

                    const cx = (x1 + x2) / 2 + nx * offset;
                    const cy = (y1 + y2) / 2 + ny * offset;

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
                    path.setAttribute('marker-end', edge.tx.tipo === 'tangible' ? 'url(#mini-arrow-tangible)' : 'url(#mini-arrow-intangible)');
                    
                    path.style.fill = 'none';
                    path.style.stroke = edge.tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                    path.style.strokeWidth = '2';
                    if(edge.tx.tipo === 'intangible') path.style.strokeDasharray = '4,4';
                    
                    svg.appendChild(path);
                    
                    const txtX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
                    const txtY = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
                    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    txt.setAttribute('x', txtX); 
                    txt.setAttribute('y', txtY - 4);
                    txt.setAttribute('text-anchor', 'middle');
                    txt.style.cssText = `fill:${edge.tx.tipo==='tangible'?'var(--accent-green)':'var(--accent-purple)'};font-size:10px;font-weight:bold;font-family:monospace;paint-order:stroke;stroke:#111;stroke-width:4px;`;
                    txt.textContent = `[${edge.i + 1}]`;
                    svg.appendChild(txt);
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
        this.dom.btnLaunch.innerText = 'Registrando en el Kernel...';

        // 1. ADD_PROJECT: Guarda la estructura base
        await store.dispatch({ 
            type: 'ADD_PROJECT', 
            payload: {
                id: projectId,
                nombre: this.dom.inpName.value.trim() || 'Nueva Red',
                sector: this.dom.inpSector.value,
                prompt: visionText, 
                archetype: arch, 
                customRoles: this.draftRoles
            } 
        });

        // 2. UPDATE_PROJECT_INFO: Forzamos la inyección del Pitch y los Tags para asegurar su persistencia en la DB Local
        await store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { 
                projectId: projectId, 
                updates: { 
                    presentation: this.draftPresentation,
                    tags: this.draftTags
                } 
            }
        });

        const state = store.getState();
        const p = state.projects.find(x => x.id === projectId);
        
        if (p && this.draftTxs && this.draftTxs.length > 0) {
            for (const aiTx of this.draftTxs) {
                const roleFrom = p.roles.find(r => r.levelId === aiTx.fromLevel);
                const roleTo = p.roles.find(r => r.levelId === aiTx.toLevel);
                
                if (roleFrom && roleTo) {
                    await store.dispatch({
                        type: 'ADD_TRANSACTION',
                        payload: {
                            projectId: projectId,
                            tx: {
                                from: roleFrom.id, 
                                to: roleTo.id,     
                                horas: aiTx.horas || 2,
                                entregable: aiTx.entregable,
                                tipo: aiTx.tipo || 'tangible',
                                status: 'theoretical'
                            }
                        }
                    });
                }
            }
        }

        window.location.href = '/v5/dashboard';
    }
}// v5/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Instanciador Agnóstico | TeamTowers SOS";
        this.currentStep = 1;
        this.draftRoles = [];
        this.draftTxs = [];
        this.draftPresentation = ""; 
        this.draftTags = []; 
        
        // Los 12 Arquetipos de Guardianes (Pantheon.work)
        this.guardians = [
            { id: 'creator', label: '🎨 Creador (Innovación)' },
            { id: 'caregiver', label: '❤️ Cuidador (Soporte)' },
            { id: 'ruler', label: '👑 Gobernante (Estructura)' },
            { id: 'jester', label: '🃏 Bufón (Disrupción)' },
            { id: 'everyman', label: '🤝 Ciudadano (Realismo)' },
            { id: 'lover', label: '🔥 Amante (Pasión)' },
            { id: 'hero', label: '⚔️ Héroe (Ejecución)' },
            { id: 'outlaw', label: '🏴‍☠️ Rebelde (Cambio)' },
            { id: 'magician', label: '✨ Mago (Transformación)' },
            { id: 'innocent', label: '🕊️ Inocente (Ética)' },
            { id: 'explorer', label: '🧭 Explorador (Búsqueda)' },
            { id: 'sage', label: '🦉 Sabio (Verdad)' }
        ];
    }

    async getHtml() {
        const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        let savedKey = '';
        if (savedProvider === 'deepseek') savedKey = localStorage.getItem('tt_key_deepseek') || '';
        if (savedProvider === 'openai') savedKey = localStorage.getItem('tt_key_openai') || '';
        if (savedProvider === 'gemini') savedKey = localStorage.getItem('tt_key_gemini') || '';

        const hasKey = savedKey.length > 5;
        
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedSector = urlParams.get('sector') || '';

        const state = store.getState();
        const customSectores = state.ontology?.sectores || {};
        
        let sectorOptions = `<optgroup label="🌟 Tus Plantillas Custom">`;
        Object.keys(customSectores).forEach(k => {
            sectorOptions += `<option value="custom_${k}" ${preselectedSector === k ? 'selected' : ''}>[Custom] ${k.toUpperCase()}</option>`;
        });
        sectorOptions += `</optgroup><optgroup label="📦 Plantillas Nativas">`;
        Object.keys(GLOBAL_ONTOLOGY).forEach(k => {
            sectorOptions += `<option value="native_${k}" ${preselectedSector === k ? 'selected' : ''}>[Nativa] ${k.toUpperCase().replace(/_/g, ' ')}</option>`;
        });
        sectorOptions += `</optgroup>`;

        return `
            <style>
                .wizard-workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; justify-content: center; align-items: flex-start; }
                .wizard-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); width: 100%; max-width: 900px; padding: 3rem; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);}
                .wizard-header { text-align: center; margin-bottom: 2rem; }
                .wizard-header h1 { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; }
                .wizard-header p { color: var(--text-muted); margin-top: 10px; }
                
                .step-indicator { display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; }
                .dot { width: 12px; height: 12px; border-radius: 50%; background: #333; transition: all 0.3s; }
                .dot.active { background: var(--accent-blue); box-shadow: 0 0 10px var(--accent-blue); transform: scale(1.2); }

                .vision-box { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 15px; color: white; font-size: 1.1rem; width: 100%; min-height: 120px; font-family: inherit; resize: vertical; margin-bottom: 1rem;}
                .vision-box:focus { border-color: var(--accent-blue); outline: none; box-shadow: 0 0 15px rgba(0, 176, 255, 0.2); }
                
                .ai-config-panel { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px dashed #333; display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem;}
                .ai-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 10px;}
                
                .ai-loading { display: none; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; animation: pulse 2s infinite; }
                .ai-loading span { font-size: 3rem; margin-bottom: 1rem; }
                .ai-loading p { color: var(--accent-blue); font-family: var(--font-mono); font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;}

                .educational-legend { background: rgba(0, 176, 255, 0.05); border: 1px solid rgba(0, 176, 255, 0.2); border-radius: var(--border-radius-sm); padding: 15px; margin-bottom: 2rem; font-size: 0.8rem; color: #ccc; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
                .legend-item { display: flex; align-items: flex-start; gap: 8px; }

                .role-draft-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem; max-height: 350px; overflow-y: auto; padding-right: 10px;}
                .role-draft-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 12px 15px; border-radius: var(--border-radius-sm); gap: 15px;}
                
                .role-inputs { display: flex; gap: 10px; flex: 1; align-items: center; flex-wrap: wrap;}
                .inp-role-level, .inp-role-guardian { background: #050505; border: 1px solid #333; border-radius: 6px; padding: 6px; font-size: 0.75rem; font-weight: bold; outline: none; cursor: pointer; transition: border-color 0.2s; color: white;}
                .inp-role-level:focus, .inp-role-guardian:focus { border-color: var(--accent-blue); }
                
                .role-inputs input.inp-role-name { background: transparent; border: none; color: white; font-size: 0.9rem; border-bottom: 1px solid #333; padding: 5px; flex: 1; min-width: 150px;}
                .role-inputs input.inp-role-name:focus { border-bottom-color: var(--accent-blue); outline: none; }
                .role-inputs .fmv-input { width: 60px; min-width: 60px; text-align: center; color: var(--accent-green); font-family: var(--font-mono); background: transparent; border: none; border-bottom: 1px solid #333;}
                
                .btn-del-role { background: transparent; border: none; color: var(--accent-red); cursor: pointer; font-size: 1.2rem; padding: 5px; transition: transform 0.2s; }
                .btn-del-role:hover { transform: scale(1.2); }

                .mini-map-container { width: 100%; height: 350px; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 20px 20px; border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); position: relative; margin-bottom: 2rem; overflow: hidden; background-color: rgba(0,0,0,0.2);}
                .mini-node { position: absolute; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 2px solid; transform: translate(-50%, -50%); font-size: 1.2rem; z-index: 5; box-shadow: 0 4px 10px rgba(0,0,0,0.5); cursor: help;}

                .tx-feedback-box { background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;}
                .tx-feedback-box:hover { background: rgba(0, 230, 118, 0.1); border-color: rgba(0, 230, 118, 0.4); transform: translateY(-2px);}
                
                .tx-preview-list { display: none; margin-bottom: 2rem; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 8px; padding: 15px; max-height: 300px; overflow-y: auto;}
                .tx-preview-item { font-size: 0.8rem; color: #ccc; padding: 8px 0; border-bottom: 1px dashed #222; display: flex; justify-content: space-between; align-items: center; gap: 10px;}
                .tx-preview-item:last-child { border-bottom: none; }

                .actions-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; margin-top: 1rem; }

                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

                @media (max-width: 768px) {
                    .wizard-workspace { padding: 1rem; }
                    .wizard-card { padding: 1.5rem; }
                    .role-draft-item { flex-direction: column; align-items: stretch; }
                    .role-inputs { flex-direction: column; align-items: stretch; }
                    .btn-del-role { align-self: flex-end; }
                    .educational-legend { grid-template-columns: 1fr; }
                    .actions-row { flex-direction: column; }
                    .actions-row .btn { width: 100%; }
                    .tx-preview-item { flex-direction: column; align-items: flex-start; gap: 4px; }
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
                                <h1>Instanciador de Red VNA</h1>
                                <p>Diseña ecosistemas de valor inmutables.</p>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 1.5rem;">
                                <div class="form-group" style="margin: 0;">
                                    <label>Nombre del Castell (Proyecto)</label>
                                    <input type="text" id="inpName" class="form-control" placeholder="Ej: Cooperativa Solar">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label>Arquetipo de Gobernanza</label>
                                    <select id="inpArchetype" class="form-control">
                                        <option value="startup">🚀 Startup (Agilidad/Equidad)</option>
                                        <option value="corp">🏢 Empresa (Jerarquía Clásica)</option>
                                        <option value="dao">🤖 IA-DAO (Humanos + Agentes IA)</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label>Plantilla Base (ADN)</label>
                                    <select id="inpSector" class="form-control">
                                        ${sectorOptions}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Visión Bruta / Input Cognitivo</label>
                                <textarea id="inpVision" class="vision-box" placeholder="Describe brevemente la idea. El Orquestador IA aplicará el modelo de Verna Allee y Pantheon para crear el mapa..."></textarea>
                            </div>

                            <details style="margin-bottom: 2rem;" ${!hasKey ? 'open' : ''}>
                                <summary style="color: var(--accent-purple); font-size: 0.85rem; font-weight: bold; cursor: pointer; margin-bottom: 10px;">✨ Configurar Llave IA Manualmente</summary>
                                <div class="ai-config-panel">
                                    <div class="ai-grid">
                                        <div>
                                            <label style="font-size: 0.7rem; color:#888;">Proveedor IA</label>
                                            <select id="inpAiProvider" class="form-control">
                                                <option value="deepseek" ${savedProvider === 'deepseek' ? 'selected' : ''}>DeepSeek (API Abierta)</option>
                                                <option value="gemini" ${savedProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
                                                <option value="openai" ${savedProvider === 'openai' ? 'selected' : ''}>OpenAI (ChatGPT)</option>
                                                <option value="custom" ${savedProvider === 'custom' ? 'selected' : ''}>Agente Corporativo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="font-size: 0.7rem; color:#888;">API Key / Bearer Token</label>
                                            <input type="password" id="inpApiKey" class="form-control" placeholder="sk-..." value="${savedKey}">
                                        </div>
                                    </div>
                                    <div id="customEndpointBox" style="display: ${savedProvider === 'custom' ? 'block' : 'none'}; margin-top: 10px;">
                                        <label style="font-size: 0.7rem; color:#888;">URL del Endpoint Custom</label>
                                        <input type="text" id="inpCustomUrl" class="form-control" placeholder="https://mi-empresa.com/api/agent/architect">
                                    </div>
                                </div>
                            </details>

                            <div class="actions-row">
                                <button class="btn btn-outline" id="btnStartBlank">📄 Empezar en Blanco</button>
                                <button class="btn btn-outline" id="btnLoadTemplate">🏗️ Cargar Plantilla Seleccionada</button>
                                <button class="btn btn-primary" id="btnGenerateAI" style="background: linear-gradient(45deg, var(--accent-purple), var(--accent-blue)); border:none;">🧠 Diseñar con IA (VNA)</button>
                            </div>
                        </div>

                        <div id="aiLoading" class="ai-loading">
                            <span>🔌</span>
                            <p id="loadingMsg">Conectando con Orquestador Cognitivo...</p>
                            <div style="font-size: 0.75rem; color: #666; margin-top: 10px;" id="loadingSubMsg">Mapeando Ecosistema VNA e Ikigai...</div>
                        </div>

                        <div id="step2" style="display: none;">
                            <div class="wizard-header" style="margin-bottom: 1.5rem;">
                                <h1>Validación de Arquitectura</h1>
                                <p>Ajusta los nodos funcionales o revisa el mapa visual antes de registrarlo.</p>
                            </div>

                            <div id="miniMapContainer" class="mini-map-container" style="display: none;"></div>

                            <div id="aiTxFeedback" class="tx-feedback-box" style="display: none;" title="Haz clic para ver un adelanto de los flujos de valor y el Pitch">
                                <div>
                                    <div style="font-size: 0.8rem; color: var(--accent-green); font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">⚡ Red de Valor y Pitch Generados</div>
                                    <div style="color: var(--text-muted); font-size: 0.85rem;">Se ha redactado la presentación y <strong id="txCount" style="color: white; font-size: 1.1rem; font-family: monospace;">0</strong> entregables clave (Clic para previsualizar).</div>
                                </div>
                                <div style="font-size: 1.5rem; opacity: 0.5;">&darr;</div>
                            </div>
                            
                            <div id="txPreviewList" class="tx-preview-list"></div>

                            <div class="educational-legend">
                                <div class="legend-item"><span style="color:var(--accent-red);">👑 @anxaneta:</span> Estrategia/Visión (x3)</div>
                                <div class="legend-item"><span style="color:#ff4081;">🧭 @aixecador:</span> Táctica/Conexión (x2)</div>
                                <div class="legend-item"><span style="color:var(--accent-purple);">👁️ @dosos:</span> Auditoría/QA (x1.5)</div>
                                <div class="legend-item"><span style="color:var(--accent-indigo);">⚙️ @baixos:</span> Producción (x1.2)</div>
                                <div class="legend-item"><span style="color:var(--accent-blue);">🤝 @pinya:</span> Soporte Base (x1)</div>
                            </div>

                            <div class="role-draft-list" id="draftRolesContainer"></div>
                            
                            <button class="btn btn-outline" id="btnAddCustomRole" style="width: 100%; margin-bottom: 2rem; border-style: dashed;">+ Instanciar Nuevo Nodo Funcional</button>

                            <div class="actions" style="border-top: 1px solid var(--glass-border); padding-top: 2rem; margin-top: 1rem; display: flex; justify-content: space-between;">
                                <button class="btn btn-outline" id="btnBack">&larr; Volver</button>
                                <button class="btn btn-success" id="btnLaunch" style="background: var(--accent-green); color: black;">🚀 Firmar y Registrar Ecosistema</button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

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
            if (!this.dom.inpName.value.trim()) return alert("El nombre es obligatorio.");
            this.draftRoles = [];
            this.draftTxs = [];
            this.draftPresentation = this.dom.inpVision.value.trim(); 
            this.draftTags = [];
            this.goToStep2();
        });

        this.dom.btnLoadTemplate.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre es obligatorio.");
            
            const sectorVal = this.dom.inpSector.value; 
            const state = store.getState();
            let sectorData = null;

            if (sectorVal.startsWith('custom_')) {
                const key = sectorVal.replace('custom_', '');
                sectorData = state.ontology?.sectores[key];
            } else {
                const key = sectorVal.replace('native_', '');
                sectorData = GLOBAL_ONTOLOGY[key];
            }

            this.draftRoles = [];
            this.draftTxs = [];
            this.draftTags = [sectorVal.split('_')[1], this.dom.inpArchetype.value];
            this.draftPresentation = this.dom.inpVision.value.trim() || `Ecosistema basado en plantilla: ${this.dom.inpSector.options[this.dom.inpSector.selectedIndex].text}.`;
            
            if (sectorData) {
                const rolesObj = sectorData.roles || sectorData;

                Object.entries(rolesObj).forEach(([levelKey, data]) => {
                    const level = data.levelId || levelKey; 
                    
                    this.draftRoles.push({
                        id: 'draft_' + Math.random().toString(36).substr(2, 9),
                        levelId: level,
                        name: data.name || level,
                        fmv: data.fmv || 50,
                        multiplier: data.multiplier || 1.0,
                        guardian: data.guardian || 'everyman'
                    });

                    if (data.standard_deliverables) {
                        data.standard_deliverables.forEach(deliv => {
                            let toLevel = deliv.to && deliv.to !== '?' ? deliv.to : (level === '@baixos' ? '@dosos' : (level === '@dosos' ? '@anxaneta' : '@baixos'));
                            let tipo = deliv.tipo || 'tangible';

                            this.draftTxs.push({
                                fromLevel: level,
                                toLevel: toLevel,
                                tipo: tipo,
                                entregable: deliv.name,
                                horas: deliv.estimatedHours || 2
                            });
                        });
                    }
                });
            } else {
                alert("La plantilla seleccionada está vacía o no existe.");
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
                levelId: '@baixos',
                name: 'Nueva Actividad',
                fmv: 40,
                multiplier: 1.2,
                guardian: 'everyman'
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
            
            const tagsHtml = this.draftTags.length > 0 ? `<div style="margin-bottom:10px;">${this.draftTags.map(t => `<span style="background:#333; padding:2px 8px; border-radius:12px; font-size:0.7rem; margin-right:5px;">#${t}</span>`).join('')}</div>` : '';

            const listHtml = this.draftTxs.map((tx, i) => `
                <div class="tx-preview-item">
                    <span>
                        <span style="color:${tx.tipo==='intangible'?'var(--accent-purple)':'var(--accent-green)'}; font-weight:bold; font-family:var(--font-mono);">[${i+1}]</span> 
                        <span style="color:#888;">${tx.fromLevel} &rarr; ${tx.toLevel}</span>
                    </span>
                    <span style="color:white; font-weight:bold;">${tx.entregable} <span style="color:var(--accent-blue); font-family:var(--font-mono);">(${tx.horas}h)</span></span>
                </div>
            `).join('');
            
            this.dom.txPreviewList.innerHTML = `
                ${tagsHtml}
                <div style="color: white; font-size: 0.9rem; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                    <strong>📖 Presentación Estratégica (Pitch):</strong><br>
                    <span style="color:#aaa; font-style:italic;">${this.draftPresentation.replace(/\n/g, '<br>')}</span>
                </div>
                ${listHtml}
                <div style="text-align:center; margin-top:15px; font-size:0.75rem; color:var(--accent-orange); font-weight:bold;">Podrás editar la presentación en el Dashboard, y los flujos en el Mapa de Valor.</div>
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
        if (provider !== 'custom' && !apiKey) return alert("Falta la API Key del proveedor. Guárdala en Configuración o ponla aquí.");

        if (provider === 'deepseek') localStorage.setItem('tt_key_deepseek', apiKey);
        if (provider === 'openai') localStorage.setItem('tt_key_openai', apiKey);
        if (provider === 'gemini') localStorage.setItem('tt_key_gemini', apiKey);
        localStorage.setItem('tt_ai_provider', provider);

        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'flex';
        this.dom.loadingMsg.innerText = `Conectando con ${provider.toUpperCase()}...`;

        // Motor de memoria contextual
        const state = store.getState();
        const customSectores = Object.keys(state.ontology?.sectores || {}).join(", ");
        const contextMemoria = customSectores.length > 0 
            ? `Tu ecosistema ya domina los patrones de: ${customSectores}. Inspírate en su densidad para diseñar esta nueva red.` 
            : "";

        // --- MASTER PROMPT VNA (Verna Allee + Pantheon Work + Pitch Inversores) ---
        const systemPrompt = `
            Actúa como Master Ecosystem Architect, experto en Value Network Analysis (Verna Allee) y Pantheon Work.
            Misión: Instanciar una DAO de valor para "${name}" (Arquetipo: "${archetypeText}").
            ${contextMemoria}

            BASE TEÓRICA CRÍTICA (VNA & PANTHEON):
            1. ROLES = ACTIVIDADES: En la metodología de Verna Allee, los roles NO son puestos de trabajo (Job Titles) ni un organigrama jerárquico. Son "nodos de actividad" que generan entregables. Una persona puede ocupar múltiples roles.
            2. TRANSACCIONES = ENTREGABLES: El valor fluye a través de entregables (siempre descritos como SUSTANTIVOS, no verbos). 
               - TANGIBLES (MUST): Entregables contractuales, exigibles, productos, código, informes, dinero.
               - INTANGIBLES (EXTRA): Conocimiento, mentoría, favores, validación, decisiones, influencia, soporte emocional. El pegamento de la red.
            3. GUARDIANES (Pantheon Work): Asigna uno de los 12 arquetipos (creator, caregiver, ruler, jester, everyman, lover, hero, outlaw, magician, innocent, explorer, sage) a cada rol según la misión o "alma" de esa actividad.

            ANÁLISIS ESTRATÉGICO:
            Antes de listar los nodos, analiza el sector y modelo de negocio para que las transacciones reflejen el intercambio real de valor económico y social.

            REGLAS DE DENSIDAD Y FLUJO:
            1. INTERDEPENDENCIA: Cada rol DEBE tener al menos 1 transacción de entrada y 1 de salida. No hay nodos aislados. El valor debe circular.
            2. COBERTURA HUMA: Crea roles distribuidos en: @anxaneta (Estrategia/Visión), @aixecador (Coordinación/Táctica), @dosos (Auditoría/QA/Control), @baixos (Ejecución/Producción), @pinya (Soporte/Base).
            3. RED DENSA: Genera un mínimo de 10 a 12 transacciones. 
            
            PRESENTACIÓN / PITCH (ENFOQUE STAKEHOLDERS E INVERSORES):
            La "presentacion" debe estar redactada en 3 párrafos orientados a cautivar a stakeholders, usuarios e inversores:
            - Párrafo 1: El Propósito fundacional y la oportunidad de mercado/problema que resuelve de forma única.
            - Párrafo 2: El Modelo de Negocio, escalabilidad y cómo fluye el valor a través de la red VNA para asegurar la ejecución.
            - Párrafo 3: El Ikigai (razón de ser) y la cultura de los Guardianes que garantizan el éxito a largo plazo.
            
            ESTRUCTURA OBLIGATORIA (Devuelve SOLO JSON Válido, sin formato markdown extra como \`\`\`json):
            {
                "presentacion": "Pitch institucional (3 párrafos) atractivo para stakeholders, usuarios e inversores...",
                "tags": ["Sector", "ModeloNegocio", "Tag3"],
                "roles": [
                    { "levelId": "@nivel", "name": "Nombre Actividad", "fmv": 60, "multiplier": 2.0, "guardian": "magician" }
                ],
                "transactions": [
                    { "fromLevel": "@origen", "toLevel": "@destino", "tipo": "tangible|intangible", "entregable": "Sustantivo (Ej: Informe de métricas)", "horas": 4 }
                ]
            }
        `;

        try {
            let textResponse = "";

            if (provider === 'gemini') {
                const targetModel = 'gemini-1.5-flash';
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = `Diseñando topología VNA con ${targetModel}...`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${systemPrompt}\n\nVISIÓN EN BRUTO: ${vision}` }] }]
                    })
                });

                if (!response.ok) throw new Error("Google Gemini Error");
                const data = await response.json();
                textResponse = data.candidates[0].content.parts[0].text;
            
            } else if (provider === 'openai') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Mapeando ecosistema VNA con GPT-4o-mini...";
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: vision }],
                        response_format: { type: "json_object" }
                    })
                });
                if (!response.ok) throw new Error("OpenAI Error");
                const data = await response.json();
                textResponse = data.choices[0].message.content;
            
            } else if (provider === 'deepseek') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Tejiendo transacciones e intangibles con DeepSeek Coder...";
                const response = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: vision }],
                        response_format: { type: "json_object" }
                    })
                });
                if (!response.ok) throw new Error("DeepSeek Error");
                const data = await response.json();
                textResponse = data.choices[0].message.content;
            } else if (provider === 'custom') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Llamando a Agente DAO Interno...";
                const customUrl = this.dom.inpCustomUrl.value.trim();
                const response = await fetch(customUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ prompt: systemPrompt, vision: vision })
                });
                if (!response.ok) throw new Error("Error de conexión con el Endpoint Custom.");
                const data = await response.json();
                textResponse = typeof data === 'string' ? data : JSON.stringify(data);
            }

            textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = textResponse.indexOf('{');
            const lastBrace = textResponse.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) textResponse = textResponse.substring(firstBrace, lastBrace + 1);

            const parsedData = JSON.parse(textResponse);

            if (!parsedData.roles) throw new Error("La IA no devolvió roles funcionales.");

            this.draftPresentation = parsedData.presentacion || vision;
            this.draftTags = parsedData.tags || [];

            this.draftRoles = parsedData.roles.map(r => ({
                id: 'draft_' + Math.random().toString(36).substr(2, 9),
                levelId: r.levelId,
                name: r.name,
                fmv: r.fmv || 50,
                multiplier: r.multiplier || 1.0,
                guardian: r.guardian || 'everyman'
            }));

            this.draftTxs = parsedData.transactions || [];
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
            { id: '@anxaneta', label: '@anxaneta (Dirección)' },
            { id: '@aixecador', label: '@aixecador (Coordinador)' },
            { id: '@dosos', label: '@dosos (Auditor)' },
            { id: '@baixos', label: '@baixos (Técnico)' },
            { id: '@pinya', label: '@pinya (Operaciones)' }
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
                        <span style="color: var(--text-muted); font-size: 0.7rem;">FMV:</span>
                        <input type="number" value="${role.fmv}" class="fmv-input inp-role-fmv" data-idx="${index}" title="Valor Mercado €/h">
                        <span style="color: var(--text-muted); font-size: 0.7rem;">€/h</span>
                    </div>
                </div>
                <button class="btn-del-role" data-idx="${index}" title="Eliminar Rol">×</button>
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

        const layout = { '@anxaneta': {x: 50, y: 20}, '@aixecador': {x: 50, y: 40}, '@dosos': {x: 35, y: 60}, '@baixos': {x: 65, y: 60}, '@pinya': {x: 50, y: 80} };
        const levelCounts = {};

        this.draftRoles.forEach((rol, i) => {
            const level = rol.levelId || '@baixos';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
            
            const pos = { ...(layout[level] || {x:50, y:50}) };
            if (levelCounts[level] > 1) pos.x += (levelCounts[level] - 1) * 20 - 10;

            const el = document.createElement('div');
            el.className = 'mini-node';
            el.dataset.idx = i;
            el.style.left = `${pos.x}%`; el.style.top = `${pos.y}%`;
            el.style.borderColor = this.getColor(level);
            el.innerHTML = this.getIcon(level);
            el.title = `${rol.name} (${this.guardians.find(g => g.id === rol.guardian)?.label || ''})`;
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

                    const r1 = dom1.getBoundingClientRect();
                    const r2 = dom2.getBoundingClientRect();

                    const x1 = r1.left + r1.width/2 - canvRect.left;
                    const y1 = r1.top + r1.height/2 - canvRect.top;
                    const x2 = r2.left + r2.width/2 - canvRect.left;
                    const y2 = r2.top + r2.height/2 - canvRect.top;

                    const dx = x2 - x1, dy = y2 - y1;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const nx = -dy / dist, ny = dx / dist;

                    let offset = 0;
                    if (edges.length > 1) {
                        const step = 20; 
                        offset = (multiIdx % 2 !== 0 ? 1 : -1) * Math.ceil(multiIdx / 2) * step;
                    }

                    const cx = (x1 + x2) / 2 + nx * offset;
                    const cy = (y1 + y2) / 2 + ny * offset;

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
                    path.setAttribute('marker-end', edge.tx.tipo === 'tangible' ? 'url(#mini-arrow-tangible)' : 'url(#mini-arrow-intangible)');
                    
                    path.style.fill = 'none';
                    path.style.stroke = edge.tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                    path.style.strokeWidth = '2';
                    if(edge.tx.tipo === 'intangible') path.style.strokeDasharray = '4,4';
                    
                    svg.appendChild(path);
                    
                    const txtX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
                    const txtY = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
                    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    txt.setAttribute('x', txtX); 
                    txt.setAttribute('y', txtY - 4);
                    txt.setAttribute('text-anchor', 'middle');
                    txt.style.cssText = `fill:${edge.tx.tipo==='tangible'?'var(--accent-green)':'var(--accent-purple)'};font-size:10px;font-weight:bold;font-family:monospace;paint-order:stroke;stroke:#111;stroke-width:4px;`;
                    txt.textContent = `[${edge.i + 1}]`;
                    svg.appendChild(txt);
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
        this.dom.btnLaunch.innerText = 'Registrando en el Kernel...';

        await store.dispatch({ 
            type: 'ADD_PROJECT', 
            payload: {
                id: projectId,
                nombre: this.dom.inpName.value.trim() || 'Nueva Red',
                sector: this.dom.inpSector.value,
                prompt: visionText, 
                archetype: arch, 
                customRoles: this.draftRoles,
                tags: this.draftTags,
                presentation: this.draftPresentation
            } 
        });

        const state = store.getState();
        const p = state.projects.find(x => x.id === projectId);
        
        if (p && this.draftTxs && this.draftTxs.length > 0) {
            for (const aiTx of this.draftTxs) {
                const roleFrom = p.roles.find(r => r.levelId === aiTx.fromLevel);
                const roleTo = p.roles.find(r => r.levelId === aiTx.toLevel);
                
                if (roleFrom && roleTo) {
                    await store.dispatch({
                        type: 'ADD_TRANSACTION',
                        payload: {
                            projectId: projectId,
                            tx: {
                                from: roleFrom.id, 
                                to: roleTo.id,     
                                horas: aiTx.horas || 2,
                                entregable: aiTx.entregable,
                                tipo: aiTx.tipo || 'tangible',
                                status: 'theoretical'
                            }
                        }
                    });
                }
            }
        }

        window.location.href = '/v5/dashboard';
    }
}
