import { store } from '../core/store.js';

export const HomeView = {
    render: () => {
        const state = store.getState();
        const projects = [...(state.projects || [])].reverse();
        
        const sectores = [
            "marketing", "Web3", "gremial", "salud", "educacion", 
            "eventos", "legal", "finanzas", "retail", "turismo"
        ];

        return `
            <div style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: sans-serif;">
                <header style="margin-bottom: 40px; border-bottom: 1px solid #30363d; padding-bottom: 20px;">
                    <h1 style="color: #f0f6fc; margin: 0; font-size: 2rem;">Centro de Mando SOS</h1>
                    <p style="color: #8b949e; margin-top: 5px;">Gestión de Resiliencia y Flujo de Valor</p>
                </header>

                <section style="background: #161b22; border: 1px solid #30363d; padding: 25px; border-radius: 12px; margin-bottom: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    <h3 style="margin-top:0; color:#f0f6fc; font-size:1rem; margin-bottom:15px;">🚀 Levantar Nuevo Castell</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 120px; gap: 12px;">
                        <input id="new-p-name" type="text" placeholder="Nombre del proyecto..." 
                               style="background: #0d1117; border: 1px solid #30363d; color: white; padding: 12px; border-radius: 6px;">
                        
                        <select id="new-p-sector" style="background: #0d1117; border: 1px solid #30363d; color: white; padding: 12px; border-radius: 6px; text-transform: capitalize;">
                            ${sectores.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                        
                        <button onclick="window.createProject()" 
                                style="background: #238636; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer; transition: 0.2s;"
                                onmouseover="this.style.background='#2ea043'" onmouseout="this.style.background='#238636'">
                            Inicializar
                        </button>
                    </div>
                </section>

                <div style="display: grid; gap: 15px;">
                    <h3 style="color: #8b949e; font-size: 0.8rem; text-transform: uppercase;">Proyectos Activos</h3>
                    ${projects.length === 0 ? '<p style="color:#484f58; text-align:center; padding:20px;">No hay Castells levantados todavía.</p>' : 
                        projects.map(p => `
                        <div onclick="location.hash='#/project/${p.id}'" 
                             style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s;"
                             onmouseover="this.style.borderColor='#58a6ff'" onmouseout="this.style.borderColor='#30363d'">
                            <div>
                                <div style="font-weight: bold; color: #f0f6fc; font-size: 1.1rem;">${p.nombre}</div>
                                <div style="color: #8b949e; font-size: 0.8rem; text-transform: uppercase; margin-top: 4px;">Sector: <span style="color:#58a6ff;">${p.sector}</span></div>
                            </div>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="text-align:right; margin-right:15px;">
                                    <div style="color:#8b949e; font-size:0.7rem;">RESILIENCIA</div>
                                    <div style="color:${store.calculateResilience(p.id) > 40 ? '#238636' : '#f85149'}; font-weight:bold;">${store.calculateResilience(p.id)}%</div>
                                </div>
                                <span style="color: #58a6ff; font-size:1.2rem;">→</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

window.createProject = () => {
    const name = document.getElementById('new-p-name').value;
    const sector = document.getElementById('new-p-sector').value;
    if (!name) return alert("Por favor, ponle un nombre al Castell");
    
    const id = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    store.dispatch({ 
        type: 'ADD_PROJECT', 
        payload: { id, nombre: name, sector: sector } 
    });
    location.hash = '#/project/' + id;
};
