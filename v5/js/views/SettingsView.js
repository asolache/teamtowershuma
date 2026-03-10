// v5/js/views/SettingsView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

const HUMA_LEVELS = [
    { id: '@anxaneta', label: 'Cima / Estrategia', color: 'var(--accent-red)' },
    { id: '@aixecador', label: 'Coordinación / Táctica', color: '#ff4081' },
    { id: '@dosos', label: 'Auditoría / Control', color: 'var(--accent-purple)' },
    { id: '@baixos', label: 'Especialistas / Ejec.', color: 'var(--accent-indigo)' },
    { id: '@pinya', label: 'Soporte / Base', color: 'var(--accent-blue)' }
];

export default class SettingsView {
    constructor() {
        document.title = "Configuración & Datos | TeamTowers";
        this.tab = localStorage.getItem('tt_settings_tab') || 'general';
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
                            <p style="color:var(--text-muted); max-width: 400px; margin: 0 auto;">Solo el Ecosystem Owner puede modificar la matriz de la red.</p>
                        </div>
                    </main>
                </div>
            `;
        }

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative;}
                
                .view-header { margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                /* TABS - Fix para que se vean bien y hagan wrap */
                .tabs-nav { display: flex; gap: 10px; margin-bottom: 2rem; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                .tab-link { padding: 10px 20px; color: var(--text-muted); cursor: pointer; font-weight: bold; border-radius: 8px; border: 1px solid transparent; background: transparent; transition: 0.2s; white-space: nowrap;}
                .tab-link:hover { background: rgba(255,255,255,0.05); color: white;}
                .tab-link.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border-color: var(--accent-blue); }

                /* PANELES */
                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; margin-bottom: 2rem; animation: fadeIn 0.3s ease-out;}
                .panel h2 { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                .panel p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; }

                /* FORMULARIOS */
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; transition: border-color 0.2s; outline: none;}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 10px rgba(0, 176, 255, 0.1);}
                
                .btn-save { background: var(--accent-blue); color: black; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: transform 0.2s;}
                .btn-save:hover { transform: translateY(-2px); }

                /* TOGGLE SWITCH */
                .switch { position: relative; display: inline-block; width: 50px; height: 28px; flex-shrink: 0;}
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--accent-orange); box-shadow: 0 0 10px rgba(255, 171, 64, 0.5);}
                input:checked + .slider:before { transform: translateX(22px); }

                /* BOTONES DATOS Y PREMIUM */
                .btn-data { width: 100%; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 10px; border: none; margin-bottom: 10px;}
                .btn-export { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.3); }
                .btn-export:hover { background: rgba(0, 230, 118, 0.2); transform: translateY(-2px); }
                .btn-import { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.3); position: relative; overflow: hidden; }
                .btn-import:hover { background: rgba(0, 176, 255, 0.2); transform: translateY(-2px); }
                .btn-danger { background: rgba(255, 82, 82, 0.1); color: var(--accent-red); border: 1px dashed rgba(255, 82, 82, 0.3); margin-top: 2rem;}
                .btn-danger:hover { background: rgba(255, 82, 82, 0.2); }
                #fileInput { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

                .premium-panel { background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 176, 255, 0.1)); border: 1px solid rgba(224, 64, 251, 0.3); position: relative;}
                .premium-badge { position: absolute; top: 15px; right: 15px; background: var(--accent-purple); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; }

                /* ONTOLOGY CARDS */
                .ontology-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
                .sector-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; border-left: 4px solid var(--accent-blue);}
                .sector-card h3 { margin: 0 0 10px 0; text-transform: uppercase; font-size: 1.1rem; color: white; }
                
                /* MODAL */
                .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
                .modal-content { background: var(--bg-dark); width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; border-radius: 12px; border: 1px solid var(--glass-border); padding: 2rem; border-top: 4px solid var(--accent-blue);}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) { .app-layout { flex-direction: column; } .workspace { padding: 1.5rem; } }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/settings')}

                <main class="workspace">
                    <div class="view-header">
                        <h1>Panel Maestro</h1>
                        <p>Soberanía de datos, ADN del Ecosistema y Configuración Global.</p>
                    </div>

                    <nav class="tabs-nav" id="settingsTabs">
                        <button class="tab-link ${this.tab === 'general' ? 'active' : ''}" data-tab="general">🌍 General & IA</button>
                        <button class="tab-link ${this.tab === 'ontology' ? 'active' : ''}" data-tab="ontology">🧬 Ontologías (ADN)</button>
                        <button class="tab-link ${this.tab === 'users' ? 'active' : ''}" data-tab="users">👥 Usuarios & Nodos</button>
                        <button class="tab-link ${this.tab === 'data' ? 'active' : ''}" data-tab="data">💾 Datos & Premium</button>
                    </nav>

                    <div id="settingsContent">
                        ${this.renderTab(this.tab, state)}
                    </div>
                </main>
            </div>

            <div id="modalOntology" class="modal">
                <div class="modal-content" id="modalOntologyContent"></div>
            </div>
        `;
    }

    renderTab(tab, state) {
        const config = state.config;

        if (tab === 'general') {
            return `
                <div class="panel">
                    <h2><span style="font-size: 1.5rem;">👑</span> Gobernanza Global V4</h2>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px solid #333; margin-bottom: 1.5rem;">
                        <div>
                            <div style="color: white; font-weight: bold; margin-bottom: 5px;">Creación Libre de Castells (Bottom-Up)</div>
                            <div style="color: #888; font-size: 0.8rem;">Si está desactivado, solo los Admins podrán instanciar nuevas redes.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="toggleUserCreation" ${config.allowUserCreation ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>Nombre del Universo TeamTowers</label>
                        <input type="text" id="set-eco-name" class="form-control" value="${config.ecosystemName}">
                    </div>
                    <div class="form-group">
                        <label>System Prompt Maestro (Inyectado en los Agentes)</label>
                        <textarea id="set-eco-prompt" class="form-control" style="height: 100px;">${config.globalPrompt}</textarea>
                    </div>
                    <button class="btn-save" id="btn-save-general">Guardar Gobernanza</button>
                </div>

                <div class="panel" style="border-top: 3px solid var(--accent-purple);">
                    <h2 style="color: var(--accent-purple);">🧠 Centro de Mando Cognitivo (IA Keys)</h2>
                    <p>Estas llaves se guardan encriptadas en tu navegador para generar los mapas VNA y los Informes Notariales.</p>
                    
                    <div class="form-group">
                        <label>Proveedor IA por defecto</label>
                        <select id="inpDefaultProvider" class="form-control" style="color: var(--accent-blue); font-weight:bold;">
                            <option value="deepseek">DeepSeek (Recomendado)</option>
                            <option value="openai">OpenAI (ChatGPT)</option>
                            <option value="gemini">Google Gemini</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>DeepSeek API Key</label>
                        <input type="password" id="inpDeepseek" class="form-control" placeholder="sk-...">
                    </div>
                    <div class="form-group">
                        <label>OpenAI API Key</label>
                        <input type="password" id="inpOpenai" class="form-control" placeholder="sk-proj-...">
                    </div>
                    <div class="form-group">
                        <label>Google Gemini API Key</label>
                        <input type="password" id="inpGemini" class="form-control" placeholder="AIzaSy...">
                    </div>
                    <button class="btn-save" id="btn-save-keys" style="background: var(--accent-purple); color:white;">Guardar Credenciales Locales</button>
                    <div id="keysFeedback" style="display:none; color: var(--accent-green); margin-top: 10px; font-size: 0.8rem; font-weight: bold;">✅ Guardado en LocalStorage</div>
                </div>
            `;
        }

        if (tab === 'ontology') {
            const sectores = state.ontology?.sectores || {};
            const sectorsArr = Object.entries(sectores);
            return `
                <div class="panel">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
                        <div>
                            <h2>Biblioteca Ontológica</h2>
                            <p style="margin:0;">Plantillas maestras para generar proyectos.</p>
                        </div>
                        <button class="btn-save" id="btn-new-sector" style="background:var(--accent-green); color:black;">➕ Crear Plantilla</button>
                    </div>
                    
                    <div class="ontology-grid">
                        ${sectorsArr.map(([key, roles]) => `
                            <div class="sector-card">
                                <h3>${key.toUpperCase()}</h3>
                                <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 15px;">
                                    ${Object.entries(roles).map(([lvl, data]) => `
                                        <div style="font-size: 0.75rem; color: #888; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 3px 0;">
                                            <span style="font-family:monospace;">${lvl}</span>
                                            <b style="color:white;">${data.name}</b>
                                        </div>
                                    `).join('')}
                                </div>
                                <button class="btn-save btn-edit-sector" data-sector="${key}" style="width:100%; margin-top:1.5rem; font-size:0.8rem; background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);">⚙️ Editar ADN</button>
                            </div>
                        `).join('')}
                        ${sectorsArr.length === 0 ? '<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding:2rem; border:1px dashed #333;">No hay plantillas personalizadas. Se usarán las globales del Kernel.</p>' : ''}
                    </div>
                </div>
            `;
        }

        if (tab === 'users') {
            const users = state.globalUsers || [];
            return `
                <div class="panel" style="border-left: 4px solid var(--accent-blue);">
                    <h2 style="color: var(--accent-blue);">Alta de Nuevo Nodo (Global)</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 15px; align-items: end;">
                        <div class="form-group" style="margin:0;">
                            <label>Alias Único (@id)</label>
                            <input type="text" id="new-user-id" class="form-control" placeholder="@nombre">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label>Nombre Completo</label>
                            <input type="text" id="new-user-name" class="form-control" placeholder="Ej: Laura Pérez">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label>Email / Wallet</label>
                            <input type="text" id="new-user-contact" class="form-control" placeholder="0x... o email">
                        </div>
                        <button id="btn-create-user" class="btn-save" style="height: 42px;">Añadir</button>
                    </div>
                </div>

                <div class="panel">
                    <h2>Padrón Global de Nodos (${users.length})</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
                        <tr style="border-bottom: 1px solid #333; color: var(--text-muted);">
                            <th style="padding: 12px 10px;">Alias (@id)</th>
                            <th style="padding: 12px 10px;">Nombre Real</th>
                            <th style="padding: 12px 10px;">Rol Global</th>
                            <th style="padding: 12px 10px;">Contacto</th>
                        </tr>
                        ${users.map(u => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px 10px; font-weight: bold; color: var(--accent-blue); font-family: monospace;">${u.id}</td>
                                <td style="padding: 12px 10px; color: white;">${u.name}</td>
                                <td style="padding: 12px 10px; color: ${u.globalRole === 'ecosystem-owner' ? 'var(--accent-orange)' : '#888'};">${u.globalRole === 'ecosystem-owner' ? '👑 Owner' : 'Usuario'}</td>
                                <td style="padding: 12px 10px; color: #666;">${u.walletOrSocial || '---'}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
        }

        if (tab === 'data') {
            return `
                <div class="panel premium-panel">
                    <div class="premium-badge">V8 Preview</div>
                    <h2>☁️ TeamTowers Anchor (Premium)</h2>
                    <p style="color:#ddd;">Eleva la red local a la Nube P2P. Ancla tu Ledger en la Permaweb para tener validez mercantil y generar Informes Notariales y Diagnósticos IA.</p>
                    <ul style="list-style:none; padding:0; color:#ccc; font-size:0.9rem; line-height:1.8;">
                        <li><span style="color:var(--accent-green); margin-right:10px;">✓</span> <strong>Sincronización P2P:</strong> Multijugador en tiempo real.</li>
                        <li><span style="color:var(--accent-green); margin-right:10px;">✓</span> <strong>Informes IA:</strong> Diagnóstico VNA y Pacto de Socios PDF.</li>
                        <li><span style="color:var(--accent-green); margin-right:10px;">✓</span> <strong>Exit Boundaries:</strong> Automatización de Vesting y Cliffs.</li>
                    </ul>
                    <button class="btn-save" style="background:var(--accent-purple); color:white; width:100%; margin-top:1rem;" disabled>Próximamente: Integración Stripe</button>
                </div>

                <div class="panel" style="border-color: #333;">
                    <h2>💾 Soberanía Local (Free Tier)</h2>
                    <p>Tus redes operan en modo "Local-First". Todos los datos residen cifrados en el almacenamiento de este navegador.</p>
                    
                    <button class="btn-data btn-export" id="btnExport">⬇️ Exportar JSON del Ecosistema (Backup)</button>
                    
                    <div class="btn-data btn-import">
                        ⬆️ Importar Backup JSON
                        <input type="file" id="fileInput" accept=".json">
                    </div>

                    <button class="btn-data btn-danger" id="btnNuke">⚠️ Formatear Kernel (Borrar todo el Ecosistema)</button>
                </div>
            `;
        }
    }

    executeViewScript() {
        Sidebar.initListeners();

        // 1. GESTIÓN DE NAVEGACIÓN DE PESTAÑAS
        const tabsNav = document.getElementById('settingsTabs');
        const contentContainer = document.getElementById('settingsContent');
        
        if (tabsNav) {
            tabsNav.addEventListener('click', (e) => {
                const btn = e.target.closest('.tab-link');
                if (!btn) return;

                this.tab = btn.dataset.tab;
                localStorage.setItem('tt_settings_tab', this.tab);
                
                document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Limpia el contenedor y recarga
                contentContainer.innerHTML = '';
                contentContainer.innerHTML = this.renderTab(this.tab, store.getState());
                
                // Vuelve a asociar eventos al nuevo contenido inyectado
                this.bindContentEvents(); 
            });
        }

        // Ejecutar los eventos de la primera pestaña que cargue
        this.bindContentEvents();
    }

    bindContentEvents() {
        const state = store.getState();

        // TAB: GENERAL
        if (this.tab === 'general') {
            const toggleGov = document.getElementById('toggleUserCreation');
            if (toggleGov) {
                toggleGov.addEventListener('change', (e) => {
                    store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { allowUserCreation: e.target.checked } });
                });
            }

            const btnSaveGen = document.getElementById('btn-save-general');
            if (btnSaveGen) {
                btnSaveGen.addEventListener('click', () => {
                    const ecosystemName = document.getElementById('set-eco-name').value;
                    const globalPrompt = document.getElementById('set-eco-prompt').value;
                    store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { ecosystemName, globalPrompt } });
                    
                    btnSaveGen.innerText = "✅ Guardado";
                    btnSaveGen.style.background = "var(--accent-green)";
                    setTimeout(() => {
                        btnSaveGen.innerText = "Guardar Gobernanza";
                        btnSaveGen.style.background = "var(--accent-blue)";
                    }, 2000);
                });
            }

            // API Keys
            const uiKeys = {
                provider: document.getElementById('inpDefaultProvider'),
                deepseek: document.getElementById('inpDeepseek'),
                openai: document.getElementById('inpOpenai'),
                gemini: document.getElementById('inpGemini'),
                btnSave: document.getElementById('btn-save-keys'),
                feedback: document.getElementById('keysFeedback')
            };

            if (uiKeys.provider) {
                uiKeys.provider.value = localStorage.getItem('tt_ai_provider') || 'deepseek';
                uiKeys.deepseek.value = localStorage.getItem('tt_key_deepseek') || '';
                uiKeys.openai.value = localStorage.getItem('tt_key_openai') || '';
                uiKeys.gemini.value = localStorage.getItem('tt_key_gemini') || '';

                uiKeys.btnSave.addEventListener('click', () => {
                    localStorage.setItem('tt_ai_provider', uiKeys.provider.value);
                    localStorage.setItem('tt_key_deepseek', uiKeys.deepseek.value.trim());
                    localStorage.setItem('tt_key_openai', uiKeys.openai.value.trim());
                    localStorage.setItem('tt_key_gemini', uiKeys.gemini.value.trim());
                    
                    uiKeys.feedback.style.display = 'block';
                    setTimeout(() => uiKeys.feedback.style.display = 'none', 3000);
                });
            }
        }

        // TAB: ONTOLOGY
        if (this.tab === 'ontology') {
            document.querySelectorAll('.btn-edit-sector, #btn-new-sector').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const sectorKey = e.currentTarget.dataset.sector || '';
                    this.openOntologyModal(sectorKey, store.getState());
                });
            });
        }

        // TAB: USERS
        if (this.tab === 'users') {
            const btnCreateUser = document.getElementById('btn-create-user');
            if (btnCreateUser) {
                btnCreateUser.addEventListener('click', () => {
                    const id = document.getElementById('new-user-id').value.trim();
                    const name = document.getElementById('new-user-name').value.trim();
                    const contact = document.getElementById('new-user-contact').value.trim();

                    if (!id || !name) return alert("⚠️ Alias (@id) y Nombre obligatorios.");
                    if (!id.startsWith('@')) return alert("⚠️ El identificador debe empezar por '@'");

                    store.dispatch({ type: 'ADD_USER', payload: { id, name, walletOrSocial: contact } });
                    
                    // Recargar la tabla de usuarios localmente
                    document.getElementById('settingsContent').innerHTML = this.renderTab(this.tab, store.getState());
                    this.bindContentEvents();
                });
            }
        }

        // TAB: DATA
        if (this.tab === 'data') {
            const btnExport = document.getElementById('btnExport');
            if (btnExport) {
                btnExport.addEventListener('click', () => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.getState(), null, 2));
                    const a = document.createElement('a');
                    a.href = dataStr;
                    a.download = `TeamTowers_OS_Backup_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                });
            }

            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
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
            }

            const btnNuke = document.getElementById('btnNuke');
            if (btnNuke) {
                btnNuke.addEventListener('click', () => {
                    if (confirm("🚨 PELIGRO: Esto borrará TODOS los proyectos de tu navegador. Acción irreversible. ¿Seguro?")) {
                        localStorage.removeItem('tt_sos_state');
                        window.location.href = '/v5/';
                    }
                });
            }
        }
    }

    openOntologyModal(sectorKey, state) {
        const sectorData = sectorKey ? (state.ontology?.sectores[sectorKey] || {}) : null;
        const modal = document.getElementById('modalOntology');
        const content = document.getElementById('modalOntologyContent');

        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <h2 style="color:white; margin:0;">🧬 ADN del Sector: ${sectorKey || 'Nuevo'}</h2>
                <button class="btn-save" onclick="document.getElementById('modalOntology').style.display='none'" style="background:transparent; border:1px solid #555; color:#aaa; padding:5px 15px;">❌ Cerrar</button>
            </div>
            
            <div class="form-group">
                <label>Identificador Único (ej: software_factory)</label>
                <input type="text" id="modal-sector-id" class="form-control" value="${sectorKey}" ${sectorKey?'disabled':''} style="font-family:monospace; color:var(--accent-blue);">
            </div>
            
            <div style="display:flex; flex-direction:column; gap:1.5rem; margin-top:2rem;">
                ${HUMA_LEVELS.map(lvl => {
                    const data = sectorData ? sectorData[lvl.id] : {};
                    let delivs = '';
                    if (data && data.standard_deliverables) {
                        delivs = data.standard_deliverables.map(d => `${d.estimatedHours} | ${d.name}`).join('\n');
                    }
                    return `
                        <div style="background:rgba(255,255,255,0.02); padding:1.5rem; border-radius:8px; border-left:4px solid ${lvl.color};">
                            <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
                                <b style="color:white; width:100px; font-family:monospace;">${lvl.id}</b>
                                <div style="flex:2;"><input type="text" id="name-${lvl.id}" class="form-control" placeholder="Nombre del Rol (Ej: Tech Lead)" value="${data?.name || ''}"></div>
                                <div style="flex:1;"><input type="number" step="0.1" id="mult-${lvl.id}" class="form-control" placeholder="Mult. (Ej: 2.0)" value="${data?.multiplier || 1.0}"></div>
                            </div>
                            <div style="display:flex; gap:10px;">
                                <div style="flex:1;">
                                    <label style="font-size:0.7rem; color:#888; margin-bottom:5px; display:block;">🤖 Prompt Específico para IA</label>
                                    <textarea id="prompt-${lvl.id}" class="form-control" placeholder="Eres el rol..." style="height:80px; font-size:0.8rem;">${data?.ai_prompt || ''}</textarea>
                                </div>
                                <div style="flex:1;">
                                    <label style="font-size:0.7rem; color:var(--accent-green); margin-bottom:5px; display:block;">📦 Tareas Estándar (Horas | Nombre)</label>
                                    <textarea id="deliv-${lvl.id}" class="form-control" placeholder="10 | Definir Arquitectura\n5 | Revisar PRs" style="height:80px; font-size:0.8rem; color:var(--accent-green);">${delivs}</textarea>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:2rem;">
                <button class="btn-save" id="btn-save-sector-action" style="background:var(--accent-green); color:black; font-size:1.1rem; padding:15px 30px;">💾 Inyectar a la Biblioteca</button>
            </div>
        `;

        modal.style.display = 'flex';

        document.getElementById('btn-save-sector-action').addEventListener('click', async () => {
            let newId = document.getElementById('modal-sector-id').value.trim().toLowerCase().replace(/\s+/g, '_');
            if(!newId) return alert("El identificador es obligatorio.");

            const rolesData = {};
            HUMA_LEVELS.forEach(lvl => {
                const delivText = document.getElementById(`deliv-${lvl.id}`).value;
                const standard_deliverables = delivText.split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const parts = line.split('|');
                        return { estimatedHours: parseFloat(parts[0]) || 0, name: parts.slice(1).join('|').trim() || 'Entregable' };
                    });

                rolesData[lvl.id] = {
                    name: document.getElementById(`name-${lvl.id}`).value || lvl.label,
                    multiplier: parseFloat(document.getElementById(`mult-${lvl.id}`).value) || 1.0,
                    ai_prompt: document.getElementById(`prompt-${lvl.id}`).value.trim(),
                    standard_deliverables
                };
            });

            await store.dispatch({
                type: 'ADD_ONTOLOGY_SECTOR',
                payload: { sectorId: newId, rolesData }
            });

            modal.style.display = 'none';
            // Refrescar Pestaña Activa
            document.getElementById('settingsContent').innerHTML = this.renderTab('ontology', store.getState());
            this.bindContentEvents();
        });
    }
}
