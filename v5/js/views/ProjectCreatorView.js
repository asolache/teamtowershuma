// v5/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "IA Instanciador | TeamTowers";
        this.currentStep = 1;
        this.draftRoles = [];
        this.draftTxs = [];
    }

    async getHtml() {
        const savedKey = localStorage.getItem('tt_gemini_key') || '';

        return `
            <style>
                .wizard-workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; justify-content: center; align-items: flex-start; }
                .wizard-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); width: 100%; max-width: 800px; padding: 3rem; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);}
                .wizard-header { text-align: center; margin-bottom: 2rem; }
                .wizard-header h1 { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; }
                .wizard-header p { color: var(--text-muted); margin-top: 10px; }
                
                .step-indicator { display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; }
                .dot { width: 12px; height: 12px; border-radius: 50%; background: #333; transition: all 0.3s; }
                .dot.active { background: var(--accent-purple); box-shadow: 0 0 10px var(--accent-purple); transform: scale(1.2); }

                /* VISION TEXTAREA */
                .vision-box { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 15px; color: white; font-size: 1.1rem; width: 100%; min-height: 120px; font-family: inherit; resize: vertical; margin-bottom: 1rem;}
                .vision-box:focus { border-color: var(--accent-purple); outline: none; box-shadow: 0 0 15px rgba(179, 136, 255, 0.2); }
                
                /* AI LOADING */
                .ai-loading { display: none; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; animation: pulse 2s infinite; }
                .ai-loading span { font-size: 3rem; margin-bottom: 1rem; }
                .ai-loading p { color: var(--accent-purple); font-family: var(--font-mono); font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;}

                .educational-legend { background: rgba(0, 176, 255, 0.05); border: 1px solid rgba(0, 176, 255, 0.2); border-radius: var(--border-radius-sm); padding: 15px; margin-bottom: 2rem; font-size: 0.8rem; color: #ccc; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .legend-item { display: flex; align-items: flex-start; gap: 8px; }
                .legend-item span { font-weight: bold; }

                .role-draft-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem; max-height: 400px; overflow-y: auto; padding-right: 10px;}
                .role-draft-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 12px 15px; border-radius: var(--border-radius-sm); gap: 15px;}
                
                .role-inputs { display: flex; gap: 15px; flex: 1; align-items: center; }
                .inp-role-level { background: #050505; border: 1px solid #333; border-radius: 6px; padding: 6px; font-size: 0.75rem; font-weight: bold; outline: none; cursor: pointer; transition: border-color 0.2s; }
                .inp-role-level:focus { border-color: var(--accent-blue); }
                
                .role-inputs input { background: transparent; border: none; color: white; font-size: 1rem; border-bottom: 1px solid #333; padding: 5px; flex: 1; min-width: 150px;}
                .role-inputs input:focus { border-bottom-color: var(--accent-blue); outline: none; }
                .role-inputs .fmv-input { width: 70px; min-width: 70px; text-align: center; color: var(--accent-green); font-family: var(--font-mono); }
                
                .btn-del-role { background: transparent; border: none; color: var(--accent-red); cursor: pointer; font-size: 1.2rem; padding: 5px; transition: transform 0.2s; }
                .btn-del-role:hover { transform: scale(1.2); }

                .actions { display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--glass-border); }

                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
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
                                <h1>Instanciar Red con IA</h1>
                                <p>Describe tu proyecto. Gemini AI diseñará la ontología óptima y los flujos críticos (Tangibles e Intangibles).</p>
                            </div>
                            
                            <div class="form-group">
                                <label>Nombre del Proyecto</label>
                                <input type="text" id="inpName" class="form-control" placeholder="Ej: Cooperativa Solar DAO">
                            </div>

                            <div class="form-group">
                                <label>Visión Estratégica (Habla con la IA)</label>
                                <textarea id="inpVision" class="vision-box" placeholder="Ej: Somos 3 personas. Queremos montar una plataforma educativa sobre ética IA para empresas. Necesitamos roles técnicos, legales y de comunidad. Vamos a pulmón sin inversión inicial..."></textarea>
                            </div>

                            <div class="form-group" style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px dashed #333;">
                                <label style="display: flex; justify-content: space-between;">
                                    <span>🔑 Gemini API Key (Requerido)</span>
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: var(--accent-blue); text-transform: none; font-size: 0.7rem; text-decoration: underline;">Obtener Key</a>
                                </label>
                                <input type="password" id="inpApiKey" class="form-control" placeholder="AIzaSy..." value="${savedKey}">
                            </div>

                            <div class="actions" style="justify-content: flex-end;">
                                <button class="btn btn-primary" id="btnGenerateAI" style="background: linear-gradient(45deg, var(--accent-purple), var(--accent-blue));">🧠 Generar Castell con IA</button>
                            </div>
                        </div>

                        <div id="aiLoading" class="ai-loading">
                            <span>🧠</span>
                            <p>El Orquestador IA está diseñando tu red...</p>
                            <div style="font-size: 0.75rem; color: #666; margin-top: 10px;">Calculando Valor de Mercado y Transacciones Críticas.</div>
                        </div>

                        <div id="step2" style="display: none;">
                            <div class="wizard-header" style="margin-bottom: 1.5rem;">
                                <h1>Validar Ontología IA</h1>
                                <p>Ajusta la propuesta de Gemini. Se han pre-cargado flujos de valor estratégicos.</p>
                            </div>

                            <div class="educational-legend">
                                <div class="legend-item"><span style="color:var(--accent-red);">👑 @anxaneta:</span> Dirección y Visión (Riesgo x3)</div>
                                <div class="legend-item"><span style="color:#ff4081;">🧭 @aixecador:</span> Coordinación y PM (Riesgo x2)</div>
                                <div class="legend-item"><span style="color:var(--accent-purple);">👁️ @dosos:</span> Auditoría y QA (Riesgo x1.5)</div>
                                <div class="legend-item"><span style="color:var(--accent-indigo);">⚙️ @baixos:</span> Especialista / Core (Riesgo x1.2)</div>
                                <div class="legend-item"><span style="color:var(--accent-blue);">🤝 @pinya:</span> Operaciones / Base (Riesgo x1)</div>
                            </div>

                            <div class="role-draft-list" id="draftRolesContainer"></div>
                            
                            <button class="btn btn-outline" id="btnAddCustomRole" style="width: 100%; margin-bottom: 2rem; border-style: dashed;">+ Añadir Nodo Manualmente</button>

                            <div style="background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 2rem;">
                                <div style="font-size: 0.8rem; color: var(--accent-green); font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">⚡ Flujos Pre-Cargados (Kanban)</div>
                                <div style="color: var(--text-muted); font-size: 0.85rem;">Gemini ha diseñado <strong id="txCount" style="color: white;">0</strong> entregables clave de gestión, ética y desarrollo para la Fase 1. Estarán en tu Mercado Teórico.</div>
                            </div>

                            <div class="actions">
                                <button class="btn btn-outline" id="btnBack">&larr; Volver</button>
                                <button class="btn btn-success" id="btnLaunch">🚀 Instanciar Red en el Kernel</button>
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
            step2: document.getElementById('step2'),
            dot1: document.getElementById('dot1'),
            dot2: document.getElementById('dot2'),
            btnGenerateAI: document.getElementById('btnGenerateAI'),
            btnBack: document.getElementById('btnBack'),
            btnLaunch: document.getElementById('btnLaunch'),
            btnAddCustom: document.getElementById('btnAddCustomRole'),
            container: document.getElementById('draftRolesContainer'),
            inpName: document.getElementById('inpName'),
            inpVision: document.getElementById('inpVision'),
            inpApiKey: document.getElementById('inpApiKey'),
            txCount: document.getElementById('txCount')
        };

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
                name: 'Nodo Técnico',
                fmv: 40,
                multiplier: 1.2
            });
            this.renderDraftRoles();
        });

        this.dom.btnLaunch.addEventListener('click', () => this.finalizeProject());
    }

    async generateWithAI() {
        const name = this.dom.inpName.value.trim();
        const vision = this.dom.inpVision.value.trim();
        const apiKey = this.dom.inpApiKey.value.trim();

        if (!name) return alert("Debes darle un nombre a la red.");
        if (!vision) return alert("Escribe tu visión estratégica para que la IA pueda diseñar.");
        if (!apiKey) return alert("Falta la API Key de Gemini.");

        localStorage.setItem('tt_gemini_key', apiKey);

        this.dom.step1.style.display = 'none';
        this.dom.loading.style.display = 'flex';

        const systemPrompt = `
            Eres el 'Ecosystem Architect' de TeamTowers, un sistema operativo para organizaciones distribuidas basado en Value Network Analysis (VNA) y Slicing Pie.
            Tu misión es analizar la visión del usuario y devolver UNICAMENTE un JSON válido con la estructura óptima del equipo y las primeras tareas críticas. NO devuelvas texto adicional ni formato markdown.
            
            Debes definir 5 Roles usando los niveles Castellers: @anxaneta (Dirección), @aixecador (Coordinador), @dosos (Auditor/QA), @baixos (Técnico Core), @pinya (Operaciones).
            Calcula el FMV (Fair Market Value en €/hora) realista para el mercado actual.
            
            Define entre 3 y 5 transacciones iniciales críticas. Incluye transacciones 'tangibles' e 'intangibles'.
            
            FORMATO JSON ESTRICTO:
            {
                "roles": [
                    { "levelId": "@anxaneta", "name": "Ej: Tech Lead", "fmv": 60, "multiplier": 3.0 },
                    { "levelId": "@aixecador", "name": "...", "fmv": 50, "multiplier": 2.0 },
                    { "levelId": "@dosos", "name": "...", "fmv": 45, "multiplier": 1.5 },
                    { "levelId": "@baixos", "name": "...", "fmv": 40, "multiplier": 1.2 },
                    { "levelId": "@pinya", "name": "...", "fmv": 30, "multiplier": 1.0 }
                ],
                "transactions": [
                    { "fromLevel": "@anxaneta", "toLevel": "@dosos", "tipo": "intangible", "entregable": "Alineación estratégica", "horas": 2 },
                    { "fromLevel": "@baixos", "toLevel": "@aixecador", "tipo": "tangible", "entregable": "Despliegue del Core", "horas": 8 }
                ]
            }
        `;

        try {
            console.log("🚀 Iniciando llamada a Gemini API...");
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nPROYECTO DEL USUARIO: ${vision}` }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error de la API de Google:", errorData);
                throw new Error(`Error API (${response.status}): ${errorData.error?.message || 'Revisa tu API Key'}`);
            }
            
            const data = await response.json();
            let textResponse = data.candidates[0].content.parts[0].text;
            
            console.log("🤖 Respuesta bruta de Gemini:", textResponse);

            // 🔥 FIX: Limpiamos las comillas Markdown (```json) que a veces la IA mete por error
            textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

            const parsedData = JSON.parse(textResponse);

            if (!parsedData.roles || !parsedData.transactions) {
                throw new Error("El JSON devuelto no tiene la estructura correcta (faltan roles o transacciones).");
            }

            this.draftRoles = parsedData.roles.map(r => ({
                id: 'draft_' + Math.random().toString(36).substr(2, 9),
                levelId: r.levelId,
                name: r.name,
                fmv: r.fmv,
                multiplier: r.multiplier
            }));

            this.draftTxs = parsedData.transactions;

            this.dom.loading.style.display = 'none';
            this.dom.step2.style.display = 'block';
            this.dom.dot1.classList.remove('active');
            this.dom.dot2.classList.add('active');
            this.dom.txCount.innerText = this.draftTxs.length;
            
            this.renderDraftRoles();
            console.log("✅ Ontología generada con éxito.");

        } catch (error) {
            console.error("💥 Fallo en la Generación IA:", error);
            alert(`Fallo IA: ${error.message}\n\nAplicando fallback básico.`);
            
            this.selectedSector = 'startup_tech';
            this.draftTxs = [];
            this.draftRoles = [
                { id: 'd1', levelId: '@anxaneta', name: 'Visionario', fmv: 60, multiplier: 3.0 },
                { id: 'd2', levelId: '@aixecador', name: 'Orquestador', fmv: 50, multiplier: 2.0 },
                { id: 'd3', levelId: '@dosos', name: 'Auditor', fmv: 45, multiplier: 1.5 },
                { id: 'd4', levelId: '@baixos', name: 'Técnico', fmv: 40, multiplier: 1.2 },
                { id: 'd5', levelId: '@pinya', name: 'Soporte', fmv: 30, multiplier: 1.0 }
            ];
            
            this.dom.loading.style.display = 'none';
            this.dom.step2.style.display = 'block';
            this.renderDraftRoles();
        }
    }

    renderDraftRoles() {
        this.dom.container.innerHTML = '';
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        
        const levels = [
            { id: '@anxaneta', label: '@anxaneta (Dirección)' },
            { id: '@aixecador', label: '@aixecador (Coordinación)' },
            { id: '@dosos', label: '@dosos (Auditoría)' },
            { id: '@baixos', label: '@baixos (Técnico)' },
            { id: '@pinya', label: '@pinya (Base)' }
        ];

        this.draftRoles.forEach((role, index) => {
            const color = colors[role.levelId] || '#fff';
            const row = document.createElement('div');
            row.className = 'role-draft-item';
            
            let selectHtml = `<select class="inp-role-level" data-idx="${index}" style="color: ${color}; border-color: ${color};">`;
            levels.forEach(l => {
                selectHtml += `<option value="${l.id}" ${role.levelId === l.id ? 'selected' : ''}>${l.label}</option>`;
            });
            selectHtml += `</select>`;

            row.innerHTML = `
                <div class="role-inputs">
                    ${selectHtml}
                    <input type="text" value="${role.name}" class="inp-role-name" data-idx="${index}" title="Nombre del Rol">
                    <div style="display:flex; align-items:center; gap: 5px;">
                        <span style="color: var(--text-muted); font-size: 0.7rem;">FMV:</span>
                        <input type="number" value="${role.fmv}" class="fmv-input inp-role-fmv" data-idx="${index}" title="Valor de Mercado €/h">
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
        
        // 1. Despachamos la creación del proyecto (esto carga los roles)
        store.dispatch({ 
            type: 'ADD_PROJECT', 
            payload: {
                id: projectId,
                nombre: this.dom.inpName.value.trim(),
                sector: 'ai_custom',
                archetype: 'startup',
                customRoles: this.draftRoles 
            } 
        });

        // 2. Inyectamos las transacciones fundacionales que propuso Gemini
        const state = store.getState();
        const p = state.projects.find(x => x.id === projectId);
        
        if (p && this.draftTxs && this.draftTxs.length > 0) {
            this.draftTxs.forEach(aiTx => {
                // Buscamos los IDs reales de los roles generados
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
