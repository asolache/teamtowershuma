import { store } from '../core/store.js';

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
    }
});

// 🛡️ GESTIÓN DE ACCIONES
document.addEventListener('click', (e) => {
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

    if (e.target.classList.contains('btn-archive-role')) {
        const roleId = e.target.getAttribute('data-rid');
        const projectId = e.target.getAttribute('data-pid');
        if(confirm('¿Desactivar este nodo del ecosistema?')) {
            store.dispatch({ type: 'ARCHIVE_ROLE', payload: { projectId, roleId } });
            document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
        }
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        const activeRoles = project.roles.filter(r => !r.isArchived);
        
        const levelOptions = [
            { id: "@anxaneta", label: "Strategy (@anxaneta)" },
            { id: "@aixecador", label: "Creative/Coord (@aixecador)" },
            { id: "@dosos", label: "Quality/Audit (@dosos)" },
            { id: "@baixos", label: "Operational (@baixos)" },
            { id: "@pinya", label: "Support/Base (@pinya)" }
        ];

        const projectDescription = project.description || generateRichProjectPrompt(project);

        return `
            <div class="container">
                <header class="header-main" style="flex-direction: column; align-items: flex-start; gap: 10px; padding-bottom: 20px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; width: 100%;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none;">Dashboard</a> <span style="opacity:0.5;">/</span>
                        <b style="color: var(--text-heading);">${project.nombre}</b> <span style="opacity:0.5;">/</span>
                        <a href="#/project/${projectId}" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--text-heading)'" onmouseout="this.style.color='var(--text-muted)'">Maping</a> <span style="opacity:0.5;">/</span>
                        <span style="color: var(--accent-gold); font-weight:bold;">Configurador</span> <span style="opacity:0.5;">/</span>
                        <a href="#/project/${projectId}/accounting" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--text-heading)'" onmouseout="this.style.color='var(--text-muted)'">Accounting</a>
                    </div>
                    
                    <div style="margin-top: 10px;">
                        <h1 class="text-accent" style="margin: 0 0 5px 0;">⚙️ Configurador Estratégico</h1>
                        <p class="text-muted" style="margin: 0;">Ajusta la base narrativa, la identidad y el rol de los agentes de este proyecto.</p>
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
                                style="height: 300px; line-height: 1.5; font-family: 'Cascadia Code', monospace; background: var(--bg-panel); color: var(--text-main); resize: vertical; font-size: 0.8rem; border-color: rgba(163, 113, 247, 0.3);" 
                                placeholder="Estructura general del prompt...">${projectDescription}</textarea>
                        </div>

                        <button id="btn-save-meta" data-pid="${projectId}" class="btn btn-primary btn-block">
                            💾 Guardar y Sincronizar Contexto
                        </button>
                    </section>

                    <section class="panel">
                        <h3 style="margin-top: 0;">Identidad de los Nodos (Agentes)</h3>
                        <p class="text-muted text-small" style="margin-bottom: 20px;">Personaliza la personalidad, nivel de autoridad y directrices de cada nodo del ecosistema.</p>
                        
                        <div style="margin-bottom: 30px;">
                            ${activeRoles.map(r => {
                                let rolePrompt = r.systemPrompt || '';
                                if (!rolePrompt.includes('[CONTEXTO DE ROL]')) {
                                    const tareasRol = project.transactions.filter(t => t.from === r.id).map(t => `#${t.entregable.replace(/\s+/g,'')}`).join(', ');
                                    rolePrompt = `[CONTEXTO DE ROL]\nIdentidad: @${r.name.replace(/\s+/g, '')}\nAutoridad: Nivel ${r.levelId}\n\n[MISIÓN]\n${rolePrompt}\n\n[DIRECTRICES DE OPERACIÓN]\n- Entregables a tu cargo: ${tareasRol || 'Por definir'}\n- Coordínate con otros nodos mencionándolos con @.\n- Valida la calidad antes de emitir flujo hacia @dosos.`;
                                }

                                return `
                                <div class="panel-surface" style="padding: 20px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05); border-left: 3px solid var(--text-muted); transition: 0.2s;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 40px; gap: 15px; align-items: center;">
                                        <div>
                                            <label class="text-small text-muted" style="display:block; font-size:0.6rem; letter-spacing: 0.05rem;">NOMBRE DEL NODO / AGENTE</label>
                                            <input type="text" class="form-control edit-role-name" data-pid="${projectId}" data-rid="${r.id}" value="${r.name}" style="margin:0; background: var(--bg-panel); font-weight: bold; color: var(--text-heading);">
                                        </div>
                                        <div>
                                            <label class="text-small text-muted" style="display:block; font-size:0.6rem; letter-spacing: 0.05rem;">ÓRBITA (NIVEL DE AUTORIDAD)</label>
                                            <select class="form-control edit-role-level" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; font-size: 0.85rem; background: var(--bg-panel);">
                                                ${levelOptions.map(opt => `<option value="${opt.id}" ${r.levelId === opt.id ? 'selected' : ''}>${opt.label}</option>`).join('')}
                                            </select>
                                        </div>
                                        <button class="btn-archive-role" data-pid="${projectId}" data-rid="${r.id}" style="background:none; border:none; cursor:pointer; font-size:1.2rem; opacity:0.5; transition: 0.2s;" onmouseover="this.style.opacity=1; this.style.color='var(--accent-red)'" onmouseout="this.style.opacity=0.5; this.style.color='inherit'">🗑️</button>
                                    </div>
                                    
                                    <div style="margin-top: 15px;">
                                        <label class="text-small" style="display:block; font-size:0.7rem; color: var(--accent-blue); margin-bottom: 5px;">🤖 System Prompt Específico del Agente</label>
                                        <textarea class="form-control role-prompt-input" data-pid="${projectId}" data-rid="${r.id}" 
                                            style="min-height: 120px; background: var(--bg-panel); color: var(--text-main); font-family: 'Cascadia Code', monospace; font-size: 0.8rem; margin: 0; border: 1px solid rgba(88, 166, 255, 0.2);" 
                                            placeholder="Define cómo debe pensar y actuar este nodo...">${rolePrompt}</textarea>
                                    </div>
                                </div>
                                `
                            }).join('')}
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};
