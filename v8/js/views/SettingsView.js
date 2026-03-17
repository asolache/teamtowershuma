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
            tagline: "Central de Orquestación A2A: Motores LLM, Padrón de Agentes W3C y Genoma.",
            tabs: [
                { id: 'ia', label: '🧠 Motores & APIs', active: this.tab === 'ia' },
                { id: 'agents', label: '🤖 Reclutar Agente (A2A)', active: this.tab === 'agents' },
                { id: 'ontology', label: '🧬 ADN Base (LMS)', active: this.tab === 'ontology' },
                { id: 'stakeholders', label: '🌌 Macro-VNA', active: this.tab === 'stakeholders' },
                { id: 'data', label: '💾 Web3 & Datos', active: this.tab === 'data' }
            ]
        };

        const keys = {
            provider: localStorage.getItem('tt_ai_provider') || 'deepseek',
            deepseek: localStorage.getItem('tt_key_deepseek') || '',
            openai: localStorage.getItem('tt_key_openai') || '',
            gemini: localStorage.getItem('tt_key_gemini') || '',
            anthropic: localStorage.getItem('tt_key_anthropic') || '',
            customUrl: localStorage.getItem('tt_custom_url') || '',
            customKey: localStorage.getItem('tt_custom_key') || ''
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-settings { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%; background: radial-gradient(circle at top right, #111116 0%, #050505 100%);}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 2rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                .panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; padding: 3rem; margin-bottom: 2.5rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(15px); width: 100%; box-sizing: border-box;}
                .panel h2 { color: white; font-size: 1.5rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; font-weight: 900; letter-spacing: -0.5px;}
                .panel p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }

                .engine-card { display: flex; align-items: center; gap: 20px; padding: 20px; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 16px; margin-bottom: 15px; transition: 0.3s;}
                .engine-card:hover { border-color: #555; background: rgba(255,255,255,0.02); }
                .engine-icon { font-size: 2.5rem; width: 60px; text-align: center; }
                .engine-info { flex: 1; }
                .engine-info h3 { margin: 0 0 5px 0; color: white; font-size: 1.1rem; display:flex; align-items:center; gap:10px;}
                .engine-info p { margin: 0; color: #888; font-size: 0.85rem; line-height:1.4; }
                .role-badge { font-size:0.7rem; font-family:var(--font-mono); padding:2px 8px; border-radius:12px; border:1px solid; }

                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px 18px; border-radius: 12px; font-family: var(--font-mono); font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.2), inset 0 2px 5px rgba(0,0,0,0.5);}
                
                .btn-save { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 16px 30px; border-radius: 12px; font-weight: 900; font-size: 1.05rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(0, 176, 255, 0.2); width: 100%; text-transform: uppercase; letter-spacing: 1px;}
                .btn-save:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(224, 64, 251, 0.4); filter: brightness(1.1);}

                .ontology-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; width: 100%;}
                .sector-card { background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 2rem; border-top: 4px solid var(--accent-blue); display:flex; flex-direction:column; backdrop-filter: blur(10px); transition: transform 0.3s; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);}
                .sector-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); box-shadow: 0 15px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(0,0,0,0.5);}
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/settings')}
                
                <main class="workspace-settings">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-ia" class="tab-content ${this.tab === 'ia' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-purple);">
                            <h2 style="color: var(--accent-purple);">🧠 Orquestadores Cognitivos (Matriz de APIs)</h2>
                            <p>Conecta los cerebros externos. Para una topología A2A eficiente, no uses un solo modelo. Asigna el LLM adecuado al nodo adecuado según su rol en el flujo VNA.</p>
                            
                            <div class="engine-card">
                                <div class="engine-icon">🧠</div>
                                <div class="engine-info">
                                    <h3>OpenAI (GPT-4o) <span class="role-badge" style="color:var(--accent-red); border-color:var(--accent-red);">@anxaneta</span></h3>
                                    <p>Especialización: Razonamiento lógico extremo, meta-prompting y arquitecturas VNA complejas. Alto coste/h.</p>
                                    <div class="form-group" style="margin-top: 10px;">
                                        <input type="password" id="keyOpenAI" class="form-control" placeholder="sk-proj-..." value="${keys.openai}">
                                    </div>
                                </div>
                            </div>

                            <div class="engine-card">
                                <div class="engine-icon">⚡</div>
                                <div class="engine-info">
                                    <h3>Google Gemini (1.5 Pro/Flash) <span class="role-badge" style="color:var(--accent-purple); border-color:var(--accent-purple);">@dosos</span></h3>
                                    <p>Especialización: Ventana masiva (2M tokens). Perfecto para auditar repositorios de GitHub y revisión de SOCs.</p>
                                    <div class="form-group" style="margin-top: 10px;">
                                        <input type="password" id="keyGemini" class="form-control" placeholder="AIzaSy..." value="${keys.gemini}">
                                    </div>
                                </div>
                            </div>

                            <div class="engine-card">
                                <div class="engine-icon">🎭</div>
                                <div class="engine-info">
                                    <h3>Anthropic (Claude 3.5) <span class="role-badge" style="color:#ff4081; border-color:#ff4081;">@aixecador</span></h3>
                                    <p>Especialización: Síntesis de Sprints, redacción humana y estructuración estricta de JSON/YAML.</p>
                                    <div class="form-group" style="margin-top: 10px;">
                                        <input type="password" id="keyAnthropic" class="form-control" placeholder="sk-ant-..." value="${keys.anthropic}">
                                    </div>
                                </div>
                            </div>

                            <div class="engine-card">
                                <div class="engine-icon">🐳</div>
                                <div class="engine-info">
                                    <h3>DeepSeek (Coder/V3) <span class="role-badge" style="color:var(--accent-blue); border-color:var(--accent-blue);">@baixos</span></h3>
                                    <p>Especialización: Producción de código crudo. Coste marginal ultra-bajo para ejecución continua de SOPs.</p>
                                    <div class="form-group" style="margin-top: 10px;">
                                        <input type="password" id="keyDeepSeek" class="form-control" placeholder="sk-..." value="${keys.deepseek}">
                                    </div>
                                </div>
                            </div>

                            <div class="engine-card" style="border-style: dashed;">
                                <div class="engine-icon">🖧</div>
                                <div class="engine-info">
                                    <h3>Custom Endpoint (Local) <span class="role-badge" style="color:#fff; border-color:#fff;">@pinya</span></h3>
                                    <p>Especialización: Llama.cpp / LM Studio. Privacidad Zero-Trust absoluta. Soporte y volumen gratuito.</p>
                                    <div style="display:flex; gap:10px; margin-top:10px;">
                                        <input type="text" id="inpCustomUrl" class="form-control" placeholder="http://localhost:1234/v1" value="${keys.customUrl}">
                                        <input type="password" id="inpCustomKey" class="form-control" placeholder="Bearer Token (Opcional)" value="${keys.customKey}">
                                    </div>
                                </div>
                            </div>

                            <button class="btn-save" id="btn-save-keys" style="margin-top:2rem;">Forjar Llaves Criptográficas</button>
                            <div id="keysFeedback" style="display:none; color: var(--accent-green); margin-top: 15px; font-size: 0.95rem; font-weight: bold; text-align:center;">✅ Llaves encriptadas en la memoria del navegador.</div>
                        </div>
                    </div>

                    <div id="tab-agents" class="tab-content ${this.tab === 'agents' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-blue);">
                            <h2 style="color: var(--accent-blue);">➕ Reclutamiento W3C (Agentes y Humanos)</h2>
                            <p>Convierte a un Agente (o Humano) en un meme evolutivo A2A. Al inyectarlo, su identidad se convierte en un nodo válido para las Work Orders del ecosistema.</p>
                            
                            <div style="background: rgba(0,0,0,0.3); padding:2rem; border-radius:16px; border: 1px solid var(--glass-border); margin-bottom: 2rem;">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; align-items: start;">
                                    <div class="form-group" style="margin:0;">
                                        <label>DID / Alias (@id)</label>
                                        <input type="text" id="new-user-id" class="form-control" placeholder="Ej: @rust_auditor">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Nombre del Nodo</label>
                                        <input type="text" id="new-user-name" class="form-control" placeholder="Rust QA Bot">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Versión Semántica</label>
                                        <input type="text" id="new-user-version" class="form-control" placeholder="v1.0.0" value="v1.0.0">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Motor A2A Preferido</label>
                                        <select id="new-user-engine" class="form-control">
                                            <option value="deepseek">DeepSeek (@baixos)</option>
                                            <option value="gemini">Gemini (@dosos)</option>
                                            <option value="anthropic">Claude (@aixecador)</option>
                                            <option value="openai">OpenAI (@anxaneta)</option>
                                            <option value="human">--- Humano ---</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-group" style="margin-top:20px;">
                                    <label>System Prompt Base / Wallet / Repositorio Github</label>
                                    <textarea id="new-user-contact" class="form-control" style="min-height: 80px; resize:vertical;" placeholder="Instrucciones fundacionales del agente o dirección de contacto humano..."></textarea>
                                </div>
                                <button id="btn-create-user" class="btn-save" style="margin-top: 15px; background: var(--accent-green); color:black;">Inyectar al Padrón Global</button>
                            </div>

                            <h3 style="color: white; border-bottom: 1px solid #333; padding-bottom: 10px;">Registro VNA Global (${state.globalUsers.length} Nodos)</h3>
                            <div style="overflow-x:auto; max-height: 400px; overflow-y:auto;">
                                <table style="width:100%; border-collapse:collapse; text-align:left;">
                                    <tr style="border-bottom:1px solid #444; position: sticky; top: 0; background: rgba(10,10,15,0.95);">
                                        <th style="padding:15px; color:#aaa;">DID (Alias)</th>
                                        <th style="padding:15px; color:#aaa;">Motor / Versión</th>
                                        <th style="padding:15px; color:#aaa;">Privilegios</th>
                                    </tr>
                                    ${state.globalUsers.map(u => `
                                        <tr style="border-bottom:1px solid #222;">
                                            <td style="padding:15px; font-weight: bold; color: var(--accent-blue); font-family: monospace;">${u.id}</td>
                                            <td style="padding:15px; color: white; font-weight: 900;">
                                                ${u.profile?.isAi ? '🤖 ' + (u.profile.preferredEngine||'native').toUpperCase() : '👤 HUMANO'} 
                                                <span style="color:#666; font-size:0.7rem;">${u.profile?.version || 'v1.0'}</span>
                                            </td>
                                            <td style="padding:15px; color: ${u.globalRole === 'ecosystem-owner' ? 'var(--accent-orange)' : '#888'}; font-weight:bold;">${u.globalRole === 'ecosystem-owner' ? '👑 Owner' : (u.profile?.isAi ? 'A2A AGENT' : 'CIUDADANO')}</td>
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

                    <div id="tab-data" class="tab-content ${this.tab === 'data' ? 'active' : ''}">
                         <div class="panel" style="border-color: #333;">
                            <h2>💾 Control de Memoria Local (Web3-First)</h2>
                            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:2.5rem;">
                                <button class="btn-success-outline" id="btnExport" style="flex:1;">⬇️ Exportar Snapshot (.JSON)</button>
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

        window.addEventListener('ph-tab-changed', (e) => {
            this.tab = e.detail.tabId;
            localStorage.setItem('tt_settings_tab', this.tab);
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.tab}`);
            if(target) target.classList.add('active');

            if(this.tab === 'ontology') this.renderOntologyGrids();
        });

        if(this.tab === 'ontology') this.renderOntologyGrids();

        this.bindContentEvents();
    }

    bindContentEvents() {
        const uiKeys = {
            apiKeyD: document.getElementById('keyDeepSeek'),
            apiKeyO: document.getElementById('keyOpenAI'),
            apiKeyG: document.getElementById('keyGemini'),
            apiKeyA: document.getElementById('keyAnthropic'),
            customUrl: document.getElementById('inpCustomUrl'),
            customKey: document.getElementById('inpCustomKey'),
            btnSave: document.getElementById('btn-save-keys'),
            feedback: document.getElementById('keysFeedback')
        };

        if (uiKeys.btnSave) {
            uiKeys.btnSave.addEventListener('click', () => {
                localStorage.setItem('tt_key_deepseek', uiKeys.apiKeyD.value.trim());
                localStorage.setItem('tt_key_openai', uiKeys.apiKeyO.value.trim());
                localStorage.setItem('tt_key_gemini', uiKeys.apiKeyG.value.trim());
                localStorage.setItem('tt_key_anthropic', uiKeys.apiKeyA.value.trim());
                localStorage.setItem('tt_custom_url', uiKeys.customUrl.value.trim());
                localStorage.setItem('tt_custom_key', uiKeys.customKey.value.trim());
                
                uiKeys.feedback.style.display = 'block';
                setTimeout(() => uiKeys.feedback.style.display = 'none', 3000);
            });
        }

        document.getElementById('btn-create-user')?.addEventListener('click', async () => {
            let id = document.getElementById('new-user-id').value.trim();
            const name = document.getElementById('new-user-name').value.trim();
            const engine = document.getElementById('new-user-engine').value;
            const version = document.getElementById('new-user-version').value.trim();
            const contactOrPrompt = document.getElementById('new-user-contact').value.trim();
            
            if (!id || !name) return alert("⚠️ Alias y Nombre son obligatorios.");
            if (!id.startsWith('@')) id = '@' + id; 

            const isAi = engine !== 'human';
            
            const newUser = {
                id: id,
                name: name,
                globalRole: isAi ? 'ai-agent' : 'network-user',
                walletOrSocial: !isAi ? contactOrPrompt : undefined,
                profile: { 
                    isAi: isAi, 
                    preferredEngine: isAi ? engine : null,
                    version: version || 'v1.0.0', 
                    vision: contactOrPrompt, 
                    structural_affinity: ['@baixos'] // Por defecto, se forjará como productor
                }
            };

            await store.dispatch({ type: 'ADD_USER', payload: newUser });
            alert(`✅ Nodo ${id} inyectado al Padrón.`);
            window.location.reload(); 
        });
    }

    async renderOntologyGrids() {
        const nativeGrid = document.getElementById('nativeOntologyGrid');
        if(!nativeGrid) return;
        await KB.init();
        this.sectorsFromKB = await KB.getAvailableSectors();
        const sectorKeys = Object.keys(this.sectorsFromKB);
        if (sectorKeys.length === 0) return;

        nativeGrid.innerHTML = sectorKeys.map(key => {
            const sectorData = this.sectorsFromKB[key]; 
            return `
            <div class="sector-card native">
                <h3 style="color:#00b0ff; margin-top:0;">${sectorData.label.toUpperCase()}</h3>
            </div>
            `
        }).join('');
    }
}
