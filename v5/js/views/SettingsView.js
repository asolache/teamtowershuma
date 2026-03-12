// v5/js/views/SettingsView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

let GLOBAL_ONTOLOGY = {};
try {
    const ontologyModule = require('../data/ontology.js');
    GLOBAL_ONTOLOGY = ontologyModule.GLOBAL_ONTOLOGY || {};
} catch(e) {
    console.warn("Cargando sin GLOBAL_ONTOLOGY externa.");
}

export default class SettingsView {
    constructor() {
        document.title = "Configuración Ecosistema | TeamTowers SOS";
        this.tab = localStorage.getItem('tt_settings_tab') || 'ecosistema';
    }

    async getHtml() {
        const state = store.getState();
        const isEcosystemOwner = state.session.role === 'ecosystem-owner';
        
        if (!isEcosystemOwner) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/settings')}
                    <main class="workspace-settings" style="display:flex; justify-content:center; align-items:center;">
                        <div style="text-align:center; background: rgba(255,82,82,0.05); padding: 3rem; border-radius: 24px; border: 1px dashed var(--accent-red); max-width: 500px; box-sizing: border-box; backdrop-filter: blur(10px);">
                            <div style="font-size:4rem; margin-bottom:1rem; line-height:1;">🔒</div>
                            <h2 style="color:var(--accent-red); margin-top:0; font-weight:900; letter-spacing:-1px;">Acceso Restringido</h2>
                            <p style="color:var(--text-muted); line-height: 1.6;">Solo el Master Architect (Ecosystem Owner) tiene acceso a la consola de gobernanza macro y configuración del Kernel.</p>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/settings')}
                </div>
            `;
        }

        const headerConfig = {
            title: "Settings",
            subtitle: "Kernel V11",
            tagline: "Gobernanza Fractal, Orquestación IA y Control P2P de la Red.",
            tabs: [
                { id: 'ecosistema', label: '🪐 Gobernanza', active: this.tab === 'ecosistema' },
                { id: 'users', label: '👥 Padrón Global', active: this.tab === 'users' },
                { id: 'ia', label: '🧠 Motor IA', active: this.tab === 'ia' },
                { id: 'ontology', label: '🧬 ADN Base', active: this.tab === 'ontology' },
                { id: 'data', label: '💾 Web3 & Datos', active: this.tab === 'data' }
            ]
        };

        return `
            <style>
                /* FIX SCROLL LATERAL: overflow-x: hidden estricto */
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-settings { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%; background: radial-gradient(circle at top right, #111116 0%, #050505 100%);}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 2rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                /* =========================================================
                   PANELES LUXURY
                   ========================================================= */
                .panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 3rem; margin-bottom: 2.5rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(15px); width: 100%; box-sizing: border-box;}
                .panel h2 { color: white; font-size: 1.5rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; font-weight: 900; letter-spacing: -0.5px;}
                .panel p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }

                /* FORMS LUXURY */
                .form-group { margin-bottom: 25px; }
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 16px 20px; border-radius: 12px; font-family: var(--font-mono); font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.2), inset 0 2px 5px rgba(0,0,0,0.5);}
                
                .btn-save { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 16px 30px; border-radius: 12px; font-weight: 900; font-size: 1.05rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(0, 176, 255, 0.2); width: 100%; text-transform: uppercase; letter-spacing: 1px;}
                .btn-save:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(224, 64, 251, 0.4); filter: brightness(1.1);}

                /* TOGGLE SWITCH V11 */
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

                /* TABLA USUARIOS (RESPONSIVE FIX) */
                .user-table-wrapper { overflow-x: auto; background: rgba(0,0,0,0.4); border-radius: 16px; border: 1px solid #333; width: 100%;}
                .user-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; text-align: left; min-width: 600px;}
                .user-table th { padding: 18px 15px; border-bottom: 1px solid #444; color: var(--text-muted); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; font-weight:900;}
                .user-table td { padding: 15px; border-bottom: 1px dashed rgba(255,255,255,0.05); color: #ccc;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE MOBILE (FIELD APP - BOTTOM SAFE)
                   ========================================================= */
                @media (max-width: 1024px) { 
                    .ontology-grid, .agents-grid { grid-template-columns: 1fr 1fr; }
                }
                
                @media (max-width: 768px) { 
                    .workspace-settings { 
                        padding: 90px 1rem 120px 1rem; /* 120px Bottom Safe iOS */
                    } 
                    .panel { padding: 1.5rem; border-radius: 20px;}
                    .ontology-grid, .agents-grid { grid-template-columns: 1fr; }
                    
                    /* Formularios Apilados */
                    .ai-grid, .user-form-grid, .location-form-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
                    
                    /* Governance Card apilada */
                    .gov-card { flex-direction: column; align-items: flex-start; padding: 1.5rem;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/settings')}
                
                <main class="workspace-settings">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-ecosistema" class="tab-content ${this.tab === 'ecosistema' ? 'active' : ''}">
                        <div class="panel">
                            <h2><span style="font-size: 1.8rem; margin-right:10px;">🪐</span> Identidad y Soberanía</h2>
                            <p>Configura las reglas macro de esta red descentralizada. El Kernel aplicará estas políticas de Gobernanza a todos los Castells.</p>
                            
                            <div class="form-group">
                                <label>Nombre del Universo (Ecosistema Global)</label>
                                <input type="text" id="set-eco-name" class="form-control" value="${state.config.ecosystemName}">
                            </div>

                            <div class="form-group">
                                <label>Arquetipo Estructural Base</label>
                                <select class="form-control" style="color: var(--accent-blue); font-weight:bold;">
                                    <option value="incubator" ${state.config.archetype === 'incubator' ? 'selected' : ''}>🏭 Incubadora / Aceleradora Matricial</option>
                                    <option value="holding" ${state.config.archetype === 'holding' ? 'selected' : ''}>🏢 Holding Empresarial Tradicional</option>
                                    <option value="dao" ${state.config.archetype === 'dao' ? 'selected' : ''}>🤖 DAO (Organización Autónoma)</option>
                                    <option value="sos" ${state.config.archetype === 'sos' ? 'selected' : ''}>🆘 S.O.S. (Sistema Social Comunitario)</option>
                                    <option value="startup" ${state.config.archetype === 'startup' ? 'selected' : ''}>🚀 Startup Ágil</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>System Prompt Maestro (Propósito de la IA Global)</label>
                                <textarea id="set-eco-prompt" class="form-control" style="height: 140px; resize:vertical; line-height: 1.5;">${state.config.globalPrompt}</textarea>
                            </div>

                            <div class="gov-card">
                                <div>
                                    <div style="color: var(--accent-orange); font-weight: 900; margin-bottom: 5px; font-size: 1.1rem; text-transform:uppercase;">Gobernanza V11: Creación de Castells</div>
                                    <div style="color: #aaa; font-size: 0.9rem; line-height:1.5;">Define quién tiene permiso para instanciar nuevos proyectos en el Ecosistema.</div>
                                </div>
                                <select id="set-creation-mode" class="form-control" style="width: auto; flex-shrink: 0; min-width:200px; border-color:var(--accent-orange);">
                                    <option value="open" ${state.config.projectCreationMode === 'open' ? 'selected' : ''}>🌍 Abierto (Todos)</option>
                                    <option value="templates_only" ${state.config.projectCreationMode === 'templates_only' ? 'selected' : ''}>📦 Solo Plantillas</option>
                                    <option value="closed" ${state.config.projectCreationMode === 'closed' ? 'selected' : ''}>🔒 Cerrado (Solo Owner)</option>
                                </select>
                            </div>

                            <button class="btn-save" id="btn-save-general" style="margin-top: 2.5rem;">Guardar Configuración Macro</button>
                        </div>
                    </div>

                    <div id="view-ia" class="tab-content ${this.tab === 'ia' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-purple);">
                            <h2 style="color: var(--accent-purple);">🧠 Orquestador Cognitivo (APIs)</h2>
                            <p>Conecta el Kernel con proveedores de IA para activar el diseño automático de VNA y los Agentes Resolutores.</p>
                            
                            <div class="ai-grid" style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
                                <div class="form-group">
                                    <label>Motor Neuronal Activo</label>
                                    <select id="inpDefaultProvider" class="form-control" style="color: var(--accent-purple); font-weight:900;">
                                        <option value="deepseek">DeepSeek (V3/R1)</option>
                                        <option value="openai">OpenAI (GPT-4o)</option>
                                        <option value="gemini">Google Gemini</option>
                                        <option value="custom">Servidor Local / Custom</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>API Key / Bearer Token</label>
                                    <input type="password" id="inpApiKeyCommon" class="form-control" placeholder="sk-........................">
                                </div>
                            </div>
                            
                            <div id="customEndpointBox" style="display:none; margin-top: 10px; padding: 20px; background: rgba(0,0,0,0.3); border-radius:12px; border:1px dashed #444;">
                                <label style="font-size: 0.8rem; color:var(--text-muted);">URL del Endpoint (Ej: LM Studio / Ollama)</label>
                                <input type="text" id="inpCustomUrl" class="form-control" placeholder="http://localhost:1234/v1/chat/completions">
                            </div>

                            <button class="btn-save" id="btn-save-keys" style="background: linear-gradient(135deg, #7c4dff, #e040fb); margin-top:2rem;">Guardar Llaves Criptográficas</button>
                            <div id="keysFeedback" style="display:none; color: var(--accent-green); margin-top: 15px; font-size: 0.95rem; font-weight: bold; text-align:center;">✅ Guardado Seguro en LocalStorage (No se envía a Servidores).</div>
                        </div>

                        <div class="panel" style="border-color: #333;">
                            <h2 style="color: white;">🤖 Enjambre de Agentes (V11 Status)</h2>
                            <p style="color:#aaa; margin-bottom: 2rem;">El Ecosistema instancia agentes especializados para cada capa fractal de la organización.</p>
                            
                            <div class="agents-grid">
                                <div class="sector-card" style="border-top-color: var(--accent-orange);">
                                    <h3 style="color:var(--accent-orange);">Agente de Ecosistema</h3>
                                    <p style="font-size:0.9rem; color:#ccc; flex:1; line-height:1.5;">Audita la resiliencia global y la transferencia de valor financiero entre proyectos cruzados.</p>
                                    <div style="font-size:0.8rem; font-family:var(--font-mono); color:var(--text-muted); margin-top:1rem; border:1px dashed #444; padding:8px; text-align:center; border-radius:8px;">Estado: Bloqueado (V12)</div>
                                </div>
                                <div class="sector-card" style="border-top-color: var(--accent-blue);">
                                    <h3 style="color:var(--accent-blue);">Agente de Proyecto</h3>
                                    <p style="font-size:0.9rem; color:#ccc; flex:1; line-height:1.5;">El <i>Project Owner IA</i>. Analiza cuellos de botella en el Kanban V10 y genera pactos Slicing Pie.</p>
                                    <div style="font-size:0.8rem; font-family:var(--font-mono); color:var(--accent-green); margin-top:1rem; border:1px solid rgba(0,230,118,0.3); padding:8px; text-align:center; border-radius:8px; background:rgba(0,230,118,0.05);">Estado: Operativo (Dashboard)</div>
                                </div>
                                <div class="sector-card" style="border-top-color: var(--accent-green);">
                                    <h3 style="color:var(--accent-green);">Agente de Persona</h3>
                                    <p style="font-size:0.9rem; color:#ccc; flex:1; line-height:1.5;">Lee la <i>Identidad Fractal</i> (Ikigai) y sugiere oportunidades de PULL en el mercado de tareas.</p>
                                    <div style="font-size:0.8rem; font-family:var(--font-mono); color:var(--text-muted); margin-top:1rem; border:1px dashed #444; padding:8px; text-align:center; border-radius:8px;">Estado: Bloqueado (V12)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="view-users" class="tab-content ${this.tab === 'users' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-blue);">
                            <h2 style="color: var(--accent-blue);">➕ Inyectar Nodo Local al Padrón</h2>
                            <p style="margin-top:0;">Da de alta usuarios en el Padrón Global para que puedan ser reclutados por cualquier Castell.</p>
                            
                            <div style="background: rgba(0,0,0,0.3); padding:2.5rem; border-radius:16px; border: 1px solid #333;">
                                <div class="user-form-grid" style="display: grid; grid-template-columns: 1fr 1.5fr 1.5fr; gap: 20px; align-items: start; margin-bottom: 20px;">
                                    <div class="form-group" style="margin:0;">
                                        <label>Alias Único (@id)</label>
                                        <input type="text" id="new-user-id" class="form-control" placeholder="Ej: @maria_dev">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Nombre Completo</label>
                                        <input type="text" id="new-user-name" class="form-control" placeholder="Ej: María López">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Contacto / Web3 Wallet</label>
                                        <input type="text" id="new-user-contact" class="form-control" placeholder="Email o Dirección 0x">
                                    </div>
                                </div>
                                <div class="location-form-grid" style="display: grid; grid-template-columns: 1fr 1fr 100px 200px; gap: 20px; align-items: end; padding-top: 20px; border-top: 1px dashed #444;">
                                    <div class="form-group" style="margin:0;">
                                        <label>País</label>
                                        <input type="text" id="new-user-country" class="form-control" placeholder="Ej: España">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Ciudad</label>
                                        <input type="text" id="new-user-city" class="form-control" placeholder="Ej: Barcelona">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>C. Postal</label>
                                        <input type="text" id="new-user-cp" class="form-control" placeholder="08001">
                                    </div>
                                    <button id="btn-create-user" class="btn-save" style="padding: 16px; margin:0;">Inyectar</button>
                                </div>
                            </div>
                        </div>

                        <div class="panel">
                            <h2>Registro Global de Identidades (${state.globalUsers.length})</h2>
                            <div class="user-table-wrapper">
                                <table class="user-table">
                                    <tr>
                                        <th>Alias (@id)</th>
                                        <th>Nombre Real</th>
                                        <th>Rol Global</th>
                                        <th>Localización</th>
                                        <th>Wallet / Contacto</th>
                                    </tr>
                                    ${state.globalUsers.map(u => `
                                        <tr>
                                            <td style="font-weight: bold; color: var(--accent-blue); font-family: monospace;">${u.id}</td>
                                            <td style="color: white; font-weight: 900;">${u.name}</td>
                                            <td style="color: ${u.globalRole === 'ecosystem-owner' ? 'var(--accent-orange)' : '#888'}; font-weight:bold;">${u.globalRole === 'ecosystem-owner' ? '👑 Owner' : 'Ciudadano'}</td>
                                            <td style="color: #aaa; font-size:0.85rem;">${u.location?.city ? `📍 ${u.location.city}, ${u.location.country}` : '<span style="color:#555; font-style:italic;">Desconocida</span>'}</td>
                                            <td style="color: #666; font-size:0.85rem; font-family: monospace;">${u.walletOrSocial || '---'}</td>
                                        </tr>
                                    `).join('')}
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="view-data" class="tab-content ${this.tab === 'data' ? 'active' : ''}">
                        <div class="panel" style="border-color: #333;">
                            <h2>💾 Gestión Local y Backups</h2>
                            <p>El sistema es 100% Local y Privado. El estado del Kernel V11 vive en tu navegador. Haz copias de seguridad de la base de datos JSON periódicamente.</p>
                            
                            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:2.5rem;">
                                <button class="btn-data btn-export" id="btnExport" style="flex:1;">⬇️ Descargar JSON (Backup)</button>
                                <div class="btn-data btn-import" style="flex:1;">
                                    ⬆️ Restaurar Kernel (Cargar JSON)
                                    <input type="file" id="fileInput" accept=".json">
                                </div>
                            </div>

                            <button class="btn-data btn-danger" id="btnNuke">⚠️ Formatear Kernel (Borrar Toda la Base de Datos)</button>
                        </div>

                        <div class="panel" style="background: linear-gradient(135deg, rgba(224, 64, 251, 0.05), rgba(0, 176, 255, 0.05)); border: 1px solid rgba(224, 64, 251, 0.3);">
                            <h2 style="color:var(--accent-purple);">☁️ TeamTowers Anchor (Permaweb)</h2>
                            <p style="color:#ddd; font-size:1.05rem;">Conecta tu Kernel Local a la red Arweave para persistencia inmutable y orquestación multi-jugador real.</p>
                            <ul style="list-style:none; padding:0; color:#aaa; font-size:0.95rem; line-height:2; margin-bottom: 2.5rem;">
                                <li><span style="color:var(--accent-green); margin-right:10px; font-size:1.2rem; font-weight:bold;">✓</span> <strong>Sincronización P2P:</strong> Multi-usuario sin servidores centrales.</li>
                                <li><span style="color:var(--accent-green); margin-right:10px; font-size:1.2rem; font-weight:bold;">✓</span> <strong>Notaría Web3:</strong> Sella el Ledger en Blockchain para inversores.</li>
                            </ul>
                            <button class="btn-save" style="background:transparent; border: 1px dashed var(--accent-purple); color:var(--accent-purple); width:100%; box-shadow:none;">Módulo en Desarrollo (V12)</button>
                        </div>
                    </div>

                    <div id="view-ontology" class="tab-content ${this.tab === 'ontology' ? 'active' : ''}">
                        <div class="panel">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 3rem; flex-wrap: wrap; gap:15px;">
                                <div>
                                    <h2 style="margin-bottom:5px;">Plantillas de Ecosistema (ADN Base)</h2>
                                    <p style="margin:0; max-width:600px; font-size:0.9rem;">El código fuente de tus redes. Las plantillas incluyen Roles y Flujos VNA teóricos listos para ser instanciados en el Orquestador.</p>
                                </div>
                                <button class="btn-save" id="btn-new-sector" style="background:var(--accent-green); color:black; width:auto;">➕ Diseñar Plantilla IA</button>
                            </div>
                            
                            <h3 style="color: var(--accent-blue); margin-top: 3rem; font-size: 1.2rem; border-bottom: 1px solid #333; padding-bottom: 10px; font-weight:900;">🌟 Tus Plantillas Privadas</h3>
                            <div class="ontology-grid" id="customOntologyGrid"></div>

                            <h3 style="color: #888; margin-top: 4rem; font-size: 1.2rem; border-bottom: 1px solid #333; padding-bottom: 10px; font-weight:900;">📦 Plantillas Nativas (Kernel V11)</h3>
                            <div class="ontology-grid" id="nativeOntologyGrid"></div>
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

        const tabsBtns = document.querySelectorAll('.ph-tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabsBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabsBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => content.classList.remove('active'));
                
                const targetId = `view-${btn.dataset.tab}`;
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                this.tab = btn.dataset.tab;
                localStorage.setItem('tt_settings_tab', this.tab);

                if(this.tab === 'ontology') this.renderOntologyGrids();
            });
        });

        if(this.tab === 'ontology') this.renderOntologyGrids();

        this.bindContentEvents();
    }

    bindContentEvents() {
        const state = store.getState();

        document.getElementById('btn-save-general')?.addEventListener('click', async () => {
            const ecosystemName = document.getElementById('set-eco-name').value;
            const globalPrompt = document.getElementById('set-eco-prompt').value;
            const projectCreationMode = document.getElementById('set-creation-mode').value; // V11 GOV
            
            await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { ecosystemName, globalPrompt, projectCreationMode } });
            alert("✅ Configuración y Gobernanza Macro Guardadas.");
            window.location.reload();
        });

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

        const btnCreateUser = document.getElementById('btn-create-user');
        if (btnCreateUser) {
            btnCreateUser.addEventListener('click', async () => {
                let id = document.getElementById('new-user-id').value.trim();
                const name = document.getElementById('new-user-name').value.trim();
                const contact = document.getElementById('new-user-contact').value.trim();
                const location = {
                    country: document.getElementById('new-user-country').value.trim(),
                    city: document.getElementById('new-user-city').value.trim(),
                    cp: document.getElementById('new-user-cp').value.trim()
                };

                if (!id || !name) return alert("⚠️ Alias y Nombre son obligatorios.");
                if (!id.startsWith('@')) id = '@' + id; 

                await store.dispatch({ type: 'ADD_USER', payload: { id, name, walletOrSocial: contact, location } });
                window.location.reload(); 
            });
        }

        document.getElementById('btnExport')?.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.getState(), null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `TeamTowers_OS_V11_Backup_${new Date().toISOString().split('T')[0]}.json`;
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
                        if (confirm("⚠️ Importar sobreescribirá todos los datos actuales del Kernel. ¿Proceder?")) {
                            store.state = importedState;
                            localStorage.setItem('tt_sos_state', JSON.stringify(store.state));
                            window.location.href = '/v5/';
                        }
                    } else { alert("❌ JSON inválido o estructura antigua no compatible."); }
                } catch (err) { alert("❌ Error de lectura criptográfica."); }
            };
            reader.readAsText(file);
        });

        document.getElementById('btnNuke')?.addEventListener('click', () => {
            if (confirm("🚨 PROTOCOLO OMEGA: Esto borrará TODOS los proyectos y vaciará el Kernel. ¿Estás seguro?")) {
                localStorage.removeItem('tt_sos_state');
                window.location.href = '/v5/';
            }
        });

        document.getElementById('btn-new-sector')?.addEventListener('click', () => {
            window.location.href = '/v5/create'; 
        });
    }

    renderOntologyGrids() {
        const state = store.getState();
        const customSectores = state.ontology?.sectores || {};
        const nativeSectores = GLOBAL_ONTOLOGY || {};

        const customGrid = document.getElementById('customOntologyGrid');
        const nativeGrid = document.getElementById('nativeOntologyGrid');
        
        if(!customGrid || !nativeGrid) return;

        const renderRoleData = (lvl, data) => {
            let delivsHtml = '';
            if (data.standard_deliverables && data.standard_deliverables.length > 0) {
                delivsHtml = data.standard_deliverables.map(d => {
                    const tipoColor = d.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                    return `<div class="deliv-badge" style="color:${tipoColor}; border-color:${tipoColor}; opacity:0.9;">${d.to || '?'} | ${d.estimatedHours}h | ${d.tipo || 'tangible'}</div>`;
                }).join(' ');
            }
            return `
                <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 12px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; gap:10px;">
                        <span style="font-family:var(--font-mono); font-size:0.75rem; color:#888; font-weight:bold; background:rgba(0,0,0,0.4); padding:2px 6px; border-radius:4px;">${lvl}</span>
                        <b style="color:white; font-size:1rem; text-align:right;">${data.name} ${data.guardian ? `<span style="color:var(--accent-orange); font-weight:bold; font-size:0.75rem; text-transform:uppercase;">[${data.guardian}]</span>` : ''}</b>
                    </div>
                    <div style="margin-top:8px;">${delivsHtml}</div>
                </div>
            `;
        };

        const customKeys = Object.keys(customSectores).filter(k => k !== '_meta');
        if(customKeys.length === 0) {
            customGrid.innerHTML = '<div style="color:var(--text-muted); grid-column: 1/-1; padding:3rem; border: 1px dashed #333; text-align:center; border-radius:16px; background: rgba(0,0,0,0.3); font-size:1.1rem;">Aún no has diseñado plantillas propias para este ecosistema.</div>';
        } else {
            customGrid.innerHTML = customKeys.map(key => {
                const roles = customSectores[key];
                return `
                <div class="sector-card">
                    <h3>${key.toUpperCase().replace(/_/g, ' ')}</h3>
                    <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                        ${Object.entries(roles).filter(([k])=> k !== '_meta' && k !== 'roles').map(([lvl, data]) => renderRoleData(data.levelId || lvl, data)).join('')}
                    </div>
                    <button class="btn-save btn-use-template" data-sector="custom_${key}" style="margin-top:2.5rem; background:var(--accent-blue); color:black; font-size:1rem;">🚀 Instanciar Red (DAO)</button>
                </div>
            `}).join('');
        }

        const nativeKeys = Object.keys(nativeSectores).filter(k => k !== '_meta');
        nativeGrid.innerHTML = nativeKeys.map(key => {
            const data = nativeSectores[key];
            const rolesObj = data.roles || data; 
            
            return `
            <div class="sector-card native">
                <h3 style="color:#aaa;">${key.toUpperCase().replace(/_/g, ' ')}</h3>
                <div style="display: flex; flex-direction: column; gap: 5px; flex:1; opacity:0.8;">
                    ${Object.entries(rolesObj).filter(([k])=> k !== '_meta' && k !== 'roles').map(([lvl, roleData]) => renderRoleData(roleData.levelId || lvl, roleData)).join('')}
                </div>
                <button class="btn-save btn-use-template" data-sector="native_${key}" style="margin-top:2.5rem; background:rgba(255,255,255,0.05); border: 1px dashed #888; color:#ccc; font-size:1rem; box-shadow:none;">🚀 Instanciar Red (DAO)</button>
            </div>
            `
        }).join('');

        document.querySelectorAll('.btn-use-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sector = e.currentTarget.dataset.sector;
                window.location.href = `/v5/create?sector=${sector}`;
            });
        });
    }
}
