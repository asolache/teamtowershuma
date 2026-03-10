// v5/js/views/SettingsView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js'; // Importación nativa ES6 corregida

const HUMA_LEVELS = [
    { id: '@anxaneta', label: 'Cima / Estrategia', color: 'var(--accent-red)', desc: 'Visión, Dirección, CEO. Fija el rumbo.', guardEj: 'Ej: El Soberano / Visionario' },
    { id: '@aixecador', label: 'Coordinación / Táctica', color: '#ff4081', desc: 'Operaciones, Project Manager. Conecta puntos.', guardEj: 'Ej: El Mago / Explorador' },
    { id: '@dosos', label: 'Auditoría / Control', color: 'var(--accent-purple)', desc: 'Finanzas, QA, Seguridad. Valida el valor.', guardEj: 'Ej: El Sabio / Juez' },
    { id: '@baixos', label: 'Especialistas / Ejecución', color: 'var(--accent-indigo)', desc: 'Desarrolladores, Creadores. Construyen el producto.', guardEj: 'Ej: El Creador / Héroe' },
    { id: '@pinya', label: 'Soporte / Base', color: 'var(--accent-blue)', desc: 'Comunidad, Legal, Infraestructura. Sostiene la red.', guardEj: 'Ej: El Cuidador / Protector' }
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

                .tabs-nav { display: flex; gap: 10px; margin-bottom: 2rem; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                .tab-link { padding: 10px 20px; color: var(--text-muted); cursor: pointer; font-weight: bold; border-radius: 8px; border: 1px solid transparent; background: transparent; transition: 0.2s; white-space: nowrap;}
                .tab-link:hover { background: rgba(255,255,255,0.05); color: white;}
                .tab-link.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border-color: var(--accent-blue); }

                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; margin-bottom: 2rem; animation: fadeIn 0.3s ease-out;}
                .panel h2 { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                .panel p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; }

                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; transition: border-color 0.2s; outline: none;}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 10px rgba(0, 176, 255, 0.1);}
                
                .btn-save { background: var(--accent-blue); color: black; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: transform 0.2s;}
                .btn-save:hover { transform: translateY(-2px); }

                .switch { position: relative; display: inline-block; width: 50px; height: 28px; flex-shrink: 0;}
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--accent-orange); box-shadow: 0 0 10px rgba(255, 171, 64, 0.5);}
                input:checked + .slider:before { transform: translateX(22px); }

                .btn-data { width: 100%; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 10px; border: none; margin-bottom: 10px;}
                .btn-export { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.3); }
                .btn-export:hover { background: rgba(0, 230, 118, 0.2); transform: translateY(-2px); }
                .btn-import { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.3); position: relative; overflow: hidden; }
                .btn-import:hover { background: rgba(0, 176, 255, 0.2); transform: translateY(-2px); }
                .btn-danger { background: rgba(255, 82, 82, 0.1); color: var(--accent-red); border: 1px dashed rgba(255, 82, 82, 0.3); margin-top: 2rem;}
                .btn-danger:hover { background: rgba(255, 82, 82, 0.2); }
                #fileInput { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

                .ontology-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;}
                .sector-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; border-left: 4px solid var(--accent-blue); display:flex; flex-direction:column;}
                .sector-card.native { border-left-color: #555; background: rgba(0,0,0,0.5); border-color: #222;}
                .sector-card h3 { margin: 0 0 10px 0; text-transform: uppercase; font-size: 1.1rem; color: white; }
                
                .deliv-badge { background: rgba(0,0,0,0.4); border: 1px solid #333; font-size: 0.65rem; color: var(--accent-green); padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block; font-family: monospace;}

                .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
                .modal-content { background: var(--bg-dark); width: 95%; max-width: 1000px; max-height: 90vh; overflow-y: auto; border-radius: 12px; border: 1px solid var(--glass-border); padding: 2.5rem; border-top: 4px solid var(--accent-blue);}

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
                        <button class="tab-link ${this.tab === 'data' ? 'active' : ''}" data-tab="data">💾 Datos & Backups</button>
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
        if (tab === 'general') {
            const config = state.config;
            return `
                <div class="panel">
                    <h2><span style="font-size: 1.5rem;">👑</span> Gobernanza Global</h2>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px solid #333; margin-bottom: 1.5rem;">
                        <div>
                            <div style="color: white; font-weight: bold; margin-bottom: 5px;">Creación Libre de Castells (Bottom-Up)</div>
                            <div style="color: #888; font-size: 0.8rem;">Si está desactivado, solo tú (Owner) podrás instanciar redes.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="toggleUserCreation" ${config.allowUserCreation ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>Nombre del Universo (Ecosistema)</label>
                        <input type="text" id="set-eco-name" class="form-control" value="${config.ecosystemName}">
                    </div>
                    <div class="form-group">
                        <label>System Prompt Maestro</label>
                        <textarea id="set-eco-prompt" class="form-control" style="height: 100px;">${config.globalPrompt}</textarea>
                    </div>
                    <button class="btn-save" id="btn-save-general">Guardar Gobernanza</button>
                </div>

                <div class="panel" style="border-top: 3px solid var(--accent-purple);">
                    <h2 style="color: var(--accent-purple);">🧠 Centro de Mando Cognitivo (IA Keys)</h2>
                    <p>Las API Keys se usan para que la IA escanee tus mapas y redacte los informes. Se guardan seguras en tu navegador (Local).</p>
                    
                    <div class="form-group">
                        <label>Proveedor IA por defecto</label>
                        <select id="inpDefaultProvider" class="form-control" style="color: var(--accent-blue); font-weight:bold;">
                            <option value="deepseek">DeepSeek (Recomendado / Económico)</option>
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
                    <button class="btn-save" id="btn-save-keys" style="background: var(--accent-purple); color:white;">Guardar Llaves</button>
                    <div id="keysFeedback" style="display:none; color: var(--accent-green); margin-top: 10px; font-size: 0.8rem; font-weight: bold;">✅ Guardado en LocalStorage</div>
                </div>
            `;
        }

        if (tab === 'ontology') {
            const customSectores = state.ontology?.sectores || {};
            const nativeSectores = GLOBAL_ONTOLOGY || {};
            
            const renderRoleData = (lvl, data) => {
                let delivsHtml = '';
                if (data.standard_deliverables && data.standard_deliverables.length > 0) {
                    delivsHtml = data.standard_deliverables.map(d => {
                        const tipoColor = d.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                        return `<div class="deliv-badge" style="color:${tipoColor}; border-color:${tipoColor}; opacity:0.8;">${d.to || '?'} | ${d.estimatedHours}h | ${d.tipo || 'tangible'} | ${d.name}</div>`;
                    }).join(' ');
                }
                
                return `
                    <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 8px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline;">
                            <span style="font-family:monospace; font-size:0.75rem; color:#888;">${lvl}</span>
                            <b style="color:white; font-size:0.9rem;">${data.name} ${data.guardian ? `<span style="color:var(--accent-gold); font-weight:normal; font-size:0.7rem;">(${data.guardian})</span>` : ''}</b>
                        </div>
                        <div style="margin-top:4px;">${delivsHtml}</div>
                    </div>
                `;
            };

            return `
                <div class="panel">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap:10px;">
                        <div>
                            <h2>Plantillas de Red (Ontologías)</h2>
                            <p style="margin:0; max-width:600px;">
                                El ADN predefinido de tus redes. Incluye Roles, Arquetipos y Flujos VNA que las redes heredarán al nacer.
                            </p>
                        </div>
                        <button class="btn-save" id="btn-new-sector" style="background:var(--accent-green); color:black;">➕ Crear Plantilla Custom</button>
                    </div>
                    
                    <h3 style="color: var(--accent-blue); margin-top: 2rem; font-size: 1rem; border-bottom: 1px solid #333; padding-bottom: 5px;">🌟 Tus Plantillas Custom</h3>
                    <div class="ontology-grid">
                        ${Object.entries(customSectores).map(([key, roles]) => `
                            <div class="sector-card">
                                <h3>${key.toUpperCase()}</h3>
                                <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                                    ${Object.entries(roles).map(([lvl, data]) => renderRoleData(lvl, data)).join('')}
                                </div>
                                <button class="btn-save btn-edit-sector" data-sector="${key}" style="width:100%; margin-top:1.5rem; font-size:0.8rem; background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);">⚙️ Editar ADN</button>
                            </div>
                        `).join('')}
                        ${Object.keys(customSectores).length === 0 ? '<p style="color:var(--text-muted); grid-column: 1/-1; padding:1rem; border: 1px dashed #333;">No has creado plantillas propias. (Pronto podrás exportarlas desde tus mapas VNA).</p>' : ''}
                    </div>

                    <h3 style="color: #666; margin-top: 2rem; font-size: 1rem; border-bottom: 1px solid #333; padding-bottom: 5px;">📦 Plantillas Nativas (Kernel Base)</h3>
                    <div class="ontology-grid">
                        ${Object.entries(nativeSectores).map(([key, data]) => {
                            const rolesObj = data.roles || data; 
                            return `
                            <div class="sector-card native">
                                <h3 style="color:#aaa;">${key.toUpperCase().replace(/_/g, ' ')}</h3>
                                <div style="display: flex; flex-direction: column; gap: 5px; flex:1;">
                                    ${Object.entries(rolesObj).map(([lvl, roleData]) => renderRoleData(lvl, roleData)).join('')}
                                </div>
                                <div style="font-size: 0.7rem; color: #444; margin-top: 15px; text-align: center; border-top: 1px solid #222; padding-top: 5px;">Solo Lectura</div>
                            </div>
                        `}).join('')}
                        ${Object.keys(nativeSectores).length === 0 ? '<p style="color:#555; grid-column: 1/-1;">Error leyendo el archivo nativo de ontologías.</p>' : ''}
                    </div>
                </div>
            `;
        }

        if (tab === 'users') {
            const users = state.globalUsers || [];
            return `
                <div class="panel" style="border-left: 4px solid var(--accent-blue);">
                    <h2 style="color: var(--accent-blue);">Inyectar Nodo Local</h2>
                    <p style="margin-top:0;">Da de alta usuarios en tu terminal para poder incluirlos en el Pacto de Socios y asignarles Capital/Slices en el Ledger. Añade su localización para los filtros de La Colla.</p>
                    
                    <div style="background: rgba(0,0,0,0.3); padding:1.5rem; border-radius:8px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; align-items: end; margin-bottom: 15px;">
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
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; align-items: end; padding-top: 15px; border-top: 1px dashed #333;">
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
                            <button id="btn-create-user" class="btn-save" style="height: 42px;">➕ Añadir Nodo</button>
                        </div>
                    </div>
                </div>

                <div class="panel">
                    <h2>Padrón de Nodos Conocidos (${users.length})</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
                        <tr style="border-bottom: 1px solid #333; color: var(--text-muted);">
                            <th style="padding: 12px 10px;">Alias (@id)</th>
                            <th style="padding: 12px 10px;">Nombre Real</th>
                            <th style="padding: 12px 10px;">Jerarquía</th>
                            <th style="padding: 12px 10px;">Localización</th>
                            <th style="padding: 12px 10px;">Contacto</th>
                        </tr>
                        ${users.map(u => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px 10px; font-weight: bold; color: var(--accent-blue); font-family: monospace;">${u.id}</td>
                                <td style="padding: 12px 10px; color: white;">${u.name}</td>
                                <td style="padding: 12px 10px; color: ${u.globalRole === 'ecosystem-owner' ? 'var(--accent-orange)' : '#888'};">${u.globalRole === 'ecosystem-owner' ? '👑 Owner' : 'Mercenario'}</td>
                                <td style="padding: 12px 10px; color: #aaa; font-size:0.85rem;">
                                    ${u.location?.city ? `📍 ${u.location.city}, ${u.location.country}` : '<span style="color:#555;">No definida</span>'}
                                </td>
                                <td style="padding: 12px 10px; color: #666; font-size:0.8rem;">${u.walletOrSocial || '---'}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
        }

        if (tab === 'data') {
            return `
                <div class="panel" style="border-color: #333;">
                    <h2>💾 Gestión Local y Backups</h2>
                    <p>Actualmente el sistema es 100% Local (Free). Si vacías la caché del navegador, perderás los datos. Haz copias de seguridad regularmente.</p>
                    
                    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:2rem;">
                        <button class="btn-data btn-export" id="btnExport" style="flex:1;">⬇️ Descargar Backup (JSON)</button>
                        <div class="btn-data btn-import" style="flex:1;">
                            ⬆️ Restaurar Backup
                            <input type="file" id="fileInput" accept=".json">
                        </div>
                    </div>

                    <button class="btn-data btn-danger" id="btnNuke">⚠️ Formatear Kernel (Borrar Base de Datos)</button>
                </div>

                <div class="panel" style="background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 176, 255, 0.1)); border: 1px solid rgba(224, 64, 251, 0.3);">
                    <h2 style="color:var(--accent-purple);">☁️ TeamTowers Anchor (Próximamente)</h2>
                    <p style="color:#ddd;">Suscripción para Ecosystem Owners. Eleva tu matriz local a una red P2P en tiempo real.</p>
                    <ul style="list-style:none; padding:0; color:#aaa; font-size:0.9rem; line-height:1.8;">
                        <li><span style="color:var(--accent-green); margin-right:10px;">✓</span> <strong>Sincronización P2P:</strong> Multi-usuario sin servidores centrales.</li>
                        <li><span style="color:var(--accent-green); margin-right:10px;">✓</span> <strong>Informes IA Notariales:</strong> Genera PDFs legales del Pacto de Socios.</li>
                        <li><span style="color:var(--accent-green); margin-right:10px;">✓</span> <strong>Permaweb:</strong> Sella el Ledger en Arweave de forma inmutable.</li>
                    </ul>
                </div>
            `;
        }
    }

    executeViewScript() {
        Sidebar.initListeners();

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
                
                contentContainer.innerHTML = '';
                contentContainer.innerHTML = this.renderTab(this.tab, store.getState());
                this.bindContentEvents(); 
            });
        }

        this.bindContentEvents();
    }

    bindContentEvents() {
        const state = store.getState();

        if (this.tab === 'general') {
            document.getElementById('toggleUserCreation')?.addEventListener('change', async (e) => {
                await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { allowUserCreation: e.target.checked } });
            });

            document.getElementById('btn-save-general')?.addEventListener('click', async () => {
                const ecosystemName = document.getElementById('set-eco-name').value;
                const globalPrompt = document.getElementById('set-eco-prompt').value;
                await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { ecosystemName, globalPrompt } });
                alert("✅ Gobernanza Guardada");
            });

            const uiKeys = {
                provider: document.getElementById('inpDefaultProvider'),
                deepseek: document.getElementById('inpDeepseek'),
                openai: document.getElementById('inpOpenai'),
                btnSave: document.getElementById('btn-save-keys'),
                feedback: document.getElementById('keysFeedback')
            };

            if (uiKeys.provider) {
                uiKeys.provider.value = localStorage.getItem('tt_ai_provider') || 'deepseek';
                uiKeys.deepseek.value = localStorage.getItem('tt_key_deepseek') || '';
                uiKeys.openai.value = localStorage.getItem('tt_key_openai') || '';

                uiKeys.btnSave.addEventListener('click', () => {
                    localStorage.setItem('tt_ai_provider', uiKeys.provider.value);
                    localStorage.setItem('tt_key_deepseek', uiKeys.deepseek.value.trim());
                    localStorage.setItem('tt_key_openai', uiKeys.openai.value.trim());
                    uiKeys.feedback.style.display = 'block';
                    setTimeout(() => uiKeys.feedback.style.display = 'none', 3000);
                });
            }
        }

        if (this.tab === 'ontology') {
            document.querySelectorAll('.btn-edit-sector').forEach(btn => {
                btn.addEventListener('click', (e) => this.openOntologyModal(e.currentTarget.dataset.sector, store.getState()));
            });
            document.getElementById('btn-new-sector')?.addEventListener('click', () => this.openOntologyModal('', store.getState()));
        }

        if (this.tab === 'users') {
            const btnCreateUser = document.getElementById('btn-create-user');
            if (btnCreateUser) {
                btnCreateUser.addEventListener('click', async () => {
                    const idInput = document.getElementById('new-user-id');
                    const nameInput = document.getElementById('new-user-name');
                    const contactInput = document.getElementById('new-user-contact');
                    const countryInput = document.getElementById('new-user-country');
                    const cityInput = document.getElementById('new-user-city');
                    const cpInput = document.getElementById('new-user-cp');

                    let id = idInput.value.trim();
                    const name = nameInput.value.trim();
                    const contact = contactInput.value.trim();
                    const location = {
                        country: countryInput.value.trim(),
                        city: cityInput.value.trim(),
                        cp: cpInput.value.trim()
                    };

                    if (!id || !name) return alert("⚠️ Alias y Nombre son obligatorios.");
                    if (!id.startsWith('@')) id = '@' + id; 

                    await store.dispatch({ 
                        type: 'ADD_USER', 
                        payload: { id, name, walletOrSocial: contact, location } 
                    });
                    
                    document.getElementById('settingsContent').innerHTML = this.renderTab(this.tab, store.getState());
                    this.bindContentEvents();
                });
            }
        }

        if (this.tab === 'data') {
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
                if (confirm("🚨 PELIGRO: Esto borrará TODOS los proyectos de tu navegador y vaciará el Kernel. Ideal para limpiar tras ejecutar pruebas. ¿Seguro?")) {
                    localStorage.removeItem('tt_sos_state');
                    window.location.href = '/v5/';
                }
            });
        }
    }

    openOntologyModal(sectorKey, state) {
        const sectorData = sectorKey ? (state.ontology?.sectores[sectorKey] || {}) : null;
        const modal = document.getElementById('modalOntology');
        const content = document.getElementById('modalOntologyContent');

        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <div>
                    <h2 style="color:white; margin:0;">🧬 ADN de Red: Creador de Plantillas VNA</h2>
                    <p style="color:var(--text-muted); font-size:0.85rem; margin-top:5px;">Configura los Roles, Arquetipos y Flujos predefinidos que heredarán los nuevos proyectos.</p>
                </div>
                <button class="btn-save" onclick="document.getElementById('// v5/js/views/SettingsView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

// Intentamos importar la ontología base
let GLOBAL_ONTOLOGY = {};
try {
    const ontologyModule = require('../data/ontology.js');
    GLOBAL_ONTOLOGY = ontologyModule.GLOBAL_ONTOLOGY || {};
} catch(e) {
    console.warn("Cargando sin GLOBAL_ONTOLOGY externa.");
}

const HUMA_LEVELS = [
    { id: '@anxaneta', label: 'Cima / Estrategia', color: 'var(--accent-red)', desc: 'Visión, Dirección, CEO. Fija el rumbo.', guardEj: 'Ej: El Soberano / Visionario' },
    { id: '@aixecador', label: 'Coordinación / Táctica', color: '#ff4081', desc: 'Operaciones, Project Manager. Conecta puntos.', guardEj: 'Ej: El Mago / Explorador' },
    { id: '@dosos', label: 'Auditoría / Control', color: 'var(--accent-purple)', desc: 'Finanzas, QA, Seguridad. Valida el valor.', guardEj: 'Ej: El Sabio / Juez' },
    { id: '@baixos', label: 'Especialistas / Ejec.', color: 'var(--accent-indigo)', desc: 'Desarrolladores, Creadores. Construyen el producto.', guardEj: 'Ej: El Creador / Héroe' },
    { id: '@pinya', label: 'Soporte / Base', color: 'var(--accent-blue)', desc: 'Comunidad, Legal, Infraestructura. Sostiene la red.', guardEj: 'Ej: El Cuidador / Protector' }
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

                .tabs-nav { display: flex; gap: 10px; margin-bottom: 2rem; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                .tab-link { padding: 10px 20px; color: var(--text-muted); cursor: pointer; font-weight: bold; border-radius: 8px; border: 1px solid transparent; background: transparent; transition: 0.2s; white-space: nowrap;}
                .tab-link:hover { background: rgba(255,255,255,0.05); color: white;}
                .tab-link.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border-color: var(--accent-blue); }

                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; margin-bottom: 2rem; animation: fadeIn 0.3s ease-out;}
                .panel h2 { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                .panel p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; }

                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; transition: border-color 0.2s; outline: none;}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 10px rgba(0, 176, 255, 0.1);}
                
                .btn-save { background: var(--accent-blue); color: black; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: transform 0.2s;}
                .btn-save:hover { transform: translateY(-2px); }

                .switch { position: relative; display: inline-block; width: 50px; height: 28px; flex-shrink: 0;}
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--accent-orange); box-shadow: 0 0 10px rgba(255, 171, 64, 0.5);}
                input:checked + .slider:before { transform: translateX(22px); }

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

                .ontology-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;}
                .sector-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; border-left: 4px solid var(--accent-blue); display:flex; flex-direction:column;}
                .sector-card.native { border-left-color: #555; background: rgba(0,0,0,0.5); border-color: #222;}
                .sector-card h3 { margin: 0 0 10px 0; text-transform: uppercase; font-size: 1.1rem; color: white; }
                
                .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
                .modal-content { background: var(--bg-dark); width: 95%; max-width: 1000px; max-height: 90vh; overflow-y: auto; border-radius: 12px; border: 1px solid var(--glass-border); padding: 2.5rem; border-top: 4px solid var(--accent-blue);}

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
                        <button class="tab-link ${this.tab === 'data' ? 'active' : ''}" data-tab="data">💾 Datos & Backups</button>
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
        if (tab === 'general') {
            const config = state.config;
            return `
                <div class="panel">
                    <h2><span style="font-size: 1.5rem;">👑</span> Gobernanza Global</h2>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px solid #333; margin-bottom: 1.5rem;">
                        <div>
                            <div style="color: white; font-weight: bold; margin-bottom: 5px;">Creación Libre de Castells (Bottom-Up)</div>
                            <div style="color: #888; font-size: 0.8rem;">Si está desactivado, solo tú (Owner) podrás instanciar redes.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="toggleUserCreation" ${config.allowUserCreation ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>Nombre del Universo (Ecosistema)</label>
                        <input type="text" id="set-eco-name" class="form-control" value="${config.ecosystemName}">
                    </div>
                    <div class="form-group">
                        <label>System Prompt Maestro</label>
                        <textarea id="set-eco-prompt" class="form-control" style="height: 100px;">${config.globalPrompt}</textarea>
                    </div>
                    <button class="btn-save" id="btn-save-general">Guardar Gobernanza</button>
                </div>

                <div class="panel" style="border-top: 3px solid var(--accent-purple);">
                    <h2 style="color: var(--accent-purple);">🧠 Centro de Mando Cognitivo (IA Keys)</h2>
                    <p>Las API Keys se usan para que la IA escanee tus mapas y redacte los informes. Se guardan seguras en tu navegador (Local).</p>
                    
                    <div class="form-group">
                        <label>Proveedor IA por defecto</label>
                        <select id="inpDefaultProvider" class="form-control" style="color: var(--accent-blue); font-weight:bold;">
                            <option value="deepseek">DeepSeek (Recomendado / Económico)</option>
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
                    <button class="btn-save" id="btn-save-keys" style="background: var(--accent-purple); color:white;">Guardar Llaves</button>
                    <div id="keysFeedback" style="display:none; color: var(--accent-green); margin-top: 10px; font-size: 0.8rem; font-weight: bold;">✅ Guardado en LocalStorage</div>
                </div>
            `;
        }

        if (tab === 'ontology') {
            const customSectores = state.ontology?.sectores || {};
            const nativeSectores = GLOBAL_ONTOLOGY || {};
            
            return `
                <div class="panel">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap:10px;">
                        <div>
                            <h2>Plantillas de Red (Ontologías)</h2>
                            <p style="margin:0; max-width:600px;">
                                El ADN predefinido de tus redes. Incluye Roles, Arquetipos y Flujos VNA que las redes heredarán al nacer.
                            </p>
                        </div>
                        <button class="btn-save" id="btn-new-sector" style="background:var(--accent-green); color:black;">➕ Crear Plantilla Custom</button>
                    </div>
                    
                    <h3 style="color: var(--accent-blue); margin-top: 2rem; font-size: 1rem; border-bottom: 1px solid #333; padding-bottom: 5px;">🌟 Tus Plantillas Custom</h3>
                    <div class="ontology-grid">
                        ${Object.entries(customSectores).map(([key, roles]) => `
                            <div class="sector-card">
                                <h3>${key.toUpperCase()}</h3>
                                <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 15px; flex: 1;">
                                    ${Object.entries(roles).map(([lvl, data]) => `
                                        <div style="font-size: 0.75rem; color: #888; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 3px 0;">
                                            <span style="font-family:monospace;">${lvl}</span><b style="color:white;">${data.name}</b>
                                        </div>
                                    `).join('')}
                                </div>
                                <button class="btn-save btn-edit-sector" data-sector="${key}" style="width:100%; margin-top:1.5rem; font-size:0.8rem; background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);">⚙️ Editar ADN</button>
                            </div>
                        `).join('')}
                        ${Object.keys(customSectores).length === 0 ? '<p style="color:var(--text-muted); grid-column: 1/-1; padding:1rem; border: 1px dashed #333;">No has creado plantillas propias. (Pronto podrás exportarlas desde tus mapas VNA).</p>' : ''}
                    </div>

                    <h3 style="color: #666; margin-top: 2rem; font-size: 1rem; border-bottom: 1px solid #333; padding-bottom: 5px;">📦 Plantillas Nativas (Kernel Base)</h3>
                    <div class="ontology-grid">
                        ${Object.entries(nativeSectores).map(([key, data]) => {
                            const rolesObj = data.roles || data; 
                            const rolesHtml = Object.entries(rolesObj).map(([lvl, roleData]) => `
                                <div style="font-size: 0.75rem; color: #666; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.02); padding: 3px 0;">
                                    <span style="font-family:monospace;">${lvl}</span><b style="color:#aaa;">${roleData.name || roleData}</b>
                                </div>
                            `).join('');
                            
                            return `
                            <div class="sector-card native">
                                <h3 style="color:#aaa;">${key.toUpperCase().replace(/_/g, ' ')}</h3>
                                <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 15px; flex:1;">
                                    ${rolesHtml}
                                </div>
                                <div style="font-size: 0.7rem; color: #444; margin-top: 15px; text-align: center; border-top: 1px solid #222; padding-top: 5px;">Solo Lectura</div>
                            </div>
                        `}).join('')}
                        ${Object.keys(nativeSectores).length === 0 ? '<p style="color:#555; grid-column: 1/-1;">Error leyendo el archivo nativo de ontologías.</p>' : ''}
                    </div>
                </div>
            `;
        }

        if (tab === 'users') {
            const users = state.globalUsers || [];
            return `
                <div class="panel" style="border-left: 4px solid var(--accent-blue);">
                    <h2 style="color: var(--accent-blue);">Inyectar Nodo Local</h2>
                    <p style="margin-top:0;">Da de alta usuarios en tu terminal para poder incluirlos en el Pacto de Socios y asignarles Capital/Slices en el Ledger. Añade su localización para los filtros de La Colla.</p>
                    
                    <div style="background: rgba(0,0,0,0.3); padding:1.5rem; border-radius:8px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; align-items: end; margin-bottom: 15px;">
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
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; align-items: end; padding-top: 15px; border-top: 1px dashed #333;">
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
                            <button id="btn-create-user" class="btn-save" style="height: 42px;">➕ Añadir Nodo</button>
                        </div>
                    </div>
                </div>

                <div class="panel">
                    <h2>Padrón de Nodos Conocidos (${users.length})</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
                        <tr style="border-bottom: 1px solid #333; color: var(--text-muted);">
                            <th style="padding: 12px 10px;">Alias (@id)</th>
                            <th style="padding: 12px 10px;">Nombre Real</th>
                            <th style="padding: 12px 10px;">Jerarquía</th>
                            <th style="padding: 12px 10px;">Localización</th>
                            <th style="padding: 12px 10px;">Contacto</th>
                        </tr>
                        ${users.map(u => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px 10px; font-weight: bold; color: var(--accent-blue); font-family: monospace;">${u.id}</td>
                                <td style="padding: 12px 10px; color: white;">${u.name}</td>
                                <td style="padding: 12px 10px; color: ${u.globalRole === 'ecosystem-owner' ? 'var(--accent-orange)' : '#888'};">${u.globalRole === 'ecosystem-owner' ? '👑 Owner' : 'Mercenario'}</td>
                                <td style="padding: 12px 10px; color: #aaa; font-size:0.85rem;">
                                    ${u.location?.city ? `📍 ${u.location.city}, ${u.location.country}` : '<span style="color:#555;">No definida</span>'}
                                </td>
                                <td style="padding: 12px 10px; color: #666; font-size:0.8rem;">${u.walletOrSocial || '---'}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
        }

        if (tab === 'data') {
            return `
                <div class="panel" style="border-color: #333;">
                    <h2>💾 Gestión Local y Backups</h2>
                    <p>Actualmente el sistema es 100% Local (Free). Si vacías la caché del navegador, perderás los datos. Haz copias de seguridad regularmente.</p>
                    
                    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:2rem;">
                        <button class="btn-data btn-export" id="btnExport" style="flex:1;">⬇️ Descargar Backup (JSON)</button>
                        <div class="btn-data btn-import" style="flex:1;">
                            ⬆️ Restaurar Backup
                            <input type="file" id="fileInput" accept=".json">
                        </div>
                    </div>

                    <button class="btn-data btn-danger" id="btnNuke">⚠️ Formatear Kernel (Borrar Base de Datos)</button>
                </div>

                <div class="panel" style="background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 176, 255, 0.1)); border: 1px solid rgba(224, 64, 251, 0.3);">
                    <h2 style="color:var(--accent-purple);">☁️ TeamTowers Anchor (Próximamente)</h2>
                    <p style="color:#ddd;">Suscripción para Ecosystem Owners. Eleva tu matriz local a una red P2P en tiempo real.</p>
                    <ul style="list-style:none; padding:0; color:#aaa; font-size:0.9rem; line-height:1.8;">
                        <li><span style="color:var(--accent-green); margin-right:10px;">✓</span> <strong>Sincronización P2P:</strong> Multi-usuario sin servidores centrales.</li>
                        <li><span style="color:var(--accent-green); margin-right:10px;">✓</span> <strong>Informes IA Notariales:</strong> Genera PDFs legales del Pacto de Socios.</li>
                        <li><span style="color:var(--accent-green); margin-right:10px;">✓</span> <strong>Permaweb:</strong> Sella el Ledger en Arweave de forma inmutable.</li>
                    </ul>
                </div>
            `;
        }
    }

    executeViewScript() {
        Sidebar.initListeners();

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
                
                contentContainer.innerHTML = '';
                contentContainer.innerHTML = this.renderTab(this.tab, store.getState());
                this.bindContentEvents(); 
            });
        }

        this.bindContentEvents();
    }

    bindContentEvents() {
        const state = store.getState();

        if (this.tab === 'general') {
            document.getElementById('toggleUserCreation')?.addEventListener('change', async (e) => {
                await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { allowUserCreation: e.target.checked } });
            });

            document.getElementById('btn-save-general')?.addEventListener('click', async () => {
                const ecosystemName = document.getElementById('set-eco-name').value;
                const globalPrompt = document.getElementById('set-eco-prompt').value;
                await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { ecosystemName, globalPrompt } });
                alert("✅ Gobernanza Guardada");
            });

            const uiKeys = {
                provider: document.getElementById('inpDefaultProvider'),
                deepseek: document.getElementById('inpDeepseek'),
                openai: document.getElementById('inpOpenai'),
                btnSave: document.getElementById('btn-save-keys'),
                feedback: document.getElementById('keysFeedback')
            };

            if (uiKeys.provider) {
                uiKeys.provider.value = localStorage.getItem('tt_ai_provider') || 'deepseek';
                uiKeys.deepseek.value = localStorage.getItem('tt_key_deepseek') || '';
                uiKeys.openai.value = localStorage.getItem('tt_key_openai') || '';

                uiKeys.btnSave.addEventListener('click', () => {
                    localStorage.setItem('tt_ai_provider', uiKeys.provider.value);
                    localStorage.setItem('tt_key_deepseek', uiKeys.deepseek.value.trim());
                    localStorage.setItem('tt_key_openai', uiKeys.openai.value.trim());
                    uiKeys.feedback.style.display = 'block';
                    setTimeout(() => uiKeys.feedback.style.display = 'none', 3000);
                });
            }
        }

        if (this.tab === 'ontology') {
            document.querySelectorAll('.btn-edit-sector').forEach(btn => {
                btn.addEventListener('click', (e) => this.openOntologyModal(e.currentTarget.dataset.sector, store.getState()));
            });
            document.getElementById('btn-new-sector')?.addEventListener('click', () => this.openOntologyModal('', store.getState()));
        }

        if (this.tab === 'users') {
            const btnCreateUser = document.getElementById('btn-create-user');
            if (btnCreateUser) {
                btnCreateUser.addEventListener('click', async () => {
                    const idInput = document.getElementById('new-user-id');
                    const nameInput = document.getElementById('new-user-name');
                    const contactInput = document.getElementById('new-user-contact');
                    const countryInput = document.getElementById('new-user-country');
                    const cityInput = document.getElementById('new-user-city');
                    const cpInput = document.getElementById('new-user-cp');

                    let id = idInput.value.trim();
                    const name = nameInput.value.trim();
                    const contact = contactInput.value.trim();
                    const location = {
                        country: countryInput.value.trim(),
                        city: cityInput.value.trim(),
                        cp: cpInput.value.trim()
                    };

                    if (!id || !name) return alert("⚠️ Alias y Nombre son obligatorios.");
                    if (!id.startsWith('@')) id = '@' + id; 

                    await store.dispatch({ 
                        type: 'ADD_USER', 
                        payload: { id, name, walletOrSocial: contact, location } 
                    });
                    
                    document.getElementById('settingsContent').innerHTML = this.renderTab(this.tab, store.getState());
                    this.bindContentEvents();
                });
            }
        }

        if (this.tab === 'data') {
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
                if (confirm("🚨 PELIGRO: Esto borrará TODOS los proyectos de tu navegador y vaciará el Kernel. Ideal para limpiar tras ejecutar pruebas. ¿Seguro?")) {
                    localStorage.removeItem('tt_sos_state');
                    window.location.href = '/v5/';
                }
            });
        }
    }

    openOntologyModal(sectorKey, state) {
        const sectorData = sectorKey ? (state.ontology?.sectores[sectorKey] || {}) : null;
        const modal = document.getElementById('modalOntology');
        const content = document.getElementById('modalOntologyContent');

        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <div>
                    <h2 style="color:white; margin:0;">🧬 ADN de Red: Creador de Plantillas VNA</h2>
                    <p style="color:var(--text-muted); font-size:0.85rem; margin-top:5px;">Configura los Roles, Arquetipos y Flujos predefinidos que heredarán los nuevos proyectos.</p>
                </div>
                <button class="btn-save" onclick="document.getElementById('modalOntology').style.display='none'" style="background:transparent; border:1px solid #555; color:#aaa; padding:5px 15px;">❌ Cerrar</button>
            </div>
            
            <div class="form-group" style="background: rgba(0,0,0,0.3); padding:1rem; border-radius:8px;">
                <label style="color: var(--accent-blue);">ID de la Plantilla (ej: agencia_marketing)</label>
                <input type="text" id="modal-sector-id" class="form-control" value="${sectorKey}" ${sectorKey?'disabled':''} style="font-family:monospace; color:var(--accent-blue); font-size:1.1rem; max-width: 400px;">
            </div>
            
            <div style="display:flex; flex-direction:column; gap:1.5rem; margin-top:2rem;">
                ${HUMA_LEVELS.map(lvl => {
                    const data = sectorData ? sectorData[lvl.id] : {};
                    let delivs = '';
                    if (data && data.standard_deliverables) {
                        // FIX VNA: Ahora muestra el tipo (tangible/intangible)
                        delivs = data.standard_deliverables.map(d => `${d.to || '?'} | ${d.estimatedHours} | ${d.tipo || 'tangible'} | ${d.name}`).join('\n');
                    }
                    return `
                        <div style="background:rgba(255,255,255,0.02); padding:1.5rem; border-radius:8px; border-left:4px solid ${lvl.color};">
                            
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 15px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 10px;">
                                <div style="display:flex; align-items:center; gap: 10px;">
                                    <b style="color:white; font-family:monospace; font-size:1.2rem;">${lvl.id}</b>
                                    <span style="background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:12px; font-size:0.7rem; color:#ccc;">${lvl.label}</span>
                                </div>
                                <div style="font-size:0.75rem; color:#888; font-style:italic;">${lvl.desc}</div>
                            </div>

                            <div style="display:grid; grid-template-columns: 2fr 1.5fr 1fr; gap:15px; align-items:end; margin-bottom:15px;">
                                <div>
                                    <label style="font-size:0.7rem; color:#aaa; margin-bottom:5px; display:block;">Nombre del Rol (Puesto)</label>
                                    <input type="text" id="name-${lvl.id}" class="form-control" placeholder="Ej: Director Creativo" value="${data?.name || ''}">
                                </div>
                                <div>
                                    <label style="font-size:0.7rem; color:var(--accent-gold); margin-bottom:5px; display:block;">Arquetipo Guardián (Ikigai)</label>
                                    <input type="text" id="guard-${lvl.id}" class="form-control" placeholder="${lvl.guardEj}" value="${data?.guardian || ''}">
                                </div>
                                <div>
                                    <label style="font-size:0.7rem; color:#aaa; margin-bottom:5px; display:block;">Multiplicador (Riesgo)</label>
                                    <input type="number" step="0.1" id="mult-${lvl.id}" class="form-control" placeholder="Ej: 2.0" value="${data?.multiplier || 1.0}">
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                                <div>
                                    <label style="font-size:0.7rem; color:#888; margin-bottom:5px; display:block;">🤖 System Prompt del Agente (IA)</label>
                                    <textarea id="prompt-${lvl.id}" class="form-control" placeholder="Contexto: Eres el encargado de supervisar..." style="height:100px; font-size:0.8rem;">${data?.ai_prompt || ''}</textarea>
                                </div>
                                <div>
                                    <label style="font-size:0.7rem; color:var(--accent-green); margin-bottom:5px; display:block;">🕸️ Flujos VNA (Una por línea)</label>
                                    <p style="font-size: 0.65rem; color: #666; margin-top:0; margin-bottom:5px;">Formato: <code>@destino | Horas | Tipo | Nombre Tarea</code></p>
                                    <textarea id="deliv-${lvl.id}" class="form-control" placeholder="@dosos | 10 | tangible | Definir Arquitectura\n@baixos | 5 | intangible | Revisar PRs" style="height:70px; font-size:0.8rem; color:var(--accent-green);">${delivs}</textarea>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2rem; background:rgba(0,0,0,0.5); padding:1rem; border-radius:8px;">
                <span style="font-size:0.8rem; color:var(--text-muted);">Los proyectos creados con esta plantilla inyectarán estos datos automáticamente.</span>
                <button class="btn-save" id="btn-save-sector-action" style="background:var(--accent-green); color:black; font-size:1.1rem; padding:12px 30px;">💾 Inyectar a la Biblioteca</button>
            </div>
        `;

        modal.style.display = 'flex';

        document.getElementById('btn-save-sector-action').addEventListener('click', async () => {
            let newId = document.getElementById('modal-sector-id').value.trim().toLowerCase().replace(/\s+/g, '_');
            if(!newId) return alert("El identificador es obligatorio.");

            const rolesData = {};
            HUMA_LEVELS.forEach(lvl => {
                const delivText = document.getElementById(`deliv-${lvl.id}`).value;
                
                // Parseador inteligente de VNA con validación de tipo
                const standard_deliverables = delivText.split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const parts = line.split('|').map(p => p.trim());
                        let to = '?';
                        let estimatedHours = 0;
                        let tipo = 'tangible';
                        let name = 'Entregable';
                        
                        if (parts.length >= 4) {
                            to = parts[0];
                            estimatedHours = parseFloat(parts[1]) || 0;
                            // Flexibilidad: si escriben 'i', 'int', 'intangible', lo capta.
                            tipo = parts[2].toLowerCase().startsWith('i') ? 'intangible' : 'tangible';
                            name = parts.slice(3).join('|') || name;
                        } else if (parts.length === 3) {
                            // Formato fallback anterior sin tipo: @to | horas | nombre
                            to = parts[0];
                            estimatedHours = parseFloat(parts[1]) || 0;
                            name = parts.slice(2).join('|') || name;
                        } else if (parts.length === 2) {
                            estimatedHours = parseFloat(parts[0]) || 0;
                            name = parts[1];
                        } else {
                            name = parts[0];
                        }
                        
                        return { to, estimatedHours, tipo, name };
                    });

                rolesData[lvl.id] = {
                    name: document.getElementById(`name-${lvl.id}`).value || lvl.label,
                    guardian: document.getElementById(`guard-${lvl.id}`).value || '',
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
            document.getElementById('settingsContent').innerHTML = this.renderTab('ontology', store.getState());
            this.bindContentEvents();
        });
    }
}
