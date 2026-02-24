import { store } from '../core/store.js';

// EVENTO DE CREACIÓN DE PROYECTO DESDE EL DASHBOARD
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-create-project') {
        const name = document.getElementById('new-proj-name').value;
        const sector = document.getElementById('new-proj-sector').value;
        
        if (!name) return alert("Dale un nombre a tu ecosistema.");
        
        const newId = `proj-${Date.now()}`;
        store.dispatch({ type: 'ADD_PROJECT', payload: { id: newId, nombre: name, sector: sector } });
        
        // Redirigir a la vista del proyecto recién creado
        location.hash = `#/project/${newId}`;
    }
});

export const DashboardView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects || [];
        const sectoresCore = Object.keys(state.ontology.sectores);

        // Generar lista dinámica de proyectos
        const projectsListHTML = projects.length === 0 
            ? `<div class="text-muted text-center" style="padding: 20px;">Aún no hay ecosistemas. Crea uno a la derecha.</div>`
            : projects.map(p => {
                const rolesCount = (p.roles || []).filter(r => !r.isArchived).length;
                const txCount = (p.transactions || []).length;
                const salud = store.calculateResilience(p.id);
                
                return `
                <div class="list-item" onclick="location.hash='#/project/${p.id}'" style="cursor: pointer; display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                    <div>
                        <b style="display: block; font-size: 1.1rem; color: var(--accent-blue);">${p.nombre}</b>
                        <span class="text-small text-muted text-uppercase">${p.sector} • ${rolesCount} Nodos • ${txCount} Flujos</span>
                    </div>
                    <div style="text-align: right;">
                        <div class="text-accent" style="font-weight: bold; font-size: 0.8rem;">VNA Activo</div>
                        <div class="text-small text-muted" style="color: ${salud > 40 ? 'var(--accent-green)' : 'var(--accent-red)'}">Resiliencia: ${salud}%</div>
                    </div>
                </div>
                `;
            }).join('');

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent">🚀 TeamTowers SOS: Dashboard</h1>
                        <p class="text-muted">Sistema de Gestión Basado en Redes de Valor</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="location.hash='#/user'">👤 Portal del Contribuidor</button>
                        <button class="btn btn-secondary" onclick="location.hash='#/about'">📖 Metodología</button>
                    </div>
                </header>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr;">
                    
                    <main>
                        <div class="panel">
                            <h3 style="margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Ecosistemas Activos</h3>
                            <div class="list-group" style="margin-top: 15px;">
                                ${projectsListHTML}
                            </div>
                        </div>
                    </main>

                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel" style="border-color: var(--accent-purple);">
                            <h4 style="margin-top: 0; color: var(--accent-purple);">+ Nuevo Ecosistema</h4>
                            <p class="text-small text-muted">Inicializa un mapa con la ontología Slicing Pie precargada.</p>
                            
                            <label class="form-label">Nombre del Proyecto</label>
                            <input type="text" id="new-proj-name" class="form-control" placeholder="Ej: Core Platform v5">
                            
                            <label class="form-label">Sector Operativo (Ontología)</label>
                            <select id="new-proj-sector" class="form-control text-uppercase">
                                ${sectoresCore.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                            
                            <button id="btn-create-project" class="btn btn-primary btn-block" style="margin-top: 15px;">
                                Inicializar Nodos →
                            </button>
                        </div>

                        <div class="panel" style="background: linear-gradient(135deg, var(--bg-panel) 0%, rgba(163, 113, 247, 0.1) 100%);">
                            <h4 style="margin-top: 0; color: var(--accent-purple);">🤖 Consultoría IA</h4>
                            <p class="text-small text-muted">Aviso del Sistema Experto VNA.</p>
                            <div style="background: var(--bg-surface); padding: 10px; border-radius: 8px; font-size: 0.85rem; border: 1px solid var(--border-color);">
                                "Mantén actualizados los flujos de auditoría (@dosos) para garantizar que los cálculos de resiliencia sean precisos antes de repartir Slicing Pie."
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;
    }
};
