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
                    <main class="workspace" style="display:flex; justify-content:center; align-items:center;">
                        <div style="text-align:center; background: rgba(0,0,0,0.5); padding: 3rem; border-radius: 12px; border: 1px solid #333;">
                            <div style="font-size:4rem; margin-bottom:1rem;">🔒</div>
                            <h2 style="color:white; margin-top:0;">Acceso Restringido</h2>
                            <p style="color:var(--text-muted); max-width: 400px; margin: 0 auto;">Solo el Master Architect de este Ecosistema puede acceder a la sala de máquinas.</p>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/settings')}
                </div>
            `;
        }

        const headerConfig = {
            title: "Configuración",
            subtitle: "Global",
            tagline: "Panel de control fractal: IA, Padrón y Orquestación del Ecosistema.",
            tabs: [
                { id: 'ecosistema', label: '🪐 Ecosistema', active: this.tab === 'ecosistema' },
                { id: 'ia', label: '🧠 Agentes IA', active: this.tab === 'ia' },
                { id: 'users', label: '👥 Padrón', active: this.tab === 'users' },
                { id: 'data', label: '💾 Data & Web3', active: this.tab === 'data' },
                { id: 'ontology', label: '🧬 ADN Base', active: this.tab === 'ontology' }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; height: 100%; box-sizing: border-box; scroll-behavior: smooth;}
                
                .tab-content { display: none; animation: fadeIn 0.3s ease-out; padding-bottom: 2rem; }
                .tab-content.active { display: block; }

                /* PANELES LUXURY */
                .panel { background: rgba(255,255,255,0.015); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2.5rem; margin-bottom: 2.5rem; box-shadow: 0 10px 40px rgba(0,0,0,0.2); backdrop-filter: blur(10px);}
                .panel h2 { color: white; font-size: 1.3rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; font-weight: 800; letter-spacing: -0.5px;}
                .panel p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; }

                /* FORMS LUXURY */
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 14px 18px; border-radius: 12px; font-family: var(--font-mono); font-size: 0.95rem; transition: all 0.3s; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.1);}
                
                .btn-save { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(0, 176, 255, 0.2);}
                .btn-save:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 25px rgba(224, 64, 251, 0.4); filter: brightness(1.1);}

                /* TOGGLE SWITCH */
                .switch { position: relative; display: inline-block; width: 50px; height: 28px; flex-shrink: 0;}
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--accent-orange); box-shadow: 0 0 10px rgba(255, 171, 64, 0.5);}
                input:checked + .slider:before { transform: translateX(22px); }

                /* DATOS & BACKUPS */
                .btn-data { width: 100%; padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: all 0.3s; display: flex; justify-content: center; align-items: center; gap: 10px; border: none; margin-bottom: 10px;}
                .btn-export { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.3); }
                .btn-export:hover { background: rgba(0, 230, 118, 0.2); transform: translateY(-2px); }
                .btn-import { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.3); position: relative; overflow: hidden; }
                .btn-import:hover { background: rgba(0, 176, 255, 0.2); transform: translateY(-2px); }
                .btn-danger { background: rgba(255, 82, 82, 0.1); color: var(--accent-red); border: 1px dashed rgba(255, 82, 82, 0.3); margin-top: 2rem;}
                .btn-danger:hover { background: rgba(255, 82, 82, 0.2); }
                #fileInput { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

                /* ONTOLOGÍA Y AGENTES */
                .ontology-grid, .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;}
                
                .sector-card { background: rgba(20, 20, 25, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.8rem; border-left: 4px solid var(--accent-blue); display:flex; flex-direction:column; backdrop-filter: blur(10px); transition: transform 0.3s;}
                .sector-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.1); box-shadow: 0 10px 20px rgba(0,0,0,0.3);}
                .sector-card.native { border-left-color: #555; background: rgba(0,0,0,0.5); border-color: #222;}
                .sector-card h3 { margin: 0 0 10px 0; text-transform: uppercase; font-size: 1.2rem; color: white; font-weight: 800;}
                .deliv-badge { background: rgba(0,0,0,0.4); border: 1px solid #333; font-size: 0.7rem; color: var(--accent-green); padding: 4px 8px; border-radius: 8px; margin-top: 6px; display: inline-block; font-family: monospace;}

                /* TABLA USUARIOS (RESPONSIVE) */
                .user-table-wrapper { overflow-x: auto; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px solid #333;}
                .user-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; text-align: left; min-width: 600px;}
                .user-table th { padding: 15px; border-bottom: 1px solid #444; color: var(--text-muted); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;}
                .user-table td { padding: 15px; border-bottom: 1px dashed rgba(255,255,255,0.05); }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

                /* RESPONSIVE MOBILE */
                @media (max-width: 768px) { 
                    .workspace { padding: 80px 1rem 90px 1rem; } 
                    .panel { padding: 1.5rem; border-radius: 16px;}
                    .ai-grid { grid-template-columns: 1fr; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/settings')}
                
                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-ecosistema" class="tab-content ${this.tab === 'ecosistema' ? 'active' : ''}">
                        <div class="panel">
                            <h2><span style="font-size: 1.5rem;">🪐</span> Identidad del Ecosistema</h2>
                            <p>Configura las reglas macro de esta red descentralizada. Esta configuración afecta a todos los Castells (proyectos) que se instancien bajo ella.</p>
                            
                            <div class="form-group">
                                <label>Nombre del Universo (Ecosistema)</label>
                                <input type="text" id="set-eco-name" class="form-control" value="${state.config.ecosystemName}">
                            </div>

                            <div class="form-group">
                                <label>Arquetipo Macro</label>
                                <select class="form-control" style="color: var(--accent-orange); font-weight:bold;">
                                    <option value="incubator">🏭 Incubadora / Aceleradora Matricial</option>
                                    <option value="holding">🏢 Holding Empresarial</option>
                                    <option value="sos">🆘 S.O.S. (Sistema Operativo Social / Comunitario)</option>
                                    <option value="custom">✨ Universo Custom (Desde Cero)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>System Prompt Maestro (Propósito Global)</label>
                                <textarea id="set-eco-prompt" class="form-control" style="height: 140px; resize:vertical; line-height: 1.5;">${state.config.globalPrompt}</textarea>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 12px; border: 1px solid #333; margin-top: 2rem;">
                                <div>
                                    <div style="color: white; font-weight: bold; margin-bottom: 5px; font-size: 1.1rem;">Creación Libre de Castells (Bottom-Up)</div>
                                    <div style="color: #888; font-size: 0.9rem;">Si está desactivado, solo tú (Owner) podrás instanciar nuevas redes/proyectos.</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="toggleUserCreation" ${state.config.allowUserCreation ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>

                            <button class="btn-save" id="btn-save-general" style="width:100%; margin-top: 2rem;">Guardar Configuración Macro</button>
                        </div>
                    </div>

                    <div id="view-ia" class="tab-content ${this.tab === 'ia' ? 'active' : ''}">
                        <div class="panel" style="border-top: 3px solid var(--accent-purple);">
                            <h2 style="color: var(--accent-purple);">🧠 Orquestador Cognitivo (API Keys)</h2>
                            <p>Conecta el Kernel con proveedores de IA para activar el diseño automático de VNA y los Agentes.</p>
                            
                            <div class="ai-grid" style="display:grid; grid-template-columns: 1fr 2fr; gap:15px;">
                                <div class="form-group">
                                    <label>Proveedor IA Activo</label>
                                    <select id="inpDefaultProvider" class="form-control" style="color: var(--accent-purple); font-weight:bold;">
                                        <option value="deepseek">DeepSeek (Recomendado)</option>
                                        <option value="openai">OpenAI (ChatGPT)</option>
                                        <option value="gemini">Google Gemini</option>
                                        <option value="custom">Agente Local / Custom</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>API Key / Bearer Token</label>
                                    <input type="password" id="inpApiKeyCommon" class="form-control" placeholder="sk-...">
                                </div>
                            </div>
                            
                            <div id="customEndpointBox" style="display:none; margin-top: 10px;">
                                <label style="font-size: 0.7rem; color:#888;">URL del Endpoint Custom (Local LM Studio / Ollama)</label>
                                <input type="text" id="inpCustomUrl" class="form-control" placeholder="http://localhost:1234/v1/chat/completions">
                            </div>

                            <button class="btn-save" id="btn-save-keys" style="background: var(--accent-purple); color:white; width:100%; margin-top:1rem;">Guardar Llaves en Navegador</button>
                            <div id="keysFeedback" style="display:none; color: var(--accent-green); margin-top: 15px; font-size: 0.9rem; font-weight: bold; text-align:center;">✅ Guardado Seguro (Local)</div>
                        </div>

                        <h3 style="color: white; font-size: 1.2rem; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 3rem;">🤖 Enjambre de Agentes (MOCKUP V10)</h3>
                        <p style="color:#888; font-size:0.95rem; margin-bottom: 2rem;">Instancia agentes especializados para cada capa fractal de la organización.</p>
                        
                        <div class="agents-grid">
                            <div class="sector-card" style="border-left-color: var(--accent-orange);">
                                <h3 style="color:var(--accent-orange);">Agente de Ecosistema</h3>
                                <p style="font-size:0.9rem; color:#ccc; flex:1;">Audita la resiliencia global y la transferencia de valor entre proyectos.</p>
                                <button class="btn-save" style="background:transparent; border:1px dashed var(--accent-orange); color:var(--accent-orange); font-size:0.9rem; margin-top:1rem;">Desarrollo V10</button>
                            </div>
                            <div class="sector-card" style="border-left-color: var(--accent-blue);">
                                <h3 style="color:var(--accent-blue);">Agente de Proyecto</h3>
                                <p style="font-size:0.9rem; color:#ccc; flex:1;">El Project Owner IA. Analiza cuellos de botella en el Kanban y sugiere PULLs.</p>
                                <button class="btn-save" style="background:transparent; border:1px dashed var(--accent-blue); color:var(--accent-blue); font-size:0.9rem; margin-top:1rem;">Desarrollo V10</button>
                            </div>
                            <div class="sector-card" style="border-left-color: var(--accent-green);">
                                <h3 style="color:var(--accent-green);">Agente de Persona (Match)</h3>
                                <p style="font-size:0.9rem; color:#ccc; flex:1;">Lee tu Ikigai y busca oportunidades de trabajo en la red automáticamente.</p>
                                <button class="btn-save" style="background:transparent; border:1px dashed var(--accent-green); color:var(--accent-green); font-size:0.9rem; margin-top:1rem;">Desarrollo V10</button>
                            </div>
                        </div>
                    </div>

                    <div id="view-users" class="tab-content ${this.tab === 'users' ? 'active' : ''}">
                        <div class="panel" style="border-left: 4px solid var(--accent-blue);">
                            <h2 style="color: var(--accent-blue);">Inyectar Nodo Local</h2>
                            <p style="margin-top:0;">Da de alta usuarios en el Padrón del Ecosistema para asignarles Capital o Slices.</p>
                            
                            <div style="background: rgba(0,0,0,0.3); padding:2rem; border-radius:12px; border: 1px solid #333;">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; align-items: end; margin-bottom: 20px;">
                                    <div class="form-group" style="margin:0;">
                                        <label>Alias Único (@id)</label>
                                        <input type="text" id="new-user-id" class="form-control" placeholder="Ej: @maria_dev">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Nombre Completo</label>
                                        <input type="text" id="new-user-name" class="form-control" placeholder="Ej: María López">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Contacto / Wallet</label>
                                        <input type="text" id="new-user-contact" class="form-control" placeholder="Email o Dirección 0x">
                                    </div>
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; align-items: end; padding-top: 20px; border-top: 1px dashed #444;">
                                    <div class="form-group" style="margin:0;">
                                        <label>País</label>
                                        <input type="text" id="new-user-country" class="form-control" placeholder="Ej: España">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Ciudad</label>
                                        <input type="text" id="new-user-city" class="form-control" placeholder="Ej: Barcelona">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Código Postal</label>
                                        <input type="text" id="new-user-cp" class="form-control" placeholder="Ej: 08001">
                                    </div>
                                    <button id="btn-create-user" class="btn-save" style="height: 50px;">➕ Añadir Nodo</button>
                                </div>
                            </div>
                        </div>

                        <div class="panel">
                            <h2>Padrón del Ecosistema (${state.globalUsers.length})</h2>
                            <div class="user-table-wrapper">
                                <table class="user-table">
                                    <tr>
                                        <th>Alias (@id)</th>
                                        <th>Nombre Real</th>
                                        <th>Jerarquía Global</th>
                                        <th>Localización</th>
                                        <th>Contacto</th>
                                    </tr>
                                    ${state.globalUsers.map(u => `
                                        <tr>
                                            <td style="font-weight: bold; color: var(--accent-blue); font-family: monospace;">${u.id}</td>
                                            <td style="color: white; font-weight: bold;">${u.name}</td>
                                            <td style="color: ${u.globalRole === 'ecosystem-owner' ? 'var(--accent-orange)' : '#888'};">${u.globalRole === 'ecosystem-owner' ? '👑 Owner' : 'Ciudadano'}</td>
                                            <td style="color: #aaa; font-size:0.85rem;">${u.location?.city ? `📍 ${u.location.city}, ${u.location.country}` : '<span style="color:#555;">No definida</span>'}</td>
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
                            <p>El sistema es 100% Local (Free). El estado del Ecosistema vive en tu navegador. Haz copias de seguridad regularmente.</p>
                            
                            <div style="display:flex; gap:15px; flex-wrap:wrap; margin-top:2rem;">
                                <button class="btn-data btn-export" id="btnExport" style="flex:1;">⬇️ Descargar Backup (JSON)</button>
                                <div class="btn-data btn-import" style="flex:1;">
                                    ⬆️ Restaurar Backup
                                    <input type="file" id="fileInput" accept=".json">
                                </div>
                            </div>

                            <button class="btn-data btn-danger" id="btnNuke">⚠️ Formatear Kernel (Borrar Base de Datos)</button>
                        </div>

                        <div class="panel" style="background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 176, 255, 0.1)); border: 1px solid rgba(224, 64, 251, 0.3);">
                            <h2 style="color:var(--accent-purple);">☁️ TeamTowers Anchor (Permaweb Node)</h2>
                            <p style="color:#ddd; font-size:1.05rem;">Conecta tu Ecosistema Local a la red Arweave para persistencia inmutable y orquestación multi-jugador real.</p>
                            <ul style="list-style:none; padding:0; color:#aaa; font-size:0.95rem; line-height:2; margin-bottom: 2rem;">
                                <li><span style="color:var(--accent-green); margin-right:10px; font-size:1.2rem;">✓</span> <strong>Sincronización P2P:</strong> Multi-usuario sin servidores centrales.</li>
                                <li><span style="color:var(--accent-green); margin-right:10px; font-size:1.2rem;">✓</span> <strong>Notaría Web3:</strong> Sella el Ledger y los pactos de socios en Blockchain.</li>
                            </ul>
                            <button class="btn-save" style="background:transparent; border: 1px solid var(--accent-purple); color:var(--accent-purple); width:100%;">Configurar Nodo Anchor (Próximamente)</button>
                        </div>
                    </div>

                    <div id="view-ontology" class="tab-content ${this.tab === 'ontology' ? 'active' : ''}">
                        <div class="panel">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 2.5rem; flex-wrap: wrap; gap:15px;">
                                <div>
                                    <h2>Plantillas de Proyecto (ADN)</h2>
                                    <p style="margin:0; max-width:600px;">El código fuente de tus redes. Incluye Roles, Arquetipos y Flujos VNA predefinidos para la instanciación rápida.</p>
                                </div>
                                <button class="btn-save" id="btn-new-sector" style="background:var(--accent-green); color:black;">➕ Diseñar Plantilla (IA)</button>
                            </div>
                            
                            <h3 style="color: var(--accent-blue); margin-top: 3rem; font-size: 1.1rem; border-bottom: 1px solid #333; padding-bottom: 10px;">🌟 Tus Plantillas Custom</h3>
                            <div class="ontology-grid" id="customOntologyGrid">
                                </div>

                            <h3 style="color: #888; margin-top: 3rem; font-size: 1.1rem; border-bottom: 1px solid #333; padding-bottom: 10px;">📦 Plantillas Nativas (Kernel Base V10)</h3>
                            <div class="ontology-grid" id="nativeOntologyGrid">
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

        document.getElementById('toggleUserCreation')?.addEventListener('change', async (e) => {
            await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { allowUserCreation: e.target.checked } });
        });

        document.getElementById('btn-save-general')?.addEventListener('click', async () => {
            const ecosystemName = document.getElementById('set-eco-name').value;
            const globalPrompt = document.getElementById('set-eco-prompt').value;
            await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { ecosystemName, globalPrompt } });
            alert("✅ Configuración de Ecosistema Guardada.");
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
            a.download = `TeamTowers_OS_Backup_${new Date().toISOString().split('T')[0]}.json`;
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
                        if (confirm("⚠️ Importar sobreescribirá todos los datos actuales. ¿Proceder?")) {
                            store.state = importedState;
                            localStorage.setItem('tt_sos_state', JSON.stringify(store.state));
                            window.location.href = '/v5/';
                        }
                    } else { alert("❌ JSON inválido."); }
                } catch (err) { alert("❌ Error leyendo archivo."); }
            };
            reader.readAsText(file);
        });

        document.getElementById('btnNuke')?.addEventListener('click', () => {
            if (confirm("🚨 PELIGRO: Esto borrará TODOS los proyectos de tu navegador y vaciará el Kernel. ¿Seguro?")) {
                localStorage.removeItem('tt_sos_state');
                window.location.href = '/v5/';
            }
        });

        // FIX DRY: Redirigir al creador
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
                    return `<div class="deliv-badge" style="color:${tipoColor}; border-color:${tipoColor}; opacity:0.8;">${d.to || '?'} | ${d.estimatedHours}h | ${d.tipo || 'tangible'} | ${d.name}</div>`;
                }).join(' ');
            }
            return `
                <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 10px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <span style="font-family:monospace; font-size:0.8rem; color:#888; font-weight:bold;">${lvl}</span>
                        <b style="color:white; font-size:0.95rem;">${data.name} ${data.guardian ? `<span style="color:var(--accent-gold); font-weight:normal; font-size:0.75rem;">(${data.guardian})</span>` : ''}</b>
                    </div>
                    <div style="margin-top:6px;">${delivsHtml}</div>
                </div>
            `;
        };

        // CUSTOM SECTORS (Saltando _meta)
        const customKeys = Object.keys(customSectores).filter(k => k !== '_meta');
        if(customKeys.length === 0) {
            customGrid.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1; padding:2rem; border: 1px dashed #333; text-align:center; border-radius:12px; background: rgba(0,0,0,0.2);">No has creado plantillas propias.</p>';
        } else {
            customGrid.innerHTML = customKeys.map(key => {
                const roles = customSectores[key];
                return `
                <div class="sector-card">
                    <h3>${key.toUpperCase()}</h3>
                    <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                        ${Object.entries(roles).filter(([k])=> k !== '_meta' && k !== 'roles').map(([lvl, data]) => renderRoleData(data.levelId || lvl, data)).join('')}
                    </div>
                    <div style="display:flex; gap:10px; margin-top:2rem;">
                        <button class="btn-save btn-use-template" data-sector="custom_${key}" style="flex:2; background:var(--accent-green); color:black; font-size:0.9rem;">🚀 Instanciar DAO</button>
                    </div>
                </div>
            `}).join('');
        }

        // NATIVE SECTORS (Saltando _meta)
        const nativeKeys = Object.keys(nativeSectores).filter(k => k !== '_meta');
        nativeGrid.innerHTML = nativeKeys.map(key => {
            const data = nativeSectores[key];
            const rolesObj = data.roles || data; 
            
            return `
            <div class="sector-card native">
                <h3 style="color:#aaa;">${key.toUpperCase().replace(/_/g, ' ')}</h3>
                <div style="display: flex; flex-direction: column; gap: 5px; flex:1;">
                    ${Object.entries(rolesObj).filter(([k])=> k !== '_meta' && k !== 'roles').map(([lvl, roleData]) => renderRoleData(roleData.levelId || lvl, roleData)).join('')}
                </div>
                <button class="btn-save btn-use-template" data-sector="native_${key}" style="width:100%; margin-top:2rem; background:rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color:var(--accent-green); font-size:0.9rem;">🚀 Instanciar DAO</button>
            </div>
            `
        }).join('');

        // Re-bind listeners
        document.querySelectorAll('.btn-use-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sector = e.currentTarget.dataset.sector;
                window.location.href = `/v5/create?sector=${sector}`;
            });
        });
    }
}
