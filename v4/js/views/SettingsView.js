import { store } from '../core/store.js';

// Constantes de los 5 niveles inmutables del sistema HUMA
const HUMA_LEVELS = [
    { id: '@anxaneta', label: 'Cima / Estrategia', color: 'var(--accent-gold)' },
    { id: '@aixecador', label: 'Coordinación / Táctica', color: 'var(--accent-blue)' },
    { id: '@dosos', label: 'Auditoría / Control', color: 'var(--accent-purple)' },
    { id: '@baixos', label: 'Especialistas / Ejecución', color: 'var(--accent-green)' },
    { id: '@pinya', label: 'Soporte / Base', color: 'var(--text-muted)' }
];

let currentEditingSector = null;

// --- CONTROLADORES DE EVENTOS GLOBALES ---
document.addEventListener('click', (e) => {
    
    // 🛡️ GUARDAR CONFIGURACIÓN GLOBAL (Nombre, Tema, Prompt Maestro)
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

    // --- MODAL: ONTOLOGÍA (ABRIR) ---
    if (e.target.classList.contains('btn-edit-sector') || e.target.id === 'btn-new-sector') {
        const sectorKey = e.target.getAttribute('data-sector');
        currentEditingSector = sectorKey; // null si es nuevo
        
        const state = store.getState();
        const sectores = state.ontology?.sectores || {};
        const sectorData = sectorKey ? sectores[sectorKey] : null;

        document.getElementById('modal-sector-id').value = sectorKey || '';
        document.getElementById('modal-sector-id').disabled = !!sectorKey; // No cambiar ID si ya existe

        // Rellenar los 5 niveles
        HUMA_LEVELS.forEach(lvl => {
            const roleData = sectorData ? sectorData[lvl.id] : null;
            document.getElementById(`role-name-${lvl.id}`).value = roleData?.name || '';
            document.getElementById(`role-mult-${lvl.id}`).value = roleData?.multiplier || 1.0;
            document.getElementById(`role-prompt-${lvl.id}`).value = roleData?.ai_prompt || '';
            
            // Reconstruir entregables en formato texto (Horas | Nombre)
            let deliverablesText = '';
            if (roleData?.standard_deliverables) {
                deliverablesText = roleData.standard_deliverables.map(d => `${d.estimatedHours} | ${d.name}`).join('\n');
            }
            document.getElementById(`role-deliv-${lvl.id}`).value = deliverablesText;
        });

        document.getElementById('modal-ontology').style.display = 'flex';
    }

    // --- MODAL: ONTOLOGÍA (CERRAR) ---
    if (e.target.id === 'btn-close-ontology') {
        document.getElementById('modal-ontology').style.display = 'none';
        currentEditingSector = null;
    }

    // --- GUARDAR PLANTILLA DE SECTOR ---
    if (e.target.id === 'btn-save-sector') {
        let sectorId = document.getElementById('modal-sector-id').value.trim().toLowerCase().replace(/\s+/g, '_');
        if (!sectorId) return alert("El identificador del sector es obligatorio.");

        const newRolesData = {};

        HUMA_LEVELS.forEach(lvl => {
            const name = document.getElementById(`role-name-${lvl.id}`).value.trim();
            const multiplier = parseFloat(document.getElementById(`role-mult-${lvl.id}`).value) || 1.0;
            const ai_prompt = document.getElementById(`role-prompt-${lvl.id}`).value.trim();
            const delivText = document.getElementById(`role-deliv-${lvl.id}`).value;

            // Parsear entregables (Formato: Horas | Nombre)
            const standard_deliverables = delivText.split('\n')
                .filter(line => line.trim() !== '')
                .map(line => {
                    const parts = line.split('|');
                    return {
                        estimatedHours: parseFloat(parts[0]) || 0,
                        name: parts.slice(1).join('|').trim() || 'Entregable sin nombre'
                    };
                });

            newRolesData[lvl.id] = { name: name || lvl.label, multiplier, ai_prompt, standard_deliverables };
        });

        store.dispatch({
            type: 'ADD_ONTOLOGY_SECTOR',
            payload: { sectorId, rolesData: newRolesData }
        });

        document.getElementById('modal-ontology').style.display = 'none';
        document.getElementById('app').innerHTML = SettingsView.render();
    }
});

export const SettingsView = {
    render: () => {
        const state = store.getState();
        const config = state.config || { theme: 'dark', ecosystemName: '', globalPrompt: '' };
        const sectores = state.ontology?.sectores || {};

        // 🚀 BREADCRUMBS Y RESET NAVBAR
        setTimeout(() => window.setNavbar ? window.setNavbar([], '', '') : null, 0);

        // 🧠 Generar HTML de la lista de sectores actuales
        let sectoresHTML = '';
        for (const [sectorKey, roles] of Object.entries(sectores)) {
            sectoresHTML += `
                <div class="panel-surface" style="margin-bottom: 20px; border-left: 4px solid var(--accent-blue); padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0; text-transform: uppercase; color: var(--text-heading);">${sectorKey}</h3>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">Plantilla Ontológica</span>
                        </div>
                        <button class="btn btn-outline text-small btn-edit-sector" data-sector="${sectorKey}">⚙️ Editar Ontología</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                        ${Object.entries(roles).map(([nivel, datos]) => `
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; font-family: monospace;">${nivel}</div>
                                <div style="font-weight: bold; font-size: 0.9rem; color: var(--accent-blue); margin-bottom: 8px;">${datos.name}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">🎯 Riesgo/Multiplicador: x${datos.multiplier}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">📦 ${datos.standard_deliverables?.length || 0} Entregables estándar</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return `
            <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 15px 30px; position: sticky; top: 0; z-index: 50;">
                <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                    <div style="font-size: 0.95rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none; font-weight: bold;">🏠 Hub</a> 
                        <span>/</span> 
                        <span style="color: var(--text-heading); font-weight: bold;">⚙️ Configuración del Ecosistema</span>
                    </div>
                </div>
            </div>

            <div class="container fade-in" style="max-width: 1200px; margin: 30px auto; padding: 0 20px;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px;">
                    <div>
                        <h1 style="margin: 0 0 5px 0; font-size: 2.2rem; color: var(--text-heading);">Kernel Settings</h1>
                        <p style="margin: 0; color: var(--text-muted);">Parámetros maestros, System Prompts y Diccionarios Ontológicos.</p>
                    </div>
                    <div>
                        <button id="btn-new-sector" class="btn" style="background: var(--accent-blue); color: #fff; border: none; font-weight: bold;">
                            ➕ Crear Nueva Plantilla (Sector)
                        </button>
                    </div>
                </div>

                <div class="grid-layout" style="grid-template-columns: 1fr 2fr; gap: 30px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="panel-surface" style="padding: 25px; border-radius: 12px;">
                            <h3 style="margin-top: 0; color: var(--text-heading);">Identidad & Entorno</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Ajustes básicos de la plataforma.</p>
                            
                            <label class="form-label" style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Nombre del Universo Global</label>
                            <input id="set-eco-name" type="text" class="form-input" value="${config.ecosystemName}" placeholder="Ej: TeamTowers Network" style="width:100%; margin-bottom: 20px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius:6px;">

                            <label class="form-label" style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Apariencia Visual (UI)</label>
                            <select id="set-theme" class="form-input" style="width:100%; margin-bottom: 20px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius:6px;">
                                <option value="dark" ${config.theme === 'dark' ? 'selected' : ''}>🌙 Modo Oscuro (Dark)</option>
                                <option value="light" ${config.theme === 'light' ? 'selected' : ''}>☀️ Modo Claro (Light)</option>
                            </select>
                        </div>

                        <div class="panel-surface" style="padding: 25px; border-radius: 12px; border-top: 3px solid var(--accent-purple); background: linear-gradient(180deg, rgba(163, 113, 247, 0.05) 0%, transparent 100%);">
                            <h3 style="margin-top: 0; color: var(--accent-purple);">🤖 System Prompt Maestro</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Contexto raíz que se inyectará en CUALQUIER Agente IA. Define las reglas de tu gobernanza.</p>
                            
                            <textarea id="set-eco-prompt" class="form-input" style="width:100%; height: 300px; font-family: 'Cascadia Code', monospace; font-size: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); padding: 15px; color: var(--accent-purple); border-radius:6px;" placeholder="Ej: Eres el orquestador principal...">${config.globalPrompt}</textarea>
                            
                            <button id="btn-save-settings" class="btn btn-primary btn-block" style="margin-top: 20px; width: 100%; background: var(--accent-purple); border: none;">💾 Guardar Configuración Base</button>
                        </div>
                    </aside>

                    <main>
                        <div class="panel-surface" style="padding: 25px; border-radius: 12px;">
                            <h3 style="margin-top: 0; display: flex; align-items: center; justify-content: space-between;">
                                <span>📚 Biblioteca Ontológica (Sectores)</span>
                            </h3>
                            <p class="text-small text-muted" style="margin-bottom: 25px;">
                                Estas plantillas estructuran el ADN de los proyectos. Contienen los Roles, Prompts para la IA y los Entregables pre-aprobados (Pull System).
                            </p>
                            
                            <div style="max-height: 800px; overflow-y: auto; padding-right: 10px;">
                                ${sectoresHTML || '<p class="text-muted text-center" style="padding: 40px; border: 1px dashed var(--border-color);">No hay plantillas creadas. Crea tu primer sector.</p>'}
                            </div>
                        </div>
                    </main>

                </div>
            </div>

            <div id="modal-ontology" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:1000; align-items:center; justify-content:center; backdrop-filter: blur(8px);">
                <div class="panel-surface fade-in" style="width: 900px; max-height: 90vh; display: flex; flex-direction: column; border-radius: 12px; border: 1px solid var(--border-color); border-top: 4px solid var(--accent-blue); background: var(--bg-dark);">
                    
                    <div style="padding: 20px 30px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
                        <h2 style="margin: 0; color: var(--text-heading);">🧬 Editor de Plantilla Ontológica</h2>
                        <button id="btn-close-ontology" class="btn btn-outline" style="padding: 5px 15px; border-color: transparent;">❌ Cerrar</button>
                    </div>

                    <div style="padding: 30px; overflow-y: auto; flex: 1;">
                        <div style="margin-bottom: 30px;">
                            <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Identificador del Sector (ID único sin espacios)</label>
                            <input type="text" id="modal-sector-id" class="form-input" placeholder="ej: marketing_agencia" style="width: 100%; font-size: 1.2rem; background: var(--bg-base); border: 1px solid var(--border-color); padding: 12px; color: white; border-radius: 6px; font-family: monospace;">
                        </div>

                        <div style="border-left: 2px solid var(--border-color); padding-left: 20px;">
                            ${HUMA_LEVELS.map(lvl => `
                                <div style="margin-bottom: 40px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                                    <div style="background: rgba(0,0,0,0.3); padding: 15px 20px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 15px;">
                                        <div style="width: 15px; height: 15px; border-radius: 50%; background: ${lvl.color};"></div>
                                        <h3 style="margin: 0; color: var(--text-heading); font-family: monospace;">${lvl.id}</h3>
                                        <span style="color: var(--text-muted); font-size: 0.85rem;">(${lvl.label})</span>
                                    </div>
                                    
                                    <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                        <div>
                                            <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.8rem;">Nombre del Rol en este sector</label>
                                            <input type="text" id="role-name-${lvl.id}" placeholder="Ej: Director Estratégico" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius: 6px;">
                                            
                                            <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.8rem;">Multiplicador de Riesgo / Valor</label>
                                            <input type="number" step="0.1" id="role-mult-${lvl.id}" placeholder="Ej: 3.0" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius: 6px;">

                                            <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.8rem;">🤖 Prompt Específico para IA Auditora</label>
                                            <textarea id="role-prompt-${lvl.id}" placeholder="Eres el rol que se encarga de..." style="width:100%; height: 100px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--accent-blue); border-radius: 6px; font-family: monospace; font-size: 0.8rem;"></textarea>
                                        </div>
                                        <div>
                                            <label style="display:block; margin-bottom:5px; color:var(--accent-green); font-size:0.8rem; font-weight: bold;">📦 Entregables Estándar (Pull System)</label>
                                            <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px;">Añade uno por línea. Formato: <code>Horas | Nombre del Entregable</code></p>
                                            <textarea id="role-deliv-${lvl.id}" placeholder="10 | Roadmap Anual\n5 | Análisis de Competencia" style="width:100%; height: 235px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--accent-green); border-radius: 6px; font-family: monospace; font-size: 0.85rem; white-space: pre;"></textarea>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="padding: 20px 30px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; background: var(--bg-surface); border-radius: 0 0 12px 12px;">
                        <button id="btn-save-sector" class="btn" style="background: var(--accent-blue); color: #fff; font-weight: bold; padding: 12px 25px; border: none;">
                            💾 Guardar Plantilla en Biblioteca
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};
