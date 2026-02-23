import { store } from '../core/store.js';

export const HomeView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects || [];
        
        // Invertimos la copia para no mutar el estado original
        const displayProjects = [...projects].reverse();

        // Cálculos con validación de existencia
        const totalLiquidez = projects.reduce((sum, p) => {
            const txs = p.transactions || [];
            return sum + txs.reduce((s, t) => s + (Number(t.liquidación) || 0), 0);
        }, 0);
        
        const totalHoras = projects.reduce((sum, p) => {
            const txs = p.transactions || [];
            return sum + txs.reduce((s, t) => s + (Number(t.horas) || 0), 0);
        }, 0);

        const proyectosEnRiesgo = projects.filter(p => store.calculateResilience(p.id) < 30).length;

        // Nota: He unido las líneas de estilo para evitar el error de 'unescaped line break'
        return `
            <div style="max-width: 1000px; margin: 0 auto; padding: 40px 20px;">
                <header style="margin-bottom: 40px;">
                    <h1 style="color: #f0f6fc; font-size: 2rem;">Centro de Mando SOS</h1>
                    <p style="color: #8b949e;">Gestión de Resiliencia y Valor Simbiótico</p>
                </header>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;">
                    <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                        <div style="color: #8b949e; font-size: 0.7rem; text-transform: uppercase;">Valor Circulante</div>
                        <div style="color: #238636; font-size: 1.8rem; font-weight: bold;">${totalLiquidez.toLocaleString()}€</div>
                    </div>
                    <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                        <div style="color: #8b949e; font-size: 0.7rem; text-transform: uppercase;">Esfuerzo</div>
                        <div style="color: #58a6ff; font-size: 1.8rem; font-weight: bold;">${totalHoras}h</div>
                    </div>
                    <div style="background: #161b22; border: 1px solid ${proyectosEnRiesgo > 0 ? '#f85149' : '#30363d'}; padding: 20px; border-radius: 12px;">
                        <div style="color: #8b949e; font-size: 0.7rem; text-transform: uppercase;">Alertas</div>
                        <div style="color: ${proyectosEnRiesgo > 0 ? '#f85149' : '#f0f6fc'}; font-size: 1.8rem; font-weight: bold;">${proyectosEnRiesgo}</div>
                    </div>
                </div>

                <section style="background: #0d1117; border: 1px solid #30363d; padding: 25px; border-radius: 12px; margin-bottom: 40px;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                        <input id="new-p-name" type="text" placeholder="Nombre del Castell..." style="background: #161b22; border: 1px solid #30363d; color: white; padding: 12px; border-radius: 6px;">
                        <button onclick="window.createProject()" style="background: #238636; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer;">Inicializar</button>
                    </div>
                </section>

                <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                    ${displayProjects.map(p => {
                        const salud = store.calculateResilience(p.id);
                        return `
                        <div onclick="location.hash='#/project/${p.id}'" style="background: #161b22; border: 1px solid #30363d; padding: 15px 25px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                            <div style="color: #f0f6fc; font-weight: bold;">${p.nombre}</div>
                            <div style="color: ${salud < 30 ? '#f85149' : '#238636'}; font-size: 0.9rem;">${salud}% Resiliencia</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
    }
};

window.createProject = () => {
    const name = document.getElementById('new-p-name').value;
    if (!name) return alert("Nombre obligatorio");
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    store.dispatch({ type: 'ADD_PROJECT', payload: { id, nombre: name, sector: 'general' } });
    location.hash = '#/project/' + id;
};
