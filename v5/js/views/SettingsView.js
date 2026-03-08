// v5/js/views/SettingsView.js
import { store } from '../core/store.js';

export default class SettingsView {
    constructor() {
        document.title = "Configuración & Datos | TeamTowers";
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* Sidebar Universal */
                .sidebar { width: 260px; background: rgba(15, 15, 20, 0.95); border-right: 1px solid rgba(255,255,255,0.05); padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 10px; z-index: 10; flex-shrink: 0; overflow-y: auto;}
                .side-section { margin-bottom: 1rem; }
                .side-link { padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; color: #888; text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
                .side-link:hover { background: rgba(255,255,255,0.05); color: white; }
                .side-link.active { background: rgba(0, 176, 255, 0.1); color: #00b0ff; font-weight: bold; border-left: 3px solid #00b0ff; }
                .sidebar-footer { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; }

                /* Workspace */
                .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                .view-header { margin-bottom: 3rem; }
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: #888; font-size: 0.95rem; margin-top: 5px; }

                .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                
                /* Paneles */
                .panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 2rem; }
                .panel h2 { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; }
                .panel p { color: #888; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; }

                /* Botones de Datos */
                .btn-data { width: 100%; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 10px; border: none; margin-bottom: 10px;}
                .btn-export { background: rgba(0, 230, 118, 0.1); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.3); }
                .btn-export:hover { background: rgba(0, 230, 118, 0.2); transform: translateY(-2px); }
                .btn-import { background: rgba(0, 176, 255, 0.1); color: #00b0ff; border: 1px solid rgba(0, 176, 255, 0.3); position: relative; overflow: hidden; }
                .btn-import:hover { background: rgba(0, 176, 255, 0.2); transform: translateY(-2px); }
                .btn-danger { background: rgba(255, 82, 82, 0.1); color: #ff5252; border: 1px dashed rgba(255, 82, 82, 0.3); margin-top: 2rem;}
                .btn-danger:hover { background: rgba(255, 82, 82, 0.2); }

                /* Input File Oculto */
                #fileInput { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

                /* Premium Tier Teaser */
                .premium-panel { background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 176, 255, 0.1)); border: 1px solid rgba(224, 64, 251, 0.3); position: relative; overflow: hidden;}
                .premium-badge { position: absolute; top: 15px; right: 15px; background: #e040fb; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                .feature-list { list-style: none; padding: 0; margin: 0 0 1.5rem 0; }
                .feature-list li { color: #ccc; font-size: 0.9rem; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
                .feature-list li::before { content: '✓'; color: #00e676; font-weight: bold; }
                .btn-upgrade { background: #e040fb; color: white; width: 100%; padding: 15px; border-radius: 8px; font-weight: bold; border: none; cursor: not-allowed; opacity: 0.7; }

                @media (max-width: 768px) {
                    .app-layout { flex-direction: column; }
                    .sidebar { width: 100%; padding: 1rem; flex-direction: row; overflow-x: auto; flex-wrap: nowrap; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .sidebar-footer { display: none; }
                    .settings-grid { grid-template-columns: 1fr; }
                }
            </style>

            <div class="app-layout">
                <aside class="sidebar">
                    <div style="font-weight: bold; font-family: monospace; color: white; margin-bottom: 2rem; font-size: 1.2rem; flex-shrink: 0;">🗼 TeamTowers</div>
                    
                    <div class="side-section">
                        <a href="/v5/" class="side-link" data-link>🏠 Inicio</a>
                        <a href="/v5/network" class="side-link" data-link>🌐 Explorar DAOs</a>
                        <a href="/v5/create" class="side-link" data-link>➕ Instanciar Red</a>
                    </div>
                    
                    <div class="sidebar-footer">
                        <a href="/v5/settings" class="side-link active" data-link style="font-size: 0.8rem;">⚙️ Configuración & Datos</a>
                    </div>
                </aside>

                <main class="workspace">
                    <div class="view-header">
                        <h1>Configuración de Ecosistema</h1>
                        <p>Gestiona la soberanía de tus datos descentralizados o actualiza a los servicios de red anclados.</p>
                    </div>

                    <div class="settings-grid">
                        <div class="panel">
                            <h2>💾 Soberanía Local (Free Tier)</h2>
                            <p>Tus redes operan actualmente en modo "Local-First". Todos los datos y el ledger inmutable residen cifrados en el almacenamiento de este navegador. Puedes exportarlos para hacer copias de seguridad o llevarlos a otro dispositivo.</p>
                            
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
                </main>
            </div>
        `;
    }

    executeViewScript() {
        // EXPORTAR ESTADO A JSON
        document.getElementById('btnExport').addEventListener('click', () => {
            const state = store.getState();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            const date = new Date().toISOString().split('T')[0];
            downloadAnchorNode.setAttribute("download", `TeamTowers_Backup_${date}.json`);
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
                    
                    // Validación ultra básica para asegurar que es un backup de TeamTowers
                    if (importedState && importedState.projects && Array.isArray(importedState.projects)) {
                        if (confirm("⚠️ Importar sobreescribirá todos los datos actuales de este navegador. ¿Proceder?")) {
                            store.state = importedState;
                            localStorage.setItem('tt_sos_state', JSON.stringify(store.state));
                            alert("✅ Ecosistema restaurado con éxito.");
                            window.location.href = '/v5/network';
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
