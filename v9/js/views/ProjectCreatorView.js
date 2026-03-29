// v9/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';
import { Orchestrator } from '../core/Orchestrator.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Génesis VNA | TeamTowers V9";
    }

    async getHtml() {
        await store.init();
        
        const headerConfig = {
            title: "Génesis de Ecosistema",
            subtitle: "Matriz VNA Auto-Generada",
            tagline: "Describe tu visión. El @agent_genesis_architect estructurará los roles Casteller y los flujos de valor. Edítalos a tu gusto antes de sellar.",
            tabs: []
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-creator { flex: 1; padding: 2rem 3rem; overflow-y: auto; background: radial-gradient(circle at center, #111116 0%, #050505 100%); position: relative; scroll-behavior: smooth;}
                
                .creator-container { max-width: 1000px; margin: 2rem auto; background: rgba(10,10,15,0.8); border: 1px solid var(--glass-border); border-top: 4px solid var(--accent-purple); border-radius: 20px; padding: 3rem; box-shadow: 0 20px 50px rgba(0,0,0,0.5);}
                
                .form-group { margin-bottom: 2rem; display: flex; flex-direction: column; gap: 10px;}
                .form-group label { color: var(--accent-blue); font-size: 0.85rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                
                .form-control { background: rgba(0,0,0,0.6); border: 1px solid #333; color: white; padding: 15px; border-radius: 12px; font-family: var(--font-main); font-size: 1rem; outline: none; transition: 0.3s;}
                .form-control:focus { border-color: var(--accent-purple); box-shadow: inset 0 0 15px rgba(224,64,251,0.1);}
                .form-control.textarea { min-height: 150px; resize: vertical; font-family: 'Georgia', serif; line-height: 1.6;}
                
                .btn-generate { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 15px 30px; border-radius: 12px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: 0.3s; width: 100%; display: flex; justify-content: center; align-items: center; gap: 10px; box-shadow: 0 10px 30px rgba(224,64,251,0.2);}
                .btn-generate:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(224,64,251,0.4); filter: brightness(1.2);}
                .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; filter: grayscale(1);}

                /* 🔥 VISTA PREVIA VISUAL (NUEVO) */
                .preview-box { display: none; margin-top: 2rem; padding-top: 2rem; border-top: 1px dashed #444; animation: fadeIn 0.4s ease;}
                .preview-title { color: var(--accent-green); font-size: 1.2rem; font-weight: 900; margin-bottom: 1.5rem; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center;}
                
                .section-label { color: var(--accent-blue); font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px; }
                
                /* ROLES GRID */
                .roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-bottom: 2rem;}
                .role-card { background: rgba(0,0,0,0.5); border: 1px solid #444; border-left: 4px solid var(--accent-purple); border-radius: 12px; padding: 15px; display: flex; flex-direction: column; gap: 10px; transition: 0.2s;}
                .role-card:focus-within { border-color: var(--accent-purple); background: rgba(224,64,251,0.05); }
                .rc-input-row { display: flex; gap: 10px; align-items: center; }
                .rc-input-row label { font-size: 0.7rem; color: #888; width: 50px;}
                .rc-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid #333; color: white; padding: 8px; border-radius: 6px; font-family: var(--font-main); font-size: 0.9rem; outline: none; transition: 0.2s; width: 100%; box-sizing: border-box;}
                .rc-input:focus { border-color: var(--accent-blue); }

                /* FLOWS LIST */
                .flows-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 10px;}
                .flow-row { display: flex; gap: 10px; align-items: center; background: rgba(0,0,0,0.5); border: 1px solid #444; padding: 10px 15px; border-radius: 12px; min-width: 800px; transition: 0.2s;}
                .flow-row:focus-within { border-color: var(--accent-green); background: rgba(0,230,118,0.05); }
                .flow-icon { color: #888; font-size: 1.2rem; }
                .fr-select { flex: 1.5; background: rgba(255,255,255,0.05); border: 1px solid #333; color: white; padding: 8px; border-radius: 6px; font-family: var(--font-main); font-size: 0.85rem; outline: none;}
                .fr-input { flex: 3; background: rgba(255,255,255,0.05); border: 1px solid #333; color: white; padding: 8px; border-radius: 6px; font-family: var(--font-main); font-size: 0.9rem; outline: none;}
                .fr-number { flex: 0.8; background: rgba(255,255,255,0.05); border: 1px solid #333; color: var(--accent-orange); font-family: var(--font-mono); font-weight: bold; padding: 8px; border-radius: 6px; font-size: 0.9rem; outline: none; text-align: center;}
                
                /* TERMINAL VIEW */
                .btn-toggle-raw { background: transparent; border: 1px dashed #555; color: #aaa; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; transition: 0.2s; font-family: var(--font-mono); }
                .btn-toggle-raw:hover { background: rgba(255,255,255,0.05); color: white; }
                .json-preview-wrapper { display: none; margin-bottom: 2rem;}
                .json-preview { background: #050508; border: 1px solid #333; padding: 15px; border-radius: 12px; font-family: var(--font-mono); font-size: 0.8rem; color: #00e676; overflow-x: auto; white-space: pre-wrap; max-height: 300px; overflow-y: auto;}
                
                .btn-confirm { background: var(--accent-green); color: black; border: none; padding: 15px 30px; border-radius: 12px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: 0.3s; width: 100%; box-shadow: 0 10px 30px rgba(0,230,118,0.2);}
                .btn-confirm:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(0,230,118,0.4);}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .workspace-creator { padding: 80px 1rem 100px 1rem; }
                    .creator-container { padding: 1.5rem; }
                    .rc-input-row { flex-direction: column; align-items: stretch; gap: 5px; }
                    .rc-input-row label { width: auto; }
                }
            </style>
            
            <div class="app-layout">
                ${Sidebar.getHtml('/create')}
                <main class="workspace-creator">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <div class="creator-container">
                        <div class="form-group">
                            <label>Nombre del Ecosistema</label>
                            <input type="text" id="inpProjName" class="form-control" placeholder="Ej: SOS TeamTowers">
                        </div>
                        <div class="form-group">
                            <label>Visión Fundacional (Input VNA)</label>
                            <textarea id="inpProjVision" class="form-control textarea" placeholder="Describe el modelo de negocio, quiénes son los actores principales y qué valor intercambian. El Arquitecto hará el resto..."></textarea>
                        </div>
                        
                        <button class="btn-generate" id="btnGenerateVNA">🧠 Orquestar Matriz VNA</button>

                        <div class="preview-box" id="previewBox">
                            <div class="preview-title">
                                <span>Matriz Compilada (Modo Edición)</span>
                                <button class="btn-toggle-raw" id="btnToggleRaw">👁️ Ver Matriz Raw (JSON)</button>
                            </div>
                            
                            <div class="json-preview-wrapper" id="jsonPreviewWrapper">
                                <div class="json-preview" id="jsonPreview"></div>
                            </div>

                            <div class="section-label">👥 Nodos de Gravedad (Roles Casteller)</div>
                            <div class="roles-grid" id="rolesGrid"></div>

                            <div class="section-label">🔗 Intercambio de Valor (Transacciones)</div>
                            <div class="flows-list" id="flowsList"></div>

                            <button class="btn-confirm" id="btnConfirmCreation">💾 Materializar Ecosistema en Redux</button>
                        </div>
                    </div>
                </main>
                ${BottomNav.getHtml('/create')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        this.dom = {
            inpName: document.getElementById('inpProjName'),
            inpVision: document.getElementById('inpProjVision'),
            btnGenerate: document.getElementById('btnGenerateVNA'),
            previewBox: document.getElementById('previewBox'),
            btnToggleRaw: document.getElementById('btnToggleRaw'),
            jsonPreviewWrapper: document.getElementById('jsonPreviewWrapper'),
            jsonPreview: document.getElementById('jsonPreview'),
            rolesGrid: document.getElementById('rolesGrid'),
            flowsList: document.getElementById('flowsList'),
            btnConfirm: document.getElementById('btnConfirmCreation')
        };

        this.generatedBlueprint = null;

        // Toggle JSON Terminal
        this.dom.btnToggleRaw.addEventListener('click', () => {
            const isVisible = this.dom.jsonPreviewWrapper.style.display === 'block';
            this.dom.jsonPreviewWrapper.style.display = isVisible ? 'none' : 'block';
            this.dom.btnToggleRaw.innerText = isVisible ? '👁️ Ver Matriz Raw (JSON)' : '🙈 Ocultar Matriz Raw';
        });

        this.dom.btnGenerate.addEventListener('click', async () => {
            const name = this.dom.inpName.value.trim();
            const vision = this.dom.inpVision.value.trim();

            if (!vision) return alert("⚠️ La visión fundacional es necesaria para calcular la matriz.");

            this.dom.btnGenerate.disabled = true;
            this.dom.btnGenerate.innerHTML = "⏳ @agent_genesis_architect diseñando...";
            this.dom.previewBox.style.display = 'none';

            try {
                const systemPrompt = `
                    Eres @agent_genesis_architect.
                    Tu misión es recibir una visión de negocio y generar un VNA Blueprint estricto.
                    
                    DEBES DEVOLVER ÚNICAMENTE UN OBJETO JSON con esta estructura exacta:
                    {
                      "type": "vna_blueprint",
                      "nombre": "Nombre sugerido (si el usuario no lo dio) o el proporcionado",
                      "presentation": "Visión general corta",
                      "roles": [
                        { "id": "r1", "name": "Nombre Rol", "levelId": "anxaneta|aixecador|dosos|baixos|pinya", "fmv": 50, "domain": "zeus" }
                      ],
                      "vna_flows": [
                        { "id": "tx1", "from": "r2", "to": "r1", "tipo": "tangible|intangible", "entregable": "Nombre del Entregable", "horas": 1 }
                      ]
                    }
                    NO incluyas markdown, solo el JSON raw.
                `;

                const userPrompt = `NOMBRE PROYECTO: ${name || 'Por definir'}\nVISIÓN DE NEGOCIO:\n${vision}`;

                const globalEngine = localStorage.getItem('tt_ai_provider') || 'openai';
                const apiKey = localStorage.getItem(`tt_key_${globalEngine}`);

                const response = await Orchestrator.callLLM({ 
                    provider: globalEngine, 
                    apiKey: apiKey, 
                    systemPrompt: systemPrompt, 
                    userPrompt: userPrompt, 
                    responseFormat: "json_object", 
                    temperature: 0.2 
                });

                let parsed = response.content;
                if (typeof parsed === 'string') {
                    try { parsed = JSON.parse(parsed); } 
                    catch(e) { parsed = JSON.parse(parsed.match(/\{[\s\S]*\}/)[0]); }
                }

                if (!parsed.roles || !parsed.vna_flows) throw new Error("La matriz devuelta está incompleta.");

                this.generatedBlueprint = parsed;
                this.dom.inpName.value = parsed.nombre; 
                this.dom.jsonPreview.innerText = JSON.stringify(parsed, null, 2);
                
                // RENDERIZAR EDITOR VISUAL
                this.renderVisualEditor(parsed);
                
                this.dom.previewBox.style.display = 'block';
                this.dom.previewBox.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                alert(`⚠️ Fallo en el núcleo de Génesis: ${error.message}`);
            } finally {
                this.dom.btnGenerate.disabled = false;
                this.dom.btnGenerate.innerHTML = "🧠 Orquestar Matriz VNA";
            }
        });

        this.dom.btnConfirm.addEventListener('click', async () => {
            if (!this.generatedBlueprint) return;

            this.dom.btnConfirm.disabled = true;
            this.dom.btnConfirm.innerText = "⏳ Empaquetando Matriz...";

            try {
                const state = store.getState();
                const activeUserId = state.session.activeUserId;
                
                // 1. RECOLECTAR DATOS DEL DOM (Lo que el usuario haya editado)
                const finalRoles = Array.from(document.querySelectorAll('.role-card')).map(card => {
                    return {
                        id: card.dataset.id,
                        name: card.querySelector('.rc-name').value.trim(),
                        levelId: card.querySelector('.rc-level').value,
                        fmv: parseFloat(card.querySelector('.rc-fmv').value) || 0,
                        domain: card.dataset.domain // Mantenemos el dominio generado
                    };
                });

                const finalFlows = Array.from(document.querySelectorAll('.flow-row')).map(row => {
                    return {
                        id: row.dataset.id,
                        from: row.querySelector('.fr-from').value,
                        to: row.querySelector('.fr-to').value,
                        tipo: row.querySelector('.fr-type').value,
                        entregable: row.querySelector('.fr-entregable').value.trim(),
                        horas: parseFloat(row.querySelector('.fr-horas').value) || 1
                    };
                });
                
                // 2. INYECTAR WORK ORDERS BASE
                const initialWorkOrders = finalFlows
                    .filter(f => f.tipo === 'tangible')
                    .map(f => ({
                        id: `wo_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,
                        flowId: f.id,
                        status: 'pending',
                        comentario: `Entregar: ${f.entregable}`,
                        assigneeId: null,
                        workerId: null,
                        createdAt: new Date().toISOString()
                    }));

                // 3. CONSTRUIR ECOSISTEMA FINAL
                const finalName = this.dom.inpName.value.trim() || this.generatedBlueprint.nombre;
                const newProject = {
                    id: `proj_${Date.now()}`,
                    nombre: finalName,
                    presentation: this.generatedBlueprint.presentation,
                    ownerId: activeUserId,
                    usuarios: [state.globalUsers.find(u => u.id === activeUserId)],
                    createdAt: new Date().toISOString(),
                    ledger: [],
                    roles: finalRoles,
                    vna_flows: finalFlows,
                    work_orders: initialWorkOrders 
                };

                await store.dispatch({ type: 'ADD_PROJECT', payload: newProject });
                localStorage.setItem('tt_active_project', newProject.id);
                
                alert("✅ Ecosistema materializado con éxito. Viajando al Kanban...");
                
                const link = document.createElement('a');
                link.href = '/v9/project';
                link.setAttribute('data-link', '');
                document.body.appendChild(link);
                link.click();

            } catch(e) {
                alert("⚠️ Error al materializar: " + e.message);
                this.dom.btnConfirm.disabled = false;
                this.dom.btnConfirm.innerText = "💾 Materializar Ecosistema en Redux";
            }
        });
    }

    // 🔥 GENERADOR DEL EDITOR VISUAL
    renderVisualEditor(data) {
        const castellerLevels = ['Anxaneta', 'Aixecador', 'Dosos', 'Baixos', 'Pinya'];
        const getOptions = (arr, selectedValue) => arr.map(opt => `<option value="${opt.toLowerCase()}" ${selectedValue.toLowerCase() === opt.toLowerCase() ? 'selected' : ''}>${opt}</option>`).join('');
        
        const getRoleOptions = (roles, selectedId) => roles.map(r => `<option value="${r.id}" ${r.id === selectedId ? 'selected' : ''}>${r.name}</option>`).join('');

        // 1. Renderizar Roles
        this.dom.rolesGrid.innerHTML = data.roles.map(r => `
            <div class="role-card" data-id="${r.id}" data-domain="${r.domain || 'zeus'}">
                <div class="rc-input-row">
                    <label>Nombre</label>
                    <input type="text" class="rc-input rc-name" value="${r.name}">
                </div>
                <div class="rc-input-row">
                    <label>Nivel</label>
                    <select class="rc-input rc-level">
                        ${getOptions(castellerLevels, r.levelId)}
                    </select>
                </div>
                <div class="rc-input-row">
                    <label>FMV (€)</label>
                    <input type="number" class="rc-input rc-fmv" value="${r.fmv}" style="color:var(--accent-orange); font-family:var(--font-mono); font-weight:bold;">
                </div>
            </div>
        `).join('');

        // 2. Renderizar Flujos
        this.dom.flowsList.innerHTML = data.vna_flows.map(f => {
            const isTangible = f.tipo === 'tangible';
            return `
                <div class="flow-row" data-id="${f.id}" style="border-left: 3px solid ${isTangible ? 'var(--accent-green)' : 'var(--accent-purple)'}">
                    <div class="flow-icon">📤</div>
                    <select class="fr-select fr-from" title="Origen">${getRoleOptions(data.roles, f.from)}</select>
                    
                    <div class="flow-icon">📥</div>
                    <select class="fr-select fr-to" title="Destino">${getRoleOptions(data.roles, f.to)}</select>
                    
                    <select class="fr-select fr-type" style="color:${isTangible ? 'var(--accent-green)' : 'var(--accent-purple)'}; font-weight:bold;">
                        <option value="tangible" ${isTangible ? 'selected' : ''}>🟢 Tangible</option>
                        <option value="intangible" ${!isTangible ? 'selected' : ''}>🟣 Intangible</option>
                    </select>
                    
                    <input type="text" class="fr-input fr-entregable" value="${f.entregable}" title="Entregable">
                    <input type="number" class="fr-number fr-horas" value="${f.horas || 1}" title="Horas Estimadas">
                </div>
            `;
        }).join('');
    }
}
