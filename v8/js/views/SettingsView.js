// v8/js/views/SettingsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class SettingsView {
    constructor() {
        document.title = "Consola V9 | TeamTowers";
        this.tab = localStorage.getItem('tt_settings_tab') || 'ia'; 
        this.sectorsFromKB = {}; 
        this.resizeObserver = null;
    }

    async getHtml() {
        const state = store.getState();
        const isEcosystemOwner = state.session.role === 'ecosystem-owner' || state.session.activeUserId; 
        
        if (!isEcosystemOwner) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/settings')}
                    <main class="workspace-settings" style="display:flex; justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center; background: rgba(255,82,82,0.05); padding: 4rem; border: 1px dashed var(--accent-red); max-width: 500px;">
                            <div style="font-size:5rem; margin-bottom:1rem; line-height:1;">🔒</div>
                            <h2 style="color:var(--accent-red); margin-top:0; font-weight:900; letter-spacing:-1px;">Acceso Restringido</h2>
                            <p style="color:var(--text-muted); line-height: 1.6; font-size:1.1rem;">Solo el Master Architect (Ecosystem Owner) tiene las llaves de la Consola de Gobernanza.</p>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/settings')}
                </div>
            `;
        }

        const headerConfig = {
            title: "Hub de Gobernanza V9",
            subtitle: "Ecosystem Owner",
            tagline: "Central de Orquestación: Gestiona motores LLM, recluta Agentes y administra el genoma de la Matriz.",
            tabs: [
                { id: 'ia', label: '🧠 Motores LLM', active: this.tab === 'ia' },
                { id: 'agents', label: '🤖 Agentes & Padrón', active: this.tab === 'agents' },
                { id: 'ontology', label: '🧬 ADN Base (LMS)', active: this.tab === 'ontology' },
                { id: 'stakeholders', label: '🌌 Macro-VNA', active: this.tab === 'stakeholders' },
                { id: 'data', label: '💾 Web3 & Datos', active: this.tab === 'data' }
            ]
        };

        // LLAVES IA
        const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        const keyDeepSeek = localStorage.getItem('tt_key_deepseek') || '';
        const keyOpenAI = localStorage.getItem('tt_key_openai') || '';
        const keyGemini = localStorage.getItem('tt_key_gemini') || '';
        const customUrl = localStorage.getItem('tt_custom_url') || '';
        const customKey = localStorage.getItem('tt_custom_key') || '';

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-settings { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%; background: radial-gradient(circle at top right, #111116 0%, #050505 100%);}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 2rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                /* PANELES LUXURY V9 */
                .panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; padding: 3rem; margin-bottom: 2.5rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(15px); width: 100%; box-sizing: border-box;}
                .panel h2 { color: white; font-size: 1.5rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; font-weight: 900; letter-spacing: -0.5px;}
                .panel p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }

                /* ENGINE CARDS */
                .engine-card { display: flex; align-items: center; gap: 20px; padding: 20px; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 16px; margin-bottom: 15px; transition: 0.3s;}
                .engine-card:hover { border-color: #555; background: rgba(255,255,255,0.02); }
                .engine-icon { font-size: 2.5rem; width: 60px; text-align: center; }
                .engine-info { flex: 1; }
                .engine-info h3 { margin: 0 0 5px 0; color: white; font-size: 1.2rem; }
                .engine-info p { margin: 0; color: #888; font-size: 0.85rem; }

                /* FORMS & OTHER UI */
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px 18px; border-radius: 12px; font-family: var(--font-mono); font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.2), inset 0 2px 5px rgba(0,0,0,0.5);}
                
                .btn-save { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 16px 30px; border-radius: 12px; font-weight: 900; font-size: 1.05rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(0, 176, 255, 0.2); width: 100%; text-transform: uppercase; letter-spacing: 1px;}
                .btn-save:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(224, 64, 251, 0.4); filter: brightness(1.1);}

                .btn-danger-outline { background: transparent; border: 1px solid var(--accent-red); color: var(--accent-red); padding: 16px; border-radius: 12px; font-weight: bold; cursor: pointer; width: 100%; transition: 0.2s;}
                .btn-danger-outline:hover { background: rgba(255,82,82,0.1); }
                .btn-success-outline { background: transparent; border: 1px solid var(--accent-green); color: var(--accent-green); padding: 16px; border-radius: 12px; font-weight: bold; cursor: pointer; width: 100%; transition: 0.2s;}
                .btn-success-outline:hover { background: rgba(0,230,118,0.1); }

                .ontology-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; width: 100%;}
                .sector-card { background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 2rem; border-top: 4px solid var(--accent-blue); display:flex; flex-direction:column; backdrop-filter: blur(10px); transition: transform 0.3s; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);}
                .sector-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); box-shadow: 0 15px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(0,0,0,0.5);}
                .deliv-badge { background: rgba(0,0,0,0.6); border: 1px solid #333; font-size: 0.75rem; color: var(--accent-green); padding: 6px 10px; border-radius: 8px; margin-top: 8px; display: inline-block; font-family: monospace; font-weight:bold;}

                .file-upload-wrapper { position: relative; overflow: hidden; display: inline-block; width: 100%; }
                .file-upload-wrapper input[type=file] { font-size: 100px; position: absolute; left: 0; top: 0; opacity: 0; cursor: pointer; height: 100%; }

                /* MACRO VNA STYLES */
                .sh-map-container { width: 100%; height: 500px; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0); background-size: 50px 50px; border: 1px solid var(--glass-border); border-radius: 20px; position: relative; overflow: hidden; background-color: rgba(5,5,8,0.9); box-shadow: inset 0 0 100px rgba(0,0,0,0.8); margin-top: 1rem;}
                #sh-edges { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; overflow: visible;}
                .edge-line { fill: none; stroke-width: 3; opacity: 0.6; transition: all 0.4s; }
                .edge-line:hover { opacity: 1; stroke-width: 6 !important; cursor: pointer; pointer-events: stroke; filter: brightness(1.3);}
                .edge-tangible { stroke: var(--accent-green); filter: drop-shadow(0 0 3px rgba(0, 230, 118, 0.3));}
                .edge-intangible { stroke: var(--accent-purple); stroke-dasharray: 8, 6; animation: dashAnim 20s linear infinite; filter: drop-shadow(0 0 3px rgba(224, 64, 251, 0.3)); stroke-width: 2.5;}
                .node-wrapper { position: absolute; z-index: 5; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; width: 160px; transition: all 0.3s; cursor: grab;}
                .node-circle { position: relative; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; transition: all 0.3s; background: rgba(10, 10, 15, 0.95); backdrop-filter: blur(15px); border: 3px solid rgba(255,255,255,0.08); color: white; box-shadow: 0 15px 35px rgba(0,0,0,0.7); width: 80px; height: 80px; box-sizing: border-box;}
                .node-icon { font-size: 2rem; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));}
                .node-title { margin-top: 10px; font-size: 0.8rem; font-weight: 900; color: white; text-align: center; text-transform: uppercase; width: 100%; line-height: 1.3; padding: 5px 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none; background: rgba(0,0,0,0.6); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); box-sizing: border-box;}

                @keyframes dashAnim { to { stroke-dashoffset: -200; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) { 
                    .workspace-settings { padding: 90px 1rem 120px 1rem; } 
                    .panel { padding: 1.5rem; border-radius: 20px;}
                    .ontology-grid { grid-template-columns: 1fr; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/settings')}
                
                <main class="workspace-settings">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-ia" class="tab-content ${this.tab === 'ia' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-purple);">
                            <h2 style="color: var(--accent-purple);">🧠 Orquestadores Cognitivos (API Hub)</h2>
                            <p>Conecta el Kernel V9 con los LLMs externos. El Orquestador usará estos motores para generar topologías VNA o auditar código. <strong>Las llaves se guardan encriptadas en tu LocalStorage, Zero-Trust.</strong></p>
                            
                            <div class="form-group" style="background: rgba(224,64,251,0.05); padding: 20px; border-radius: 12px; border: 1px dashed var(--accent-purple);">
                                <label style="color: var(--accent-purple);">Motor Activo Principal</label>
                                <select id="inpDefaultProvider" class="form-control" style="font-weight:900; border-color: var(--accent-purple);">
                                    <option value="gemini" ${savedProvider === 'gemini' ? 'selected' : ''}>Google Gemini 1.5 (Recomendado para VNA Masivos)</option>
                                    <option value="deepseek" ${savedProvider === 'deepseek' ? 'selected' : ''}>DeepSeek (Recomendado para Código)</option>
                                    <option value="openai" ${savedProvider === 'openai' ? 'selected' : ''}>OpenAI GPT-4o (Lógica de Negocio)</option>
                                    <option value="custom" ${savedProvider === 'custom' ? 'selected' : ''}>Custom Endpoint (Local Server)</option>
                                </select>
                            </div>

                            <div class="engine-card">
                                <div class="engine-icon">⚡</div>
                                <div class="engine-info">
                                    <h3>Google Gemini</h3>
                                    <div class="form-group" style="margin: 0;">
                                        <input type="password" id="keyGemini" class="form-control" placeholder="AIzaSy..." value="${keyGemini}">
                                    </div>
                                </div>
                            </div>

                            <div class="engine-card">
                                <div class="engine-icon">🧠</div>
                                <div class="engine-info">
                                    <h3>OpenAI</h3>
                                    <div class="form-group" style="margin: 0;">
                                        <input type="password" id="keyOpenAI" class="form-control" placeholder="sk-proj-..." value="${keyOpenAI}">
                                    </div>
                                </div>
                            </div>

                            <div class="engine-card">
                                <div class="engine-icon">🐳</div>
                                <div class="engine-info">
                                    <h3>DeepSeek</h3>
                                    <div class="form-group" style="margin: 0;">
                                        <input type="password" id="keyDeepSeek" class="form-control" placeholder="sk-..." value="${keyDeepSeek}">
                                    </div>
                                </div>
                            </div>

                            <div class="engine-card" id="customEndpointBox" style="display:${savedProvider === 'custom' ? 'flex' : 'none'}; border-style: dashed;">
                                <div class="engine-icon">🖧</div>
                                <div class="engine-info">
                                    <h3>Custom Endpoint</h3>
                                    <div style="display:flex; gap:10px; margin-top:5px;">
                                        <input type="text" id="inpCustomUrl" class="form-control" placeholder="http://localhost:1234/v1" value="${customUrl}">
                                        <input type="password" id="inpCustomKey" class="form-control" placeholder="Bearer Token" value="${customKey}">
                                    </div>
                                </div>
                            </div>

                            <button class="btn-save" id="btn-save-keys" style="margin-top:2rem;">Forjar Llaves Criptográficas</button>
                            <div id="keysFeedback" style="display:none; color: var(--accent-green); margin-top: 15px; font-size: 0.95rem; font-weight: bold; text-align:center;">✅ Llaves ancladas en memoria local.</div>
                        </div>
                    </div>

                    <div id="tab-agents" class="tab-content ${this.tab === 'agents' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-blue);">
                            <h2 style="color: var(--accent-blue);">➕ Reclutar Agente o Humano</h2>
                            <p>Da de alta un nuevo Nodo (IA o Humano) en el Padrón Global de la Matriz para asignarle roles y SOPs en tus ecosistemas.</p>
                            
                            <div style="background: rgba(0,0,0,0.3); padding:2rem; border-radius:16px; border: 1px solid var(--glass-border); margin-bottom: 2rem;">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; align-items: start;">
                                    <div class="form-group" style="margin:0;">
                                        <label>Alias (@id)</label>
                                        <input type="text" id="new-user-id" class="form-control" placeholder="Ej: @dev_ninja">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Nombre Público</label>
                                        <input type="text" id="new-user-name" class="form-control" placeholder="Ninja Coder AI">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Tipo de Nodo</label>
                                        <select id="new-user-type" class="form-control">
                                            <option value="ai">🤖 Agente Autónomo (IA)</option>
                                            <option value="human">👤 Operador Humano</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-group" style="margin-top:20px;">
                                    <label>System Prompt (Alma del Agente) / Wallet (Humanos)</label>
                                    <textarea id="new-user-contact" class="form-control" style="min-height: 80px; resize:vertical;" placeholder="Si es IA: Escribe su prompt base. Si es humano: Email o Wallet 0x..."></textarea>
                                </div>
                                <button id="btn-create-user" class="btn-save" style="margin-top: 15px;">Inyectar al Padrón Global</button>
                            </div>

                            <h3 style="color: white; border-bottom: 1px solid #333; padding-bottom: 10px;">Registro Global (${state.globalUsers.length} Nodos Activos)</h3>
                            <div style="overflow-x:auto; max-height: 400px; overflow-y:auto;">
                                <table style="width:100%; border-collapse:collapse; text-align:left;">
                                    <tr style="border-bottom:1px solid #444; position: sticky; top: 0; background: rgba(10,10,15,0.95);">
                                        <th style="padding:15px; color:#aaa;">Alias</th>
                                        <th style="padding:15px; color:#aaa;">Nombre</th>
                                        <th style="padding:15px; color:#aaa;">Privilegios</th>
                                    </tr>
                                    ${state.globalUsers.map(u => `
                                        <tr style="border-bottom:1px solid #222;">
                                            <td style="padding:15px; font-weight: bold; color: var(--accent-blue); font-family: monospace;">${u.id}</td>
                                            <td style="padding:15px; color: white; font-weight: 900;">${u.profile?.isAi ? '🤖 ' : ''}${u.name}</td>
                                            <td style="padding:15px; color: ${u.globalRole === 'ecosystem-owner' ? 'var(--accent-orange)' : '#888'}; font-weight:bold;">${u.globalRole === 'ecosystem-owner' ? '👑 Owner' : (u.profile?.isAi ? 'IA NATIVA' : 'Ciudadano')}</td>
                                        </tr>
                                    `).join('')}
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="tab-ontology" class="tab-content ${this.tab === 'ontology' ? 'active' : ''}">
                        <div class="panel">
                            <h2>🧬 Catálogo Fractal de Ecosistemas (LMS)</h2>
                            <p>El Orquestador lee estos genomas estructurales para instanciar nuevas redes. Los roles contienen referencias a <b>Flujos de Metodología VNA</b>, no simples descripciones de texto.</p>
                            
                            <div class="ontology-grid" id="nativeOntologyGrid">
                                <div style="color:#888; grid-column: 1/-1; padding: 2rem; text-align:center;">Extrayendo genoma semántico...</div>
                            </div>
                        </div>
                    </div>

                    <div id="tab-stakeholders" class="tab-content ${this.tab === 'stakeholders' ? 'active' : ''}">
                        <div class="panel" style="border-color: var(--accent-orange); box-shadow: inset 0 0 50px rgba(255,171,64,0.05);">
                            <h2 style="color: var(--accent-orange);">🌌 Macro-Red de Stakeholders</h2>
                            <p>Visión topológica. Define cómo fluye el valor tangible e intangible en el nivel más alto de la corporación/red.</p>
                            
                            <div style="display: flex; gap: 15px; font-size: 0.8rem; font-weight:bold; color: #aaa; align-items: center; background: rgba(0,0,0,0.5); padding: 8px 15px; border-radius: 8px; border: 1px solid var(--glass-border); width: max-content; margin-bottom: 0.5rem;">
                                <div style="display: flex; align-items: center; gap: 8px; text-transform: uppercase;"><div style="width:18px; height:4px; border-radius:2px; background:var(--accent-green);"></div> Tangible</div>
                                <div style="display: flex; align-items: center; gap: 8px; text-transform: uppercase;"><div style="width:18px; height:4px; border-radius:2px; border-bottom:2px dashed var(--accent-purple); background:transparent;"></div> Intangible</div>
                            </div>

                            <div class="sh-map-container" id="stakeholderMap">
                                <svg id="sh-edges">
                                    <defs>
                                        <marker id="arrow-tangible-macro" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto"><polygon points="0 0, 14 5, 0 10" fill="#00e676"/></marker>
                                        <marker id="arrow-intangible-macro" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto"><polygon points="0 0, 14 5, 0 10" fill="#e040fb"/></marker>
                                    </defs>
                                    <g id="sh-paths-group"></g>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div id="tab-data" class="tab-content ${this.tab === 'data' ? 'active' : ''}">
                        <div class="panel" style="border-color: #333;">
                            <h2>💾 Control de Memoria Local (Web3-First)</h2>
                            <p>El núcleo V9 funciona 100% en tu navegador. <strong>Exporta un archivo .JSON para asegurar tus ecosistemas, agentes y flujos VNA.</strong></p>
                            
                            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:2.5rem;">
                                <button class="btn-success-outline" id="btnExport" style="flex:1;">⬇️ Exportar Snapshot (.JSON)</button>
                                
                                <div class="file-upload-wrapper" style="flex:1;">
                                    <button class="btn-danger-outline">⬆️ Importar Memoria (.JSON)</button>
                                    <input type="file" id="fileInput" accept=".json">
                                </div>
                            </div>
                            
                            <div style="margin-top:4rem; border-top:1px dashed #333; padding-top:2rem; text-align:center;">
                                <button class="btn-lux btn-lux-danger" id="btnNuke" style="width:auto; display:inline-block; padding: 10px 20px; font-size:0.8rem;">⚠️ PROTOCOLO OMEGA (Borrar Todo el Kernel)</button>
                            </div>
                        </div>
                    </div>

                </main>
                ${BottomNav.getHtml('/settings')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        // TABS V9 EVENT SYNC
        window.addEventListener('ph-tab-changed', (e) => {
            this.tab = e.detail.tabId;
            localStorage.setItem('tt_settings_tab', this.tab);
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.tab}`);
            if(target) target.classList.add('active');

            if(this.tab === 'ontology') this.renderOntologyGrids();
            if(this.tab === 'stakeholders') setTimeout(() => this.renderMacroVNA(), 50);
        });

        if(this.tab === 'ontology') this.renderOntologyGrids();
        if(this.tab === 'stakeholders') setTimeout(() => this.renderMacroVNA(), 100);

        this.bindContentEvents();

        if (window.ResizeObserver) {
            const container = document.getElementById('stakeholderMap');
            if (container) {
                this.resizeObserver = new ResizeObserver(() => {
                    if (this.tab === 'stakeholders') this.renderMacroVNA();
                });
                this.resizeObserver.observe(container);
            }
        }
    }

    renderMacroVNA() {
        const container = document.getElementById('stakeholderMap');
        const pathsGroup = document.getElementById('sh-paths-group');
        if (!container || !pathsGroup) return;

        container.querySelectorAll('.node-wrapper, .tx-badge').forEach(e => e.remove());
        pathsGroup.innerHTML = '';

        const nodes = [
            { id: 'inv', label: 'Inversores', desc: 'Capital FIAT', icon: '🏦', color: 'var(--accent-green)', x: 18, y: 25 },
            { id: 'cli', label: 'Mercado', desc: 'Pago por Valor', icon: '🛍️', color: 'var(--accent-blue)', x: 82, y: 25 },
            { id: 'eo', label: 'Ecosystem Owner', desc: 'Master Architect', icon: '👑', color: 'var(--accent-orange)', x: 50, y: 50 },
            { id: 'team', label: 'La Colla', desc: 'IA + Humanos', icon: '🤖👥', color: 'var(--accent-purple)', x: 50, y: 82 }
        ];

        const edges = [
            { from: 'inv', to: 'eo', tipo: 'tangible', label: 'Inversión (€)' },
            { from: 'eo', to: 'inv', tipo: 'intangible', label: 'Equidad / SBT' },
            { from: 'eo', to: 'team', tipo: 'intangible', label: 'Visión & Metas' },
            { from: 'eo', to: 'team', tipo: 'tangible', label: 'Slices (Pago PoW)' },
            { from: 'team', to: 'eo', tipo: 'tangible', label: 'Entregables (PoW)' },
            { from: 'team', to: 'cli', tipo: 'tangible', label: 'Producto / SaaS' },
            { from: 'cli', to: 'team', tipo: 'intangible', label: 'Feedback / Datos' },
            { from: 'cli', to: 'eo', tipo: 'tangible', label: 'Ingresos (€)' },
            { from: 'eo', to: 'cli', tipo: 'intangible', label: 'Promesa de Marca' }
        ];

        nodes.forEach(n => {
            const el = document.createElement('div');
            el.className = 'node-wrapper';
            el.dataset.id = n.id;
            el.style.left = `${n.x}%`;
            el.style.top = `${n.y}%`;
            el.innerHTML = `
                <div class="node-circle" style="border-color:${n.color}; box-shadow: 0 0 35px ${n.color}50;">
                    <div class="node-icon">${n.icon}</div>
                </div>
                <div class="node-title">${n.label}</div>
            `;
            container.appendChild(el);
        });

        const pairCounts = {};
        edges.forEach((tx, i) => {
            const key = tx.from < tx.to ? `${tx.from}-${tx.to}` : `${tx.to}-${tx.from}`;
            if (!pairCounts[key]) pairCounts[key] = [];
            pairCounts[key].push({ tx, index: i });
        });

        setTimeout(() => {
            Object.keys(pairCounts).forEach(key => {
                const edgesGroup = pairCounts[key];
                edgesGroup.forEach((edgeData, multiIdx) => {
                    this.drawMacroEdge(container, pathsGroup, edgeData.tx, edgeData.index, edgesGroup, multiIdx);
                });
            });
        }, 60);
    }

    drawMacroEdge(canvas, pathsGroup, tx, originalIndex, edgesGroup, multiIdx) {
        const dom1 = canvas.querySelector(`.node-wrapper[data-id="${tx.from}"]`);
        const dom2 = canvas.querySelector(`.node-wrapper[data-id="${tx.to}"]`);
        if (!dom1 || !dom2 || tx.from === tx.to) return;

        const x1_center = dom1.offsetLeft;
        const y1_center = dom1.offsetTop;
        const x2_center = dom2.offsetLeft;
        const y2_center = dom2.offsetTop;

        const dx = x2_center - x1_center;
        const dy = y2_center - y1_center;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        const trim = 55; 
        let x1 = x1_center, y1 = y1_center, x2 = x2_center, y2 = y2_center;

        if (dist > trim) {
            x1 = x1_center + (dx/dist) * trim;
            y1 = y1_center + (dy/dist) * trim;
            x2 = x2_center - (dx/dist) * trim;
            y2 = y2_center - (dy/dist) * trim;
        }

        const nx = -dy / dist; 
        const ny = dx / dist;
        let offset = 0;
        
        if (edgesGroup.length > 1) {
            const step = 45; 
            if (multiIdx % 2 !== 0) { offset = Math.ceil(multiIdx / 2) * step; } 
            else { offset = -(Math.ceil(multiIdx / 2) * step); }
            if (tx.from > tx.to) offset = -offset;
        }

        const cx = (x1_center + x2_center) / 2 + nx * offset;
        const cy = (y1_center + y2_center) / 2 + ny * offset;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
        
        let markerId = tx.tipo === 'tangible' ? 'arrow-tangible-macro' : 'arrow-intangible-macro';
        const lineClass = tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible';
        path.setAttribute('class', `edge-line ${lineClass}`);
        
        const strokeHex = tx.tipo === 'tangible' ? '#00e676' : '#e040fb';
        path.style.stroke = strokeHex;
        path.setAttribute('marker-end', `url(#${markerId})`);
        
        pathsGroup.appendChild(path);

        let t = 0.5; 
        if (edgesGroup.length > 1) {
            const totalInGroup = edgesGroup.length;
            const spreadFactor = 0.3; 
            if (totalInGroup > 1) {
                t = 0.5 + ((multiIdx / (totalInGroup - 1)) - 0.5) * spreadFactor;
            }
        }

        const omt = 1 - t;
        const omt2 = omt * omt;
        const t2 = t * t;
        
        const txX = omt2 * x1 + 2 * omt * t * cx + t2 * x2;
        const txY = omt2 * y1 + 2 * omt * t * cy + t2 * y2;

        const badge = document.createElement('div');
        badge.className = 'tx-badge';
        badge.style.left = `${txX}px`;
        badge.style.top = `${txY}px`;
        badge.style.backgroundColor = strokeHex;
        
        badge.innerHTML = `<span class="tx-order">${originalIndex + 1}.</span> ${tx.label}`;
        canvas.appendChild(badge);
    }

    bindContentEvents() {
        const uiKeys = {
            provider: document.getElementById('inpDefaultProvider'),
            apiKeyD: document.getElementById('keyDeepSeek'),
            apiKeyO: document.getElementById('keyOpenAI'),
            apiKeyG: document.getElementById('keyGemini'),
            customUrl: document.getElementById('inpCustomUrl'),
            customKey: document.getElementById('inpCustomKey'),
            boxCustom: document.getElementById('customEndpointBox'),
            btnSave: document.getElementById('btn-save-keys'),
            feedback: document.getElementById('keysFeedback')
        };

        if (uiKeys.provider) {
            uiKeys.provider.addEventListener('change', (e) => {
                uiKeys.boxCustom.style.display = e.target.value === 'custom' ? 'flex' : 'none';
            });

            uiKeys.btnSave.addEventListener('click', () => {
                localStorage.setItem('tt_ai_provider', uiKeys.provider.value);
                localStorage.setItem('tt_key_deepseek', uiKeys.apiKeyD.value.trim());
                localStorage.setItem('tt_key_openai', uiKeys.apiKeyO.value.trim());
                localStorage.setItem('tt_key_gemini', uiKeys.apiKeyG.value.trim());
                localStorage.setItem('tt_custom_url', uiKeys.customUrl.value.trim());
                localStorage.setItem('tt_custom_key', uiKeys.customKey.value.trim());
                
                uiKeys.feedback.style.display = 'block';
                setTimeout(() => uiKeys.feedback.style.display = 'none', 3000);
            });
        }

        document.getElementById('btn-create-user')?.addEventListener('click', async () => {
            let id = document.getElementById('new-user-id').value.trim();
            const name = document.getElementById('new-user-name').value.trim();
            const type = document.getElementById('new-user-type').value;
            const contactOrPrompt = document.getElementById('new-user-contact').value.trim();
            
            if (!id || !name) return alert("⚠️ Alias y Nombre son obligatorios.");
            if (!id.startsWith('@')) id = '@' + id; 

            const isAi = type === 'ai';
            
            const newUser = {
                id: id,
                name: name,
                globalRole: isAi ? 'ai-agent' : 'network-user',
                walletOrSocial: !isAi ? contactOrPrompt : undefined,
                profile: isAi ? { isAi: true, structural_affinity: ['@baixos'], vision: contactOrPrompt } : { sbt_skills: [] }
            };

            await store.dispatch({ type: 'ADD_USER', payload: newUser });
            alert(`✅ Nodo ${id} inyectado al Padrón.`);
            window.location.reload(); 
        });

        // DATA MANAGEMENT
        document.getElementById('btnExport')?.addEventListener('click', async () => {
            const btn = document.getElementById('btnExport');
            btn.innerText = '⏳ Compilando...';
            try {
                await KB.init();
                const kbNodes = await KB.getAllNodes();
                const backupPayload = {
                    version: "V12.0_Fractal", timestamp: Date.now(),
                    store: store.getState(), knowledge_base: kbNodes
                };
                
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
                const a = document.createElement('a');
                a.href = dataStr;
                a.download = `TeamTowers_OS_V9_Snapshot_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                btn.innerText = '✔️ Exportación Exitosa';
            } catch(e) { alert("Error exportando el Kernel."); }
            setTimeout(() => btn.innerText = '⬇️ Exportar Snapshot (.JSON)', 2000);
        });

        document.getElementById('fileInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (!importedData.store || !importedData.knowledge_base) throw new Error("JSON Inválido");
                    
                    if (confirm("⚠️ Importar sobrescribirá TODOS tus proyectos y memes actuales. ¿Proceder?")) {
                        await KB.init();
                        const tx = KB.db.transaction(['nodes'], 'readwrite');
                        tx.objectStore('nodes').clear(); 
                        for (const node of importedData.knowledge_base) { await KB.saveNode(node); }
                        
                        await store.dispatch({ type: 'RESTORE_STATE', payload: importedData.store });
                        window.location.href = '/v8/';
                    }
                } catch (err) { alert("❌ Error de lectura criptográfica: Archivo corrupto."); }
            };
            reader.readAsText(file);
        });

        document.getElementById('btnNuke')?.addEventListener('click', () => {
            if (confirm("🚨 PROTOCOLO OMEGA: Esto borrará TODOS los proyectos y vaciará el Kernel. ¿Estás seguro?")) {
                localStorage.clear();
                window.location.href = '/v8/';
            }
        });
    }

    async renderOntologyGrids() {
        const nativeGrid = document.getElementById('nativeOntologyGrid');
        if(!nativeGrid) return;

        await KB.init();
        this.sectorsFromKB = await KB.getAvailableSectors();
        const sectorKeys = Object.keys(this.sectorsFromKB);

        if (sectorKeys.length === 0) {
            nativeGrid.innerHTML = `<div style="grid-column:1/-1; padding:3rem; text-align:center; border:1px dashed #444; border-radius:16px;">El Cerebro Semántico está vacío. Inicia el sistema o usa el LMS para inyectar conocimiento.</div>`;
            return;
        }

        const renderRoleData = (lvl, data) => {
            let flowsHtml = '';
            if (data.core_flows && data.core_flows.length > 0) {
                flowsHtml = data.core_flows.map(f => {
                    return `<div class="deliv-badge" style="opacity:0.9;">🔄 ${f}</div>`;
                }).join(' ');
            }
            return `
                <div style="border-bottom: 1px dashed rgba(255,255,255,0.05); padding: 12px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; gap:10px;">
                        <span style="font-family:var(--font-mono); font-size:0.75rem; color:#888; font-weight:bold; background:rgba(0,0,0,0.4); padding:2px 6px; border-radius:4px;">${lvl}</span>
                        <b style="color:white; font-size:0.9rem; text-align:right;">${data.name}</b>
                    </div>
                    <div style="margin-top:8px;">${flowsHtml}</div>
                </div>
            `;
        };

        nativeGrid.innerHTML = sectorKeys.map(key => {
            const sectorData = this.sectorsFromKB[key]; 
            return `
            <div class="sector-card native">
                <h3 style="color:#00b0ff; margin-top:0;">${sectorData.label.toUpperCase()}</h3>
                <div style="display: flex; flex-direction: column; gap: 5px; flex:1; opacity:0.8;">
                    ${Object.entries(sectorData.roles).map(([lvl, roleData]) => renderRoleData(lvl, roleData)).join('')}
                </div>
                <button class="btn-save btn-use-template" data-sector="${key}" style="margin-top:2.5rem; background:rgba(0,176,255,0.1); border: 1px dashed var(--accent-blue); color:var(--accent-blue); font-size:0.95rem; box-shadow:none;">🚀 Instanciar Red Fractal</button>
            </div>
            `
        }).join('');

        document.querySelectorAll('.btn-use-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sector = e.currentTarget.dataset.sector;
                window.location.href = `/v8/create?sector=${sector}`;
            });
        });
    }
}
