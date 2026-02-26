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
let settingsTabMode = 'ontology'; // Modos: ontology, users, permissions

// --- CONTROLADORES DE EVENTOS GLOBALES ---
document.addEventListener('click', (e) => {
    
    // --- NAVEGACIÓN DE PESTAÑAS (SETTINGS) ---
    if (e.target.classList.contains('set-tab-btn')) {
        settingsTabMode = e.target.getAttribute('data-mode');
        document.getElementById('app').innerHTML = SettingsView.render();
    }

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
        currentEditingSector = sectorKey; 
        
        const state = store.getState();
        const sectores = state.ontology?.sectores || {};
        const sectorData = sectorKey ? sectores[sectorKey] : null;

        document.getElementById('modal-sector-id').value = sectorKey || '';
        document.getElementById('modal-sector-id').disabled = !!sectorKey; 

        HUMA_LEVELS.forEach(lvl => {
            const roleData = sectorData ? sectorData[lvl.id] : null;
            document.getElementById(`role-name-${lvl.id}`).value = roleData?.name || '';
            document.getElementById(`role-mult-${lvl.id}`).value = roleData?.multiplier || 1.0;
            document.getElementById(`role-prompt-${lvl.id}`).value = roleData?.ai_prompt || '';
            
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

    // 👤 RBAC: AÑADIR NUEVO USUARIO AL SISTEMA
    if (e.target.id === 'btn-create-user') {
        const id = document.getElementById('new-user-id').value.trim();
        const name = document.getElementById('new-user-name').value.trim();
        const contact = document.getElementById('new-user-contact').value.trim();

        if (!id || !name) return alert("⚠️ El Alias (@id) y el Nombre son obligatorios.");
        if (!id.startsWith('@')) return alert("⚠️ El identificador debe empezar por '@'. Ej: @juan");

        try {
            store.dispatch({ type: 'ADD_USER', payload: { id, name, walletOrSocial: contact } });
            alert(`✅ Usuario ${id} añadido al ecosistema.`);
            document.getElementById('app').innerHTML = SettingsView.render();
        } catch(err) {
            alert("⚠️ Error: " + err.message);
        }
    }

    // 👑 RBAC: CAMBIAR EL PROJECT OWNER DE UNA RED
    if (e.target.classList.contains('select-project-owner')) {
        e.target.addEventListener('change', (ev) => {
            const projectId = ev.target.getAttribute('data-pid');
            const newOwnerId = ev.target.value;
            
            if(confirm(`¿Estás seguro de transferir la propiedad de esta red a ${newOwnerId}?`)) {
                store.dispatch({ type: 'PROMOTE_TO_PO', payload: { projectId, userId: newOwnerId } });
                document.getElementById('app').innerHTML = SettingsView.render();
            } else {
                // Revertir el select visualmente si cancela
                document.getElementById('app').innerHTML = SettingsView.render();
            }
        }, { once: true });
    }
});

export const SettingsView = {
    render: () => {
        const state = store.getState();
        const config = state.config || { theme: 'dark', ecosystemName: '', globalPrompt: '' };
        const sectores = state.ontology?.sectores || {};
        const users = state.globalUsers || [];
        const projects = state.projects || [];

        // 🚀 BREADCRUMBS Y RESET NAVBAR
        setTimeout(() => window.setNavbar ? window.setNavbar([{ label: '⚙️ Configuración del Ecosistema' }], '', '') : null, 0);

        const tabStyle = (mode) => `
            padding: 10px 20px; font-weight: bold; cursor: pointer; border-bottom: 3px solid ${settingsTabMode === mode ? 'var(--accent-blue)' : 'transparent'}; 
            color: ${settingsTabMode === mode ? 'var(--text-heading)' : 'var(--text-muted)'}; transition: 0.2s; background: transparent; border-top: none; border-left: none; border-right: none; font-size: 1.1rem;
        `;

        

        // 🧠 HTML: BIBLIOTECA ONTOLÓGICA
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

        // 👤 HTML: REGISTRO DE USUARIOS
        const usersTableHTML = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; margin-top: 20px;">
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                    <th style="padding: 12px 10px;">Alias (@id)</th>
                    <th style="padding: 12px 10px;">Nombre Real</th>
                    <th style="padding: 12px 10px;">Contacto / Billetera</th>
                </tr>
                ${users.map(u => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px 10px; font-weight: bold; color: var(--accent-blue); font-family: monospace;">${u.id}</td>
                        <td style="padding: 12px 10px; color: var(--text-heading);">${u.name}</td>
                        <td style="padding: 12px 10px; color: var(--text-muted);">${u.walletOrSocial || '---'}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        // 👑 HTML: DELEGACIÓN DE PROJECT OWNERS
        const userOptionsHTML = users.map(u => `<option value="${u.id}">${u.id} (${u.name})</option>`).join('');
        const delegationTableHTML = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; margin-top: 20px;">
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                    <th style="padding: 12px 10px;">Proyecto / Área</th>
                    <th style="padding: 12px 10px;">Owner Actual</th>
                    <th style="padding: 12px 10px;">Delegar Propiedad a...</th>
                </tr>
                ${projects.map(p => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px 10px; font-weight: bold; color: var(--text-heading);">${p.nombre}</td>
                        <td style="padding: 12px 10px; color: var(--accent-gold); font-family: monospace;">
                            ${p.ownerId === 'ecosystem-admin' ? '👑 Admin General' : p.ownerId}
                        </td>
                        <td style="padding: 12px 10px;">
                            <select class="form-control select-project-owner" data-pid="${p.id}" style="margin: 0; padding: 5px; font-size: 0.8rem; background: var(--bg-surface);">
                                <option value="ecosystem-admin" ${p.ownerId === 'ecosystem-admin' ? 'selected' : ''}>👑 Admin General</option>
                                ${users.map(u => `<option value="${u.id}" ${p.ownerId === u.id ? 'selected' : ''}>${u.id} (${u.name})</option>`).join('')}
                            </select>
                        </td>
                    </tr>
                `).join('')}
            </table>
        `;

        return `
            <div class="container fade-in" style="max-width: 1300px; margin: 30px auto; padding: 0 20px;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px;">
                    <div>
                        <h1 style="margin: 0 0 5px 0; font-size: 2.2rem; color: var(--text-heading);">Configuración del Ecosistema</h1>
                        <p style="margin: 0; color: var(--text-muted);">Panel de Control Maestro (Solo accesible para el Ecosystem Owner).</p>
                    </div>
                </div>

                <div class="grid-layout" style="grid-template-columns: 1fr 3fr; gap: 30px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="panel-surface" style="padding: 25px; border-radius: 12px;">
                            <h3 style="margin-top: 0; color: var(--text-heading);">Identidad & Entorno</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Ajustes básicos de la plataforma.</p>
                            
                            <label class="form-label">Nombre del Universo Global</label>
                            <input id="set-eco-name" type="text" class="form-control" value="${config.ecosystemName}" placeholder="Ej: TeamTowers Network">

                            <label class="form-label">Apariencia Visual (UI)</label>
                            <select id="set-theme" class="form-control">
                                <option value="dark" ${config.theme === 'dark' ? 'selected' : ''}>🌙 Modo Oscuro (Dark)</option>
                                <option value="light" ${config.theme === 'light' ? 'selected' : ''}>☀️ Modo Claro (Light)</option>
                            </select>
                        </div>

                        <div class="panel-surface" style="padding: 25px; border-radius: 12px; border-top: 3px solid var(--accent-purple); background: linear-gradient(180deg, rgba(163, 113, 247, 0.05) 0%, transparent 100%);">
                            <h3 style="margin-top: 0; color: var(--accent-purple);">🤖 System Prompt Maestro</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Contexto raíz inyectado en todos los agentes auditores de la red.</p>
                            
                            <textarea id="set-eco-prompt" class="form-control" style="height: 250px; font-family: 'Cascadia Code', monospace; font-size: 0.8rem; background: rgba(0,0,0,0.3); color: var(--accent-purple);">${config.globalPrompt}</textarea>
                            
                            <button id="btn-save-settings" class="btn btn-primary btn-block" style="background: var(--accent-purple); border: none;">💾 Guardar Variables Base</button>
                        </div>
                    </aside>

                    <main>
                        <div style="display:flex; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; gap: 20px;">
                            <button class="set-tab-btn" data-mode="ontology" style="${tabStyle('ontology')}">📚 Biblioteca Ontológica</button>
                            <button class="set-tab-btn" data-mode="users" style="${tabStyle('users')}">👤 Padrón de Usuarios</button>
                            <button class="set-tab-btn" data-mode="permissions" style="${tabStyle('permissions')}">👑 Dueños de Área (PO)</button>
                        </div>

                        ${settingsTabMode === 'ontology' ? `
                            <div class="panel-surface" style="padding: 25px; border-radius: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                                    <p class="text-small text-muted" style="margin: 0; max-width: 60%;">Estas plantillas estructuran el ADN de los proyectos (Roles, Prompts para IA y Entregables estándar).</p>
                                    <button id="btn-new-sector" class="btn" style="background: var(--accent-blue); color: #fff; border: none; font-weight: bold;">
                                        ➕ Crear Plantilla
                                    </button>
                                </div>
                                <div style="max-height: 700px; overflow-y: auto; padding-right: 10px;">
                                    ${sectoresHTML || '<p class="text-muted text-center" style="padding: 40px; border: 1px dashed var(--border-color);">No hay plantillas creadas.</p>'}
                                </div>
                            </div>
                        ` : ''}

                        ${settingsTabMode === 'users' ? `
                            <div class="panel-surface" style="padding: 25px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid var(--accent-blue);">
                                <h3 style="margin-top: 0; color: var(--accent-blue);">Alta de Nuevo Nodo</h3>
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 15px; align-items: end;">
                                    <div>
                                        <label class="form-label">Alias Único (@id)</label>
                                        <input type="text" id="new-user-id" class="form-control" placeholder="@nombre" style="margin-bottom:0;">
                                    </div>
                                    <div>
                                        <label class="form-label">Nombre Completo</label>
                                        <input type="text" id="new-user-name" class="form-control" placeholder="Ej: Laura Pérez" style="margin-bottom:0;">
                                    </div>
                                    <div>
                                        <label class="form-label">Email / Wallet</label>
                                        <input type="text" id="new-user-contact" class="form-control" placeholder="0x... o email" style="margin-bottom:0;">
                                    </div>
                                    <button id="btn-create-user" class="btn btn-primary" style="background: var(--accent-blue); border:none; padding: 10px 20px; height: 42px;">Añadir</button>
                                </div>
                            </div>

                            <div class="panel-surface" style="padding: 25px; border-radius: 12px;">
                                <h3 style="margin-top: 0;">Registro Global de Nodos (${users.length})</h3>
                                ${users.length === 0 ? '<p class="text-muted">Aún no hay usuarios en el sistema.</p>' : usersTableHTML}
                            </div>
                        ` : ''}

                        ${settingsTabMode === 'permissions' ? `
                            <div class="panel-surface" style="padding: 25px; border-radius: 12px;">
                                <h3 style="margin-top: 0; color: var(--accent-gold);">Delegación de Poder (RBAC)</h3>
                                <p class="text-small text-muted" style="margin-bottom: 20px;">Asigna a un usuario el rol de <b>Project Owner (PO)</b> de una red. Ese usuario recibirá las notificaciones de sistema y podrá aprobar/rechazar entregables de esa área.</p>
                                
                                ${projects.length === 0 ? '<p class="text-muted text-center" style="padding: 20px; border: 1px dashed var(--border-color);">No hay redes creadas aún.</p>' : delegationTableHTML}
                            </div>
                        ` : ''}

                    </main>

                </div>
            </div>

            <div id="modal-ontology" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:3000; align-items:center; justify-content:center; backdrop-filter: blur(8px);">
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
