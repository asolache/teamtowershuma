// v9/js/components/SettingsVault.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';

export class SettingsVault {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentTab = 'ai';
    }

    async render() {
        if (!this.container) return;

        await store.init();
        const state = store.getState();
        const activeUser = state.session.activeUserId || '';
        const isEO = state.session.role === 'ecosystem-owner' || activeUser.toLowerCase().includes('alvaro');

        if (!isEO) {
            this.container.innerHTML = `
                <div style="text-align:center; max-width: 600px; margin: 4rem auto; padding: 3rem; background: rgba(10,10,15,0.8); border: 1px dashed var(--accent-red); border-radius: 20px;">
                     <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">🔒</div>
                     <h2 style="color:var(--accent-red); margin-top:0; font-weight:900;">ACCESO DENEGADO</h2>
                     <p style="color:var(--text-muted); margin-bottom: 0;">Solo el Ecosystem Owner o el Arquitecto Mayor pueden acceder a las bóvedas de configuración global.</p>
                </div>
            `;
            return;
        }

        const provider = localStorage.getItem('tt_ai_provider') || 'openai'; // Por defecto OpenAI para evitar CORS
        const keyDeepSeek = localStorage.getItem('tt_key_deepseek') || '';
        const keyOpenAI = localStorage.getItem('tt_key_openai') || '';
        const keyGemini = localStorage.getItem('tt_key_gemini') || '';
        const keyAnthropic = localStorage.getItem('tt_key_anthropic') || '';

        let nodesHtml = '';
        state.globalUsers.forEach(u => {
            const isAgent = u.profile?.isAi;
            const icon = isAgent ? '🤖' : '👤';
            const color = isAgent ? 'var(--accent-purple)' : 'var(--accent-blue)';
            
            nodesHtml += `
                <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; border-left: 4px solid ${color}; margin-bottom: 10px;">
                    <div>
                        <div style="color:white; font-weight:bold;">${icon} ${u.name} <span style="color:#666; font-size:0.8rem; font-family:var(--font-mono);">${u.id}</span></div>
                        <div style="color:#888; font-size:0.8rem; margin-top:4px;">Rol: ${u.globalRole}</div>
                    </div>
                    <button class="btn-del-node" data-id="${u.id}" style="background:transparent; border:1px solid var(--accent-red); color:var(--accent-red); padding:5px 10px; border-radius:8px; cursor:pointer;" ${u.id === activeUser ? 'disabled title="No puedes borrarte a ti mismo"' : ''}>Expulsar</button>
                </div>
            `;
        });

        this.container.innerHTML = `
            <style>
                .sv-tabs { display: flex; gap: 10px; margin-bottom: 2rem; border-bottom: 1px solid #333; padding-bottom: 10px; overflow-x: auto; }
                .sv-tab-btn { background: transparent; border: none; color: #888; font-size: 1rem; font-weight: bold; cursor: pointer; padding: 10px 20px; border-radius: 12px; transition: 0.3s; white-space: nowrap; }
                .sv-tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                .sv-tab-btn.active { color: white; background: rgba(0,176,255,0.1); border: 1px solid rgba(0,176,255,0.3); }

                .sv-tab-content { display: none; animation: fadeIn 0.3s ease-out; }
                .sv-tab-content.active { display: block; }
                
                .settings-section { background: rgba(10,10,15,0.8); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; margin-bottom: 2rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.3);}
                .sec-title { color: white; font-weight: 900; font-size: 1.3rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px dashed #333; padding-bottom: 15px;}
                
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.8rem; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px 16px; border-radius: 12px; font-family: var(--font-mono); font-size: 0.95rem; outline: none; transition: 0.3s; box-sizing: border-box;}
                .form-control:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224,64,251,0.15);}
                
                .btn-save { background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; border: none; padding: 14px 30px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; display: inline-flex; align-items: center; gap: 10px; font-size: 1rem; margin-top: 1rem;}
                .btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(224,64,251,0.4); }
                
                .btn-io { background: transparent; border: 1px dashed var(--accent-green); color: var(--accent-green); padding: 12px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; display: block; width: 100%; text-align: center; margin-bottom: 15px; font-size: 1rem;}
                .btn-io:hover { background: rgba(0, 230, 118, 0.1); border-style: solid; box-shadow: 0 5px 15px rgba(0,230,118,0.2); }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .settings-section { padding: 1.5rem; }
                    .btn-save { width: 100%; justify-content: center; }
                }
            </style>

            <div class="sv-tabs">
                <button class="sv-tab-btn ${this.currentTab === 'ai' ? 'active' : ''}" data-tab="ai">🤖 Motores IA</button>
                <button class="sv-tab-btn ${this.currentTab === 'nodes' ? 'active' : ''}" data-tab="nodes">👥 Padrón de Nodos</button>
                <button class="sv-tab-btn ${this.currentTab === 'system' ? 'active' : ''}" data-tab="system">💾 I/O y Sistema</button>
            </div>

            <div id="sv-tab-ai" class="sv-tab-content ${this.currentTab === 'ai' ? 'active' : ''}">
                <div class="settings-section" style="border-top: 4px solid var(--accent-purple);">
                    <h2 class="sec-title">🤖 Motor de Orquestación y RAG</h2>
                    <p style="color:#aaa; font-size:0.95rem; margin-bottom:2rem;">El Orquestador usará el motor Primario configurado aquí. Si una Key falla, usará el enrutamiento en Cascada (Fallback).</p>
                    
                    <div class="form-group">
                        <label>Motor NLP Primario (Preferencia Global)</label>
                        <select id="inpProvider" class="form-control" style="font-family:var(--font-main); font-weight:bold; color:var(--accent-purple);">
                            <option value="openai" ${provider === 'openai' ? 'selected' : ''}>OpenAI (GPT-4o) - Uso General Seguro</option>
                            <option value="deepseek" ${provider === 'deepseek' ? 'selected' : ''}>DeepSeek (V3/R1) - Optimizado para Código</option>
                            <option value="gemini" ${provider === 'gemini' ? 'selected' : ''}>Google Gemini (1.5 / 2.0) - Multimodal Rápido</option>
                            <option value="anthropic" ${provider === 'anthropic' ? 'selected' : ''}>Anthropic (Claude 3.5/3.7) - VNA (¡Atención: Da error CORS en navegador!)</option>
                            <option value="custom" ${provider === 'custom' ? 'selected' : ''}>Local / Custom API (Ollama)</option>
                        </select>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <div class="form-group">
                            <label>OpenAI API Key</label>
                            <input type="password" id="inpKeyOpenAI" class="form-control" value="${keyOpenAI}" placeholder="sk-proj-...">
                        </div>
                        <div class="form-group">
                            <label>DeepSeek API Key</label>
                            <input type="password" id="inpKeyDeepSeek" class="form-control" value="${keyDeepSeek}" placeholder="sk-...">
                        </div>
                        <div class="form-group">
                            <label>Anthropic API Key</label>
                            <input type="password" id="inpKeyAnthropic" class="form-control" value="${keyAnthropic}" placeholder="sk-ant-...">
                        </div>
                        <div class="form-group">
                            <label>Google Gemini API Key</label>
                            <input type="password" id="inpKeyGemini" class="form-control" value="${keyGemini}" placeholder="AIza...">
                        </div>
                    </div>
                    
                    <button id="btnSaveAi" class="btn-save">💾 Guardar Bóveda de Claves</button>
                </div>
            </div>

            <div id="sv-tab-nodes" class="sv-tab-content ${this.currentTab === 'nodes' ? 'active' : ''}">
                <div class="settings-section" style="border-top: 4px solid var(--accent-blue);">
                    <h2 class="sec-title">👥 Padrón Global de Nodos</h2>
                    <p style="color:#aaa; margin-bottom:2rem;">Gestión centralizada de IAs y Humanos.</p>
                    <div>${nodesHtml}</div>
                </div>
            </div>

            <div id="sv-tab-system" class="sv-tab-content ${this.currentTab === 'system' ? 'active' : ''}">
                <div class="settings-section" style="border-top: 4px solid var(--accent-green);">
                    <h2 class="sec-title" style="color:var(--accent-green);">💾 Portabilidad de Ecosistemas (I/O)</h2>
                    <p style="color:#aaa; margin-bottom:2rem;">Exporta tu red completa a un archivo JSON o importa el trabajo de otro Master Architect.</p>
                    <button id="btnExportOS" class="btn-io">⬇️ Descargar Kernel OS (JSON)</button>
                    <label for="inpImportOS" class="btn-io" style="cursor:pointer; display:inline-block; margin-bottom: 0; color:var(--accent-blue); border-color:var(--accent-blue);">
                        ⬆️ Importar Kernel OS (JSON)
                    </label>
                    <input type="file" id="inpImportOS" accept=".json" style="display:none;">
                </div>

                <div class="settings-section" style="border-top: 4px solid var(--accent-red);">
                    <h2 class="sec-title" style="color:var(--accent-red);">⚠️ Zona de Peligro (Destrucción)</h2>
                    <button id="btnPurgeDb" style="background:rgba(255,82,82,0.1); border:1px solid var(--accent-red); color:var(--accent-red); padding:12px 20px; border-radius:12px; font-weight:bold; cursor:pointer;">🔥 Purgar Cerebro LMS (IndexedDB)</button>
                    <button id="btnPurgeRedux" style="background:transparent; border:1px dashed var(--accent-red); color:var(--accent-red); padding:12px 20px; border-radius:12px; font-weight:bold; cursor:pointer; margin-top:15px; display:block;">🧹 Purgar Proyectos (Redux Store)</button>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        // Lógica de Pestañas
        this.container.querySelectorAll('.sv-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTab = e.target.dataset.tab;
                this.container.querySelectorAll('.sv-tab-btn').forEach(b => b.classList.remove('active'));
                this.container.querySelectorAll('.sv-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.container.querySelector(`#sv-tab-${this.currentTab}`).classList.add('active');
            });
        });

        // 🔥 GUARDADO DE BÓVEDA IA SANEADO
        const btnSaveAi = this.container.querySelector('#btnSaveAi');
        if (btnSaveAi) {
            btnSaveAi.addEventListener('click', () => {
                const providerSelect = this.container.querySelector('#inpProvider');
                const provider = providerSelect.options[providerSelect.selectedIndex].value;
                
                const kDs = this.container.querySelector('#inpKeyDeepSeek').value.trim();
                const kOai = this.container.querySelector('#inpKeyOpenAI').value.trim();
                const kGem = this.container.querySelector('#inpKeyGemini').value.trim();
                const kAnt = this.container.querySelector('#inpKeyAnthropic').value.trim();

                localStorage.setItem('tt_ai_provider', provider);
                if(kDs) localStorage.setItem('tt_key_deepseek', kDs);
                if(kOai) localStorage.setItem('tt_key_openai', kOai);
                if(kGem) localStorage.setItem('tt_key_gemini', kGem);
                if(kAnt) localStorage.setItem('tt_key_anthropic', kAnt);

                btnSaveAi.innerText = "✅ Bóveda Actualizada";
                setTimeout(() => btnSaveAi.innerText = "💾 Guardar Bóveda de Claves", 2000);
            });
        }

        // 🔥 PURGA DE BASES DE DATOS
        const btnPurge = this.container.querySelector('#btnPurgeDb');
        if (btnPurge) {
            btnPurge.addEventListener('click', async () => {
                if(confirm("¡PELIGRO! Esto borrará todos los Memes y Prompts del Cerebro LMS (IndexedDB). ¿Continuar?")) {
                    indexedDB.deleteDatabase('TeamTowers_LMS_V15'); 
                    alert("Cerebro Purgado. Recarga la página para re-inyectar el Genoma Base.");
                    window.location.reload();
                }
            });
        }

        const btnPurgeRedux = this.container.querySelector('#btnPurgeRedux');
        if (btnPurgeRedux) {
            btnPurgeRedux.addEventListener('click', async () => {
                if(confirm("¡PELIGRO! Esto destruirá el estado del Redux (Todos los Proyectos, Kanban y Ledger). ¿Estás seguro?")) {
                    localStorage.removeItem('tt_v9_kernel_state');
                    await KB.init();
                    await KB.deleteNode('global_kernel_state');
                    alert("Redux Destruido. Cerrando Sesión...");
                    window.location.href = '/v9/';
                }
            });
        }

        // 🔥 ELIMINAR NODOS DEL PADRÓN
        this.container.querySelectorAll('.btn-del-node').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const targetId = e.currentTarget.getAttribute('data-id');
                if(confirm(`¿Expulsar definitivamente al nodo ${targetId} de la memoria del Sistema Operativo?`)) {
                    let currentState = store.getState();
                    currentState.globalUsers = currentState.globalUsers.filter(u => u.id !== targetId);
                    store.state = currentState;
                    await store.persistState();
                    alert(`Nodo ${targetId} purgado.`);
                    this.render(); // Re-render componente
                }
            });
        });

        // 🔥 EXPORTAR OS (KERNEL COMPLETO)
        const btnExport = this.container.querySelector('#btnExportOS');
        if (btnExport) {
            btnExport.addEventListener('click', async () => {
                btnExport.innerText = "⏳ Empaquetando...";
                await KB.init();
                const allMemes = await KB.getAllNodes();
                const fullState = store.getState();

                const exportPackage = {
                    metadata: { exportDate: new Date().toISOString(), version: "TeamTowers_V9_Antigravity", architect: fullState.session.activeUserId },
                    redux_state: fullState,
                    lms_database: allMemes
                };

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPackage, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `tt_ecosystem_backup_${Date.now()}.json`);
                document.body.appendChild(downloadAnchorNode); 
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                
                btnExport.innerText = "⬇️ Descargar Kernel OS (JSON)";
            });
        }

        // 🔥 IMPORTAR OS (SOBRESCRIBIR KERNEL)
        const inpImport = this.container.querySelector('#inpImportOS');
        if (inpImport) {
            inpImport.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        if (!importedData.redux_state || !importedData.lms_database) {
                            throw new Error("Formato Antigravity Kernel inválido.");
                        }

                        if(confirm("⚠️ ESTO SOBRESCRIBIRÁ TODA TU BASE DE DATOS ACTUAL. ¿Estás absolutamente seguro de inyectar este Kernel?")) {
                            store.state = importedData.redux_state;
                            await store.persistState();

                            await KB.init();
                            for (const node of importedData.lms_database) {
                                await KB.saveNode(node);
                            }

                            alert("✅ Ecosistema Inyectado con Éxito. El sistema se reiniciará.");
                            window.location.href = '/v9/';
                        }
                    } catch (error) {
                        alert("❌ Error al importar: " + error.message);
                    }
                    inpImport.value = ''; 
                };
                reader.readAsText(file);
            });
        }
    }
}
