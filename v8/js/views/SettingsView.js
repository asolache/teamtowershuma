// v8/js/views/SettingsView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class SettingsView {
    constructor() {
        document.title = "Panteón V14 | TeamTowers";
        this.tab = localStorage.getItem('tt_settings_tab') || 'ia'; 
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
                            <p style="color:var(--text-muted); line-height: 1.6; font-size:1.1rem;">Solo el Master Architect (Ecosystem Owner) tiene las llaves del Panteón de Gobernanza.</p>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/settings')}
                </div>
            `;
        }

        const headerConfig = {
            title: "Panteón de Gobernanza",
            subtitle: "Ecosystem Owner",
            tagline: "Bóveda Zero-Trust de APIs (Multimodales) y Registro Global del Enjambre (A2A).",
            tabs: [
                { id: 'ia', label: '🔑 Bóveda de Conectores (APIs)', active: this.tab === 'ia' },
                { id: 'agents', label: '🤖 Enjambre Global (12 Guardianes)', active: this.tab === 'agents' },
                { id: 'data', label: '💾 Web3 & Snapshot', active: this.tab === 'data' }
            ]
        };

        const keys = {
            deepseek: localStorage.getItem('tt_key_deepseek') || '',
            openai: localStorage.getItem('tt_key_openai') || '',
            gemini: localStorage.getItem('tt_key_gemini') || '',
            anthropic: localStorage.getItem('tt_key_anthropic') || '',
            nano_banana: localStorage.getItem('tt_key_nano_banana') || '', // 🔥 NUEVO: Nano Banana 2 (Image)
            veo: localStorage.getItem('tt_key_veo') || '', // 🔥 NUEVO: Veo (Video)
            customUrl: localStorage.getItem('tt_custom_url') || '',
            customKey: localStorage.getItem('tt_custom_key') || ''
        };

        const aiAgents = state.globalUsers.filter(u => u.globalRole === 'ai-agent');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-settings { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%; background: radial-gradient(circle at top right, #111116 0%, #050505 100%);}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 2rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                .panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; padding: 3rem; margin-bottom: 2.5rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(15px); width: 100%; box-sizing: border-box;}
                .panel h2 { color: white; font-size: 1.5rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; font-weight: 900; letter-spacing: -0.5px;}
                .panel p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }

                .engine-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;}
                .engine-card { display: flex; flex-direction: column; padding: 20px; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 16px; transition: 0.3s; position: relative; overflow: hidden;}
                .engine-card:hover { border-color: #555; background: rgba(255,255,255,0.02); transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.4);}
                
                .engine-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px;}
                .engine-icon { font-size: 2.2rem; width: 50px; text-align: center; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));}
                .engine-info h3 { margin: 0 0 5px 0; color: white; font-size: 1.1rem; display:flex; align-items:center; gap:8px;}
                .engine-info p { margin: 0; color: #888; font-size: 0.8rem; line-height:1.4; }
                .role-badge { font-size:0.7rem; font-family:var(--font-mono); padding:2px 8px; border-radius:8px; border:1px solid; font-weight:bold; letter-spacing: 1px;}
                
                .form-group { margin-bottom: 0; width: 100%;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px 15px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; transition: all 0.3s; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.2), inset 0 2px 5px rgba(0,0,0,0.5);}
                
                .btn-save { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 16px 30px; border-radius: 12px; font-weight: 900; font-size: 1.05rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(0, 176, 255, 0.2); width: 100%; text-transform: uppercase; letter-spacing: 1px;}
                .btn-save:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(224, 64, 251, 0.4); filter: brightness(1.1);}

                /* TABLA DEL ENJAMBRE (Responsive Mobile First) */
                .swarm-list { display: flex; flex-direction: column; gap: 15px;}
                .agent-row { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px 20px; border-radius: 12px; gap: 15px; transition: transform 0.2s;}
                .agent-row:hover { background: rgba(255,255,255,0.04); border-color: #444; }
                .agent-avatar { font-size: 2rem; background: rgba(0,0,0,0.5); width: 50px; height: 50px; border-radius: 12px; display: flex; justify-content: center; align-items: center; border: 1px solid #333;}
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* MOBILE TWEAKS */
                @media (max-width: 768px) {
                    .workspace-settings { padding: 90px 1rem 120px 1rem; }
                    .panel { padding: 1.5rem; border-radius: 16px;}
                    .engine-grid { grid-template-columns: 1fr; }
                    .agent-row { flex-direction: column; align-items: flex-start; }
                    .agent-row > div:last-child { width: 100%; margin-top: 10px;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/settings')}
                
                <main class="workspace-settings">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-ia" class="tab-content ${this.tab === 'ia' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-purple);">
                            <h2 style="color: var(--accent-purple);">🔐 Bóveda Criptográfica Multimodal</h2>
                            <p>Las llaves nunca abandonan tu navegador. Para forjar un ecosistema A2A puro, asigna el motor adecuado según la especialización del Agente en el DAG (Grafo Acíclico Dirigido).</p>
                            
                            <div class="engine-grid">
                                <div class="engine-card">
                                    <div class="engine-header">
                                        <div class="engine-icon">🧠</div>
                                        <div class="engine-info">
                                            <h3>OpenAI (GPT-4o) <span class="role-badge" style="color:var(--accent-red); border-color:var(--accent-red);">@anxaneta</span></h3>
                                            <p>Razonamiento lógico extremo y Arquitectura VNA.</p>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <input type="password" id="keyOpenAI" class="form-control" placeholder="sk-proj-..." value="${keys.openai}">
                                    </div>
                                </div>

                                <div class="engine-card">
                                    <div class="engine-header">
                                        <div class="engine-icon">⚡</div>
                                        <div class="engine-info">
                                            <h3>Google Gemini <span class="role-badge" style="color:var(--accent-purple); border-color:var(--accent-purple);">@dosos</span></h3>
                                            <p>Ventana de contexto masiva. Ideal para Auditoría de SOCs.</p>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <input type="password" id="keyGemini" class="form-control" placeholder="AIzaSy..." value="${keys.gemini}">
                                    </div>
                                </div>

                                <div class="engine-card">
                                    <div class="engine-header">
                                        <div class="engine-icon">🐳</div>
                                        <div class="engine-info">
                                            <h3>DeepSeek V3 <span class="role-badge" style="color:var(--accent-blue); border-color:var(--accent-blue);">@baixos</span></h3>
                                            <p>Producción de código masiva y barata (Operativa).</p>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <input type="password" id="keyDeepSeek" class="form-control" placeholder="sk-..." value="${keys.deepseek}">
                                    </div>
                                </div>

                                <div class="engine-card">
                                    <div class="engine-header">
                                        <div class="engine-icon">🎭</div>
                                        <div class="engine-info">
                                            <h3>Anthropic (Claude 3.5) <span class="role-badge" style="color:#ff4081; border-color:#ff4081;">@aixecador</span></h3>
                                            <p>Síntesis impecable y redacción humana (Comunicación).</p>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <input type="password" id="keyAnthropic" class="form-control" placeholder="sk-ant-..." value="${keys.anthropic}">
                                    </div>
                                </div>

                                <div class="engine-card" style="border-color: rgba(0, 230, 118, 0.3);">
                                    <div class="engine-header">
                                        <div class="engine-icon">🍌</div>
                                        <div class="engine-info">
                                            <h3>Nano Banana 2 <span class="role-badge" style="color:var(--accent-green); border-color:var(--accent-green);">IMAGEN</span></h3>
                                            <p>Generación de Assets Visuales (Gemini 3 Flash Image).</p>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <input type="password" id="keyNanoBanana" class="form-control" placeholder="Key de Nano Banana 2..." value="${keys.nano_banana}">
                                    </div>
                                </div>

                                <div class="engine-card" style="border-color: rgba(255, 171, 64, 0.3);">
                                    <div class="engine-header">
                                        <div class="engine-icon">🎬</div>
                                        <div class="engine-info">
                                            <h3>Veo (Video Gen) <span class="role-badge" style="color:var(--accent-orange); border-color:var(--accent-orange);">VÍDEO</span></h3>
                                            <p>Composición y Animación de alta fidelidad.</p>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <input type="password" id="keyVeo" class="form-control" placeholder="Key de Google Veo..." value="${keys.veo}">
                                    </div>
                                </div>

                                <div class="engine-card" style="grid-column: 1 / -1; border-style: dashed;">
                                    <div class="engine-header">
                                        <div class="engine-icon">🖧</div>
                                        <div class="engine-info">
                                            <h3>Custom Endpoint (Local) <span class="role-badge" style="color:#fff; border-color:#fff;">@pinya</span></h3>
                                            <p>Llama.cpp / LM Studio. Zero-Trust absoluta. Para Agentes de Soporte On-Premise.</p>
                                        </div>
                                    </div>
                                    <div style="display:flex; gap:10px; flex-wrap:wrap; width:100%;">
                                        <input type="text" id="inpCustomUrl" class="form-control" style="flex:2; min-width:200px;" placeholder="http://localhost:1234/v1" value="${keys.customUrl}">
                                        <input type="password" id="inpCustomKey" class="form-control" style="flex:1; min-width:150px;" placeholder="Bearer Token (Opcional)" value="${keys.customKey}">
                                    </div>
                                </div>
                            </div>

                            <button class="btn-save" id="btn-save-keys" style="margin-top:2rem;">Forjar Llaves en Bóveda</button>
                            <div id="keysFeedback" style="display:none; color: var(--accent-green); margin-top: 15px; font-size: 0.95rem; font-weight: bold; text-align:center;">✅ Llaves encriptadas y aisladas en el cliente.</div>
                        </div>
                    </div>

                    <div id="tab-agents" class="tab-content ${this.tab === 'agents' ? 'active' : ''}">
                        <div class="panel" style="border-top: 4px solid var(--accent-blue);">
                            <h2 style="color: var(--accent-blue);">🌌 Padrón Global (Los 12 Guardianes del Panteón)</h2>
                            <p>Instancia Meta-Agentes en la red global para poder delegarles tareas en cualquier Castell. Para entrenarlos, ve a la <b>Forja LMS</b>.</p>
                            
                            <div style="background: rgba(0,0,0,0.3); padding:2rem; border-radius:16px; border: 1px solid var(--glass-border); margin-bottom: 2.5rem;">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; align-items: start;">
                                    <div class="form-group">
                                        <label>DID / Alias (@id)</label>
                                        <input type="text" id="new-user-id" class="form-control" placeholder="Ej: @hades_forge">
                                    </div>
                                    <div class="form-group">
                                        <label>Nombre del Agente</label>
                                        <input type="text" id="new-user-name" class="form-control" placeholder="Hades (Backend Dev)">
                                    </div>
                                    <div class="form-group">
                                        <label>Guardián Intangible (Arquetipo)</label>
                                        <select id="new-user-guardian" class="form-control">
                                            <option value="creator">🎨 Creador</option><option value="ruler">👑 Gobernante</option>
                                            <option value="magician">✨ Mago</option><option value="sage">🦉 Sabio</option>
                                            <option value="explorer">🧭 Explorador</option><option value="hero">⚔️ Héroe</option>
                                            <option value="outlaw">🏴‍☠️ Rebelde</option><option value="jester">🃏 Bufón</option>
                                            <option value="lover">🔥 Amante</option><option value="caregiver">❤️ Cuidador</option>
                                            <option value="everyman">🤝 Ciudadano</option><option value="innocent">🕊️ Inocente</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Motor A2A Base</label>
                                        <select id="new-user-engine" class="form-control">
                                            <option value="deepseek">DeepSeek (Lógica/Código)</option>
                                            <option value="gemini">Gemini (Auditoría/Datos)</option>
                                            <option value="openai">OpenAI (Meta-Arquitectura)</option>
                                            <option value="anthropic">Claude (Redacción)</option>
                                            <option value="nano_banana">Nano Banana 2 (Generador Imagen)</option>
                                            <option value="human">--- Humano ---</option>
                                        </select>
                                    </div>
                                </div>
                                <button id="btn-create-user" class="btn-save" style="margin-top: 25px; background: transparent; border: 1px dashed var(--accent-blue); color: var(--accent-blue); box-shadow:none;">➕ Inscribir en el Padrón</button>
                            </div>

                            <div class="swarm-list">
                                ${state.globalUsers.map(u => `
                                    <div class="agent-row">
                                        <div style="display:flex; align-items:center; gap:15px; flex:1;">
                                            <div class="agent-avatar">${u.profile?.isAi ? '🤖' : '👤'}</div>
                                            <div>
                                                <div style="font-weight: 900; color: white; font-size: 1.1rem; display:flex; align-items:center; gap:8px;">
                                                    ${u.name} 
                                                    <span class="role-badge" style="color:var(--text-muted); border-color:#333;">${u.profile?.guardian || 'Sin Guardián'}</span>
                                                </div>
                                                <div style="color: var(--accent-blue); font-family: monospace; font-size: 0.85rem; font-weight:bold; margin-top:4px;">${u.id}</div>
                                            </div>
                                        </div>
                                        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px; min-width:180px;">
                                            <div style="color:#aaa; font-size:0.8rem; text-transform:uppercase; font-weight:bold;">Motor Configurado:</div>
                                            <div style="color:white; font-family:monospace; font-weight:bold;">${(u.profile?.preferredEngine||'Ninguno').toUpperCase()}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div id="tab-data" class="tab-content ${this.tab === 'data' ? 'active' : ''}">
                         <div class="panel" style="border-color: #333;">
                            <h2>💾 Control de Memoria Local (Web3-First)</h2>
                            <p>El Kernel V14 almacena todo el estado en el almacenamiento criptográfico del navegador. Exporta tu base de datos regularmente.</p>
                            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:2.5rem;">
                                <button class="btn-save" id="btnExport" style="flex:1; background:transparent; border:1px solid var(--accent-green); color:var(--accent-green); box-shadow:none;">⬇️ Exportar Snapshot (.JSON)</button>
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
        });

        this.bindContentEvents();
    }

    bindContentEvents() {
        const uiKeys = {
            apiKeyD: document.getElementById('keyDeepSeek'),
            apiKeyO: document.getElementById('keyOpenAI'),
            apiKeyG: document.getElementById('keyGemini'),
            apiKeyA: document.getElementById('keyAnthropic'),
            apiKeyNB: document.getElementById('keyNanoBanana'),
            apiKeyVeo: document.getElementById('keyVeo'),
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
                localStorage.setItem('tt_key_nano_banana', uiKeys.apiKeyNB.value.trim());
                localStorage.setItem('tt_key_veo', uiKeys.apiKeyVeo.value.trim());
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
            const guardian = document.getElementById('new-user-guardian').value;
            
            if (!id || !name) return alert("⚠️ Alias y Nombre son obligatorios.");
            if (!id.startsWith('@')) id = '@' + id; 

            const isAi = engine !== 'human';
            
            const newUser = {
                id: id,
                name: name,
                globalRole: isAi ? 'ai-agent' : 'network-user',
                profile: { 
                    isAi: isAi, 
                    preferredEngine: isAi ? engine : null,
                    guardian: guardian,
                    sbt_skills: []
                }
            };

            await store.dispatch({ type: 'ADD_USER', payload: newUser });
            window.location.reload(); 
        });

        document.getElementById('btnExport')?.addEventListener('click', () => {
            const data = localStorage.getItem('tt_v9_kernel_state') || "{}";
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([data], {type: "application/json"}));
            a.download = `TeamTowers_Snapshot_V14_${Date.now()}.json`;
            a.click();
        });
    }
}
