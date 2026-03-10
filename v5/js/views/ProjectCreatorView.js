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
        this.draftPresentation = ""; // Almacenará el Pitch (Manual o IA)
        
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

                /* MINI-MAP PREVIEW */
                .mini-map-container { width: 100%; height: 350px; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 20px 20px; border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); position: relative; margin-bottom: 2rem; overflow: hidden; background-color: rgba(0,0,0,0.2);}
                .mini-node { position: absolute; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 2px solid; transform: translate(-50%, -50%); font-size: 1.2rem; z-index: 5; box-shadow: 0 4px 10px rgba(0,0,0,0.5); cursor: help;}

                /* FEEDBACK INTERACTIVO Y PREVIEW DE TXs */
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
                                <h1>Instanciador de Red</h1>
                                <p>Mapea una organización existente o diseña una nueva desde cero.</p>
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
                                    <label>Macro-Área / Sector</label>
                                    <select id="inpSector" class="form-control">
                                        <option value="tech_saas_platform">💻 Software & SaaS</option>
                                        <option value="web3_defi_protocol">⛓️ Web3 & Protocolo</option>
                                        <option value="digital_media_growth">📢 Digital Media & Growth</option>
                                        <option value="healthtech_ai">🏥 HealthTech & IA Clínica</option>
                                        <option value="deeptech_hardware">🤖 DeepTech & Hardware</option>
                                        <option value="ecommerce_d2c">📦 E-Commerce & D2C</option>
                                        <option value="agile_consulting_b2b">👔 Agencia / Consultoría B2B</option>
                                        <option value="edtech_community">🎓 EdTech & Academia</option>
                                        <option value="impact_dao_ngo">🌍 Impacto Social / ONG</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Visión Bruta / Input Cognitivo</label>
                                <textarea id="inpVision" class="vision-box" placeholder="Describe brevemente la idea. El Orquestador IA generará la Propuesta de Valor, el Ikigai de la red y el Pitch final..."></textarea>
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
                                <button class="btn btn-outline" id="btnLoadTemplate">🏗️ Cargar Plantilla Base</button>
                                <button class="btn btn-primary" id="btnGenerateAI" style="background: linear-gradient(45deg, var(--accent-purple), var(--accent-blue)); border:none;">🧠 Diseñar con IA</button>
                            </div>
                        </div>

                        <div id="aiLoading" class="ai-loading">
                            <span>🔌</span>
                            <p id="loadingMsg">Conectando con Orquestador Cognitivo...</p>
                            <div style="font-size: 0.75rem; color: #666; margin-top: 10px;" id="loadingSubMsg">Redactando Propuesta de Valor y Ecosistema...</div>
                        </div>

                        <div id="step2" style="display: none;">
                            <div class="wizard-header" style="margin-bottom: 1.5rem;">
                                <h1>Validación de Arquitectura</h1>
                                <p>Ajusta los roles o revisa el mapa visual antes de registrarlo.</p>
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
                                <div class="legend-item"><span style="color:var(--accent-red);">👑 @anxaneta:</span> Dirección (x3)</div>
                                <div class="legend-item"><span style="color:#ff4081;">🧭 @aixecador:</span> Coordinación (x2)</div>
                                <div class="legend-item"><span style="color:var(--accent-purple);">👁️ @dosos:</span> Auditoría/QA (x1.5)</div>
                                <div class="legend-item"><span style="color:var(--accent-indigo);">⚙️ @baixos:</span> Especialista (x1.2)</div>
                                <div class="legend-item"><span style="color:var(--accent-blue);">🤝 @pinya:</span> Operaciones (x1)</div>
                            </div>

                            <div class="role-draft-list" id="draftRolesContainer"></div>
                            
                            <button class="btn btn-outline" id="btnAddCustomRole" style="width: 100%; margin-bottom: 2rem; border-style: dashed;">+ Instanciar Nuevo Rol</button>

                            <div class="actions" style="border-top: 1px solid var(--glass-border); padding-top: 2rem; margin-top: 1rem; display: flex; justify-content: space-between;">
                                <button class="btn btn-outline" id="btnBack">&larr; Volver</button>
                                <button class="btn btn-success" id="btnLaunch" style="background: var(--accent-green); color: black;">🚀 Firmar y Registrar en el Sistema</button>
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

        // Mostrar Preview de Entregables y Pitch
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
            // Guardamos el texto bruto introducido por el usuario para el Dashboard
            this.draftPresentation = this.dom.inpVision.value.trim(); 
            this.goToStep2();
        });

        this.dom.btnLoadTemplate.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre es obligatorio.");
            const sectorData = GLOBAL_ONTOLOGY[this.dom.inpSector.value];
            this.draftRoles = [];
            this.draftTxs = [];
            
            // Guardamos el texto bruto, o un fallback genérico si está vacío
            this.draftPresentation = this.dom.inpVision.value.trim() || `Ecosistema basado en plantilla estándar de ${this.dom.inpSector.options[this.dom.inpSector.selectedIndex].text}.`;
            
            if (sectorData) {
                Object.keys(sectorData).forEach((level, idx) => {
                    if (level !== 'roles') { 
                        this.draftRoles.push({
                            id: 'draft_' + Math.random().toString(36).substr(2, 9),
                            levelId: level,
                            name: sectorData[level].name,
                            fmv: sectorData[level].fmv || 50,
                            multiplier: sectorData[level].multiplier || 1.0,
                            guardian: this.guardians[idx % this.guardians.length].id
                        });
                    }
                });

                Object.keys(sectorData).forEach(level => {
                    const roleNode = sectorData[level];
                    if (roleNode && roleNode.standard_deliverables) {
                        roleNode.standard_deliverables.forEach(deliv => {
                            const toLevel = level === '@baixos' ? '@dosos' : (level === '@dosos' ? '@anxaneta' : '@baixos');
                            this.draftTxs.push({
                                fromLevel: level,
                                toLevel: toLevel,
                                tipo: deliv.tipo || 'tangible',
                                entregable: deliv.name,
                                horas: deliv.estimatedHours || 2
                            });
                        });
                    }
                });
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
                name: 'Nuevo Rol',
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
        
        // Muestra el cuadro verde SI hay texto de presentación O transacciones
        if (this.draftTxs.length > 0 || this.draftPresentation.length > 0) {
            this.dom.aiTxFeedback.style.display = 'flex';
            this.dom.txCount.innerText = this.draftTxs.length;
            
            const listHtml = this.draftTxs.map((tx, i) => `
                <div class="tx-preview-item">
                    <span>
                        <span style="color:var(--accent-purple); font-weight:bold; font-family:var(--font-mono);">[${i+1}]</span> 
                        <span style="color:#888;">${tx.fromLevel} &rarr; ${tx.toLevel}</span>
                    </span>
                    <span style="color:white; font-weight:bold;">${tx.entregable} <span style="color:var(--accent-blue); font-family:var(--font-mono);">(${tx.horas}h)</span></span>
                </div>
            `).join('');
            
            this.dom.txPreviewList.innerHTML = `
                <div style="color: white; font-size: 0.9rem; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                    <strong>📖 Pitch / Presentación:</strong><br>
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
        const customUrl = this.dom.inpCustomUrl.value.trim();
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

        // PROMPT ESTRATÉGICO V7.3 - INCLUYE REDACCIÓN DEL PITCH (IKIGAI)
        const systemPrompt = `
            Eres el 'Ecosystem Architect' de TeamTowers. 
            Misión: Analizar la visión en bruto del proyecto y devolver UNICAMENTE un JSON válido. CERO markdown, CERO texto introductorio.
            
            Contexto Estructural: 
            El modelo de gobernanza es "${archetypeText}".
            
            Reglas de Redacción del Campo "presentacion":
            Redacta un "Pitch" o carta de presentación institucional de la red (máximo 3 párrafos).
            Debe explicar: 1. El Propósito / Propuesta de Valor. 2. El Qué, Cómo y Para Quién. 3. El Ikigai de la red (la razón de ser).
            El tono debe ser épico, claro, y atractivo tanto para captar talento (colaboradores/mercenarios) como para stakeholders e inversores. Usa formato de texto plano (sin HTML, usa saltos de línea \\n).
            
            Reglas de Roles:
            1. Genera TODOS los roles necesarios. Usa: "@anxaneta" (Dirección), "@aixecador" (Coordinación), "@dosos" (Auditoría/QA), "@baixos" (Técnicos), "@pinya" (Soporte).
            2. Asigna un 'guardian' de Pantheon.work (ej: "creator", "caregiver", "ruler", "
