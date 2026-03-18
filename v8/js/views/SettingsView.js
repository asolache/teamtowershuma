// v8/js/views/SettingsView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class SettingsView {
    constructor() {
        document.title = "Consola Global | TeamTowers V14";
        this.currentTab = 'ai';
    }

    async getHtml() {
        const state = store.getState();
        const activeUser = state.session.activeUserId || '';
        
        // 🔥 FIX SEGURIDAD: Override para el Arquitecto Mayor (@alvaro)
        const isEO = state.session.role === 'ecosystem-owner' || activeUser.toLowerCase().includes('alvaro');

        if (!isEO) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/settings')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center; max-width: 600px; border: 1px dashed var(--accent-red);">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">🔒</div>
                             <h2 style="color:var(--accent-red); margin-top:0; font-weight:900;">ACCESO DENEGADO</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem;">Solo el Ecosystem Owner o el Arquitecto Mayor pueden acceder a las bóvedas de configuración global.</p>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/settings')}
                </div>
            `;
        }

        const headerConfig = {
            title: "Panteón (Consola Global)",
            tagline: "Configuración Root, Modelos IA, y Bóveda de Claves.",
            tabs: [
                { id: 'ai', label: '🤖 Motores IA', active: this.currentTab === 'ai' },
                { id: 'nodes', label: '👥 Nodos y Padrón', active: this.currentTab === 'nodes' },
                { id: 'system', label: '⚙️ Sistema', active: this.currentTab === 'system' }
            ]
        };

        const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        const keyDeepSeek = localStorage.getItem('tt_key_deepseek') || '';
        const keyOpenAI = localStorage.getItem('tt_key_openai') || '';
        const keyGemini = localStorage.getItem('tt_key_gemini') || '';

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-settings { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box;}
                
                .tab-content { display: none; animation: fadeIn 0.3s ease-out; padding-bottom: 5rem;}
                .tab-content.active { display: block; }
                
                .settings-section { background: rgba(10,10,15,0.8); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; margin-bottom: 2rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.3);}
                .sec-title { color: white; font-weight: 900; font-size: 1.3rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px dashed #333; padding-bottom: 15px;}
                
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.8rem; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px 16px; border-radius: 12px; font-family: var(--font-mono); font-size: 0.95rem; outline: none; transition: 0.3s; box-sizing: border-box;}
                .form-control:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224,64,251,0.15);}
                
                .btn-save { background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; border: none; padding: 14px 30px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; display: inline-flex; align-items: center; gap: 10px; font-size: 1rem; margin-top: 1rem;}
                .btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(224,64,251,0.4); }

                @media (max-width: 768px) {
                    .workspace-settings { padding: 90px 1rem 120px 1rem; }
                    .settings-section { padding: 1.5rem; }
                    .btn-save { width: 100%; justify-content: center; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/settings')}

                <main class="workspace-settings">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-ai" class="tab-content ${this.currentTab === 'ai' ? 'active' : ''}">
                        <div class="settings-section" style="border-top: 4px solid var(--accent-purple);">
                            <h2 class="sec-title">🤖 Motor de Orquestación y RAG</h2>
                            <p style="color:#aaa; font-size:0.95rem; margin-bottom:2rem;">Configura las credenciales (Zero-Trust) almacenadas localmente en tu navegador. El Orquestador usará este motor por defecto.</p>
                            
                            <div class="form-group">
                                <label>Motor LLM Primario</label>
                                <select id="inpProvider" class="form-control" style="font-family:var(--font-main); font-weight:bold; color:var(--accent-purple);">
                                    <option value="deepseek" ${provider === 'deepseek' ? 'selected' : ''}>DeepSeek (V3/R1)</option>
                                    <option value="openai" ${provider === 'openai' ? 'selected' : ''}>OpenAI (GPT-4o)</option>
                                    <option value="gemini" ${provider === 'gemini' ? 'selected' : ''}>Google Gemini (1.5 / 2.0)</option>
                                    <option value="custom" ${provider === 'custom' ? 'selected' : ''}>Local / Custom API</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>DeepSeek API Key</label>
                                <input type="password" id="inpKeyDeepSeek" class="form-control" value="${keyDeepSeek}" placeholder="sk-...">
                            </div>

                            <div class="form-group">
                                <label>OpenAI API Key</label>
                                <input type="password" id="inpKeyOpenAI" class="form-control" value="${keyOpenAI}" placeholder="sk-proj-...">
                            </div>

                            <div class="form-group">
                                <label>Google Gemini API Key</label>
                                <input type="password" id="inpKeyGemini" class="form-control" value="${keyGemini}" placeholder="AIza...">
                            </div>

                            <button id="btnSaveAi" class="btn-save">💾 Guardar Bóveda de Claves</button>
                        </div>
                    </div>

                    <div id="tab-nodes" class="tab-content ${this.currentTab === 'nodes' ? 'active' : ''}">
                        <div class="settings-section">
                            <h2 class="sec-title">👥 Padrón Global de Nodos</h2>
                            <p style="color:#aaa; margin-bottom:2rem;">Gestión de IAs y Humanos registrados en el Kernel.</p>
                            <div style="padding: 2rem; border: 1px dashed #444; border-radius: 12px; text-align: center; color: #666;">
                                (Módulo de Padrón en desarrollo para el próximo Sprint)
                            </div>
                        </div>
                    </div>

                    <div id="tab-system" class="tab-content ${this.currentTab === 'system' ? 'active' : ''}">
                        <div class="settings-section" style="border-top: 4px solid var(--accent-red);">
                            <h2 class="sec-title" style="color:var(--accent-red);">⚠️ Zona de Peligro (Sistema)</h2>
                            <p style="color:#aaa; margin-bottom:2rem;">Acciones destructivas del Kernel.</p>
                            
                            <button id="btnPurgeDb" style="background:rgba(255,82,82,0.1); border:1px solid var(--accent-red); color:var(--accent-red); padding:12px 20px; border-radius:12px; font-weight:bold; cursor:pointer;">🔥 Purgar Red Neuronal (LMS IndexedDB)</button>
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

        const state = store.getState();
        const activeUser = state.session.activeUserId || '';
        const isEO = state.session.role === 'ecosystem-owner' || activeUser.toLowerCase().includes('alvaro');
        if (!isEO) return;

        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');
        });

        const btnSaveAi = document.getElementById('btnSaveAi');
        if (btnSaveAi) {
            btnSaveAi.addEventListener('click', () => {
                const provider = document.getElementById('inpProvider').value;
                const kDs = document.getElementById('inpKeyDeepSeek').value.trim();
                const kOai = document.getElementById('inpKeyOpenAI').value.trim();
                const kGem = document.getElementById('inpKeyGemini').value.trim();

                localStorage.setItem('tt_ai_provider', provider);
                if(kDs) localStorage.setItem('tt_key_deepseek', kDs);
                if(kOai) localStorage.setItem('tt_key_openai', kOai);
                if(kGem) localStorage.setItem('tt_key_gemini', kGem);

                btnSaveAi.innerText = "✅ Bóveda Actualizada";
                setTimeout(() => btnSaveAi.innerText = "💾 Guardar Bóveda de Claves", 2000);
            });
        }

        const btnPurge = document.getElementById('btnPurgeDb');
        if (btnPurge) {
            btnPurge.addEventListener('click', async () => {
                if(confirm("¡PELIGRO! Esto borrará todos los Memes y Prompts del Cerebro LMS (IndexedDB). ¿Continuar?")) {
                    indexedDB.deleteDatabase('TeamTowers_LMS_V14');
                    alert("Cerebro Purgado. Recarga la página para re-inyectar el Genoma Base.");
                    window.location.reload();
                }
            });
        }
    }
}
