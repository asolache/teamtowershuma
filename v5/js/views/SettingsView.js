// v5/js/views/SettingsView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class SettingsView {
    constructor() {
        document.title = "Configuración & Datos | TeamTowers";
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                
                /* Workspace */
                .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                .view-header { margin-bottom: 3rem; }
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: flex-start;}
                
                /* Paneles */
                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; }
                .panel h2 { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                .panel p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; }

                /* Botones de Datos */
                .btn-data { width: 100%; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 10px; border: none; margin-bottom: 10px;}
                .btn-export { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.3); }
                .btn-export:hover { background: rgba(0, 230, 118, 0.2); transform: translateY(-2px); }
                .btn-import { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.3); position: relative; overflow: hidden; }
                .btn-import:hover { background: rgba(0, 176, 255, 0.2); transform: translateY(-2px); }
                .btn-danger { background: rgba(255, 82, 82, 0.1); color: var(--accent-red); border: 1px dashed rgba(255, 82, 82, 0.3); margin-top: 2rem;}
                .btn-danger:hover { background: rgba(255, 82, 82, 0.2); }

                /* Input File Oculto */
                #fileInput { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

                /* Panel AI Keys (NUEVO) */
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; transition: border-color 0.2s;}
                .form-control:focus { border-color: var(--accent-blue); outline: none; box-shadow: 0 0 10px rgba(0, 176, 255, 0.1);}
                
                .btn-save-keys { background: var(--accent-blue); color: black; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; font-size: 1rem; transition: transform 0.2s;}
                .btn-save-keys:hover { transform: scale(1.02); }

                /* Premium Tier Teaser */
                .premium-panel { background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 176, 255, 0.1)); border: 1px solid rgba(224, 64, 251, 0.3); position: relative; overflow: hidden; margin-bottom: 2rem;}
                .premium-badge { position: absolute; top: 15px; right: 15px; background: var(--accent-purple); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                .feature-list { list-style: none; padding: 0; margin: 0 0 1.5rem 0; }
                .feature-list li { color: #ccc; font-size: 0.9rem; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
                .feature-list li::before { content: '✓'; color: var(--accent-green); font-weight: bold; }
                .btn-upgrade { background: var(--accent-purple); color: white; width: 100%; padding: 15px; border-radius: 8px; font-weight: bold; border: none; cursor: not-allowed; opacity: 0.7; }

                @media (max-width: 1024px) {
                    .settings-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .app-layout { flex-direction: column; }
                    .workspace { padding: 1.5rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/settings')}

                <main class="workspace">
                    <div class="view-header">
                        <h1>Configuración de Ecosistema</h1>
                        <p>Gestiona la soberanía de tus datos, tus llaves cognitivas y servicios de red.</p>
                    </div>

                    <div class="settings-grid">
                        
                        <div>
                            <div class="panel" style="margin-bottom: 2rem;">
                                <h2>💾 Soberanía Local (Free Tier)</h2>
                                <p>Tus redes operan en modo "Local-First". Todos los datos y el Ledger residen cifrados en el almacenamiento de este navegador. Puedes exportarlos para llevarlos a otro dispositivo.</p>
                                
                                <button class="btn-data btn-export" id="btnExport">
                                    ⬇️ Exportar JSON del Ecosistema
                                </button>
                                
                                <div class="btn-data btn-import">
                                    ⬆️ Importar Backup JSON
                                    <input type="file" id="fileInput" accept=".json">
                                </div>

                                <button class="btn-data btn-danger" id="btnNuke">
                                    ⚠️ Formatear Kernel (Borrar todo)
                                </button>
                            </div>

                            <div class="panel premium-panel">
                                <div class="premium-badge">Próximamente</div>
                                <h2>☁️ TeamTowers Anchor (Premium)</h2>
                                <p>Eleva la red local a la Nube. Ancla tu Ledger para tener validez mercantil y automatizar la gestión de salidas (Exits).</p>
                                
                                <ul class="feature-list">
                                    <li><strong>Triple-Entry Sync:</strong> Sincronización en tiempo real multi-dispositivo.</li>
                                    <li><strong>Reportes Mercantiles:</strong> Exportación de Cap Table en PDF con validez legal.</li>
                                    <li><strong>Exit Boundaries:</strong> Automatización de Vesting, Cliffs y Penalizaciones.</li>
                                    <li><strong>Liquidity Pools:</strong> Intercambio interno de Slices por activos/cash.</li>
                                </ul>

                                <button class="btn-upgrade">Contactar para Early Access</button>
                            </div>
                        </div>

                        <div>
                            <div class="panel">
                                <h2>🧠 Centro de Mando Cognitivo</h2>
                                <p>Configura las llaves de acceso (API Keys) de los modelos de Inteligencia Artificial. Estas llaves se guardan en tu navegador y se usan para el diseño automático de ecosistemas (VNA) y el Motor de Matching.</p>
                                
                                <div class="form-group">
                                    <label>Proveedor IA por defecto</label>
                                    <select id="inpDefaultProvider" class="form-control" style="font-weight: bold; color: var(--accent-blue);">
                                        <option value="deepseek">DeepSeek Coder (Recomendado)</option>
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

                                <button class="btn-save-keys" id="btnSaveKeys">Guardar Credenciales</button>
                                <div id="keysFeedback" style="display:none; color: var(--accent-green); text-align: center; margin-top: 10px; font-size: 0.8rem; font-weight: bold;">✅ Guardado en LocalStorage</div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        // --- GESTIÓN DE API KEYS ---
        const uiKeys = {
            provider: document.getElementById('inpDefaultProvider'),
            deepseek: document.getElementById('inpDeepseek'),
            openai: document.getElementById('inpOpenai'),
            gemini: document.getElementById('inpGemini'),
            btnSave: document.getElementById('btnSaveKeys'),
            feedback: document.getElementById('keysFeedback')
        };

        // Cargar llaves previas
        uiKeys.provider.value = localStorage.getItem('tt_ai_provider') || 'deepseek';
        uiKeys.deepseek.value = localStorage.getItem('tt_key_deepseek') || '';
        uiKeys.openai.value = localStorage.getItem('tt_key_openai') || '';
        uiKeys.gemini.value = localStorage.getItem('tt_key_gemini') || '';

        // Guardar llaves
        uiKeys.btnSave.addEventListener('click', () => {
            localStorage.setItem('tt_ai_provider', uiKeys.provider.value);
            localStorage.setItem('tt_key_deepseek', uiKeys.deepseek.value.trim());
            localStorage.setItem('tt_key_openai', uiKeys.openai.value.trim());
            localStorage.setItem('tt_key_gemini', uiKeys.gemini.value.trim());
            
            // Para mantener compatibilidad con el código anterior del instanciador
            if (uiKeys.provider.value === 'deepseek') localStorage.setItem('tt_ai_key', uiKeys.deepseek.value.trim());
            if (uiKeys.provider.value === 'openai') localStorage.setItem('tt_ai_key', uiKeys.openai.value.trim());
            if (uiKeys.provider.value === 'gemini') localStorage.setItem('tt_ai_key', uiKeys.gemini.value.trim());

            uiKeys.feedback.style.display = 'block';
            setTimeout(() => uiKeys.feedback.style.display = 'none', 3000);
        });


        // --- SOBERANÍA DE DATOS (BACKUPS) ---
        
        // EXPORTAR ESTADO A JSON
        document.getElementById('btnExport').addEventListener('click', () => {
            const state = store.getState();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            const date = new Date().toISOString().split('T')[0];
            downloadAnchorNode.setAttribute("download", `TeamTowers_OS_Backup_${date}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });

        // IMPORTAR ESTADO DESDE JSON
        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedState = JSON.parse(event.target.result);
                    
                    // Validación ultra básica
                    if (importedState && importedState.projects && Array.isArray(importedState.projects)) {
                        if (confirm("⚠️ Importar sobreescribirá todos los datos actuales de este navegador. ¿Proceder?")) {
                            store.state = importedState;
                            localStorage.setItem('tt_sos_state', JSON.stringify(store.state));
                            alert("✅ Ecosistema restaurado con éxito.");
                            window.location.href = '/v5/';
                        }
                    } else {
                        alert("❌ Archivo JSON inválido o corrupto.");
                    }
                } catch (err) {
                    alert("❌ Error leyendo el archivo JSON.");
                }
            };
            reader.readAsText(file);
        });

        // BORRAR TODO (NUKE)
        document.getElementById('btnNuke').addEventListener('click', () => {
            if (confirm("🚨 PELIGRO: Esto borrará TODOS los proyectos y el Ledger de tu navegador. Esta acción es irreversible. ¿Estás seguro?")) {
                localStorage.removeItem('tt_sos_state');
                window.location.href = '/v5/'; // Redirigir al home forzando reinicio del kernel
            }
        });
    }
}
