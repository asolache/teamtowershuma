import { store } from '../core/store.js';

document.addEventListener('click', (e) => {
    // 🛡️ GUARDAR CONFIGURACIÓN GLOBAL
    if (e.target.id === 'btn-save-settings') {
        const ecosystemName = document.getElementById('set-eco-name').value;
        const globalPrompt = document.getElementById('set-eco-prompt').value;
        const theme = document.getElementById('set-theme').value;

        store.dispatch({
            type: 'UPDATE_GLOBAL_CONFIG',
            payload: { ecosystemName, globalPrompt, theme }
        });

        const btn = document.getElementById('btn-save-settings');
        btn.innerHTML = '✅ Configuración Guardada';
        btn.style.backgroundColor = 'var(--accent-green)';
        btn.style.color = '#fff';
        
        setTimeout(() => {
            document.getElementById('app').innerHTML = SettingsView.render();
        }, 1000);
    }
});

export const SettingsView = {
    render: () => {
        const state = store.getState();
        const config = state.config || { theme: 'dark', ecosystemName: '', globalPrompt: '' };
        const sectores = state.ontology?.sectores || {};

        // 🧠 Generar visualización de sectores (Solo lectura por ahora)
        let sectoresHTML = '';
        for (const [sectorKey, roles] of Object.entries(sectores)) {
            sectoresHTML += `
                <div class="panel-surface" style="margin-bottom: 15px; border-left: 4px solid var(--accent-blue);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; text-transform: uppercase; color: var(--text-heading);">${sectorKey}</h4>
                        <button class="btn btn-outline" style="font-size: 0.65rem; padding: 2px 8px;" onclick="alert('Editor de ontología de sectores en desarrollo. Próximamente podrás añadir y borrar roles base.')">⚙️ Editar Plantilla</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                        ${Object.entries(roles).map(([nivel, datos]) => `
                            <div style="background: var(--bg-base); border: 1px solid var(--border-color); padding: 8px; border-radius: 6px;">
                                <div style="font-size: 0.7rem; color: var(--text-muted);">${nivel}</div>
                                <div style="font-weight: bold; font-size: 0.85rem; color: var(--accent-purple);">${datos.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return `
            <div class="container">
                <header style="margin-bottom: 30px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none;">Dashboard</a> /
                        <span style="color: var(--text-heading); font-weight:bold;">Configuración Global del Ecosistema</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid var(--accent-purple); padding-bottom: 15px;">
                        <div>
                            <h1 style="color: var(--accent-purple); margin: 0;">⚙️ Kernel Settings</h1>
                            <p class="text-muted" style="margin: 5px 0 0 0;">Parámetros maestros, UI y plantillas ontológicas para todas las redes.</p>
                        </div>
                    </div>
                </header>

                <div class="grid-layout" style="grid-template-columns: 1fr 1.5fr; gap: 40px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel" style="border-color: var(--border-color);">
                            <h3 style="margin-top: 0; color: var(--text-heading);">Identidad & Entorno</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Ajustes básicos de la plataforma.</p>
                            
                            <label class="form-label">Nombre del Universo Global</label>
                            <input id="set-eco-name" type="text" class="form-control" value="${config.ecosystemName}" placeholder="Ej: TeamTowers Network">

                            <label class="form-label" style="margin-top: 15px;">Apariencia Visual (UI)</label>
                            <select id="set-theme" class="form-control">
                                <option value="dark" ${config.theme === 'dark' ? 'selected' : ''}>🌙 Modo Oscuro (Dark)</option>
                                <option value="light" ${config.theme === 'light' ? 'selected' : ''}>☀️ Modo Claro (Light)</option>
                            </select>
                        </div>

                        <div class="panel" style="border-color: var(--accent-purple); background: linear-gradient(180deg, rgba(163, 113, 247, 0.05) 0%, transparent 100%);">
                            <h3 style="margin-top: 0; color: var(--accent-purple);">🤖 System Prompt Maestro (Global IA)</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Este es el contexto raíz que se inyectará en CUALQUIER IA conectada a TeamTowers. Define tu modelo de gobernanza base.</p>
                            
                            <textarea id="set-eco-prompt" class="form-control" style="height: 250px; font-family: 'Cascadia Code', monospace; font-size: 0.8rem; background: rgba(0,0,0,0.1); border-color: rgba(163, 113, 247, 0.3);" placeholder="Ej: Eres el orquestador principal de un sistema DAO. Tu objetivo es asegurar la equidad en el Slicing Pie...">${config.globalPrompt}</textarea>
                            
                            <button id="btn-save-settings" class="btn btn-primary btn-block" style="margin-top: 15px;">💾 Guardar Configuración Global</button>
                        </div>

                    </aside>

                    <main>
                        <div class="panel">
                            <h3 style="margin-top: 0; display: flex; align-items: center; justify-content: space-between;">
                                <span>📚 Ontología Base (Sectores y Roles)</span>
                                <span style="font-size: 0.65rem; background: var(--bg-surface); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-color);">PLANTILLAS V5.4</span>
                            </h3>
                            <p class="text-small text-muted" style="margin-bottom: 20px;">
                                Estas plantillas se utilizan al "Desplegar un Nuevo Ecosistema" desde el Dashboard. 
                                La edición profunda de estos sectores será habilitada en la próxima versión.
                            </p>
                            
                            <div style="max-height: 600px; overflow-y: auto; padding-right: 10px;">
                                ${sectoresHTML}
                            </div>
                        </div>
                    </main>

                </div>
            </div>
        `;
    }
};
