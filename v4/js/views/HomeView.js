import { store } from '../core/store.js';

export const HomeView = {
    render: () => {
        const state = store.getState();
        const projects = [...(state.projects || [])].reverse();

        return `
            <div style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
                <header style="margin-bottom: 40px;">
                    <h1 style="color: #f0f6fc;">Dashboard SOS v4.3</h1>
                    <p style="color: #8b949e;">Sistema Operativo Simbiótico</p>
                </header>

                <section style="background: #161b22; border: 1px solid #30363d; padding: 25px; border-radius: 12px; margin-bottom: 40px;">
                    <h3 style="margin-top:0; color:#f0f6fc; font-size:1rem;">Levantar Nuevo Castell</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 120px; gap: 10px;">
                        <input id="new-p-name" type="text" placeholder="Nombre del proyecto..." style="background: #0d1117; border: 1px solid #30363d; color: white; padding: 12px; border-radius: 6px;">
                        <select id="new-p-sector" style="background: #0d1117; border: 1px solid #30363d; color: white; padding: 12px; border-radius: 6px;">
                            <option value="gremial">Gremial (Construcción/Ingeniería)</option>
                            <option value="Web3">Web3 (Software/Blockchain)</option>
                            <option value="marketing">Marketing (Agencia/Creativo)</option>
                        </select>
                        <button onclick="window.createProject()" style="background: #238636; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer;">Inicializar</button>
                    </div>
                </section>

                <div style="display: grid; gap: 15px;">
                    ${projects.map(p => `
                        <div onclick="location.hash='#/project/${p.id}'" style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                            <div>
                                <div style="font-weight: bold; color: #f0f6fc; font-size: 1.1rem;">${p.nombre}</div>
                                <div style="color: #8b949e; font-size: 0.8rem; text-transform: uppercase; margin-top: 4px;">Sector: ${p.sector}</div>
                            </div>
                            <span style="color: #58a6ff;">Abrir Mapa →</span>
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
    if (!name) return alert("El nombre es obligatorio");
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    store.dispatch({ 
        type: 'ADD_PROJECT', 
        payload: { id, nombre: name, sector: sector } 
    });
    location.hash = '#/project/' + id;
};
