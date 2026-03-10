// v5/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Instanciador Agnóstico | TeamTowers";
        this.currentStep = 1;
        this.draftRoles = [];
        this.draftTxs = [];
        
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
        const savedKey = localStorage.getItem('tt_ai_key') || '';
        const savedProvider = localStorage.getItem('tt_ai_provider') || 'gemini';

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

                .role-draft-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem; max-height: 450px; overflow-y: auto; padding-right: 10px;}
                .role-draft-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 12px 15px; border-radius: var(--border-radius-sm); gap: 15px;}
                
                .role-inputs { display: flex; gap: 10px; flex: 1; align-items: center; flex-wrap: wrap;}
                .inp-role-level, .inp-role-guardian { background: #050505; border: 1px solid #333; border-radius: 6px; padding: 6px; font-size: 0.75rem; font-weight: bold; outline: none; cursor: pointer; transition: border-color 0.2s; color: white;}
                .inp-role-level:focus, .inp-role-guardian:focus { border-color: var(--accent-blue); }
                
                .role-inputs input.inp-role-name { background: transparent; border: none; color: white; font-size: 0.9rem; border-bottom: 1px solid #333; padding: 5px; flex: 1; min-width: 150px;}
                .role-inputs input.inp-role-name:focus { border-bottom-color: var(--accent-blue); outline: none; }
                .role-inputs .fmv-input { width: 60px; min-width: 60px; text-align: center; color: var(--accent-green); font-family: var(--font-mono); background: transparent; border: none; border-bottom: 1px solid #333;}
                
                .btn-del-role { background: transparent; border: none; color: var(--accent-red); cursor: pointer; font-size: 1.2rem; padding: 5px; transition: transform 0.2s; }
                .btn-del-role:hover { transform: scale(1.2); }

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
                                <p>Mapea una organización existente (As-Is) o diseña una nueva (To-Be).</p>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 1.5rem;">
                                <div class="form-group" style="margin: 0;">
                                    <label>Nombre del Castell (Proyecto)</label>
                                    <input type="text" id="inpName" class="form-control" placeholder="Ej: Cooperativa Solar DAO">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label>Macro-Área / Sector</label>
                                    <select id="inpSector" class="form-control">
                                        <option value="tech_saas_platform">💻 Software & SaaS</option>
                                        <option value="web3_defi_protocol">⛓️ Web3 & Protocolo DeFi</option>
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
                                <label>Misión / Visión Estratégica</label>
                                <textarea id="inpVision" class="vision-box" placeholder="Describe el propósito de la red, los objetivos fundacionales o los problemas del sistema actual que quieres resolver..."></textarea>
                            </div>

                            <details style="margin-bottom: 2rem;">
                                <summary style="color: var(--accent-purple); font-size: 0.85rem; font-weight: bold; cursor: pointer; margin-bottom: 10px;">✨ Desplegar Asistente IA (Opcional)</summary>
                                <div class="ai-config-panel">
                                    <div class="ai-grid">
                                        <div>
                                            <label style="font-size: 0.7rem; color:#888;">Proveedor IA</label>
                                            <select id="inpAiProvider" class="form-control">
                                                <option value="gemini" ${savedProvider === 'gemini' ? 'selected' : ''}>Google Gemini (Recomendado)</option>
                                                <option value="openai" ${savedProvider === 'openai' ? 'selected' : ''}>OpenAI (ChatGPT)</option>
                                                <option value="custom" ${savedProvider === 'custom' ? 'selected' : ''}>Agente Corporativo (Custom Endpoint)</option>
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
                            <div style="font-size: 0.75rem; color: #666; margin-top: 10px;" id="loadingSubMsg">Analizando 12 Guardianes y Flujos de Valor.</div>
                        </div>

                        <div id="step2" style="display: none;">
                            <div class="wizard-header" style="margin-bottom: 1.5rem;">
                                <h1>Definición de Roles</h1>
                                <p>Ajusta los Niveles y Guardianes de Pantheon generados por la IA.</p>
                            </div>

                            <div class="educational-legend">
                                <div class="legend-item"><span style="color:var(--accent-red);">👑 @anxaneta:</span> Dirección (x3)</div>
                                <div class="legend-item"><span style="color:#ff4081;">🧭 @aixecador:</span> Coordinación (x2)</div>
                                <div class="legend-item"><span style="color:var(--accent-purple);">👁️ @dosos:</span> Auditoría/QA (x1.5)</div>
                                <div class="legend-item"><span style="color:var(--accent-indigo);">⚙️ @baixos:</span> Especialista (x1.2)</div>
                                <div class="legend-item"><span style="color:var(--accent-blue);">🤝 @pinya:</span> Operaciones (x1)</div>
                            </div>

                            <div class="role-draft-list" id="draftRolesContainer"></div>
                            
                            <button class="btn btn-outline" id="btnAddCustomRole" style="width: 100%; margin-bottom: 2rem; border-style: dashed;">+ Instanciar Nuevo Rol</button>

                            <div id="aiTxFeedback" style="display: none; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 2rem;">
                                <div style="font-size: 0.8rem; color: var(--accent-green); font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">⚡ Flujos Pre-Cargados (Kanban)</div>
                                <div style="color: var(--text-muted); font-size: 0.85rem;">La IA ha diseñado <strong id="txCount" style="color: white;">0</strong> entregables tangibles e intangibles iniciales.</div>
                            </div>

                            <div class="actions" style="border-top: 1px solid var(--glass-border); padding-top: 2rem; margin-top: 1rem; display: flex; justify-content: space-between;">
                                <button class="btn btn-outline" id="btnBack">&larr; Volver</button>
                                <button class="btn btn-success" id="btnLaunch" style="background: var(--accent-green); color: black;">🚀 Instanciar Mapa en el Kernel</button>
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
            inpVision: document.getElementById('inpVision'),
            inpApiKey: document.getElementById('inpApiKey'),
            inpAiProvider: document.getElementById('inpAiProvider'),
            inpCustomUrl: document.getElementById('inpCustomUrl'),
            customEndpointBox: document.getElementById('customEndpointBox'),
            aiTxFeedback: document.getElementById('aiTxFeedback'),
            txCount: document.getElementById('txCount')
        };

        this.dom.inpAiProvider.addEventListener('change', (e) => {
            this.dom.customEndpointBox.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });

        // RUTA 1: LIENZO EN BLANCO
        this.dom.btnStartBlank.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre es obligatorio.");
            this.draftRoles = [];
            this.draftTxs = [];
            this.goToStep2();
        });

        // RUTA 2: CARGAR PLANTILLA
        this.dom.btnLoadTemplate.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre es obligatorio.");
            const sectorData = GLOBAL_ONTOLOGY[this.dom.inpSector.value];
            this.draftRoles = [];
            this.draftTxs = [];
            
            if (sectorData) {
                Object.keys(sectorData).forEach((level, idx) => {
                    this.draftRoles.push({
                        id: 'draft_' + Math.random().toString(36).substr(2, 9),
                        levelId: level,
                        name: sectorData[level].name,
                        fmv: sectorData[level].fmv || 50,
                        multiplier: sectorData[level].multiplier || 1.0,
                        guardian: this.guardians[idx % this.guardians.length].id
                    });
                });
            }
            this.goToStep2();
        });

        // RUTA 3: IA
        this.dom.btnGenerateAI.addEventListener('click', () => this.generateWithAI());

        this.dom.btnBack.addEventListener('click', () => {
            this.dom.step2.style.display = 'none';
            this.dom.step1.style.display = 'block';
            this.dom.dot2.classList.remove('active');
            this.dom.dot1.classList.add('active');
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
        
        if (this.draftTxs.length > 0) {
            this.dom.aiTxFeedback.style.display = 'block';
            this.dom.txCount.innerText = this.draftTxs.length;
        } else {
            this.dom.aiTxFeedback.style.display = 'none';
        }

        this.renderDraftRoles();
    }

    async generateWithAI() {
        const name = this.dom.inpName.value.trim();
        const vision = this.dom.inpVision.value.trim();
        const provider = this.dom.inpAiProvider.value;
        const apiKey = this.dom.inpApiKey.value.trim();
        const customUrl = this.dom.inpCustomUrl.value.trim();

        if (!name) return alert("Debes darle un nombre a la red.");
        if (!vision) return alert("Escribe tu visión estratégica para que el Agente la procese.");
        if (provider !== 'custom' && !apiKey) return alert("Falta la API Key del proveedor seleccionado.");

        localStorage.setItem('tt_ai_key', apiKey);
        localStorage.setItem('tt_ai_provider', provider);

        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'flex';
        this.dom.loadingMsg.innerText = `Conectando con ${provider.toUpperCase()}...`;
        
        if(this.dom.loadingSubMsg) {
            this.dom.loadingSubMsg.innerText = "Iniciando análisis semántico...";
        }

        const systemPrompt = `
            Eres el 'Ecosystem Architect' de TeamTowers. 
            Tu misión es analizar la visión del usuario y devolver UNICAMENTE un JSON válido con los roles y las primeras tareas críticas. NO devuelvas texto adicional ni markdown.
            
            Reglas de Roles:
            1. Define 5 Roles usando los niveles: @anxaneta (Dirección), @aixecador (Coordinador), @dosos (Auditor), @baixos (Técnico), @pinya (Operaciones).
            2. Asigna a cada rol un 'guardian' dominante basado en los 12 Arquetipos de Pantheon.work. Opciones válidas: "creator", "caregiver", "ruler", "jester", "everyman", "lover", "hero", "outlaw", "magician", "innocent", "explorer", "sage".
            3. Calcula el FMV realista para el mercado actual.
            
            Reglas de Transacciones (Flujos de Valor):
            Define 3 a 5 transacciones iniciales. Es OBLIGATORIO incluir flujos 'tangibles' e 'intangibles'.
            
            FORMATO JSON ESTRICTO ESPERADO:
            {
                "roles": [
                    { "levelId": "@anxaneta", "name": "Ej: Estratega de Producto", "fmv": 60, "multiplier": 3.0, "guardian": "magician" }
                ],
                "transactions": [
                    { "fromLevel": "@anxaneta", "toLevel": "@dosos", "tipo": "intangible", "entregable": "Alineación estratégica", "horas": 2 }
                ]
            }
        `;

        try {
            let textResponse = "";

            if (provider === 'gemini') {
                // FORZAMOS GEMINI 1.5 FLASH (El modelo más estable globalmente para la capa gratuita/pagada)
                const targetModel = 'gemini-1.5-flash';
                
                if(this.dom.loadingSubMsg) {
                    this.dom.loadingSubMsg.innerText = `Generando Ontología con ${targetModel}...`;
                }

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${systemPrompt}\n\nPROYECTO: ${vision}` }] }]
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(`Google Gemini Error: ${errData.error?.message || response.statusText}`);
                }
                const data = await response.json();
                textResponse = data.candidates[0].content.parts[0].text;
            
            } else if (provider === 'openai') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Consultando OpenAI GPT-4o-mini...";
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: vision }
                        ],
                        response_format: { type: "json_object" }
                    })
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(`OpenAI Error: ${errData.error?.message || response.statusText}`);
                }
                const data = await response.json();
                textResponse = data.choices[0].message.content;
            
            } else if (provider === 'custom') {
                if(this.dom.loadingSubMsg) this.dom.loadingSubMsg.innerText = "Conectando con Endpoint Privado...";
                const response = await fetch(customUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ prompt: systemPrompt, vision: vision })
                });
                if (!response.ok) {
                    throw new Error("Error de conexión con el Endpoint Custom de tu empresa.");
                }
                const data = await response.json();
                textResponse = typeof data === 'string' ? data : JSON.stringify(data);
            }

            // LIMPIEZA EXTREMA DEL JSON
            textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = textResponse.indexOf('{');
            const lastBrace = textResponse.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                textResponse = textResponse.substring(firstBrace, lastBrace + 1);
            }

            const parsedData = JSON.parse(textResponse);

            if (!parsedData.roles) throw new Error("La IA respondió correctamente, pero no devolvió la estructura de roles requerida. Intenta con un prompt más claro.");

            this.draftRoles = parsedData.roles.map(r => ({
                id: 'draft_' + Math.random().toString(36).substr(2, 9),
                levelId: r.levelId,
                name: r.name,
                fmv: r.fmv,
                multiplier: r.multiplier,
                guardian: r.guardian || 'everyman'
            }));

            this.draftTxs = parsedData.transactions || [];
            this.goToStep2();

        } catch (error) {
            console.error("💥 Fallo Motor Cognitivo:", error);
            // El alert ahora mostrará EXACTAMENTE qué proveedor falló y por qué.
            alert(`Fallo en el Motor Cognitivo:\n\n${error.message}\n\nSi es un problema de cuota, espera unos minutos o revisa tu saldo en la plataforma correspondiente.`);
            
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
    }

    finalizeProject() {
        const projectId = 'proj_' + Math.random().toString(36).substr(2, 9);
        const visionText = this.dom.inpVision.value.trim();
        
        // RBAC: El despachador internamente ya leerá activeUserId y lo pondrá de ownerId
        store.dispatch({ 
            type: 'ADD_PROJECT', 
            payload: {
                id: projectId,
                nombre: this.dom.inpName.value.trim() || 'Proyecto sin título',
                sector: this.dom.inpSector.value,
                prompt: visionText,
                archetype: 'startup',
                customRoles: this.draftRoles 
            } 
        });

        const state = store.getState();
        const p = state.projects.find(x => x.id === projectId);
        
        if (p && this.draftTxs && this.draftTxs.length > 0) {
            this.draftTxs.forEach(aiTx => {
                const roleFrom = p.roles.find(r => r.levelId === aiTx.fromLevel);
                const roleTo = p.roles.find(r => r.levelId === aiTx.toLevel);
                
                if (roleFrom && roleTo) {
                    store.dispatch({
                        type: 'ADD_TRANSACTION',
                        payload: {
                            projectId: projectId,
                            tx: {
                                from: roleFrom.id,
                                to: roleTo.id,
                                horas: aiTx.horas || 2,
                                entregable: aiTx.entregable,
                                tipo: aiTx.tipo,
                                status: 'theoretical'
                            }
                        }
                    });
                }
            });
        }

        window.location.href = '/v5/map';
    }
}
