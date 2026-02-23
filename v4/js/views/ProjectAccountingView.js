import { store } from '../core/store.js';

export const ProjectAccountingView = {
    render: (projectId) => {
        const p = store.getState().projects.find(x => x.id === projectId);
        const txs = p.transactions || [];

        return `
            <div style="max-width:800px;margin:0 auto;padding:40px 20px;color:#c9d1d9;">
                <header style="margin-bottom:30px;">
                    <a href="#/project/${projectId}" style="color:#58a6ff;text-decoration:none;">← Volver al Mapa</a>
                    <h1 style="color:#f0f6fc;margin-top:10px;">💰 Libro Mayor: ${p.nombre}</h1>
                </header>

                <section style="background:#161b22;border:1px solid #30363d;padding:20px;border-radius:12px;margin-bottom:30px;">
                    <h3 style="margin-top:0;font-size:1rem;color:#f0f6fc;">Registrar Inyección de Valor</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr 100px;gap:10px;">
                        <select id="tx-role" style="background:#0d1117;color:white;border:1px solid #30363d;padding:10px;border-radius:6px;">
                            ${Object.keys(p.customRoles).map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                        <input id="tx-hours" type="number" placeholder="Horas (Valor)" style="background:#0d1117;color:white;border:1px solid #30363d;padding:10px;border-radius:6px;">
                        <button onclick="window.submitTx('${projectId}')" style="background:#238636;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Añadir</button>
                    </div>
                </section>

                <section style="background:#0d1117;border:1px solid #30363d;border-radius:12px;overflow:hidden;">
                    <table style="width:100%;border-collapse:collapse;text-align:left;font-size:0.9rem;">
                        <thead style="background:#161b22;color:#8b949e;">
                            <tr>
                                <th style="padding:12px;">Fecha</th>
                                <th style="padding:12px;">Rol</th>
                                <th style="padding:12px;">Esfuerzo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${txs.length === 0 ? '<tr><td colspan="3" style="padding:20px;text-align:center;color:#484f58;">Sin transacciones aún</td></tr>' : 
                                txs.map(t => `
                                <tr style="border-top:1px solid #30363d;">
                                    <td style="padding:12px;">${new Date(t.fecha).toLocaleDateString()}</td>
                                    <td style="padding:12px;color:#58a6ff;">${t.rolId}</td>
                                    <td style="padding:12px;">${t.horas}h</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>
            </div>`;
    }
};

window.submitTx = (pId) => {
    const rolId = document.getElementById('tx-role').value;
    const horas = document.getElementById('tx-hours').value;
    if(!horas) return alert("Indica las horas");
    
    store.dispatch({ 
        type: 'ADD_TRANSACTION', 
        payload: { projectId: pId, tx: { rolId, horas: Number(horas), fecha: new Date().toISOString() } } 
    });
    location.reload(); 
};
