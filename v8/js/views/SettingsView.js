// v8/js/views/SettingsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class SettingsView {
    constructor() {
        document.title = "Configuración Ecosistema | TeamTowers V8";
        this.tab = localStorage.getItem('tt_settings_tab') || 'stakeholders'; // Default al nuevo mapa
        this.sectorsFromKB = {}; 
    }

    async getHtml() {
        const state = store.getState();
        const isEcosystemOwner = state.session.role === 'ecosystem-owner';
        
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
            title: "Consola V8 (EO)",
            subtitle: "Ecosystem Owner",
            tagline: "Gobernanza Fractal, Orquestación IA y Control P2P de la Red.",
            tabs: [
                { id: 'stakeholders', label: '🌌 Stakeholders', active: this.tab === 'stakeholders' },
                { id: 'ecosistema', label: '🪐 Gobernanza', active: this.tab === 'ecosistema' },
                { id: 'users', label: '👥 Padrón Global', active: this.tab === 'users' },
                { id: 'ia', label: '🧠 Motor IA', active: this.tab === 'ia' },
                { id: 'ontology', label: '🧬 ADN Base (LMS)', active: this.tab === 'ontology' },
                { id: 'data', label: '💾 Web3 & Datos', active: this.tab === 'data' }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-settings { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%; background: radial-gradient(circle at top right, #111116 0%, #050505 100%);}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 2rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                /* PANELES LUXURY V8 */
                .panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; padding: 3rem; margin-bottom: 2.5rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(15px); width: 100%; box-sizing: border-box;}
                .panel h2 { color: white; font-size: 1.5rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; font-weight: 900; letter-spacing: -0.5px;}
                .panel p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }

                /* STAKEHOLDER MAP (MACRO VNA) */
                .sh-map-container { width: 100%; height: 500px; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 40px 40px; border: 1px solid var(--glass-border); border-radius: 16px; position: relative; overflow: hidden; background-color: rgba(5,5,8,0.9); box-shadow: inset 0 0 50px rgba(0,0,0,0.8);}
                
                .sh-node { position: absolute; background: rgba(20,20,25,0.9); border: 2px solid; border-radius: 16px; padding: 15px 20px; color: white; text-align: center; font-weight: 900; transform: translate(-50%, -50%); z-index: 10; box-shadow: 0 10px 30px rgba(0,0,0,0.8); backdrop-filter: blur(10px); min-width: 120px;}
                .sh-node-icon { font-size: 2rem; margin-bottom: 5px; }
                .sh-node-title { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }

                .sh-badge { position: absolute; transform: translate(-50%, -50%); z-index: 15; font-size: 0.75rem; font-weight: bold; font-family: var(--font-mono); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 5px 15px rgba(0,0,0,0.8); color: black; text-transform:uppercase;}

                /* FORMS LUXURY */
                .form-group { margin-bottom: 25px; }
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 16px 20px; border-radius: 12px; font-family: var(--font-mono); font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.2), inset 0 2px 5px rgba(0,0,0,0.5);}
                
                .btn-save { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 16px 30px; border-radius: 12px; font-weight: 900; font-size: 1.05rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(0, 176, 255, 0.2); width: 100%; text-transform: uppercase; letter-spacing: 1px;}
                .btn-save:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(224, 64, 251, 0.4); filter: brightness(1.1);}

                .gov-card { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 20px 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); margin-top: 2rem; gap: 20px;}
                
                /* DATOS & BACKUPS */
                .btn-data { width: 100%; padding: 18px; border-radius: 12px; font-weight: 900; cursor: pointer; font-size: 1.05rem; transition: all 0.3s; display: flex; justify-content: center; align-items: center; gap: 10px; border: none; margin-bottom: 15px;}
                .btn-export { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.3); }
                .btn-export:hover { background: rgba(0, 230, 118, 0.2); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,230,118,0.2);}
                .btn-import { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.3); position: relative; overflow: hidden; }
                .btn-import:hover { background: rgba(0, 176, 255, 0.2); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,176,255,0.2);}
                .btn-danger { background: rgba(255, 82, 82, 0.1); color: var(--accent-red); border: 1px dashed rgba(255, 82, 82, 0.4); margin-top: 3rem;}
                .btn-danger:hover { background: rgba(255, 82, 82, 0.2); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255,82,82,0.2);}
                #fileInput { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

                /* ONTOLOGÍA Y AGENTES */
                .ontology-grid, .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; width: 100%;}
                
                .sector-card { background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 2rem; border-top: 4px solid var(--accent-blue); display:flex; flex-direction:column; backdrop-filter: blur(10px); transition: transform 0.3s; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);}
                .sector-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); box-shadow: 0 15px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(0,0,0,0.5);}
                .sector-card.native { border-top-color: #555; background: rgba(15,15,20,0.8); border-color: #222;}
                .sector-card h3 { margin: 0 0 15px 0; text-transform: uppercase; font-size: 1.3rem; color: white; font-weight: 900; letter-spacing:-0.5px;}
                .deliv-badge { background: rgba(0,0,0,0.6); border: 1px solid #333; font-size: 0.75rem; color: var(--accent-green); padding: 6px 10px; border-radius: 8px; margin-top: 8px; display: inline-block; font-family: monospace; font-weight:bold;}

                /* TABLA USUARIOS */
                .user-table-wrapper { overflow-x: auto; background: rgba(0,0,0,0.4); border-radius: 16px; border: 1px solid #333; width: 100%;}
                .user-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; text-align: left; min-width: 600px;}
                .user-table th { padding: 18px 15px; border-bottom: 1px solid #444; color: var(--text-muted); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; font-weight:900;}
                .user-table td { padding: 15px; border-bottom: 1px dashed rgba(255,255,255,0.05); color: #ccc;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* RESPONSIVE MOBILE FIXES */
                @media (max-width: 1024px) { .ontology-grid, .agents-grid { grid-template-columns: 1fr 1fr; } }
                @media (max-width: 768px) { 
                    .workspace-settings { padding: 90px 1rem 120px 1rem; } 
                    .panel { padding: 1.5rem; border-radius: 20px;}
                    .ontology-grid, .agents-grid { grid-template-columns: 1fr; }
                    .ai-grid, .user-form-grid, .location-form-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
                    .gov-card { flex-direction: column; align-items: flex-start; padding: 1.5rem;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/settings')}
                
                <main class="workspace-settings">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-stakeholders" class="tab-content ${this.tab === 'stakeholders' ? 'active' : ''}">
                        <div class="panel" style="border-color: var(--accent-orange); box-shadow: inset 0 0 50px rgba(255,171,64,0.05);">
                            <h2 style="color: var(--accent-orange);">🌌 Macro-Red de Stakeholders</h2>
                            <p>Visión del <i>Ecosystem Owner</i>. El flujo de valor no solo existe dentro de los proyectos, sino en la órbita que los rodea. Esta es la topología del modelo de negocio.</p>
                            
                            <div class="sh-map-container" id="stakeholderMap">
                                <svg id="sh-edges" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none;">
                                    <defs>
                                        <marker id="arrow-fiat" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#00e676"/></marker>
                                        <marker id="arrow-slices" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#e040fb"/></marker>
                                        <marker id="arrow-value" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#00b0ff"/></marker>
                                    </defs>
                                    </svg>
                                
                                <div class="sh-node" id="node-investor" style="top: 20%; left: 50%; border-color: var(--accent-green);">
                                    <div class="sh-node-icon">🏦</div>
                                    <div class="sh-node-title" style="color:var(--accent-green);">Inversores</div>
                                </div>
                                <div class="sh-node" id="node-eo" style="top: 50%; left: 50%; border-color: var(--accent-orange); background:rgba(255,171,64,0.1); box-shadow: 0 0 30px rgba(255,171,64,0.3);">
                                    <div class="sh-node-icon">👑</div>
                                    <div class="sh-node-title" style="color:var(--accent-orange);">Ecosystem Owner</div>
                                </div>
                                <div class="sh-node" id="node-team" style="top: 80%; left: 20%; border-color: var(--accent-purple);">
                                    <div class="sh-node-icon">🤖👥</div>
                                    <div class="sh-node-title" style="color:var(--accent-purple);">Colla (IAs + Humanos)</div>
                                </div>
                                <div class="sh-node" id="node-client" style="top: 80%; left: 80%; border-color: var(--accent-blue);">
                                    <div class="sh-node-icon">🛍️</div>
                                    <div class="sh-node-title" style="color:var(--accent-blue);">Clientes (Mercado)</div>
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-top:20px;">
                                <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(0,230,118,0.3); padding:15px; border-radius:12px;">
                                    <div style="font-weight:bold; color:var(--accent-green); margin-bottom:5px;">🟢 Fiat / Capital</div>
                                    <div style="font-size:0.8rem; color:#aaa;">Inversiones y pagos de clientes.</div>
                                </div>
                                <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(224,64,251,0.3); padding:15px; border-radius:12px;">
                                    <div style="font-weight:bold; color:var(--accent-purple); margin-bottom:5px;">🟣 Slices (Equity)</div>
                                    <div style="font-size:0.8rem; color:#aaa;">Patrimonio dinámico generado por PoW.</div>
                                </div>
                                <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(0,176,255,0.3); padding:15px; border-radius:12px;">
                                    <div style="font-weight:bold; color:var(--accent-blue); margin-bottom:5px;">🔵 Valor (Entregables)</div>
                                    <div style="font-size:0.8rem; color:#aaa;">Productos o servicios ejecutados por la Colla.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="tab-ecosistema" class="tab-content ${this.tab === 'ecosistema' ? 'active' : ''}">
                        <div class="panel">
                            <h2><span style="font-size: 1.8rem; margin-right:10px;">🪐</span> Identidad y Soberanía</h2>
                            <p>Configura las reglas macro de esta red descentralizada. El Kernel aplicará estas políticas a todos los Castells.</p>
                            
                            <div class="form-group">
                                <label>Nombre del Universo Global</label>
                                <input type="text" id="set-eco-name" class="form-control" value="${state.config.ecosystemName}">
                            </div>

                            <div class="form-group">
                                <label>Arquetipo Estructural Base</label>
                                <select id="set-eco-arch" class="form-control" style="color: var(--accent-blue); font-weight:bold;">
                                    <option value="incubator" ${state.config.archetype === 'incubator' ? 'selected' : ''}>🏭 Incubadora Matricial</option>
                                    <option value="holding" ${state.config.archetype === 'holding' ? 'selected' : ''}>🏢 Holding Tradicional</option>
                                    <option value="dao" ${state.config.archetype === 'dao' ? 'selected' : ''}>🤖 DAO (Protocolo Autónomo)</option>
                                    <option value="sos" ${state.config.archetype === 'sos' ? 'selected' : ''}>🆘 S.O.S. (Sistema Social)</option>
                                    <option value="startup" ${state.config.archetype === 'startup' ? 'selected' : ''}>🚀 Startup Ágil</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>System Prompt Maestro (Cerebro IA)</label>
                                <textarea id="set-eco-prompt" class="form-control" style="height: 140px; resize:vertical; line-height: 1.5;">${state.config.globalPrompt}</textarea>
                            </div>

                            <div class="gov-card">
                                <div>
                                    <div style="color: var(--accent-orange); font-weight: 900; margin-bottom: 5px; font-size: 1.1rem; text-transform:uppercase;">Privilegios de Instanciación</div>
                                    <div style="color: #aaa; font-size: 0.9rem; line-height:1.5;">Define quién puede inicializar nuevos proyectos en tu Matrix.</div>
                                </div>
                                <select id="set-creation-mode" class="form-control" style="width: auto; flex-shrink: 0; min-width:200px; border-color:var(--accent-orange);">
                                    <option value="open" ${state.config.projectCreationMode === 'open' ? 'selected' : ''}>🌍 Abierto (Cualquiera)</option>
                                    <option value="templates_only" ${state.config.projectCreationMode === 'templates_only' ? 'selected' : ''}>📦 Solo Plantillas Nativas</option>
                                    <option value="closed" ${state.config.projectCreationMode === 'closed' ? 'selected' : ''}>🔒 Cerrado (Solo Yo)</option>
                                </select>
                            </div>

                            <button class="btn-save" id="btn-save-general" style="margin-top: 2.5rem;">Guardar Leyes del Ecosistema</button>
                        </div>
                    </div>

                    <div id="tab-ia" class="tab-content ${this.tab === 'ia' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-purple);">
                            <h2 style="color: var(--accent-purple);">🧠 Orquestador Cognitivo (API Keys)</h2>
                            <p>Conecta el Kernel V8 con los LLMs externos para dar vida a los botones mágicos (Simulaciones, Pactos Legales, Auto-Ejecución).</p>
                            
                            <div class="ai-grid" style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
                                <div class="form-group">
                                    <label>Motor Neuronal Activo</label>
                                    <select id="inpDefaultProvider" class="form-control" style="color: var(--accent-purple); font-weight:900;">
                                        <option value="deepseek">DeepSeek (V3/R1)</option>
                                        <option value="openai">OpenAI (GPT-4o)</option>
                                        <option value="gemini">Google Gemini</option>
                                        <option value="custom">Servidor Local (LM Studio)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>API Key / Bearer Token</label>
                                    <input type="password" id="inpApiKeyCommon" class="form-control" placeholder="sk-........................">
                                </div>
                            </div>
                            
                            <div id="customEndpointBox" style="display:none; margin-top: 10px; padding: 20px; background: rgba(0,0,0,0.3); border-radius:12px; border:1px dashed #444;">
                                <label style="font-size: 0.8rem; color:var(--text-muted);">URL del Endpoint Local</label>
                                <input type="text" id="inpCustomUrl" class="form-control" placeholder="http://localhost:1234/v1/chat/completions">
                            </div>

                            <button class="btn-save" id="btn-save-keys" style="background: linear-gradient(135deg, #7c4dff, #e040fb); margin-top:2rem;">Forjar Llaves Criptográficas</button>
                            <div id="keysFeedback" style="display:none; color: var(--accent-green); margin-top: 15px; font-size: 0.95rem; font-weight: bold; text-align:center;">✅ Llaves ancladas en memoria local.</div>
                        </div>
                    </div>

                    <div id="tab-users" class="tab-content ${this.tab === 'users' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-blue);">
                            <h2 style="color: var(--accent-blue);">➕ Alta de Nodos al Padrón</h2>
                            <p style="margin-top:0;">Permite a estos usuarios ser reclutados posteriormente en cualquier red del sistema.</p>
                            
                            <div style="background: rgba(0,0,0,0.3); padding:2.5rem; border-radius:16px; border: 1px solid var(--glass-border);">
                                <div class="user-form-grid" style="display: grid; grid-template-columns: 1fr 1.5fr 1.5fr; gap: 20px; align-items: start; margin-bottom: 20px;">
                                    <div class="form-group" style="margin:0;">
                                        <label>Alias (@id)</label>
                                        <input type="text" id="new-user-id" class="form-control" placeholder="Ej: @neo">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Nombre Humano</label>
                                        <input type="text" id="new-user-name" class="form-control" placeholder="Ej: Thomas Anderson">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Contacto / Wallet</label>
                                        <input type="text" id="new-user-contact" class="form-control" placeholder="Email o 0x...">
                                    </div>
                                </div>
                                <button id="btn-create-user" class="btn-save" style="margin-top: 15px;">Añadir al Padrón Global</button>
                            </div>
                        </div>

                        <div class="panel">
                            <h2>Registro Global de Identidades (${state.globalUsers.length})</h2>
                            <div class="user-table-wrapper">
                                <table class="user-table">
                                    <tr>
                                        <th>Alias (@id)</th>
                                        <th>Nombre Real</th>
                                        <th>Privilegios</th>
                                        <th>Contacto / Hub</th>
                                    </tr>
                                    ${state.globalUsers.map(u => `
                                        <tr>
                                            <td style="font-weight: bold; color: var(--accent-blue); font-family: monospace;">${u.id}</td>
                                            <td style="color: white; font-weight: 900;">${u.profile?.isAi ? '🤖 ' : ''}${u.name}</td>
                                            <td style="color: ${u.globalRole === 'ecosystem-owner' ? 'var(--accent-orange)' : '#888'}; font-weight:bold;">${u.globalRole === 'ecosystem-owner' ? '👑 Owner' : (u.profile?.isAi ? 'IA NATIVA' : 'Ciudadano')}</td>
                                            <td style="color: #666; font-size:0.85rem; font-family: monospace;">${u.walletOrSocial || '---'}</td>
                                        </tr>
                                    `).join('')}
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="tab-data" class="tab-content ${this.tab === 'data' ? 'active' : ''}">
                        <div class="panel" style="border-color: #333;">
                            <h2>💾 Control de Memoria Local</h2>
                            <p>El núcleo de TeamTowers V8 funciona 100% en tu navegador (Local-First). Descarga el JSON con tu imperio o formatea el Kernel.</p>
                            
                            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:2.5rem;">
                                <button class="btn-data btn-export" id="btnExport" style="flex:1;">⬇️ Descargar Snapshot (.JSON)</button>
                                <div class="btn-data btn-import" style="flex:1;">
                                    ⬆️ Inyectar Memoria (.JSON)
                                    <input type="file" id="fileInput" accept=".json">
                                </div>
                            </div>

                            <button class="btn-data btn-danger" id="btnNuke">⚠️ DESTRUCCIÓN MUTUA ASEGURADA (Borrar Todo)</button>
                        </div>
                    </div>

                    <div id="tab-ontology" class="tab-content ${this.tab === 'ontology' ? 'active' : ''}">
                        <div class="panel">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 3rem; flex-wrap: wrap; gap:15px;">
                                <div>
                                    <h2 style="margin-bottom:5px;">El ADN Estructural (LMS)</h2>
                                    <p style="margin:0; max-width:600px; font-size:0.9rem;">Estas plantillas de roles y ecosistemas han sido extraídas en tiempo real desde la Base de Conocimiento (IndexedDB).</p>
                                </div>
                            </div>
                            
                            <h3 style="color: var(--accent-blue); margin-top: 3rem; font-size: 1.2rem; border-bottom: 1px solid #333; padding-bottom: 10px; font-weight:900;">📦 Catálogo Inteligente de Ecosistemas</h3>
                            <div class="ontology-grid" id="nativeOntologyGrid">
                                <div style="color:#888; grid-column: 1/-1; padding: 2rem; text-align:center;">Extrayendo genoma semántico desde IndexedDB...</div>
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

        // TABS V8 EVENT SYNC
        window.addEventListener('ph-tab-changed', (e) => {
            this.tab = e.detail.tabId;
            localStorage.setItem('tt_settings_tab', this.tab);
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.tab}`);
            if(target) target.classList.add('active');

            if(this.tab === 'ontology') this.renderOntologyGrids();
            if(this.tab === 'stakeholders') this.renderStakeholderMap();
        });

        if(this.tab === 'ontology') this.renderOntologyGrids();
        if(this.tab === 'stakeholders') this.renderStakeholderMap();

        this.bindContentEvents();
    }

    renderStakeholderMap() {
        const svg = document.getElementById('sh-edges');
        const container = document.getElementById('stakeholderMap');
        if (!svg || !container) return;

        svg.innerHTML = `
            <defs>
                <marker id="arrow-fiat" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#00e676"/></marker>
                <marker id="arrow-slices" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#e040fb"/></marker>
                <marker id="arrow-value" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#00b0ff"/></marker>
            </defs>
        `;

        // Limpiar badges viejos
        container.querySelectorAll('.sh-badge').forEach(b => b.remove());

        const nodes = {
            inv: document.getElementById('node-investor'),
            eo: document.getElementById('node-eo'),
            team: document.getElementById('node-team'),
            cli: document.getElementById('node-client')
        };

        const drawFlow = (n1, n2, typeColor, marker, offsetMultiplier, label) => {
            const r1 = n1.getBoundingClientRect();
            const r2 = n2.getBoundingClientRect();
            const cRect = container.getBoundingClientRect();

            const x1 = r1.left + r1.width/2 - cRect.left;
            const y1 = r1.top + r1.height/2 - cRect.top;
            const x2 = r2.left + r2.width/2 - cRect.left;
            const y2 = r2.top + r2.height/2 - cRect.top;

            const dx = x2 - x1, dy = y2 - y1;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const nx = -dy / dist, ny = dx / dist;

            const offset = offsetMultiplier * 30; // Separar líneas de ida y vuelta
            const cx = (x1 + x2) / 2 + nx * offset;
            const cy = (y1 + y2) / 2 + ny * offset;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
            path.setAttribute('marker-end', `url(#${marker})`);
            path.style.fill = 'none';
            path.style.stroke = typeColor;
            path.style.strokeWidth = '3';
            if (typeColor === '#e040fb' || typeColor === '#00b0ff') path.style.strokeDasharray = '6,6'; // Intangibles/Slices punteados
            
            svg.appendChild(path);

            // Badge Label
            const badge = document.createElement('div');
            badge.className = 'sh-badge';
            badge.style.left = `${(x1 + cx + x2)/3}px`;
            badge.style.top = `${(y1 + cy + y2)/3}px`;
            badge.style.backgroundColor = typeColor;
            badge.innerText = label;
            container.appendChild(badge);
        };

        // Redibujar después de un tick para que los nodos tengan dimensiones finales
        setTimeout(() => {
            // Flujos de Capital (Verde)
            drawFlow(nodes.inv, nodes.eo, '#00e676', 'arrow-fiat', -1, 'Capital (€)');
            drawFlow(nodes.cli, nodes.eo, '#00e676', 'arrow-fiat', 1, 'Ingresos (€)');
            
            // Flujos de Slices/SBTs (Morado)
            drawFlow(nodes.eo, nodes.inv, '#e040fb', 'arrow-slices', -1, 'Equity (Slices)');
            drawFlow(nodes.eo, nodes.team, '#e040fb', 'arrow-slices', 1, 'Slices / SBTs');
            
            // Flujos de Valor Productivo (Azul)
            drawFlow(nodes.eo, nodes.team, '#00b0ff', 'arrow-value', -1, 'Visión / Directriz');
            drawFlow(nodes.team, nodes.cli, '#00b0ff', 'arrow-value', -1, 'Entregables (SaaS)');
        }, 100);
    }

    bindContentEvents() {
        const state = store.getState();

        document.getElementById('btn-save-general')?.addEventListener('click', async () => {
            const ecosystemName = document.getElementById('set-eco-name').value;
            const globalPrompt = document.getElementById('set-eco-prompt').value;
            const projectCreationMode = document.getElementById('set-creation-mode').value;
            const arch = document.getElementById('set-eco-arch').value;
            
            await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { ecosystemName, globalPrompt, projectCreationMode, archetype: arch } });
            alert("✅ Sistema Re-Calibrado Exitosamente.");
            window.location.reload();
        });

        // AI KEYS LOGIC
        const uiKeys = {
            provider: document.getElementById('inpDefaultProvider'),
            apiKey: document.getElementById('inpApiKeyCommon'),
            customUrl: document.getElementById('inpCustomUrl'),
            boxCustom: document.getElementById('customEndpointBox'),
            btnSave: document.getElementById('btn-save-keys'),
            feedback: document.getElementById('keysFeedback')
        };

        if (uiKeys.provider) {
            const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            uiKeys.provider.value = savedProvider;
            
            const loadKey = (prov) => {
                if (prov === 'deepseek') return localStorage.getItem('tt_key_deepseek') || '';
                if (prov === 'openai') return localStorage.getItem('tt_key_openai') || '';
                if (prov === 'gemini') return localStorage.getItem('tt_key_gemini') || '';
                return '';
            };
            uiKeys.apiKey.value = loadKey(savedProvider);
            uiKeys.boxCustom.style.display = savedProvider === 'custom' ? 'block' : 'none';

            uiKeys.provider.addEventListener('change', (e) => {
                const p = e.target.value;
                uiKeys.boxCustom.style.display = p === 'custom' ? 'block' : 'none';
                uiKeys.apiKey.value = loadKey(p);
            });

            uiKeys.btnSave.addEventListener('click', () => {
                const p = uiKeys.provider.value;
                localStorage.setItem('tt_ai_provider', p);
                if (p === 'deepseek') localStorage.setItem('tt_key_deepseek', uiKeys.apiKey.value.trim());
                if (p === 'openai') localStorage.setItem('tt_key_openai', uiKeys.apiKey.value.trim());
                if (p === 'gemini') localStorage.setItem('tt_key_gemini', uiKeys.apiKey.value.trim());
                
                uiKeys.feedback.style.display = 'block';
                setTimeout(() => uiKeys.feedback.style.display = 'none', 3000);
            });
        }

        // ADD GLOBAL USER
        document.getElementById('btn-create-user')?.addEventListener('click', async () => {
            let id = document.getElementById('new-user-id').value.trim();
            const name = document.getElementById('new-user-name').value.trim();
            const contact = document.getElementById('new-user-contact').value.trim();
            
            if (!id || !name) return alert("⚠️ Alias y Nombre son obligatorios.");
            if (!id.startsWith('@')) id = '@' + id; 

            await store.dispatch({ type: 'ADD_USER', payload: { id, name, walletOrSocial: contact } });
            window.location.reload(); 
        });

        // DATA MANAGEMENT
        document.getElementById('btnExport')?.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.getState(), null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `TeamTowers_OS_V8_Snapshot_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        });

        document.getElementById('fileInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedState = JSON.parse(event.target.result);
                    if (importedState && importedState.projects) {
                        if (confirm("⚠️ Importar sobreescribirá todos los datos actuales del Kernel V8. ¿Proceder?")) {
                            store.state = importedState;
                            localStorage.setItem('tt_sos_v8_state', JSON.stringify(store.state));
                            window.location.href = '/v8/';
                        }
                    } else { alert("❌ JSON inválido o estructura antigua no compatible."); }
                } catch (err) { alert("❌ Error de lectura criptográfica."); }
            };
            reader.readAsText(file);
        });

        document.getElementById('btnNuke')?.addEventListener('click', () => {
            if (confirm("🚨 PROTOCOLO OMEGA: Esto borrará TODOS los proyectos y vaciará el Kernel. ¿Estás seguro?")) {
                localStorage.removeItem('tt_sos_v8_state');
                window.location.href = '/v8/';
            }
        });
    }

    async renderOntologyGrids() {
        const nativeGrid = document.getElementById('nativeOntologyGrid');
        if(!nativeGrid) return;

        // 1. Extraemos los sectores VIVOS de la base de conocimiento
        await KB.init();
        this.sectorsFromKB = await KB.getAvailableSectors();
        const sectorKeys = Object.keys(this.sectorsFromKB);

        if (sectorKeys.length === 0) {
            nativeGrid.innerHTML = `<div style="grid-column:1/-1; padding:3rem; text-align:center; border:1px dashed #444; border-radius:16px;">El Cerebro Semántico está vacío. Inicia el sistema o usa el LMS para inyectar conocimiento.</div>`;
            return;
        }

        const renderRoleData = (lvl, data) => {
            let delivsHtml = '';
            if (data.deliverables && data.deliverables.length > 0) {
                delivsHtml = data.deliverables.map(d => {
                    const tipoColor = d.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                    return `<div class="deliv-badge" style="color:${tipoColor}; border-color:${tipoColor}; opacity:0.9;">${d.estimatedHours}h | ${d.name}</div>`;
                }).join(' ');
            }
            return `
                <div style="border-bottom: 1px dashed rgba(255,255,255,0.05); padding: 12px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; gap:10px;">
                        <span style="font-family:var(--font-mono); font-size:0.75rem; color:#888; font-weight:bold; background:rgba(0,0,0,0.4); padding:2px 6px; border-radius:4px;">${lvl}</span>
                        <b style="color:white; font-size:0.9rem; text-align:right;">${data.name}</b>
                    </div>
                    <div style="margin-top:8px;">${delivsHtml}</div>
                </div>
            `;
        };

        nativeGrid.innerHTML = sectorKeys.map(key => {
            const sectorData = this.sectorsFromKB[key]; 
            return `
            <div class="sector-card native">
                <h3 style="color:#00b0ff;">${sectorData.label.toUpperCase()}</h3>
                <div style="display: flex; flex-direction: column; gap: 5px; flex:1; opacity:0.8;">
                    ${Object.entries(sectorData.roles).map(([lvl, roleData]) => renderRoleData(lvl, roleData)).join('')}
                </div>
                <button class="btn-save btn-use-template" data-sector="${key}" style="margin-top:2.5rem; background:rgba(0,176,255,0.1); border: 1px dashed var(--accent-blue); color:var(--accent-blue); font-size:0.95rem; box-shadow:none;">🚀 Instanciar Red (V8)</button>
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
