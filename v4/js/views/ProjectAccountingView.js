import { store } from '../core/store.js';

export const ProjectAccountingView = {
    render: (projectId) => {
        const p = store.getState().projects.find(x => x.id === projectId);
        const resiliencia = store.calculateResilience(projectId);

        return `
            <div style="max-width:1000px; margin:0 auto; padding:20px; color:#c9d1d9;">
                <h2>💰 Contabilidad de Valor: ${p.nombre}</h2>
                <nav><a href="#/project/${projectId}" style="color:#58a6ff;">← Volver al Mapa</a></nav>
                
                <div style="background:#161b22; padding:20px; border-radius:8px; margin:20px 0; border:1px solid #30363d;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>Resiliencia del Sistema</span>
                        <span>${resiliencia}%</span>
                    </div>
                    <div style="background:#30363d; height:10px; border-radius:5px;">
                        <div style="background:${resiliencia < 30 ? '#f85149' : '#238636'}; width:${resiliencia}%; height:100%; border-radius:5px;"></div>
                    </div>
                </div>

                <section style="background:#0d1117; border:1px solid #30363d; padding:20px; border-radius:8px;">
                    <h4>Inyectar Valor al Nodo</h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr 100px; gap:10px;">
                        <input id="tx-role" placeholder="Rol (ej: @arquitecto)">
                        <input id="tx-val" type="number" placeholder="Horas">
                        <button onclick="window.saveTx('${projectId}')" style="background:#238636; color:white; border:none; border-radius:4px; cursor:pointer;">Añadir</button>
                    </div>
                </section>
            </div>`;
    }
};

window.saveTx = (id) => {
    const role = document.getElementById('tx-role').value;
    const hours = document.getElementById('tx-val').value;
    store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: id, tx: { rolId: role, horas: hours, fecha: new Date().toISOString() } } });
    location.reload(); 
};
