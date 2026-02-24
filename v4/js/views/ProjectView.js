import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

// 🛡️ EVENTOS BLINDADOS CONTRA SES
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-add-role-view') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name').value;
        const levelId = document.getElementById('nr-level').value;
        if(!name) return alert("Por favor, introduce un nombre para el rol o especialista.");
        
        // Usamos la nueva acción CREATE_ROLE de v4.4
        store.dispatch({ type: 'CREATE_ROLE', payload: { projectId, name, levelId } });
        
        // 🛠️ FIX: Refrescar vista al añadir rol
        const app = document.getElementById('app');
        if (app) app.innerHTML = ProjectView.render(projectId);
    }
    
    if (e.target.id === 'btn-add-tx-view') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;

        if (!entregable) return alert("Por favor, define qué se entrega en esta transacción.");

        store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId, tx: { from, to, entregable, tipo, horas: 1 } } });

        // 🛠️ FIX: Forzar el refresco de la vista para que el mapa dibuje la nueva flecha inmediatamente
        const app = document.getElementById('app');
        if (app) app.innerHTML = ProjectView.render(projectId);
    }
});

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) return `
            <div class="container text-center">
                <h2>🏰 Proyecto no encontrado</h2>
                <button class="btn btn-outline" onclick="location.hash='#/'">Volver al Dashboard</button>
            </div>`;

        const salud = store.calculateResilience(projectId);
        const colorSalud = salud > 40 ? 'var(--accent-green)' : 'var(--accent-red)';
        
        // 🚀 Ocultamos "Ecosistema" y roles archivados de los selectores de transacción
        const activeRoles = (project.roles || []).filter(r => 
            !r.isArchived && 
            r.id !== 'ecosistema' && 
            r.name.toLowerCase() !== 'ecosistema'
        );
        const optionsHtml = activeRoles.map(n => `<option value="${n.id}">${n.name} (${n.levelId})</option>`).join('');

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>🏰 ${project.nombre}</h1>
                        <div style="display: flex; gap: 15px; align-items
