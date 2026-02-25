import { store } from '../core/store.js';

// 🧠 HELPER: Generador de Sugerencias para el formulario de entregables
const generateSuggestionsHtml = (roleId, project) => {
    if (!roleId || !project) return '';
    const role = project.roles.find(r => r.id === roleId);
    if (!role || !role.systemPrompt) return '';

    const lines = role.systemPrompt.split('\n');
    let html = '';
    
    lines.forEach(line => {
        if (line.includes('- [Tangible]') || line.includes('- [Intangible]')) {
            const isTangible = line.includes('[Tangible]');
            const type = isTangible ? 'tangible' : 'intangible';
            const text = line.split('] ')[1]?.trim(); 
            
            if (text) {
                const color = isTangible ? 'var(--accent-blue)' : 'var(--accent-purple)';
                const shortTitle = text.split('.')[0]; 
                
                html += `
                    <div class="btn-use-suggestion" data-tipo="${type}" data-titulo="${shortTitle}" data-texto="${text}"
                        style="background: rgba(255,255,255,0.03); border: 1px solid ${color}; color: ${color}; 
                        padding: 8px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; margin-top: 8px; transition: 0.2s;"
                        onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                        ✨ Usar: <b>[${isTangible ? 'Tangible' : 'Intangible'}]</b> ${shortTitle}
                    </div>
                `;
            }
        }
    });

    if (html === '') return '<div class="text-muted text-small" style="margin-top:10px;">No hay sugerencias formateadas en el prompt.</div>';
    
    return `<div style="margin-top: 15px;">
                <label class="form-label text-muted" style="font-size: 0.65rem; letter-spacing: 0.05rem;">SUGERENCIAS DE ESTE NODO:</label>
                ${html}
            </div>`;
};

// 🧠 HELPER IA: Constructor Inteligente de System Prompt (Global)
const generateRichProjectPrompt = (project) => {
    if (!project) return "";
    
    const activeRoles = (project.roles || []).filter(r => !r.isArchived).map(r => `@${r.name.replace(/\s+/g, '')}`).join(', ');
    const txTags = (project.transactions || []).map(t => `#${t.entregable.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')}`).join(' ');

    let sectorBase = "Actúas como el orquestador central de un ecosistema de valor.";
    if (project.sector === 'web3') sectorBase = "Eres una IA especializada en arquitecturas descentralizadas, tokenomics y desarrollo Web3. Tu objetivo es maximizar la resiliencia y el valor on-chain.";
    if (project.sector === 'marketing') sectorBase = "Eres una IA experta en Growth, Branding y adquisición de usuarios. Tu objetivo es maximizar el ROAS y la percepción de marca.";
    if (project.sector === 'saas') sectorBase = "Eres una IA orientada a producto digital, escalabilidad y métricas B2B (MRR, Churn).";
    if (project.sector === 'gremial') sectorBase = "Eres una IA especializada en procesos industriales, cadenas de montaje y control de calidad físico.";

    return `[CONTEXTO MAESTRO DEL ECOSISTEMA]
Sector: ${project.sector.toUpperCase()}
Misión Central: ${sectorBase}

[TOPOLOGÍA DE LA RED DE VALOR]
Nodos Activos (Menciónalos para enrutar tareas): ${activeRoles || 'Aún sin definir'}
Vectores/Flujos Clave (Usa estos hashtags): ${txTags || 'Aún sin flujos definidos'}

[MARCO DE REFERENCIA Y DIRECTRICES]
1. Al recibir un requerimiento, etiqueta tu respuesta referenciando al nodo responsable (ej: "Derivando al @TechLead...").
2. Etiqueta los entregables con su hashtag correspondiente.
3. Evalúa siempre la viabilidad antes de sugerir ejecución directa.`;
};

// 🛡️ EVENTOS REACTIVOS
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('edit-role-name')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId, roleId, field: 'name', value: e.target.value } });
    }

    if (e.target.classList.contains('edit-role-level')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId, roleId, field: 'levelId', value: e.target.value } });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    if (e.target.classList.contains('role-prompt-input')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId, roleId, field: 'systemPrompt', value: e.target.value } });
        
        const currentEmisor = document.getElementById('tx-from').value;
        if (currentEmisor === roleId) {
            const project = store.getState().projects.find(p => p.id === projectId);
            document.getElementById('tx-suggestions-container').innerHTML = generateSuggestionsHtml(roleId, project);
        }
    }

    if (e.target.id === 'tx-from') {
        const projectId = e.target.getAttribute('data-pid');
        const project = store.getState().projects.find(p => p.id === projectId);
        document.getElementById('tx-suggestions-container').innerHTML = generateSuggestionsHtml(e.target.value, project);
    }
});

// 🛡️ GESTIÓN DE ACCIONES
document.addEventListener('click', (e) => {
    // Guardar Metadatos del Proyecto
    if (e.target.closest('#btn-save-meta')) {
        const btnSave = e.target.closest('#btn-save-meta');
        const projectId = btnSave.getAttribute('data-pid');
        store.dispatch({ 
            type: 'UPDATE_PROJECT_INFO', 
            payload: { 
                projectId, 
                nombre: document.getElementById('edit-name').value, 
                sector: document.getElementById('edit-sector').value, 
                description: document.getElementById('edit-desc').value 
            } 
        });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // Añadir Rol
    if (e.target.id === 'btn-add-role-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name-edit').value;
        const levelId = document.getElementById('nr-level-edit').value;
        if(!name) return alert("Indica el nombre del rol");
        store.dispatch({ type: 'CREATE_ROLE', payload: { projectId, name, levelId } });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // Archivar Rol
    if (e.target.classList.contains('btn-archive-role')) {
        const roleId = e.target.getAttribute('data-rid');
        const projectId = e.target.getAttribute('data-pid');
        if(confirm('¿Desactivar este nodo del ecosistema?')) {
            store.dispatch({ type: 'ARCHIVE_ROLE', payload: { projectId, roleId } });
            document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
        }
    }

    // Autocompletar sugerencias
    const btnSuggestion = e.target.closest('.btn-use-suggestion');
    if (btnSuggestion) {
        const tipo = btnSuggestion.getAttribute('data-tipo');
        const titulo = btnSuggestion.getAttribute('data-titulo');
        const textoCompleto = btnSuggestion.getAttribute('data-texto');

        document.getElementById('tx-tipo').value = tipo;
        document.getElementById('tx-entregable').value = titulo;
        
        // 🧠 Prompt Táctico enriquecido
        document.getElementById('tx-prompt').value = `[INSTRUCCIÓN TÁCTICA PARA ENTREGABLE: #${titulo.replace(/\s+/g,'')}]\n\nRequerimiento Central: ${textoCompleto}\n\nDirectriz: Asegúrate de cumplir con tu misión de rol y aplicar las directrices globales del ecosistema. Revisa dependencias antes de emitir la salida.`;
        
        const promptBox = document.getElementById('tx-prompt');
        promptBox.style.boxShadow = '0 0 15px var(--accent-green)';
        setTimeout(() => promptBox.style.boxShadow = 'none', 500);
    }

    // Inyectar Transacción
    if (e.target.id === 'btn-add-tx-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;
        const promptTactico = document.getElementById('tx-prompt').value;

        if (!entregable) return alert("Define el nombre del entregable.");

        store.dispatch({ 
            type: 'ADD_TRANSACTION', 
            payload: { projectId, tx: { from, to, entregable, tipo, systemPrompt: promptTactico, horas: 1 } } 
        });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // Ordenar por Gravedad
    if (e.target.id === 'btn-sort-gravity') {
        const projectId = e.target.getAttribute('data-pid');
        store.dispatch({ type: 'SORT_TRANSACTIONS_BY_GRAVITY', payload: { projectId } });
        
        e.target.innerHTML = '✅ Flujos Ordenados';
        e.target.style.color = 'var(--accent-green)';
        setTimeout(() => document.getElementById('app').innerHTML = ProjectEditView.render(projectId), 1000); 
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        const activeRoles = project.roles.filter(r => !r.isArchived);
        const optionsHtml = activeRoles.map(n => `<option value="${n.id}">${n.name} (${n.levelId})</option>`).join('');

        const levelOptions = [
            { id: "@anxaneta", label: "Strategy (@anxaneta)" },
            { id: "@aixecador", label: "Creative/Coord (@aixecador)" },
            { id: "@dosos", label: "Quality/Audit (@dosos)" },
            { id: "@baixos", label: "Operational (@baixos)" },
            { id: "@pinya", label: "Support/Base (@pinya)" }
        ];

        const initialSuggestionsHtml = activeRoles.length > 0 ? generateSuggestionsHtml(activeRoles[0].id, project) : '';
        
        // 🧠 Inyección Inteligente del Contexto Global si está vacío
        const projectDescription = project.description || generateRichProjectPrompt(project);

        return `
            <div class="container">
                <header class="header-main" style="flex-direction: column; align-items: flex-start; gap: 10px; padding-bottom: 20px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; width: 100%;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none;">Dashboard</a> <span style="opacity:0.5;">/</span>
                        <b style="color: #f0f6fc;">${project.nombre}</b> <span style="opacity:0.5;">/</span>
                        <a href="#/project/${projectId}" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='var(--text-muted)'">Maping</a> <span style="opacity:0.5;">/</span>
                        <span style="color: var(--accent-gold); font-weight:bold;">Configurador</span> <span style="opacity:0.5;">/</span>
                        <a href="#/project/${projectId}/accounting" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='var(--text-muted)'">Accounting</a> <span style="opacity:0.5;">/</span>
                        <span style="color: var(--text-muted); opacity: 0.3;" title="En desarrollo">Business (TBD)</span>
                    </div>
                    
                    <div style="margin-top: 10px;">
                        <h1 class="text-accent" style="margin: 0 0 5px 0;">⚙️ Configurador de Proyecto</h1>
                        <p class="text-muted" style="margin: 0;">Ajusta la base estratégica, los roles y las instrucciones tácticas para la IA.</p>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 400px 1fr; gap: 30px;">
                    
                    <section class="panel" style="border-color: var(--accent-purple); align-self: start; background: linear-gradient(180deg, rgba(163, 113, 247, 0.05) 0%, transparent 100%);">
                        <h3 style="display: flex; justify-content: space-between; align-items: center; color: var(--accent-purple); margin-top: 0;">
                            Misión y Propósito
                            <span style="font-size: 0.65rem; border: 1px solid var(--accent-purple); padding: 2px 6px; border-radius: 4px;">CONTEXTO IA MAESTRO</span>
                        </h3>
                        
                        <div style="margin-bottom: 20px;">
                            <label class="form-label">Nombre del Proyecto</label>
                            <input id="edit-name" type="text" class="form-control" value="${project.nombre}">
                            
                            <label class="form-label">Sector Operativo</label>
                            <select id="edit-sector" class="form-control">
                                ${Object.keys(state.ontology.sectores).map(s => `
                                    <option value="${s}" ${project.sector === s ? 'selected' : ''}>${s.toUpperCase()}</option>
                                `).join('')}
                            </select>
                            
                            <label class="form-label">Descripción (System Prompt del Sistema)</label>
                            <textarea id="edit-desc" class="form-control" 
                                style="height: 300px; line-height: 1.5; font-family: 'Cascadia Code', monospace; background: #0d1117; color: #a5d6ff; resize: vertical; font-size: 0.8rem; border-color: rgba(163, 113, 247, 0.3);" 
                                placeholder="Estructura general del prompt...">${projectDescription}</textarea>
                            <p class="text-small text-muted" style="margin-top: 8px;">💡 <b>Pro-Tip:</b> Este texto enruta a los agentes. Usa <code>@Nombres</code> para roles y <code>#Hashtags</code> para entregables.</p>
                        </div>

                        <button id="btn-save-meta" data-pid="${projectId}" class="btn btn-primary btn-block">
                            💾 Guardar y Sincronizar Contexto
                        </button>
                    </section>

                    <section class="panel">
                        <h3 style="margin-top: 0;">Gestión de Roles y Entregables (Agentes)</h3>
                        <p class="text-muted text-small" style="margin-bottom: 20px;">Personaliza la personalidad, nivel de autoridad y directrices de cada nodo del ecosistema.</p>
                        
                        <div style="margin-bottom: 30px;">
                            ${activeRoles.map(r => {
                                // 🧠 Inyección Inteligente del Prompt del Rol si está básico
                                let rolePrompt = r.systemPrompt || '';
                                if (!rolePrompt.includes('[CONTEXTO DE ROL]')) {
                                    // Genera un prompt estructurado combinando el rol, el proyecto y sus tareas asociadas
                                    const tareasRol = project.transactions.filter(t => t.from === r.id).map(t => `#${t.entregable.replace(/\s+/g,'')}`).join(', ');
                                    rolePrompt = `[CONTEXTO DE ROL]\nIdentidad: @${r.name.replace(/\s+/g, '')}\nAutoridad: Nivel ${r.levelId}\n\n[MISIÓN]\n${rolePrompt}\n\n[DIRECTRICES DE OPERACIÓN]\n- Entregables a tu cargo: ${tareasRol || 'Por definir'}\n- Coordínate con otros nodos mencionándolos con @.\n- Valida la calidad antes de emitir flujo hacia @dosos.`;
                                }

                                return `
                                <div class="panel-surface" style="padding: 20px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05); border-left: 3px solid var(--text-muted); transition: 0.2s;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 40px; gap: 15px; align-items: center;">
                                        <div>
                                            <label class="text-small text-muted" style="display:block; font-size:0.6rem; letter-spacing: 0.05rem;">NOMBRE DEL NODO / AGENTE</label>
                                            <input type="text" class="form-control edit-role-name" data-pid="${projectId}" data-rid="${r.id}" value="${r.name}" style="margin:0; background: rgba(0,0,0,0.3); font-weight: bold; color: white;">
                                        </div>
                                        <div>
                                            <label class="text-small text-muted" style="display:block; font-size:0.6rem; letter-spacing: 0.05rem;">ÓRBITA (NIVEL DE AUTORIDAD)</label>
                                            <select class="form-control edit-role-level" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; font-size: 0.85rem; background: rgba(0,0,0,0.3);">
                                                ${levelOptions.map(opt => `<option value="${opt.id}" ${r.levelId === opt.id ? 'selected' : ''}>${opt.label}</option>`).join('')}
                                            </select>
                                        </div>
                                        <button class="btn-archive-role" data-pid="${projectId}" data-rid="${r.id}" style="background:none; border:none; cursor:pointer; font-size:1.2rem; opacity:0.5; transition: 0.2s;" onmouseover="this.style.opacity=1; this.style.color='var(--accent-red)'" onmouseout="this.style.opacity=0.5; this.style.color='inherit'">🗑️</button>
                                    </div>
                                    
                                    <div style="margin-top: 15px;">
                                        <label class="text-small" style="display:block; font-size:0.7rem; color: var(--accent-blue); margin-bottom: 5px;">🤖 System Prompt Específico del Agente</label>
                                        <textarea class="form-control role-prompt-input" data-pid="${projectId}" data-rid="${r.id}" 
                                            style="min-height: 120px; background: #0d1117; color: #d2a8ff; font-family: 'Cascadia Code', monospace; font-size: 0.8rem; margin: 0; border: 1px solid rgba(88, 166, 255, 0.2);" 
                                            placeholder="Define cómo debe pensar y actuar este nodo...">${rolePrompt}</textarea>
                                    </div>
                                </div>
                                `
                            }).join('')}
                        </div>

                        <div class="panel-surface" style="border: 1px dashed rgba(255,255,255,0.2); background: rgba(255,255,255,0.02); text-align: center;">
                            <h4 style="margin:0 0 15px 0; font-size: 0.9rem; color: var(--text-heading);">+ Añadir Nuevo Nodo al Ecosistema</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: center;">
                                <input id="nr-name-edit" type="text" class="form-control" placeholder="Ej: DevOps, Copywriter..." style="margin:0;">
                                <select id="nr-level-edit" class="form-control" style="margin:0;">
                                    ${levelOptions.map(opt => `<option value="${opt.id}">${opt.label}</option>`).join('')}
                                </select>
                                <button id="btn-add-role-edit" data-pid="${projectId}" class="btn btn-secondary">Inyectar Nodo</button>
                            </div>
                        </div>
                    </section>
                </div>

                <section class="panel" style="border-color: var(--accent-green); margin-top: 30px; background: linear-gradient(180deg, rgba(35, 134, 54, 0.05) 0%, transparent 100%);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <div>
                            <h3 style="color: var(--accent-green); margin: 0 0 5px 0;">📝 Entregables para Mapa de Valor (Plantilla Contable)</h3>
                            <p class="text-small text-muted" style="margin: 0;">Genera los flujos de trabajo teóricos. (Próximamente se moverá a la vista del Mapa).</p>
                        </div>
                        <button id="btn-sort-gravity" data-pid="${projectId}" class="btn btn-outline" style="font-size: 0.8rem; padding: 6px 12px; border-color: rgba(255,255,255,0.2);">
                            🪄 Auto-Ordenar por Gravedad (Órbitas)
                        </button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; align-items: start;">
                        
                        <div>
                            <label class="form-label">De: (Agente Emisor)</label>
                            <select id="tx-from" data-pid="${projectId}" class="form-control text-small" style="border-color: var(--accent-blue);">${optionsHtml}</select>
                            
                            <div id="tx-suggestions-container">
                                ${initialSuggestionsHtml}
                            </div>
                            
                            <hr style="border-color: rgba(255,255,255,0.05); margin: 20px 0;">

                            <label class="form-label">Para: (Agente Receptor)</label>
                            <select id="tx-to" class="form-control text-small">${optionsHtml}</select>
                            
                            <label class="form-label">Nombre del Entregable (#Hashtag):</label>
                            <input id="tx-entregable" class="form-control text-small" placeholder="Ej: Diagrama de Arquitectura">
                            
                            <label class="form-label">Naturaleza del Flujo:</label>
                            <select id="tx-tipo" class="form-control text-small">
                                <option value="tangible">Tangible (Material / Contrato)</option>
                                <option value="intangible">Intangible (Feedback / Guía)</option>
                            </select>
                        </div>

                        <div style="display: flex; flex-direction: column; height: 100%;">
                            <label class="form-label" style="color: var(--accent-green);">Prompt Táctico del Entregable:</label>
                            <textarea id="tx-prompt" class="form-control" 
                                style="flex-grow: 1; min-height: 250px; background: #0d1117; color: #7ee787; font-family: 'Cascadia Code', monospace; font-size: 0.85rem; border-color: var(--accent-green);" 
                                placeholder="El texto se autocompletará aquí al hacer clic en una sugerencia. Este prompt guiará a la IA sobre cómo ejecutar esta tarea exacta..."></textarea>
                            
                            <button id="btn-add-tx-edit" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 15px; font-size: 1rem; padding: 12px;">
                                ➕ Inyectar Flujo al Mapa de Valor
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        `;
    }
};
