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
        btn.style.borderColor = 'var(--accent-green)';
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

        // 🚀 BREADCRUMBS GLOBALES (Estandarización UI)
        setTimeout(() => window.setNavbar(
            [
                { label: '🏠 Hub', hash: '#/' },
                { label: '⚙️ Configuración Global del Sistema' }
            ], 
            ``, `` // Sin toolbar secundaria
        ), 0);

        // 🧠 Generar visualización de sectores (Solo lectura por ahora)
        let sectoresHTML = '';
        for (const [sectorKey, roles] of Object.entries(sectores)) {
            sectoresHTML += `
                <div class="panel-surface" style="margin-bottom: 15px; border-left: 4px solid var(--accent-blue);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="margin: 0; text-transform: uppercase; color: var(--text-heading);">${sectorKey}</h4>
                        <button class="btn btn-outline text-small" onclick="alert('Editor de ontología de sectores en desarrollo. Próximamente podrás añadir y borrar roles base.')">⚙️ Editar Plantilla</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                        ${Object.entries(roles).map(([nivel, datos]) => `
                            <div style="background: var(--bg-base); border: 1px solid var(--border-color); padding: 10px; border-radius: 6px;">
                                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px;">${nivel}</div>
                                <div style="font-weight: bold; font-size: 0.85rem; color: var(--accent-purple);">${datos.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return `
            <div class="container fade-in">
                <div class="panel-surface" style="margin-bottom: 30px; border-left: 4px solid var(--accent-purple); background: linear-gradient(135deg, rgba(163, 113, 247, 0.05) 0%, transparent 100%);">
                    <h2 style="margin: 0; color: var(--accent-purple);">Kernel Settings</h2>
                    <p class="text-muted" style="margin-top: 5px; font-size: 0.9rem;">
                        Parámetros maestros, apariencia (UI) y plantillas ontológicas para todas tus redes de valor.
                    </p>
                </div>

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
                            <h3 style="margin-top: 0; color: var(--accent-purple);">🤖 System Prompt Maestro</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Contexto raíz que se inyectará en CUALQUIER Agente IA conectado a TeamTowers. Define tu modelo de gobernanza.</p>
                            
                            <textarea id="set-eco-prompt" class="form-control" style="height: 250px; font-family: 'Cascadia Code', monospace; font-size: 0.8rem; background: rgba(0,0,0,0.1); border-color: rgba(163, 113, 247, 0.3);" placeholder="Ej: Eres el orquestador principal de un sistema DAO...">${config.globalPrompt}</textarea>
                            
                            <button id="btn-save-settings" class="btn btn-primary btn-block" style="margin-top: 15px;">💾 Guardar Configuración</button>
                        </div>
                    </aside>

                    <main>
                        <div class="panel">
                            <h3 style="margin-top: 0; display: flex; align-items: center; justify-content: space-between;">
                                <span>📚 Ontología Base (Sectores y Roles)</span>
                                <span class="badge" style="background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border-color);">PLANTILLAS V5.4</span>
                            </h3>
                            <p class="text-small text-muted" style="margin-bottom: 20px;">
                                Estas plantillas se inyectan al "Inicializar una Red" desde el Hub. 
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
